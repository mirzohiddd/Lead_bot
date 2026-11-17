// JSON fayl asosidagi buyurtmalar ombori.
// - Barcha o'zgarishlar bitta navbat (mutex) orqali ketma-ket bajariladi → parallel so'rovlar faylni buzmaydi.
// - Yozish atomik: avval vaqtinchalik faylga, keyin rename → yarim yozilgan fayl qolmaydi.
// - Bitta Node jarayoni uchun mo'ljallangan (PM2 cluster / bir nechta instansiya ishlatmang).
import fs from 'node:fs/promises'
import path from 'node:path'
import { formatOrderId } from '../utils/format.js'

let state = null // { version, lastSeq, orders: [] }
let filePath = null
let queue = Promise.resolve()

/** Navbatga qo'yib bajaradi: bir vaqtda faqat bitta mutatsiya */
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

export async function initStore(file) {
  filePath = file
  await fs.mkdir(path.dirname(file), { recursive: true })
  try {
    const raw = await fs.readFile(file, 'utf8')
    const parsed = raw.trim() ? JSON.parse(raw) : null
    if (Array.isArray(parsed)) {
      // Eski format: oddiy massiv
      state = { version: 1, lastSeq: parsed.length, orders: parsed }
    } else if (parsed && Array.isArray(parsed.orders)) {
      state = { version: 1, lastSeq: parsed.lastSeq || parsed.orders.length, orders: parsed.orders }
    } else {
      state = { version: 1, lastSeq: 0, orders: [] }
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      state = { version: 1, lastSeq: 0, orders: [] }
    } else if (err instanceof SyntaxError) {
      // Fayl buzilgan — uni saqlab qo'yib, yangisini boshlaymiz (ma'lumot yo'qolmasin)
      const backup = `${file}.corrupt-${Date.now()}`
      await fs.rename(file, backup)
      console.error(`[store] orders.json buzilgan, zaxira nusxa: ${path.basename(backup)}`)
      state = { version: 1, lastSeq: 0, orders: [] }
    } else {
      throw err
    }
  }

  // Jarayon yuborish paytida to'xtagan bo'lsa — qayta urinish uchun pending holatiga qaytaramiz
  let recovered = 0
  for (const o of state.orders) {
    for (const t of Object.values(o.telegram || {})) {
      if (t && t.status === 'sending') {
        t.status = 'pending'
        t.possibly_sent = true
        recovered++
      }
    }
    syncTopStatus(o)
  }
  await exclusive(persist)
  return { total: state.orders.length, recovered }
}

/** Yuqori darajadagi telegram_status — guruhga yuborish holati */
function syncTopStatus(order) {
  order.telegram_status = order.telegram?.group?.status || 'pending'
}

/**
 * Yangi buyurtma yaratadi yoki takroriy bo'lsa mavjudini qaytaradi.
 * Takroriy deb hisoblanadi: bir xil Idempotency-Key, yoki dedupWindowMs ichida bir xil telefon.
 */
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
        if (o.phone === input.phone) return { order: o, duplicate: true }
      }
    }

    const seq = state.lastSeq + 1
    const now = new Date().toISOString()
    const target = () => ({ status: 'pending', attempts: 0, last_error: null, message_id: null, sent_at: null, next_retry_at: null })

    const order = {
      id: formatOrderId(seq),
      idempotency_key: idempotencyKey || null,
      name: input.name,
      phone: input.phone,
      product: input.product,
      consent: { data_processing: true, marketing: input.marketingConsent, at: now },
      utm: input.utm,
      page: input.page || null,
      source: 'Gepomer Landing',
      status: 'new',
      created_at: now,
      telegram: { group: target(), admin: notifyAdmin ? target() : null },
      telegram_status: 'pending'
    }

    state.lastSeq = seq
    state.orders.push(order)
    await persist()
    return { order, duplicate: false }
  })
}

/** Buyurtmaning telegram holatini yangilaydi (patch obyekti bilan) */
export function updateTelegram(orderId, targetName, patch) {
  return exclusive(async () => {
    const o = state.orders.find((x) => x.id === orderId)
    if (!o || !o.telegram?.[targetName]) return null
    Object.assign(o.telegram[targetName], patch)
    syncTopStatus(o)
    await persist()
    return o
  })
}

/**
 * Atomik "band qilish": pending → sending. Faqat muvaffaqiyatli band qilgan chaqiruvchi yuboradi.
 * Bu bir buyurtma ikki joydan (so'rov + retry worker) bir vaqtda yuborilishining oldini oladi.
 */
export function claimTelegram(orderId, targetName, maxAttempts) {
  return exclusive(async () => {
    const o = state.orders.find((x) => x.id === orderId)
    const t = o?.telegram?.[targetName]
    if (!t || t.status !== 'pending' || t.attempts >= maxAttempts) return null
    t.status = 'sending'
    t.attempts += 1
    t.last_attempt_at = new Date().toISOString()
    syncTopStatus(o)
    await persist()
    return structuredClone(o)
  })
}

/** Qayta yuborish kerak bo'lgan (pending va vaqti kelgan) yozuvlar */
export function listDue(now = Date.now()) {
  const due = []
  for (const o of state.orders) {
    for (const [name, t] of Object.entries(o.telegram || {})) {
      if (t && t.status === 'pending' && (!t.next_retry_at || Date.parse(t.next_retry_at) <= now)) {
        due.push({ orderId: o.id, target: name })
      }
    }
  }
  return due
}

export function flush() {
  return exclusive(async () => {})
}
