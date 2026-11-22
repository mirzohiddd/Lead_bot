import { config } from '../config/env.js'
import { originsFor } from '../config/products.js'
import { validateOrder, cleanIdempotencyKey } from '../utils/validation.js'
import { createOrder } from '../services/orderStore.js'
import { notifyNewOrder } from '../services/telegramService.js'

// Telegramni javob berishdan oldin qancha kutamiz. Kechiksa ham buyurtma saqlangan —
// yuborish fonda davom etadi yoki retry worker qayta yuboradi.
const TELEGRAM_WAIT_MS = 6000

const normOrigin = (o) => String(o || '').trim().replace(/\/+$/, '')

export async function createOrderHandler(req, res) {
  // Honeypot: odam ko'rmaydigan maydon to'ldirilgan bo'lsa — bot. Hech narsa saqlamaymiz.
  if (typeof req.body?.website === 'string' && req.body.website.trim() !== '') {
    return res.status(201).json({ ok: true })
  }

  const result = validateOrder(req.body)
  if (!result.ok) {
    return res.status(400).json({ ok: false, error: 'validation', errors: result.errors })
  }
  const order = result.value

  // Domen ↔ mahsulot mosligi: DERMOLIFE saytidan GEPOMER buyurtmasi (va aksincha) qabul qilinmaydi.
  // Eslatma: Origin sarlavhasi autentifikatsiya EMAS (brauzerdan tashqarida soxtalashtirish mumkin),
  // u faqat brauzer orqali kelgan so'rovlarda mahsulotlar aralashib ketishining oldini oladi.
  const origin = req.get('Origin')
  if (origin) {
    if (!originsFor(order.productCode).includes(normOrigin(origin))) {
      console.warn(`[orders] domen ${order.productCode} mahsulotiga mos emas — rad etildi`)
      return res.status(403).json({ ok: false, error: 'product_origin_mismatch' })
    }
  } else if (config.requireOrigin) {
    return res.status(403).json({ ok: false, error: 'origin_required' })
  }

  const idempotencyKey = cleanIdempotencyKey(req.get('Idempotency-Key'))

  const { order: saved, duplicate } = await createOrder(order, {
    idempotencyKey,
    dedupWindowMs: config.dedupWindowMs,
    notifyAdmin: config.telegram.notifyAdmin
  })

  if (duplicate) {
    console.info(`[orders] takroriy so'rov → ${saved.id}`)
    return res.status(200).json({ ok: true, orderId: saved.id, duplicate: true })
  }

  console.info(`[orders] yangi buyurtma ${saved.id} (${saved.product_code})`)

  const sending = notifyNewOrder(saved).catch((err) => {
    console.error(`[orders] ${saved.id} telegram xatosi:`, err.message)
  })
  await Promise.race([sending, new Promise((r) => setTimeout(r, TELEGRAM_WAIT_MS))])

  return res.status(201).json({ ok: true, orderId: saved.id })
}