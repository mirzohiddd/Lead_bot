// =====================================================================
//  Mahsulotlar reestri — bitta backend, uchta mahsulot.
//  Yangi mahsulot qo'shish: shu yerga yozuv + env.js da guruh ID va domen.
// =====================================================================
import { config } from './env.js'

export const PRODUCTS = {
  gepomer: {
    code: 'gepomer',
    name: 'GEPOMER',
    idPrefix: 'GP',
    source: 'Gepomer Landing',
    // Eski GEPOMER frontendi `product` maydonida shu qiymatlarni yuboradi (ixtiyoriy)
    variants: {
      complex: 'Gepomer Complex',
      paste: 'Gepomer Pasta',
      syrup: 'Gepomer Sirop'
    }
  },
  dermolife: {
    code: 'dermolife',
    name: 'DERMOLIFE COMPLEX',
    idPrefix: 'DL',
    source: 'Dermolife Landing',
    variants: {
      dermolife_complex: 'DERMOLIFE COMPLEX'
    }
  },
  halila: {
    code: 'halila',
    name: 'HALILA',
    idPrefix: 'HL',
    source: 'Halila Landing',
    variants: {}
  }
}

export const PRODUCT_CODES = Object.keys(PRODUCTS)

/** Mahsulot Telegram guruhi. Sozlanmagan bo'lsa — '' (hech qachon boshqa mahsulot guruhiga qaytmaydi) */
export function groupIdFor(code) {
  return config.productEnv[code]?.groupId || ''
}

export function groupEnvName(code) {
  return config.productEnv[code]?.groupEnv || ''
}

/** Mahsulotga ruxsat etilgan frontend domenlari */
export function originsFor(code) {
  return config.productEnv[code]?.origins || []
}

/** Buyurtma kartasida ko'rsatiladigan mahsulot nomi: "GEPOMER — Gepomer Pasta" */
export function productLabel(code, variant) {
  const p = PRODUCTS[code]
  if (!p) return code
  const v = variant && p.variants[variant]
  return v && v !== p.name ? `${p.name} — ${v}` : p.name
}
