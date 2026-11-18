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
        ? 'Сервер жавоб бермади. Интернетни текшириб, қайта уриниб кўринг.'
        : 'Интернет алоқаси йўқ ёки сервер ишламаяпти. Қайта уриниб кўринг.'
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

  // Server xabarlari lotinchada keladi — foydalanuvchiga kirillcha matn ko'rsatamiz

  if (res.status === 400 && data?.errors) {
    throw new ApiError('Маълумотларни текширинг.', { status: 400, fields: data.errors })
  }
  if (res.status === 429) {
    throw new ApiError('Жуда кўп уриниш. Бироздан кейин қайта уриниб кўринг.', { status: 429 })
  }
  throw new ApiError('Хатолик юз берди. Илтимос, қайта уриниб кўринг ёки бизга қўнғироқ қилинг.', {
    status: res.status
  })
}