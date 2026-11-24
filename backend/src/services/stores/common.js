// Ikkala ombor (JSON va PostgreSQL) uchun umumiy yordamchilar
import { PRODUCTS, productLabel } from '../../config/products.js'

export const formatOrderId = (code, seq) => `${PRODUCTS[code].idPrefix}-${String(seq).padStart(6, '0')}`

/** "GP-000123" → { prefix: 'GP', seq: 123 } */
export function parseOrderId(id) {
  const m = /^([A-Z]{2})-(\d+)$/.exec(String(id || ''))
  return m ? { prefix: m[1], seq: Number(m[2]) } : null
}

export const codeByPrefix = (prefix) => Object.values(PRODUCTS).find((p) => p.idPrefix === prefix)?.code || null

export const newTarget = () => ({
  status: 'pending',
  attempts: 0,
  last_error: null,
  message_id: null,
  sent_at: null,
  next_retry_at: null
})

/** Yangi buyurtma yozuvi (ombor turidan qat'i nazar bir xil shakl) */
export function buildOrder(input, { id, seq, idempotencyKey, notifyAdmin, now }) {
  const p = PRODUCTS[input.productCode]
  return {
    id,
    seq,
    product_code: input.productCode,
    product: input.product || null,
    product_name: productLabel(input.productCode, input.product),
    idempotency_key: idempotencyKey || null,
    name: input.name,
    phone: input.phone,
    // Faqat haqiqatan berilgan rozilik yoziladi. basis — ma'lumot mijozning o'z buyurtmasi bo'yicha bog'lanish uchun.
    consent: {
      data_processing: input.consent === true,
      marketing: input.marketingConsent === true,
      basis: 'order_request',
      at: now
    },
    utm: input.utm || {},
    page: input.page || null,
    source: p.source,
    status: 'new',
    created_at: now,
    telegram: { group: newTarget(), admin: notifyAdmin ? newTarget() : null },
    telegram_status: 'pending'
  }
}

/** Eski (bir mahsulotli) yozuvni yangi shaklga keltiradi. Hech narsa o'chirilmaydi. */
export function upgradeLegacyOrder(o) {
  if (!o.product_code) {
    const parsed = parseOrderId(o.id)
    o.product_code = (parsed && codeByPrefix(parsed.prefix)) || 'gepomer'
  }
  if (o.seq == null) o.seq = parseOrderId(o.id)?.seq ?? null
  if (!o.product_name) o.product_name = productLabel(o.product_code, o.product)
  if (!o.telegram) o.telegram = { group: newTarget(), admin: null }
  o.telegram_status = o.telegram.group?.status || 'pending'
  return o
}

/** Jarayon yuborish paytida to'xtagan bo'lsa: sending → pending (possibly_sent belgisi bilan) */
export function recoverSending(o) {
  let n = 0
  for (const t of Object.values(o.telegram || {})) {
    if (t && t.status === 'sending') {
      t.status = 'pending'
      t.possibly_sent = true
      n++
    }
  }
  o.telegram_status = o.telegram?.group?.status || 'pending'
  return n
}