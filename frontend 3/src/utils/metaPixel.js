// =====================================================================
//  Meta Pixel — DERMOLIFE COMPLEX
//
//  • Pixel ID faqat VITE_META_PIXEL_ID orqali beriladi. Berilmasa — pixel umuman yuklanmaydi,
//    hech qanday hodisa yuborilmaydi (boshqa loyihaning Pixel ID'si bu yerda yo'q).
//  • Pixel skripti faqat BIR MARTA yuklanadi (initPixel ikki marta chaqirilsa ham).
//
//  Hodisalar:
//   • PageView   — sahifa ochilganda bir marta (rozilik talab qilinsa — rozilikdan keyin bir marta).
//   • CTA_Click  — data-cta atributi bor tugma/havola bosilganda (custom event, har CTA o'z cta_id si bilan).
//   • Lead       — faqat backend yangi buyurtmani qabul qilganda, har bir buyurtma uchun bir marta.
//
//  Meta'ga ism, telefon, belgilar (alomatlar) yoki boshqa sog'liq ma'lumotlari YUBORILMAYDI.
//  Faqat texnik ma'lumot: cta_id, tugma matni (cta_text) va buyurtma ID (eventID sifatida).
// =====================================================================

const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID || '').trim()
const consentRequired = import.meta.env.VITE_TRACKING_CONSENT === 'required'

const CONSENT_KEY = 'dl_tracking_consent' // 'granted' | 'denied'
const LEAD_KEY = 'dl_lead_ids'
const CTA_DEDUP_MS = 800

let pageViewSent = false

export const pixelEnabled = /^\d{6,20}$/.test(PIXEL_ID)

function fbq(...args) {
  if (!pixelEnabled) return
  if (typeof window.fbq === 'function') {
    try {
      window.fbq(...args)
    } catch {
      /* pixel bloklangan bo'lishi mumkin */
    }
  }
}

function read(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* private rejim */
  }
}

/* ---------------- Pixel'ni yuklash ---------------- */

/** Meta'ning rasmiy bazaviy kodi (fbq navbati + fbevents.js asinxron yuklanadi) */
function loadPixelScript() {
  if (window.fbq) return
  const n = (window.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
  })
  if (!window._fbq) window._fbq = n
  n.push = n
  n.loaded = true
  n.version = '2.0'
  n.queue = []
  const t = document.createElement('script')
  t.async = true
  t.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(t)
}

export function initPixel() {
  if (!pixelEnabled || window.__dlPixelInit) return
  window.__dlPixelInit = true
  loadPixelScript()
  // Avtomatik "SubscribedButtonClick" va forma maydonlarini avtomatik aniqlash o'chiriladi:
  // CTA'lar faqat o'zimizning CTA_Click hodisasi bilan hisoblanadi, forma ma'lumotlari Meta'ga ketmaydi.
  fbq('set', 'autoConfig', false, PIXEL_ID)
  if (!hasTrackingConsent()) fbq('consent', 'revoke')
  fbq('init', PIXEL_ID)
  if (hasTrackingConsent()) sendPageView()
}

function sendPageView() {
  if (pageViewSent) return
  pageViewSent = true
  fbq('track', 'PageView')
}

/* ---------------- Rozilik ---------------- */

/** Rozilik so'rash kerakmi (Pixel yoqilgan, VITE_TRACKING_CONSENT=required va hali javob berilmagan) */
export function needsConsentPrompt() {
  return pixelEnabled && consentRequired && !read(CONSENT_KEY)
}

export function hasTrackingConsent() {
  return !consentRequired || read(CONSENT_KEY) === 'granted'
}

export function setTrackingConsent(granted) {
  write(CONSENT_KEY, granted ? 'granted' : 'denied')
  if (granted) {
    fbq('consent', 'grant')
    sendPageView() // rozilikdan oldin yuborilmagan edi — endi bir marta
  } else {
    fbq('consent', 'revoke')
  }
}

/* ---------------- CTA_Click ---------------- */

let lastCta = { id: '', at: 0 }

/** CTA_Click custom hodisasi. ctaId — joylashuvga xos identifikator (masalan, cta_hero_consultation) */
export function trackCta(ctaId, extra = {}) {
  if (!pixelEnabled || !ctaId || !hasTrackingConsent()) return
  const now = Date.now()
  if (lastCta.id === ctaId && now - lastCta.at < CTA_DEDUP_MS) return // ikki marta tegish
  lastCta = { id: ctaId, at: now }
  fbq('trackCustom', 'CTA_Click', { cta_id: ctaId, ...extra })
}

/**
 * Bitta delegatsiyalangan listener: [data-cta] elementlar bosilganda CTA_Click yuboradi.
 * Har bir tugmaga alohida listener qo'shilmaydi → kam xotira, memory leak yo'q.
 */
export function initCtaTracking() {
  if (!pixelEnabled || window.__dlCtaTracking) return
  window.__dlCtaTracking = true
  document.addEventListener(
    'click',
    (e) => {
      const el = e.target instanceof Element ? e.target.closest('[data-cta]') : null
      if (!el || el.disabled) return
      const text = (el.textContent || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 60)
      trackCta(el.dataset.cta, text ? { cta_text: text } : {})
    },
    { passive: true, capture: true }
  )
}

/* ---------------- Lead ---------------- */

function sentLeads() {
  try {
    return JSON.parse(read(LEAD_KEY) || '[]')
  } catch {
    return []
  }
}

/**
 * Lead — faqat backend YANGI buyurtma yaratganda (duplicate emas) va shu buyurtma uchun hali yuborilmagan bo'lsa.
 * eventID = buyurtma ID: Meta takroriy hodisalarni shu bo'yicha ham birlashtiradi.
 * @returns {boolean} yuborildimi
 */
export function trackLead(response) {
  const orderId = response?.orderId
  if (!orderId || response.duplicate) return false
  const sent = sentLeads()
  if (sent.includes(orderId)) return false
  write(LEAD_KEY, JSON.stringify([...sent, orderId].slice(-20)))
  if (!pixelEnabled || !hasTrackingConsent()) return false
  fbq('track', 'Lead', {}, { eventID: orderId })
  return true
}
