// URL dagi UTM parametrlarini saqlab qo'yadi (sahifa ichida scroll qilinganda ham yo'qolmasin)
const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'fbclid']
const STORAGE_KEY = 'gepomer_utm'

export function captureUtm() {
  try {
    const params = new URLSearchParams(window.location.search)
    const found = {}
    for (const k of KEYS) {
      const v = params.get(k)
      if (v) found[k] = v.slice(0, 300)
    }
    if (Object.keys(found).length) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found))
  } catch {
    /* sessionStorage mavjud bo'lmasligi mumkin */
  }
}

export function getUtm() {
  try {
    const fromUrl = {}
    const params = new URLSearchParams(window.location.search)
    for (const k of KEYS) if (params.get(k)) fromUrl[k] = params.get(k)
    if (Object.keys(fromUrl).length) return fromUrl
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}
