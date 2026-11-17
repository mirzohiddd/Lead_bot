import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { config } from '../config/env.js'
import { createOrderHandler } from '../controllers/orderController.js'

const router = Router()

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.rateLimitMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'rate_limited',
    message: "Juda ko'p urinish. Iltimos, birozdan keyin qayta urinib ko'ring yoki bizga qo'ng'iroq qiling."
  }
})

// Faqat POST. Buyurtmalarni o'qiydigan ommaviy GET API ataylab yo'q.
router.post('/', orderLimiter, createOrderHandler)

export default router
