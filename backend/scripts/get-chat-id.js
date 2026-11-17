// Botga kelgan oxirgi xabarlardan chat ID larni ko'rsatadi.
// Ishlatish: botni guruhga qo'shing, guruhda istalgan xabar yozing, so'ng: npm run chat-id
import { config } from '../src/config/env.js'

const token = config.telegram.token
if (!token || token.startsWith('your_')) {
  console.error('Avval .env faylida TELEGRAM_BOT_TOKEN ni to\'ldiring.')
  process.exit(1)
}

const res = await fetch(`${config.telegram.apiBase}/bot${token}/getUpdates`)
const data = await res.json()
if (!data.ok) {
  console.error('Xato:', data.description)
  process.exit(1)
}

const chats = new Map()
for (const u of data.result) {
  const msg = u.message || u.my_chat_member || u.channel_post || u.edited_message
  const chat = msg?.chat
  if (chat) chats.set(chat.id, chat)
  const from = u.message?.from
  if (from && !from.is_bot) chats.set(`user:${from.id}`, { id: from.id, type: 'shaxsiy (admin ID)', first_name: from.first_name })
}

if (!chats.size) {
  console.log("Hech narsa topilmadi. Botga yoki guruhga yangi xabar yozib, qayta ishga tushiring.")
} else {
  for (const c of chats.values()) {
    console.log(`${String(c.id).padEnd(16)} ${c.type.padEnd(20)} ${c.title || c.first_name || ''}`)
  }
}
