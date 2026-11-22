# DERMOLIFE COMPLEX — Instagram Target landing (frontend)

Vue 3 + Vite. Bitta ustunli mobil sahifa: desktopda markazda turadi, kengligi 430px. Matnlar o'zbek kirill alifbosida.

## Ishga tushirish

```bash
npm install
cp .env.example .env      # qiymatlarni to'ldiring (pastga qarang)
npm run dev               # http://localhost:5173
npm run build             # tayyor fayllar dist/ papkasida
npm run preview           # build natijasini ko'rish
```

Vercel uchun: Framework — **Vite**, Root Directory — `frontend`, Build — `npm run build`, Output — `dist`.
Environment variable'larni Vercel → Settings → Environment Variables bo'limiga kiriting. O'zgartirgandan keyin **Redeploy** qiling: `VITE_` qiymatlari build paytida kodga yoziladi.

## Sozlamalar (`.env`)

| O'zgaruvchi | Vazifasi |
|---|---|
| `VITE_API_URL` | Backend manzili. Bo'sh bo'lsa, production'da buyurtma yuborilmaydi va formada «Буюртма тизими ҳали уланмаган» xabari chiqadi. |
| `VITE_META_PIXEL_ID` | DERMOLIFE'ning **alohida** Pixel ID'si. Bo'sh bo'lsa, pixel umuman yuklanmaydi. |
| `VITE_TRACKING_CONSENT` | `required` bo'lsa, rozilik paneli chiqadi va rozilikdan oldin Meta'ga hech narsa ketmaydi. |
| `VITE_PRIVACY_URL` | Maxfiylik siyosati manzili. Standart qiymati — `public/privacy.html`. |

Bot tokeni va Telegram ID **hech qachon** frontendga yozilmaydi.

## Tuzilma

```text
src/
├── App.vue                 # 14 ta bo'lim (tartibi pastda)
├── main.js
├── api/orders.js           # POST /api/orders — barcha API so'rovlari shu yerda
├── components/
│   ├── BrandLogo.vue       # DERMOLIFE complex logotipi (SVG + matn)
│   ├── VideoCarousel.vue   # 9:16, video karta ichida ijro etiladi
│   ├── OrderForm.vue       # Ism, +998 telefon, mahsulot, rozilik
│   ├── AccordionList.vue, BaseModal.vue, ConsentBar.vue, AppIcon.vue
├── data/content.js         # BARCHA matnlar, kontaktlar, videolar
├── utils/metaPixel.js      # PageView / CTA_Click / Lead
├── utils/form.js, utils/utm.js
├── styles/main.css         # ranglar (yashil palitra), tugmalar
└── assets/products/        # soap, cream, detox (.webp)
public/privacy.html         # maxfiylik siyosati namunasi
```

**Bo'limlar:**
1. Hero
2. Teri haqida ma'lumot va statistika
3. Muammolar (accordion)
4. Mutaxassis tavsiyasi
5. Alomatlar (checkbox)
6. Teri parvarishi
7. Mahsulotlar
8. Tarkib va xususiyatlar
9. Kimlar uchun va qo'llash
10. Video sharhlar
11. Buyurtma formasi
12. Mijozlar fikri
13. FAQ
14. Yakuniy CTA va footer

## `[ТЎЛДИРИШ]` — to'ldirilishi kerak bo'lgan joylar

Tasdiqlangan ma'lumot berilmagan joylar `src/data/content.js` va `public/privacy.html` fayllarida `[ТЎЛДИРИШ]` deb belgilangan:

- **Kontaktlar:** telefon, Telegram, Instagram. Bo'sh bo'lsa, qo'ng'iroq tugmalari va ijtimoiy tarmoq belgilari ko'rinmaydi.
- **Kompaniya:** nomi va manzili.
- **Mahsulot ma'lumoti:** krem va sirop tarkibi, qo'llash tartibi, narx, yetkazib berish shartlari.
- **Hujjatlar:** sertifikat yoki ruxsatnoma raqami.
- **Fikrlar:** mutaxassis fikri, mijozlar sharhlari. Faqat haqiqiy va rozilik bilan olinganlarini qo'shing.
- **Maxfiylik siyosati:** kompaniya ma'lumotlari.

Haqiqiy logotip fayli bo'lsa, `src/components/BrandLogo.vue` ichida `<img>` bilan almashtiring.

