import { config } from '../config/env.js'
import { validateOrder, cleanIdempotencyKey } from '../utils/validation.js'
import { createOrder } from '../services/orderStore.js'
import { notifyNewOrder } from '../services/telegramService.js'

// Telegramni javob berishdan oldin qancha kutamiz. Kechiksa ham buyurtma saqlangan —
// yuborish fonda davom etadi yoki retry worker qayta yuboradi.
const TELEGRAM_WAIT_MS = 6000

export async function createOrderHandler(req, res) {
  // Honeypot: odam ko'rmaydigan maydon to'ldirilgan bo'lsa — bot. Hech narsa saqlamaymiz.
  if (typeof req.body?.website === 'string' && req.body.website.trim() !== '') {
    return res.status(201).json({ ok: true })
  }

  const result = validateOrder(req.body)
  if (!result.ok) {
    return res.status(400).json({ ok: false, error: 'validation', errors: result.errors })
  }

  const idempotencyKey = cleanIdempotencyKey(req.get('Idempotency-Key'))

  const { order, duplicate } = await createOrder(result.value, {
    idempotencyKey,
    dedupWindowMs: config.dedupWindowMs,
    notifyAdmin: config.telegram.notifyAdmin
  })

  if (duplicate) {
    console.info(`[orders] takroriy so'rov → ${order.id}`)
    return res.status(200).json({ ok: true, orderId: order.id, duplicate: true })
  }

  console.info(`[orders] yangi buyurtma ${order.id}`)

  const sending = notifyNewOrder(order).catch((err) => {
    console.error(`[orders] ${order.id} telegram xatosi:`, err.message)
  })
  await Promise.race([sending, new Promise((r) => setTimeout(r, TELEGRAM_WAIT_MS))])

  return res.status(201).json({ ok: true, orderId: order.id })
}
