// Server tomonidagi validatsiya. Frontend tekshiruviga ishonmaymiz.

export const PRODUCTS = {
  complex: 'Gepomer Complex',
  paste: 'Gepomer Pasta',
  syrup: 'Gepomer Sirop'
}

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

  // Mahsulot (ixtiyoriy)
  let product = null
  if (body.product !== undefined && body.product !== null && body.product !== '') {
    const key = clean(String(body.product)).toLowerCase()
    if (!PRODUCTS[key]) errors.product = "Mahsulot noto'g'ri tanlangan"
    else product = key
  }

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
  return { ok: true, value: { name, phone, product, marketingConsent, utm, page } }
}

/** Idempotency-Key sarlavhasini tekshiradi (UUID yoki 16–80 belgili xavfsiz satr) */
export function cleanIdempotencyKey(v) {
  if (typeof v !== 'string') return null
  const k = v.trim()
  return /^[A-Za-z0-9_-]{16,80}$/.test(k) ? k : null
}
