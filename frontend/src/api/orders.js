// =====================================================================
//  Backend bilan aloqa — DERMOLIFE COMPLEX buyurtmalari.
//
//  Manzil: VITE_API_URL (umumiy backend, masalan https://sizning-backend.onrender.com).
//   • Production'da VITE_API_URL berilmasa — so'rov yuborilmaydi, formada aniq xabar chiqadi.
//   • Dev rejimda bo'sh bo'lsa — Vite proxy /api ni localhost:3000 ga yo'naltiradi.
//
//  Umumiy backend API shartnomasi:
//   POST /api/orders
//   Headers: Content-Type: application/json, Idempotency-Key: <16–80 belgi>
//   Body:    { name, phone: '+998XXXXXXXXX', product_code: 'dermolife', product?, utm, page, website }
//            (rozilik checkboxi yo'q — consent/marketingConsent yuborilmaydi)
//   201 { ok: true, orderId: 'DL-000001' } — yangi buyurtma (DERMOLIFE Telegram guruhiga ketadi)
//   200 { ok: true, orderId, duplicate }   — takroriy (yangi buyurtma yaratilmagan)
//   400 { ok: false, errors: { field: msg } }
//   403 origin_not_allowed / product_origin_mismatch — bu domen backend'dagi DERMOLIFE_FRONTEND_URL da yo'q
//   429 rate_limited
// =====================================================================

const API_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')

/** API manzili sozlanganmi (dev'da proxy bor, shuning uchun har doim true) */
export const apiConfigured = Boolean(API_URL) || import.meta.env.DEV

export class ApiError extends Error {
  constructor(message, { status = 0, fields = null, code = '' } = {}) {
    super(message)
    this.status = status
    this.fields = fields
    this.code = code
  }
}

const MSG = {
  notConfigured: 'Буюртма тизими ҳали уланмаган. Илтимос, кейинроқ қайта уриниб кўринг.',
  notReady: 'Буюртма тизими DERMOLIFE буюртмалари учун ҳали созланмаган. Илтимос, кейинроқ қайта уриниб кўринг.',
  timeout: 'Сервер жавоб бермади. Интернетни текшириб, қайта уриниб кўринг.',
  network: 'Интернет алоқаси йўқ ёки сервер ишламаяпти. Қайта уриниб кўринг.',
  check: 'Маълумотларни текширинг.',
  rate: 'Жуда кўп уриниш. Бироздан кейин қайта уриниб кўринг.',
  generic: 'Хатолик юз берди. Илтимос, бироздан кейин қайта уриниб кўринг.'
}

/**
 * Backendni oldindan "uyg'otadi" (Render bepul tarifida birinchi so'rov 30–60 s kechikadi).
 * Faqat API manzili berilganda ishlaydi. Javob kutilmaydi.
 */
export function warmUpBackend() {
  if (!API_URL) return
  try {
    const run = () => fetch(`${API_URL}/api/health`, { method: 'GET', mode: 'no-cors', cache: 'no-store' }).catch(() => {})
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 3000 })
    else setTimeout(run, 1500)
  } catch {
    /* e'tiborsiz */
  }
}

export function newIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

/**
 * Buyurtma yuboradi.
 * @param {object} payload { name, phone, product_code, product, brand, productName, source, utm, page, website }
 * @param {string} idempotencyKey bitta forma urinishi uchun bir xil kalit — takroriy bosishda dublikat yaratilmaydi
 */
export async function createOrder(payload, idempotencyKey) {
  if (!apiConfigured) {
    console.warn('[DERMOLIFE] VITE_API_URL берилмаган — буюртма юборилмади.')
    throw new ApiError(MSG.notConfigured, { code: 'not_configured' })
  }

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 65000) // Render uyg'onishi uchun yetarli vaqt
  let res
  try {
    res = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(payload),
      signal: ctrl.signal
    })
  } catch (err) {
    throw new ApiError(err.name === 'AbortError' ? MSG.timeout : MSG.network, { code: 'network' })
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

  // Backend DERMOLIFE mahsulotini tanimaydi yoki bu domen DERMOLIFE_FRONTEND_URL ga qo'shilmagan
  if ((res.status === 400 && data?.errors?.product) || res.status === 403 || res.status === 404) {
    console.warn('[DERMOLIFE] Backend DERMOLIFE буюртмаларини ҳали қабул қилмайди:', res.status, data?.error || data?.errors)
    throw new ApiError(MSG.notReady, { status: res.status, code: 'backend_not_ready' })
  }
  if (res.status === 400 && data?.errors) {
    throw new ApiError(MSG.check, { status: 400, fields: data.errors })
  }
  if (res.status === 429) {
    throw new ApiError(MSG.rate, { status: 429 })
  }
  throw new ApiError(MSG.generic, { status: res.status })
}