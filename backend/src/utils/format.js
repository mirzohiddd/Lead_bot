const TZ = 'Asia/Tashkent'

/** Telegram HTML parse_mode uchun xavfsiz matn */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** ISO sana → { date: '17.11.2026', time: '14:35' } (Toshkent vaqti) */
export function tashkentDateTime(iso) {
  const d = new Date(iso)
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value])
  )
  return { date: `${parts.day}.${parts.month}.${parts.year}`, time: `${parts.hour}:${parts.minute}` }
}

/** UTM manbasidan reklama kanalini aniqlaydi */
export function adChannel(utm = {}) {
  const src = (utm.utm_source || '').toLowerCase()
  if (['instagram', 'ig', 'insta'].includes(src)) return 'Instagram Target'
  if (['facebook', 'fb', 'meta'].includes(src)) return 'Facebook Target'
  if (src) return utm.utm_source
  if (utm.fbclid) return 'Meta reklamasi (fbclid)'
  return "Aniqlanmagan (to'g'ridan-to'g'ri)"
}

export const formatOrderId = (seq) => `GP-${String(seq).padStart(6, '0')}`
