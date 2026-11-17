# GEPOMER Landing — Vue frontend + Node.js backend + Telegram bot

```text
gepomer-project/
├── frontend/                 # Mavjud Vue 3 + Vite landing (dizayn o'zgarmagan)
│   ├── src/api/orders.js     # POST /api/orders so'rovi (VITE_API_URL)
│   ├── src/utils/utm.js      # UTM parametrlarini saqlash
│   └── src/components/OrderForm.vue
└── backend/                  # Node.js + Express
    ├── src/
    │   ├── server.js
    │   ├── routes/orders.js
    │   ├── controllers/orderController.js
    │   ├── services/telegramService.js   # xabar yuborish + qayta yuborish
    │   ├── services/orderStore.js        # JSON ombor (atomik yozish, navbat)
    │   ├── utils/validation.js
    │   ├── utils/format.js
    │   └── config/env.js
    ├── scripts/get-chat-id.js
    ├── data/orders.json      # birinchi buyurtmada avtomatik yaratiladi
    ├── .env.example
    └── package.json
```

## Qanday ishlaydi

1. Mijoz formani to'ldiradi → frontend `POST /api/orders` yuboradi (`Idempotency-Key` sarlavhasi bilan).
2. Backend ma'lumotni tekshiradi (ism, `+998XXXXXXXXX`, mahsulot, rozilik, UTM).
3. `GP-000001` ko'rinishida unikal ID beradi va `data/orders.json` ga **avval saqlaydi**.
4. Telegram guruhga xabar yuboradi (`TELEGRAM_NOTIFY_ADMIN=true` bo'lsa — adminga ham).
5. Telegram ishlamasa, buyurtma `telegram_status: "pending"` holatida qoladi va har `TELEGRAM_RETRY_INTERVAL_SECONDS` da qayta yuboriladi (30 s, 1 daq, 2 daq … 30 daqiqagacha). `TELEGRAM_MAX_ATTEMPTS` urinishdan keyin `failed` bo'ladi.
6. Mijozga: **"Arizangiz qabul qilindi! Tez orada siz bilan bog'lanamiz."**

**Takroriy buyurtmadan himoya:**
- tugma yuborish paytida bloklanadi;
- bitta ariza uchun bitta `Idempotency-Key` ishlatiladi;
- `DEDUP_WINDOW_MINUTES` ichida bir xil raqamdan kelgan ariza yangi buyurtma yaratmaydi.

**Xavfsizlik:**
- Helmet va rate limit (bir IP dan 15 daqiqada 10 ta buyurtma) yoqilgan.
- CORS va Origin tekshiruvi faqat `FRONTEND_URL` dagi domenlarga ruxsat beradi.
- Body hajmi 10 KB bilan cheklangan.
- Botlarga qarshi honeypot maydoni bor.
- Telegram xabarida foydalanuvchi kiritgan matnlar HTML-escape qilinadi.
- Ism va telefon server loglariga yozilmaydi, logda faqat buyurtma ID'si chiqadi.
- Buyurtmalarni o'qish uchun GET API yo'q.

---

## 1. Botni BotFather orqali yaratish

1. Telegramda **@BotFather** ni oching → `/newbot`.
2. Bot nomini kiriting (masalan, `Gepomer Buyurtmalar`).
3. Username kiriting, u `bot` bilan tugashi kerak (masalan, `gepomer_orders_bot`).
4. BotFather token beradi: `1234567890:AA...`. Bu **TELEGRAM_BOT_TOKEN**. Uni hech kimga bermang va frontendga qo'ymang.

## 2. Botni guruhga qo'shish

1. Buyurtmalar keladigan guruhni oching (yoki yangisini yarating).
2. Guruh nomi → **Add members** → botning username'ini qidirib qo'shing.
3. Bot xabar yubora olishi kerak. Guruhda yozish cheklangan bo'lsa, botni **admin** qiling va "Send messages" huquqini yoqing.

## 3. Group ID va Admin ID ni topish

**Usul A — loyihadagi skript bilan (tavsiya etiladi):**
1. `backend/.env` ga `TELEGRAM_BOT_TOKEN` ni yozing.
2. Guruhda `/start@sizning_bot_username` deb yozing. Botingizga shaxsiy chatda ham `/start` yozing.
3. Skriptni ishga tushiring:
   ```bash
   cd backend
   npm install
   npm run chat-id
   ```
   Natija:
   ```text
   -1001987654321   supergroup           Gepomer buyurtmalar   ← TELEGRAM_GROUP_ID
   123456789        shaxsiy (admin ID)   Ali                   ← TELEGRAM_ADMIN_ID
   ```

**Usul B:** brauzerda `https://api.telegram.org/bot<TOKEN>/getUpdates` ni oching va `"chat":{"id":-100...}` qiymatini toping.

Shaxsiy ID'ni **@userinfobot** orqali ham bilish mumkin.

> Guruh ID odatda `-100` bilan boshlanadi. Keyinroq guruh supergroup'ga aylansa, ID o'zgaradi. Bunday holatda backend logida yangi ID ko'rsatiladi.

## 4. `.env` faylini to'ldirish

```bash
cd backend
cp .env.example .env
```
```env
NODE_ENV=development
PORT=3000
TELEGRAM_BOT_TOKEN=1234567890:AA...
TELEGRAM_ADMIN_ID=123456789
TELEGRAM_GROUP_ID=-1001987654321
TELEGRAM_NOTIFY_ADMIN=false        # true — adminga ham yuboriladi
FRONTEND_URL=http://localhost:5173
```
Qo'shimcha sozlamalar (rate limit, dedup, retry) `.env.example` faylida izohlari bilan berilgan.

## 5. Backendni ishga tushirish

```bash
cd backend
npm install
npm run dev
```
Logda shunday chiqishi kerak:
```text
[store] 0 ta buyurtma yuklandi
[telegram] bot ulandi: @gepomer_orders_bot
[server] http://localhost:3000 (development)
```
Tekshirish: `curl http://localhost:3000/api/health` → `{"ok":true}`

## 6. Frontendni ulash

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```
Dev rejimda `VITE_API_URL` bo'sh qoladi: Vite `/api` so'rovlarini `localhost:3000` ga o'zi yo'naltiradi (`vite.config.js` → `server.proxy`).
Backend alohida domenda bo'lsa, `frontend/.env` ga yozing:
```env
VITE_API_URL=https://api.gepomer.uz
```
`VITE_` o'zgaruvchilari build vaqtida kodga yoziladi. O'zgartirsangiz, `npm run build` ni qayta bajaring.

## 7. Test buyurtma

1. `http://localhost:5173/?utm_source=instagram&utm_campaign=test` ni oching.
2. Formani to'ldirib, "Buyurtma berish" ni bosing.
3. Natijani tekshiring:
   - sahifada "Arizangiz qabul qilindi!" oynasi chiqadi;
   - Telegram guruhda `🔔 YANGI BUYURTMA — GEPOMER` xabari keladi ("Reklama: Instagram Target", UTM ro'yxati bilan);
   - `backend/data/orders.json` da `"telegram_status": "sent"` turadi.
4. Retry'ni sinash: `.env` da `TELEGRAM_GROUP_ID` ni vaqtincha noto'g'ri qiling va buyurtma bering. Buyurtma `pending` holatida saqlanadi. ID'ni to'g'rilab backendni qayta ishga tushirsangiz, xabar avtomatik yuboriladi.

## 8. Production'ga deploy (VPS: Ubuntu + Nginx + PM2)

```bash
# Serverda
git clone <repo> /var/www/gepomer && cd /var/www/gepomer

# Backend
cd backend && npm ci --omit=dev
cp .env.example .env && nano .env
#   NODE_ENV=production
#   FRONTEND_URL=https://gepomer.uz,https://www.gepomer.uz
#   TRUST_PROXY=1            ← Nginx ortida bo'lgani uchun
chmod 600 .env
sudo npm i -g pm2
pm2 start src/server.js --name gepomer-api --env production -i 1   # faqat 1 instansiya!
pm2 save && pm2 startup

# Frontend
cd ../frontend && npm ci && npm run build   # → frontend/dist
```

Nginx (frontend va API bitta domenda — bunda `VITE_API_URL` bo'sh qoladi):
```nginx
server {
    server_name gepomer.uz www.gepomer.uz;
    root /var/www/gepomer/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
SSL: `sudo certbot --nginx -d gepomer.uz -d www.gepomer.uz`

**Muhim eslatmalar:**
- JSON ombor **bitta jarayon** uchun mo'ljallangan. PM2 cluster, bir nechta instansiya va serverless (Vercel/Netlify Functions) ishlatmang. Ular faylni bo'lishmaydi yoki o'chirib yuboradi.
- `backend/data/` papkasini muntazam zaxiralang, masalan cron orqali kuniga bir marta nusxa oling.
- Render/Railway kabi platformalarda **persistent disk** ulang, aks holda qayta deploy'da `orders.json` o'chib ketadi. Environment variable'lar platformaning "Environment" bo'limiga kiritiladi, `.env` fayl yuklanmaydi.
- `.env` git'ga tushmaydi (`.gitignore` da bor).

## Rozilik

Formada ikkita belgi bor:
- "Ma'lumotlarim buyurtma bo'yicha bog'lanish uchun qayta ishlanishiga roziman" — majburiy, oldindan belgilanmagan;
- "Aksiya va yangiliklar haqida xabar olishga roziman" — ixtiyoriy.

Ikkalasi ham `orders.json` da `consent` maydonida saqlanadi, marketing roziligi Telegram xabarida ham ko'rsatiladi. Raqamlardan reklama/marketing uchun faqat `consent.marketing: true` bo'lgan mijozlarda foydalaning. Footer'dagi "Maxfiylik siyosati" havolasiga haqiqiy hujjatni joylashtiring.
