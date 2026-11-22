// O'zbekiston mobil va shahar operator kodlari (+998 dan keyingi 2 ta raqam)
const OPERATOR_CODES = [
  '20', '33', '50', '55', '61', '62', '65', '66', '67', '69',
  '70', '71', '72', '73', '74', '75', '76', '77', '78', '79',
  '88', '90', '91', '93', '94', '95', '97', '98', '99'
]

/** Kiritilgan matndan +998 dan keyingi 9 ta raqamni ajratib oladi */
export function extractLocalDigits(value) {
  let digits = String(value || '').replace(/\D/g, '')
  if (digits.startsWith('998')) digits = digits.slice(3)
  return digits.slice(0, 9)
}

/** 9 ta raqamni "+998 90 123 45 67" ko'rinishiga keltiradi */
export function formatPhone(local) {
  const d = local.slice(0, 9)
  let out = '+998'
  if (d.length > 0) out += ' ' + d.slice(0, 2)
  if (d.length > 2) out += ' ' + d.slice(2, 5)
  if (d.length > 5) out += ' ' + d.slice(5, 7)
  if (d.length > 7) out += ' ' + d.slice(7, 9)
  return out
}

export function validateName(name) {
  const v = String(name || '').trim()
  if (!v) return 'Исмингизни киритинг'
  if (v.length < 2) return 'Исм камида 2 та ҳарфдан иборат бўлсин'
  if (v.length > 40) return 'Исм жуда узун'
  if (!/^[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳʻʼ'`‘’\s-]+$/.test(v)) return 'Исмда фақат ҳарфлар бўлсин'
  return ''
}

export function validatePhone(local) {
  if (!local) return 'Телефон рақамингизни киритинг'
  if (local.length < 9) return 'Рақам тўлиқ эмас: +998 XX XXX XX XX'
  if (!OPERATOR_CODES.includes(local.slice(0, 2))) return 'Оператор коди нотўғри'
  return ''
}