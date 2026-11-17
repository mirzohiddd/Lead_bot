import { config, telegramReady } from '../config/env.js'
import { PRODUCTS } from '../utils/validation.js'
import { escapeHtml, tashkentDateTime, adChannel } from '../utils/format.js'
import { claimTelegram, updateTelegram, listDue } from './orderStore.js'

const UTM_LABELS = {
  utm_source: 'source',
  utm_medium: 'medium',
  utm_campaign: 'campaign',
  utm_content: 'content',
  utm_term: 'term',
  utm_id: 'id'
}

/** Telegram xabar matni (HTML). Foydalanuvchi kiritgan har bir qiymat escape qilinadi. */
export function buildMessage(order) {
  const { date, time } = tashkentDateTime(order.created_at)
  const e = escapeHtml
  const product = order.product ? PRODUCTS[order.product] : "Ko'rsatilmagan (maslahat)"

  const lines = [
    '🔔 <b>YANGI BUYURTMA — GEPOMER</b>',
    '',
    `🆔 Buyurtma ID: <b>${e(order.id)}</b>`,
    '',
    `👤 Mijoz: ${e(order.name)}`,
    `📞 Telefon: ${e(order.phone)}`,
    `📦 Mahsulot: ${e(product)}`,
    `📅 Sana: ${date}`,
    `🕒 Vaqt: ${time}`,
    '',
    `🌐 Manba: ${e(order.source)}`,
    `📢 Reklama: ${e(adChannel(order.utm))}`
  ]

  const utmLines = Object.entries(UTM_LABELS)
    .filter(([k]) => order.utm?.[k])
    .map(([k, label]) => `   • ${label}: ${e(order.utm[k])}`)
  if (utmLines.length) lines.push('🏷 UTM:', ...utmLines)

  lines.push('', `📣 Marketing roziligi: ${order.consent?.marketing ? 'Ha' : "Yo'q"}`)
  lines.push('', '✅ Holat: Yangi buyurtma')
  return lines.join('\n')
}

class TelegramError extends Error {
  constructor(message, { retryAfter = 0, permanent = false } = {}) {
    super(message)
    this.retryAfter = retryAfter
    this.permanent = permanent
  }
}

async function sendMessage(chatId, text) {
  const url = `${config.telegram.apiBase}/bot${config.telegram.token}/sendMessage`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), config.telegram.requestTimeoutMs)
  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
      signal: ctrl.signal
    })
  } catch (err) {
    throw new TelegramError(err.name === 'AbortError' ? 'timeout' : `network: ${err.code || err.message}`)
  } finally {
    clearTimeout(timer)
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* javob JSON emas */
  }
  if (res.ok && data?.ok) return data.result

  const desc = data?.description || `HTTP ${res.status}`
  const retryAfter = data?.parameters?.retry_after || 0
  const migrateTo = data?.parameters?.migrate_to_chat_id
  if (migrateTo) {
    console.error(`[telegram] Guruh supergroup'ga o'tgan. TELEGRAM_GROUP_ID=${migrateTo} qilib yangilang.`)
  }
  // 401 — token noto'g'ri; 400/403 — chat topilmadi / bot guruhda emas. Bular sozlama xatosi,
  // lekin sozlama tuzatilgach yuborilishi uchun "permanent" emas, oddiy retry sifatida qoldiramiz.
  throw new TelegramError(desc, { retryAfter })
}

/** Keyingi urinish vaqti: 30s, 1m, 2m, 4m ... maksimal 30 daqiqa */
function backoffMs(attempts, retryAfterSec) {
  if (retryAfterSec) return retryAfterSec * 1000 + 1000
  return Math.min(30 * 60 * 1000, 30_000 * 2 ** Math.max(0, attempts - 1))
}

/**
 * Bitta manzilga (group yoki admin) yuborishga urinadi.
 * claimTelegram atomik band qiladi — shuning uchun bir xabar parallel ikki marta yuborilmaydi.
 */
export async function deliver(orderId, target) {
  if (!telegramReady()) return 'skipped'
  const order = await claimTelegram(orderId, target, config.telegram.maxAttempts)
  if (!order) return 'busy'

  const chatId = target === 'group' ? config.telegram.groupId : config.telegram.adminId
  try {
    const msg = await sendMessage(chatId, buildMessage(order))
    await updateTelegram(orderId, target, {
      status: 'sent',
      message_id: msg?.message_id ?? null,
      sent_at: new Date().toISOString(),
      last_error: null,
      next_retry_at: null
    })
    console.info(`[telegram] ${orderId} → ${target}: yuborildi`)
    return 'sent'
  } catch (err) {
    const attempts = order.telegram[target].attempts
    const exhausted = attempts >= config.telegram.maxAttempts
    await updateTelegram(orderId, target, {
      status: exhausted ? 'failed' : 'pending',
      last_error: String(err.message).slice(0, 300),
      next_retry_at: exhausted ? null : new Date(Date.now() + backoffMs(attempts, err.retryAfter)).toISOString()
    })
    console.warn(`[telegram] ${orderId} → ${target}: xato (${attempts}-urinish): ${err.message}`)
    return exhausted ? 'failed' : 'pending'
  }
}

/** Yangi buyurtmani darhol yuboradi (guruh, keyin kerak bo'lsa admin) */
export async function notifyNewOrder(order) {
  const result = { group: await deliver(order.id, 'group') }
  if (order.telegram?.admin) result.admin = await deliver(order.id, 'admin')
  return result
}

/* ---------------- Qayta yuborish mexanizmi ---------------- */
let timer = null
let running = false

async function retryTick() {
  if (running || !telegramReady()) return
  running = true
  try {
    for (const { orderId, target } of listDue()) {
      await deliver(orderId, target)
    }
  } catch (err) {
    console.error('[telegram] retry xatosi:', err.message)
  } finally {
    running = false
  }
}

export function startRetryWorker() {
  if (timer) return
  timer = setInterval(retryTick, config.telegram.retryIntervalMs)
  timer.unref()
  setTimeout(retryTick, 3000).unref() // ishga tushganda yuborilmay qolganlarni tekshirish
}

export function stopRetryWorker() {
  clearInterval(timer)
  timer = null
}

/** Ishga tushishda bot tokenini tekshirish (getMe) */
export async function checkBot() {
  if (!telegramReady()) return null
  try {
    const res = await fetch(`${config.telegram.apiBase}/bot${config.telegram.token}/getMe`, {
      signal: AbortSignal.timeout(config.telegram.requestTimeoutMs)
    })
    const data = await res.json()
    return data.ok ? data.result.username : null
  } catch {
    return null
  }
}
