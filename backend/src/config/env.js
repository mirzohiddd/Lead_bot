import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const ROOT_DIR = path.resolve(__dirname, '../..')

dotenv.config({ path: path.join(ROOT_DIR, '.env'), quiet: true })

const str = (name, fallback = '') => (process.env[name] ?? fallback).toString().trim()
const int = (name, fallback) => {
  const n = Number.parseInt(process.env[name], 10)
  return Number.isFinite(n) ? n : fallback
}
const bool = (name, fallback = false) => {
  const v = str(name).toLowerCase()
  if (!v) return fallback
  return ['1', 'true', 'yes', 'on'].includes(v)
}
const list = (name) =>
  str(name)
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean)

export const isPlaceholder = (v) =>
  !v || /^your_/.test(v) || ['-1001234567890', '-1001111111111', '-1002222222222', '-1003333333333'].includes(v)

/* ------------------------------------------------------------------
 * Har bir mahsulotning Telegram guruhi va frontend domen(lar)i.
 * GEPOMER: TELEGRAM_GEPOMER_GROUP_ID bo'lmasa, eski TELEGRAM_GROUP_ID ishlatiladi (zaxira).
 * DERMOLIFE / HALILA: faqat o'z guruhi. Sozlanmagan bo'lsa — boshqa guruhga YUBORILMAYDI.
 * ------------------------------------------------------------------ */
const gepomerGroup = isPlaceholder(str('TELEGRAM_GEPOMER_GROUP_ID'))
  ? str('TELEGRAM_GROUP_ID')
  : str('TELEGRAM_GEPOMER_GROUP_ID')

const productEnv = {
  gepomer: {
    groupId: isPlaceholder(gepomerGroup) ? '' : gepomerGroup,
    groupEnv: 'TELEGRAM_GEPOMER_GROUP_ID (yoki zaxira TELEGRAM_GROUP_ID)',
    origins: list('FRONTEND_URL')
  },
  dermolife: {
    groupId: isPlaceholder(str('TELEGRAM_DERMOLIFE_GROUP_ID')) ? '' : str('TELEGRAM_DERMOLIFE_GROUP_ID'),
    groupEnv: 'TELEGRAM_DERMOLIFE_GROUP_ID',
    origins: list('DERMOLIFE_FRONTEND_URL')
  },
  halila: {
    groupId: isPlaceholder(str('TELEGRAM_HALILA_GROUP_ID')) ? '' : str('TELEGRAM_HALILA_GROUP_ID'),
    groupEnv: 'TELEGRAM_HALILA_GROUP_ID',
    origins: list('HALILA_FRONTEND_URL')
  }
}

export const config = {
  nodeEnv: str('NODE_ENV', 'development'),
  isProd: str('NODE_ENV') === 'production',
  port: int('PORT', 3000),
  trustProxy: int('TRUST_PROXY', 0),

  productEnv,
  // CORS: uchala mahsulot domenlarining birlashmasi (hech qachon "*")
  frontendOrigins: [...new Set(Object.values(productEnv).flatMap((p) => p.origins))],
  // true bo'lsa, Origin sarlavhasisiz (curl, server-to-server) POST so'rovlari rad etiladi
  requireOrigin: bool('REQUIRE_ORIGIN', false),

  rateLimitMax: int('RATE_LIMIT_MAX', 10),
  dedupWindowMs: int('DEDUP_WINDOW_MINUTES', 5) * 60 * 1000,

  // Ombor: DATABASE_URL berilsa — PostgreSQL, aks holda JSON fayl
  databaseUrl: str('DATABASE_URL'),
  databaseSsl: str('DATABASE_SSL', 'auto'), // auto | true | false
  ordersFile: path.resolve(ROOT_DIR, str('ORDERS_FILE', 'data/orders.json')),

  telegram: {
    token: str('TELEGRAM_BOT_TOKEN'),
    adminId: str('TELEGRAM_ADMIN_ID'),
    notifyAdmin: bool('TELEGRAM_NOTIFY_ADMIN', false),
    retryIntervalMs: Math.max(10, int('TELEGRAM_RETRY_INTERVAL_SECONDS', 60)) * 1000,
    maxAttempts: Math.max(1, int('TELEGRAM_MAX_ATTEMPTS', 20)),
    requestTimeoutMs: 10_000,
    // Faqat test uchun: Telegram API manzilini almashtirish imkoniyati
    apiBase: str('TELEGRAM_API_BASE', 'https://api.telegram.org').replace(/\/+$/, '')
  }
}

/** Ishga tushishda konfiguratsiyani tekshiradi; muammolar ro'yxatini qaytaradi (ID qiymatlari logga chiqmaydi) */
export function checkConfig() {
  const problems = []
  const t = config.telegram
  if (isPlaceholder(t.token)) problems.push("TELEGRAM_BOT_TOKEN to'ldirilmagan")
  for (const [code, p] of Object.entries(productEnv)) {
    if (!p.groupId) problems.push(`${code}: Telegram guruh ID sozlanmagan (${p.groupEnv}) — buyurtmalar pending holatda saqlanadi`)
    if (!p.origins.length) problems.push(`${code}: frontend domeni sozlanmagan — brauzerdan buyurtma qabul qilinmaydi`)
  }
  if (t.notifyAdmin && isPlaceholder(t.adminId)) {
    problems.push("TELEGRAM_NOTIFY_ADMIN=true, lekin TELEGRAM_ADMIN_ID to'ldirilmagan")
  }
  if (!config.databaseUrl && config.isProd) {
    problems.push("DATABASE_URL yo'q — buyurtmalar JSON faylda saqlanadi (Render'da qayta deploy'da yo'qolishi mumkin)")
  }
  return problems
}

export const telegramReady = () => !isPlaceholder(config.telegram.token)