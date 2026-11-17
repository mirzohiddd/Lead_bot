import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { config, checkConfig } from './config/env.js'
import ordersRouter from './routes/orders.js'
import { initStore, flush } from './services/orderStore.js'
import { startRetryWorker, stopRetryWorker, checkBot } from './services/telegramService.js'

const app = express()

app.disable('x-powered-by')
if (config.trustProxy) app.set('trust proxy', config.trustProxy)

app.use(helmet())

app.use(
  cors({
    origin(origin, cb) {
      // Origin yo'q (curl, server-to-server) — CORS kerak emas, lekin brauzer so'rovlari tekshiriladi
      if (!origin) return cb(null, true)
      cb(null, config.frontendOrigins.includes(origin.replace(/\/+$/, '')))
    },
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Idempotency-Key'],
    maxAge: 600
  })
)

// Ruxsat etilmagan saytdan kelgan brauzer so'rovlarini butunlay rad etamiz
// (CORS faqat javobni o'qishni bloklaydi, so'rov baribir bajarilishi mumkin edi)
app.use('/api', (req, res, next) => {
  const origin = req.get('Origin')
  if (origin && !config.frontendOrigins.includes(origin.replace(/\/+$/, ''))) {
    return res.status(403).json({ ok: false, error: 'origin_not_allowed' })
  }
  next()
})

// Umumiy himoya: bir IP dan daqiqasiga 60 so'rov
app.use('/api', rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: 'draft-8', legacyHeaders: false }))

app.use(express.json({ limit: '10kb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/orders', ordersRouter)

// 404
app.use('/api', (_req, res) => res.status(404).json({ ok: false, error: 'not_found' }))

// Xatolar — foydalanuvchi ma'lumotlari logga yozilmaydi
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, error: 'bad_json', message: "So'rov formati noto'g'ri" })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ ok: false, error: 'too_large' })
  }
  console.error('[server] xato:', err.message)
  res.status(500).json({
    ok: false,
    error: 'server_error',
    message: "Serverda xatolik yuz berdi. Iltimos, qayta urinib ko'ring yoki bizga qo'ng'iroq qiling."
  })
})

async function main() {
  const problems = checkConfig()
  problems.forEach((p) => console.warn(`[config] ⚠️  ${p}`))

  const { total, recovered } = await initStore(config.ordersFile)
  console.info(`[store] ${total} ta buyurtma yuklandi${recovered ? `, ${recovered} ta qayta yuborishga qo'yildi` : ''}`)

  const botName = await checkBot()
  if (botName) console.info(`[telegram] bot ulandi: @${botName}`)
  else console.warn('[telegram] ⚠️  bot ulanmadi — buyurtmalar saqlanadi va keyin qayta yuboriladi')

  startRetryWorker()

  const server = app.listen(config.port, () => {
    console.info(`[server] http://localhost:${config.port} (${config.nodeEnv})`)
    console.info(`[server] CORS ruxsat: ${config.frontendOrigins.join(', ')}`)
  })

  const shutdown = async (sig) => {
    console.info(`[server] ${sig} — to'xtatilmoqda...`)
    stopRetryWorker()
    server.close(async () => {
      await flush()
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10_000).unref()
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  console.error('[server] ishga tushmadi:', err.message)
  process.exit(1)
})

export default app
