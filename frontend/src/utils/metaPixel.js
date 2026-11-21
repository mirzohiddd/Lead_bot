// =====================================================================
//  Meta Pixel tracking (pixel kodi index.html da faqat BIR MARTA o'rnatilgan).
//
//  Hodisalar:
//   • PageView   — index.html da, sahifa ochilganda bir marta.
//   • CTA_Click  — data-cta atributi bor tugma/havola bosilganda (custom event).
//   • Lead       — faqat backend yangi buyurtmani qabul qilganda, har bir buyurtma uchun bir marta.
//
//  Meta'ga ism, telefon, alomatlar yoki boshqa sog'liq ma'lumotlari YUBORILMAYDI.
//  Faqat texnik ma'lumot: cta_id, tugma matni (cta_text) va buyurtma ID (eventID sifatida).
// =====================================================================

const CONSENT_KEY = 'gp_tracking_consent' // 'granted' | 'denied'
const LEAD_KEY = 'gp_lead_ids'
const CTA_DEDUP_MS = 800

const consentRequired = import.meta.env.VITE_TRACKING_CONSENT === 'required'

function fbq(...args) {
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

/* ---------------- Rozilik ---------------- */

/** Rozilik so'rash kerakmi (VITE_TRACKING_CONSENT=required va hali javob berilmagan) */
export function needsConsentPrompt() {
  return consentRequired && !read(CONSENT_KEY)
}

export function hasTrackingConsent() {
  return !consentRequired || read(CONSENT_KEY) === 'granted'
}

export function setTrackingConsent(granted) {
  write(CONSENT_KEY, granted ? 'granted' : 'denied')
  if (granted) {
    fbq('consent', 'grant')
    // Rozilikdan oldin PageView yuborilmagan edi — endi bir marta yuboramiz
    if (!window.__gpPageViewSent) {
      window.__gpPageViewSent = true
      fbq('track', 'PageView')
    }
  } else {
    fbq('consent', 'revoke')
  }
}

/* ---------------- CTA_Click ---------------- */

let lastCta = { id: '', at: 0 }

/** CTA_Click custom hodisasi. ctaId — joylashuvga xos identifikator (masalan, cta_hero_consultation) */
export function trackCta(ctaId, extra = {}) {
  if (!ctaId || !hasTrackingConsent()) return
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
  if (window.__gpCtaTracking) return
  window.__gpCtaTracking = true
  document.addEventListener(
    'click',
    (e) => {
      const el = e.target instanceof Element ? e.target.closest('[data-cta]') : null
      if (!el || el.disabled) return
      // cta_id joylashuvni aniq ko'rsatadi (cta_hero_..., cta_sticky_..., video_play_3 ...).
      // cta_text — tugmadagi ko'rinadigan matn (shaxsiy ma'lumot emas).
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
  if (!hasTrackingConsent()) return false
  fbq('track', 'Lead', {}, { eventID: orderId })
  return true
}