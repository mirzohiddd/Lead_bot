// Buyurtmalar ombori — yagona interfeys.
//  • DATABASE_URL berilgan → PostgreSQL (production uchun tavsiya etiladi).
//  • Aks holda → JSON fayl (data/orders.json), avvalgidek.
// Qolgan kod (controller, telegramService) qaysi ombor ishlayotganini bilmaydi.
import { config } from '../config/env.js'

let impl = null

export async function initStore() {
  impl = config.databaseUrl ? await import('./stores/pgStore.js') : await import('./stores/jsonStore.js')
  return impl.init(config.ordersFile)
}

const call = (fn) => (...args) => {
  if (!impl) throw new Error('Ombor hali ishga tushirilmagan')
  return impl[fn](...args)
}

export const createOrder = call('createOrder')
export const updateTelegram = call('updateTelegram')
export const claimTelegram = call('claimTelegram')
export const getOrder = call('getOrder')
export const listDue = call('listDue')

export async function flush() {
  await impl?.flush()
}

export async function closeStore() {
  await impl?.close()
}