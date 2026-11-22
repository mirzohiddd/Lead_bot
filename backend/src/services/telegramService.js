// Telegram: bitta bot — har bir mahsulot o'z guruhiga.
//  • gepomer   → TELEGRAM_GEPOMER_GROUP_ID (bo'lmasa zaxira: TELEGRAM_GROUP_ID)
//  • dermolife → TELEGRAM_DERMOLIFE_GROUP_ID
//  • halila    → TELEGRAM_HALILA_GROUP_ID
// Guruh sozlanmagan bo'lsa — buyurtma BOSHQA guruhga yuborilmaydi: pending holatda qoladi,
// xato logga yoziladi, guruh ID qo'shilib server qayta ishga tushganda avtomatik yuboriladi.
import { config, telegramReady } from '../config/env.js'
import { PRODUCTS, groupIdFor, groupEnvName } from '../config/products.js'
import { escapeHtml, tashkentDateTime, adChannel } from '../utils/format.js'
import { claimTelegram, updateTelegram, listDue, getOrder } from './orderStore.js'

const UTM_LABELS = {
  utm_source: 'source',
  utm_medium: 'medium',
  utm_campaign: 'campaign',
  utm_content: 'content',
  utm_term: 'term',
  utm_id: 'id'
}

const GROUP_NOT_CONFIGURED = 'group_not_configured'

/** Telegram xabar matni (HTML). Foydalanuvchi kiritgan har bir qiymat escape qilinadi. */
export function buildMessage(order) {
  const { date, time } = tashkentDateTime(order.created_at)
  const e = escapeHtml
  const productName = PRODUCTS[order.product_code]?.name || order.product_code

  const lines = [
    `🔔 <b>ЯНГИ БУЮРТМА — ${e(productName)}</b>`,
    '',
    `🆔 <b>${e(order.id)}</b>`,
    `👤 Мижоз: ${e(order.name)}`,
    `📞 Телефон: ${e(order.phone)}`,
    `📦 Маҳсулот: ${e(order.product_name || productName)}`,
    `🌐 Манба: ${e(adChannel(order.utm))}`
  ]

  const utmLines = Object.entries(UTM_LABELS)
    .filter(([k]) => order.utm?.[k])
    .map(([k, label]) => `   • ${label}: ${e(order.utm[k])}`)
  if (utmLines.length) lines.push('🏷 UTM:', ...utmLines)

  lines.push(`🕒 Сана: ${date}, ${time} (Тошкент вақти)`)
  lines.push(`📣 Маркетинг розилиги: ${order.consent?.marketing ? 'Ҳа' : 'Йўқ'}`)
  lines.push('', '✅ Ҳолат: Янги буюртма')
  return lines.join('\n')
}

class TelegramError extends Error {
  constructor(message, { retryAfter = 0 } = {}) {
    super(message)
    this.retryAfter = retryAfter
  }
}

async function sendMessage(chatId, text, productCode) {
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
  if (data?.parameters?.migrate_to_chat_id) {
    console.error(
      `[telegram] ${productCode} guruhi supergroup'ga o'tgan. ${groupEnvName(productCode)} ni yangi ID bilan yangilang (npm run chat-id).`
    )
  }
  // 401 — token noto'g'ri; 400/403 — chat topilmadi / bot guruhda emas. Sozlama tuzatilgach
  // yuborilishi uchun oddiy qayta urinish sifatida qoldiramiz.
  throw new TelegramError(desc, { retryAfter })
}

/** Keyingi urinish vaqti: 30s, 1m, 2m, 4m ... maksimal 30 daqiqa */
function backoffMs(attempts, retryAfterSec) {
  if (retryAfterSec) return retryAfterSec * 1000 + 1000
  return Math.min(30 * 60 * 1000, 30_000 * 2 ** Math.max(0, attempts - 1))
}

/** Manzil chat ID si: guruh — faqat o'z mahsulotiniki; admin — TELEGRAM_ADMIN_ID */
function chatIdFor(productCode, target) {
  return target === 'group' ? groupIdFor(productCode) : config.telegram.adminId
}

/**
 * Bitta manzilga (group yoki admin) yuborishga urinadi.
 * claimTelegram atomik band qiladi — shuning uchun bir xabar parallel ikki marta yuborilmaydi.
 */
export async function deliver(orderId, target, productCode) {
  if (!telegramReady()) return 'skipped'

  const code = productCode || (await getOrder(orderId))?.product_code
  const chatId = chatIdFor(code, target)
  if (!chatId) {
    // Boshqa mahsulot guruhiga YUBORMAYMIZ. Urinish sanalmaydi — buyurtma pending qoladi.
    const current = await getOrder(orderId)
    if (current?.telegram?.[target]?.last_error !== GROUP_NOT_CONFIGURED) {
      await updateTelegram(orderId, target, { last_error: GROUP_NOT_CONFIGURED })
      console.error(`[telegram] ${orderId}: ${code} uchun Telegram guruh sozlanmagan (${groupEnvName(code)}) — pending holatda saqlandi`)
    }
    return 'no_group'
  }

  const order = await claimTelegram(orderId, target, config.telegram.maxAttempts)
  if (!order) return 'busy'

  try {
    const msg = await sendMessage(chatId, buildMessage(order), order.product_code)
    await updateTelegram(orderId, target, {
      status: 'sent',
      message_id: msg?.message_id ?? null,
      sent_at: new Date().toISOString(),
      last_error: null,
      next_retry_at: null
    })
    console.info(`[telegram] ${orderId} → ${order.product_code}/${target}: yuborildi`)
    return 'sent'
  } catch (err) {
    const attempts = order.telegram[target].attempts
    const exhausted = attempts >= config.telegram.maxAttempts
    await updateTelegram(orderId, target, {
      status: exhausted ? 'failed' : 'pending',
      last_error: String(err.message).slice(0, 300),
      next_retry_at: exhausted ? null : new Date(Date.now() + backoffMs(attempts, err.retryAfter)).toISOString()
    })
    console.warn(`[telegram] ${orderId} → ${order.product_code}/${target}: xato (${attempts}-urinish): ${err.message}`)
    return exhausted ? 'failed' : 'pending'
  }
}

/** Yangi buyurtmani darhol yuboradi (o'z guruhiga, keyin kerak bo'lsa adminga) */
export async function notifyNewOrder(order) {
  const result = { group: await deliver(order.id, 'group', order.product_code) }
  if (order.telegram?.admin) result.admin = await deliver(order.id, 'admin', order.product_code)
  return result
}

/* ---------------- Qayta yuborish mexanizmi ---------------- */
let timer = null
let running = false

async function retryTick() {
  if (running || !telegramReady()) return
  running = true
  try {
    for (const { orderId, target, productCode } of await listDue()) {
      // Guruhi sozlanmagan mahsulotni har safar urinmaymiz (logni to'ldirmaslik uchun)
      if (target === 'group' && !groupIdFor(productCode)) continue
      await deliver(orderId, target, productCode)
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