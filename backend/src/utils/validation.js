// Server tomonidagi validatsiya. Frontend tekshiruviga ishonmaymiz.
import { PRODUCTS as PRODUCT_REGISTRY } from '../config/products.js'

// Orqaga moslik uchun: eski kod `PRODUCTS` deb GEPOMER variantlarini import qilardi
export const PRODUCTS = PRODUCT_REGISTRY.gepomer.variants

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'fbclid']

// O'zbekiston operator kodlari (+998 dan keyingi 2 raqam)
const OPERATOR_CODES = new Set([
  '20', '33', '50', '55', '61', '62', '65', '66', '67', '69',
  '70', '71', '72', '73', '74', '75', '76', '77', '78', '79',
  '88', '90', '91', '93', '94', '95', '97', '98', '99'
])

const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F​-‏‪-‮⁦-⁩]/g
const NAME_RE = /^[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳʻʼ'`‘’\-\s.]+$/u

const clean = (v) => (typeof v === 'string' ? v.replace(CONTROL_CHARS, '').replace(/\s+/g, ' ').trim() : '')
const present = (v) => v !== undefined && v !== null && v !== ''

/** "+998 90 123-45-67" → "+998901234567" yoki null */
export function normalizePhone(raw) {
  if (typeof raw !== 'string') return null
  let digits = raw.replace(/[\s\-()]/g, '')
  if (digits.startsWith('+')) digits = digits.slice(1)
  if (!/^\d+$/.test(digits)) return null
  if (digits.length === 9) digits = '998' + digits
  if (!/^998\d{9}$/.test(digits)) return null
  if (!OPERATOR_CODES.has(digits.slice(3, 5))) return null
  return '+' + digits
}

/**
 * Mahsulotni aniqlaydi va normalizatsiya qiladi.
 *  • Yangi format: product_code = gepomer | dermolife | halila (+ ixtiyoriy product = variant).
 *  • Eski GEPOMER formati: product_code yo'q, product = complex | paste | syrup | bo'sh → gepomer.
 *  • Eski DERMOLIFE formati: brand = 'dermolife' yoki product = 'dermolife_complex' → dermolife.
 *  • UTM parametrlari mahsulotni aniqlashda ISHLATILMAYDI.
 * @returns {{ code: string, variant: string|null } | { error: string }}
 */
export function resolveProduct(body) {
  const rawCode = present(body.product_code) ? clean(String(body.product_code)).toLowerCase() : ''
  const rawBrand = present(body.brand) ? clean(String(body.brand)).toLowerCase() : ''
  const rawProduct = present(body.product) ? clean(String(body.product)).toLowerCase() : ''

  const known = (c) => Object.hasOwn(PRODUCT_REGISTRY, c) // prototip kalitlari (constructor, __proto__) o'tmaydi
  if (rawCode && !known(rawCode)) return { error: "Noma'lum mahsulot kodi" }
  if (rawBrand && !known(rawBrand)) return { error: "Noma'lum mahsulot brendi" }
  if (rawCode && rawBrand && rawCode !== rawBrand) return { error: 'Mahsulot kodi va brendi mos emas' }

  let code = rawCode || rawBrand
  if (!code) {
    if (!rawProduct) code = 'gepomer' // eski GEPOMER frontendi mahsulotsiz yuboradi
    else {
      code = Object.keys(PRODUCT_REGISTRY).find(
        (c) => c === rawProduct || Object.hasOwn(PRODUCT_REGISTRY[c].variants, rawProduct)
      )
      if (!code) return { error: "Mahsulot noto'g'ri tanlangan" }
    }
  }

  const p = PRODUCT_REGISTRY[code]
  let variant = null
  if (rawProduct && rawProduct !== code) {
    if (!Object.hasOwn(p.variants, rawProduct)) return { error: "Mahsulot noto'g'ri tanlangan" }
    variant = rawProduct
  }
  return { code, variant }
}

/**
 * Buyurtma so'rovini tekshiradi.
 * @returns {{ ok: true, value: object } | { ok: false, errors: Record<string,string> }}
 */
export function validateOrder(body) {
  const errors = {}
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, errors: { _: "So'rov formati noto'g'ri" } }
  }

  // Ism
  const name = clean(body.name)
  if (!name) errors.name = 'Ismingizni kiriting'
  else if (name.length < 2) errors.name = "Ism kamida 2 ta harfdan iborat bo'lsin"
  else if (name.length > 60) errors.name = 'Ism juda uzun'
  else if (!NAME_RE.test(name)) errors.name = "Ismda faqat harflar bo'lsin"

  // Telefon
  const phone = normalizePhone(body.phone)
  if (!phone) errors.phone = "Telefon raqami noto'g'ri. Format: +998XXXXXXXXX"

  // Mahsulot
  const resolved = resolveProduct(body)
  if (resolved.error) errors.product = resolved.error

  // Rozilik
  if (body.consent !== true) {
    errors.consent = "Ma'lumotlarni qayta ishlashga rozilik bering"
  }
  const marketingConsent = body.marketingConsent === true

  // UTM — faqat ruxsat etilgan kalitlar, qisqa satrlar
  const utm = {}
  if (body.utm && typeof body.utm === 'object' && !Array.isArray(body.utm)) {
    for (const k of UTM_KEYS) {
      const v = clean(typeof body.utm[k] === 'string' ? body.utm[k] : '')
      if (v) utm[k] = v.slice(0, k === 'fbclid' ? 300 : 150)
    }
  }

  // Sahifa yo'li (faqat path, query emas)
  let page = clean(typeof body.page === 'string' ? body.page : '').slice(0, 200)
  if (page && !page.startsWith('/')) page = ''

  if (Object.keys(errors).length) return { ok: false, errors }
  return {
    ok: true,
    value: {
      name,
      phone,
      productCode: resolved.code,
      product: resolved.variant, // mahsulot ichidagi variant (masalan, gepomer: paste) yoki null
      marketingConsent,
      utm,
      page
    }
  }
}

/** Idempotency-Key sarlavhasini tekshiradi (UUID yoki 16–80 belgili xavfsiz satr) */
export function cleanIdempotencyKey(v) {
  if (typeof v !== 'string') return null
  const k = v.trim()
  return /^[A-Za-z0-9_-]{16,80}$/.test(k) ? k : null
}