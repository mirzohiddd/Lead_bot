// JSON fayl asosidagi buyurtmalar ombori (DATABASE_URL berilmaganda).
// - Barcha o'zgarishlar bitta navbat (mutex) orqali ketma-ket bajariladi → parallel so'rovlar faylni buzmaydi.
// - Yozish atomik: avval vaqtinchalik faylga, keyin rename → yarim yozilgan fayl qolmaydi.
// - Har bir mahsulotning alohida raqamlash ketma-ketligi bor: GP-…, DL-…, HL-…
// - Eski (v1, faqat GEPOMER) fayl avtomatik v2 ga o'tkaziladi; asl nusxa zaxira sifatida saqlanadi.
// - Bitta Node jarayoni uchun mo'ljallangan (PM2 cluster / bir nechta instansiya ishlatmang).
import fs from 'node:fs/promises'
import path from 'node:path'
import { PRODUCT_CODES } from '../../config/products.js'
import { formatOrderId, buildOrder, upgradeLegacyOrder, recoverSending } from './common.js'

let state = null // { version: 2, seq: { gepomer, dermolife, halila }, orders: [] }
let filePath = null
let queue = Promise.resolve()

function exclusive(fn) {
  const run = queue.then(fn, fn)
  queue = run.catch(() => {})
  return run
}

async function persist() {
  const tmp = `${filePath}.${process.pid}.tmp`
  const data = JSON.stringify(state, null, 2)
  const fh = await fs.open(tmp, 'w', 0o600)
  try {
    await fh.writeFile(data, 'utf8')
    await fh.sync()
  } finally {
    await fh.close()
  }
  await fs.rename(tmp, filePath)
}

const emptySeq = () => Object.fromEntries(PRODUCT_CODES.map((c) => [c, 0]))

/** Faylni o'qiydi (yoki yo'q bo'lsa — null). Buzilgan faylni zaxiraga ko'chiradi. */
export async function readOrdersFile(file) {
  try {
    const raw = await fs.readFile(file, 'utf8')
    return raw.trim() ? JSON.parse(raw) : null
  } catch (err) {
    if (err.code === 'ENOENT') return null
    if (err instanceof SyntaxError) {
      const backup = `${file}.corrupt-${Date.now()}`
      await fs.rename(file, backup)
      console.error(`[store] orders.json buzilgan, zaxira nusxa: ${path.basename(backup)}`)
      return null
    }
    throw err
  }
}

/** Har qanday versiyadagi fayl tarkibini v2 holatiga keltiradi */
export function normalizeState(parsed) {
  let orders = []
  let seq = emptySeq()
  let legacy = false
  if (Array.isArray(parsed)) {
    orders = parsed
    legacy = true
  } else if (parsed && Array.isArray(parsed.orders)) {
    orders = parsed.orders
    if (parsed.seq && typeof parsed.seq === 'object') seq = { ...seq, ...parsed.seq }
    else {
      legacy = true
      seq.gepomer = Number(parsed.lastSeq) || 0 // v1: yagona hisoblagich GEPOMER'niki edi
    }
  }
  for (const o of orders) {
    upgradeLegacyOrder(o)
    if (o.seq && o.seq > (seq[o.product_code] || 0)) seq[o.product_code] = o.seq
  }
  return { state: { version: 2, seq, orders }, legacy }
}

export async function init(file) {
  filePath = file
  await fs.mkdir(path.dirname(file), { recursive: true })
  const parsed = await readOrdersFile(file)
  const { state: s, legacy } = normalizeState(parsed)
  if (legacy && parsed) {
    // Migratsiyadan oldin asl faylning nusxasi — hech narsa yo'qolmaydi
    const backup = `${file}.v1-backup-${Date.now()}.json`
    await fs.copyFile(file, backup)
    console.info(`[store] eski format v2 ga o'tkazildi, asl nusxa: ${path.basename(backup)}`)
  }
  state = s
  let recovered = 0
  for (const o of state.orders) recovered += recoverSending(o)
  await exclusive(persist)
  return { total: state.orders.length, recovered, kind: 'json' }
}

export function createOrder(input, { idempotencyKey, dedupWindowMs, notifyAdmin }) {
  return exclusive(async () => {
    if (idempotencyKey) {
      const same = state.orders.find((o) => o.idempotency_key === idempotencyKey)
      if (same) return { order: same, duplicate: true }
    }
    if (dedupWindowMs > 0) {
      const since = Date.now() - dedupWindowMs
      for (let i = state.orders.length - 1; i >= 0; i--) {
        const o = state.orders[i]
        if (Date.parse(o.created_at) < since) break
        // Takroriylik faqat SHU mahsulot ichida: bir mijoz GEPOMER va DERMOLIFE ga alohida ariza berishi mumkin
        if (o.phone === input.phone && o.product_code === input.productCode) return { order: o, duplicate: true }
      }
    }

    const code = input.productCode
    const seq = (state.seq[code] || 0) + 1
    const order = buildOrder(input, {
      id: formatOrderId(code, seq),
      seq,
      idempotencyKey,
      notifyAdmin,
      now: new Date().toISOString()
    })
    state.seq[code] = seq
    state.orders.push(order)
    await persist()
    return { order, duplicate: false }
  })
}

export function updateTelegram(orderId, target, patch) {
  return exclusive(async () => {
    const o = state.orders.find((x) => x.id === orderId)
    if (!o || !o.telegram?.[target]) return null
    Object.assign(o.telegram[target], patch)
    o.telegram_status = o.telegram.group?.status || 'pending'
    await persist()
    return structuredClone(o)
  })
}

/** Atomik "band qilish": pending → sending. Faqat band qilgan chaqiruvchi yuboradi (ikki marta yuborilmaydi). */
export function claimTelegram(orderId, target, maxAttempts) {
  return exclusive(async () => {
    const o = state.orders.find((x) => x.id === orderId)
    const t = o?.telegram?.[target]
    if (!t || t.status !== 'pending' || t.attempts >= maxAttempts) return null
    t.status = 'sending'
    t.attempts += 1
    t.last_attempt_at = new Date().toISOString()
    o.telegram_status = o.telegram.group?.status || 'pending'
    await persist()
    return structuredClone(o)
  })
}

export async function getOrder(orderId) {
  const o = state.orders.find((x) => x.id === orderId)
  return o ? structuredClone(o) : null
}

export async function listDue(now = Date.now()) {
  const due = []
  for (const o of state.orders) {
    for (const [name, t] of Object.entries(o.telegram || {})) {
      if (t && t.status === 'pending' && (!t.next_retry_at || Date.parse(t.next_retry_at) <= now)) {
        due.push({ orderId: o.id, target: name, productCode: o.product_code })
      }
    }
  }
  return due
}

export function flush() {
  return exclusive(async () => {})
}

export async function close() {
  await flush()
}
