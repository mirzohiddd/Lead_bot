// Backend bilan aloqa. Manzil VITE_API_URL orqali boshqariladi.
// Bo'sh bo'lsa — shu domenning o'zi (/api), dev rejimda Vite proxy backendga yo'naltiradi.
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, { status = 0, fields = null } = {}) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

export function newIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

/**
 * Buyurtma yuboradi.
 * @param {object} payload { name, phone, product?, consent, marketingConsent, utm, page, website }
 * @param {string} idempotencyKey bitta forma urinishi uchun bir xil kalit — takroriy bosishda dublikat yaratilmaydi
 */
export async function createOrder(payload, idempotencyKey) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 20000)
  let res
  try {
    res = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(payload),
      signal: ctrl.signal
    })
  } catch (err) {
    throw new ApiError(
      err.name === 'AbortError'
        ? "Server javob bermadi. Internetni tekshirib, qayta urinib ko'ring."
        : "Internet aloqasi yo'q yoki server ishlamayapti. Qayta urinib ko'ring."
    )
  } finally {
    clearTimeout(timer)
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* JSON emas */
  }

  if (res.ok && data?.ok) return data

  if (res.status === 400 && data?.errors) {
    throw new ApiError("Ma'lumotlarni tekshiring.", { status: 400, fields: data.errors })
  }
  if (res.status === 429) {
    throw new ApiError(data?.message || "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring.", { status: 429 })
  }
  throw new ApiError(data?.message || "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring yoki bizga qo'ng'iroq qiling.", {
    status: res.status
  })
}
