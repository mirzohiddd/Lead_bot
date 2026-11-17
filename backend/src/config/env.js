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

const isPlaceholder = (v) => !v || /^your_/.test(v) || v === '-1001234567890'

export const config = {
  nodeEnv: str('NODE_ENV', 'development'),
  isProd: str('NODE_ENV') === 'production',
  port: int('PORT', 3000),
  trustProxy: int('TRUST_PROXY', 0),

  frontendOrigins: str('FRONTEND_URL', 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean),

  rateLimitMax: int('RATE_LIMIT_MAX', 10),
  dedupWindowMs: int('DEDUP_WINDOW_MINUTES', 5) * 60 * 1000,

  ordersFile: path.resolve(ROOT_DIR, str('ORDERS_FILE', 'data/orders.json')),

  telegram: {
    token: str('TELEGRAM_BOT_TOKEN'),
    groupId: str('TELEGRAM_GROUP_ID'),
    adminId: str('TELEGRAM_ADMIN_ID'),
    notifyAdmin: bool('TELEGRAM_NOTIFY_ADMIN', false),
    retryIntervalMs: Math.max(10, int('TELEGRAM_RETRY_INTERVAL_SECONDS', 60)) * 1000,
    maxAttempts: Math.max(1, int('TELEGRAM_MAX_ATTEMPTS', 20)),
    requestTimeoutMs: 10_000,
    // Faqat test uchun: Telegram API manzilini almashtirish imkoniyati
    apiBase: str('TELEGRAM_API_BASE', 'https://api.telegram.org').replace(/\/+$/, '')
  }
}

/** Ishga tushishda konfiguratsiyani tekshiradi; muammolar ro'yxatini qaytaradi */
export function checkConfig() {
  const problems = []
  const t = config.telegram
  if (isPlaceholder(t.token)) problems.push('TELEGRAM_BOT_TOKEN to\'ldirilmagan')
  if (isPlaceholder(t.groupId)) problems.push('TELEGRAM_GROUP_ID to\'ldirilmagan')
  if (t.notifyAdmin && isPlaceholder(t.adminId)) {
    problems.push('TELEGRAM_NOTIFY_ADMIN=true, lekin TELEGRAM_ADMIN_ID to\'ldirilmagan')
  }
  if (!config.frontendOrigins.length) problems.push('FRONTEND_URL bo\'sh')
  return problems
}

export const telegramReady = () =>
  !isPlaceholder(config.telegram.token) && !isPlaceholder(config.telegram.groupId)