## CTA tugmalari (har birining matni va `data-cta` identifikatori boshqalardan farq qiladi)

| `id` = `data-cta` | Matn | Qayerga olib boradi |
|---|---|---|
| `cta_hero_consultation` | БЕПУЛ МАСЛАҲАТ ОЛИШ | forma |
| `cta_hero_product` | МАҲСУЛОТ БИЛАН ТАНИШИШ | mahsulotlar |
| `cta_conditions_details` | БАТАФСИЛ МАЪЛУМОТ | teri parvarishi |
| `cta_expert_contact` | МУТАХАССИС БИЛАН БОҒЛАНИШ | forma |
| `cta_symptoms_advice` | НАТИЖА БЎЙИЧА МАСЛАҲАТ | forma |
| `cta_products_price` | НАРХИНИ БИЛИШ | forma |
| `cta_reviews` | ВИДЕО ШАРҲЛАРНИ КЎРИШ | videolar |
| `cta_final_application` | АРИЗА ҚОЛДИРИШ | forma |
| `cta_sticky_more_info` | ҚЎШИМЧА МАЪЛУМОТ ОЛИШ | forma |
| `submit_order` | **БУЮРТМА БЕРИШ** (faqat forma ichida) | yuborish |
| `video_play_1…4`, `video_youtube_1…4` | Play / YouTube'да кўриш | — |

## Meta Pixel

- **PageView** — sahifa ochilganda bir marta yuboriladi.
- **CTA_Click** — `cta_id` va `cta_text` bilan yuboriladi.
- **Lead** — faqat backend **yangi** buyurtma qaytarganda (`duplicate` bo'lmasa) bir marta yuboriladi, `eventID` = buyurtma ID.
- Ism, telefon va belgilangan alomatlar Meta'ga yuborilmaydi.
- Pixel'ning avtomatik tugma kuzatuvi (`autoConfig`) o'chirilgan.
- Events Manager'da **Automatic Advanced Matching**'ni ham o'chiring.

## Backend bilan ishlash (`src/api/orders.js`)

Frontend mavjud backendga quyidagi ma'lumotni yuboradi:

```json
POST {VITE_API_URL}/api/orders
Headers: Idempotency-Key: <uuid>
{
  "name": "...", "phone": "+998XXXXXXXXX",
  "product": "dermolife_complex", "brand": "dermolife",
  "productName": "DERMOLIFE COMPLEX", "source": "Dermolife Landing",
  "consent": true, "marketingConsent": false,
  "utm": { "utm_source": "...", "utm_campaign": "..." }, "page": "/", "website": ""
}
```

Javoblar:
- `201 { ok, orderId }` — muvaffaqiyat oynasi ochiladi va Lead yuboriladi.
- `200 { ok, orderId, duplicate: true }` — muvaffaqiyat oynasi ochiladi, Lead **yuborilmaydi**.
- `400` (maydon xatolari) — formada kirillcha xabarlar chiqadi.
- `429` — «Жуда кўп уриниш».
- Tarmoq xatosi yoki 65 soniyadan oshgan kutish — aniq xato xabari chiqadi.

### ⚠ 2-bosqich: backend'da kerak bo'ladigan o'zgarishlar

Hozirgi backend `product` sifatida faqat `complex | paste | syrup` ni qabul qiladi. Shuning uchun DERMOLIFE buyurtmasi **400** bilan rad etiladi. Frontend buni ushlab, «Буюртма тизими DERMOLIFE буюртмалари учун ҳали созланмаган» deb ko'rsatadi. Bu sinovdan o'tkazilgan: buyurtma boshqa mahsulot guruhiga tushib qolmaydi.

Backend'da qilinadigan ishlar:
1. `validation.js` — `dermolife_complex` mahsulotini va `brand`/`source` maydonlarini qabul qilish.
2. Telegram — DERMOLIFE buyurtmalarini alohida guruhga yuborish (`.env` → masalan `TELEGRAM_GROUP_ID_DERMOLIFE`) va xabar sarlavhasini `YANGI BUYURTMA — DERMOLIFE` qilish.
3. `FRONTEND_URL` ga yangi Vercel domenini qo'shish (CORS).
4. Saqlash — Render'da qayta deploy'dan keyin `orders.json` yo'qolmasligi uchun persistent disk yoki ma'lumotlar bazasi.

`.env`, `node_modules` va `dist` git'ga tushmaydi (`.gitignore` da bor).
