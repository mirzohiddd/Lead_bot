# GEPOMER — Instagram/Facebook Target landing (Vue 3 + Vite)

Zeynara landing tuzilishidagi bitta ustunli, ariza yig'uvchi sahifa.
Desktopda ham mobil sahifa markazda turadi (max-width: 430px).

## Ishga tushirish
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # dist/ — istalgan statik hostingga yuklang
```

## Bo'limlar (tartib bilan)
0. Ustki panel (3 ta belgi) + logo
1. Hero — sarlavha, ma'lumot, mahsulot rasmi, 2 tugma
2. Jigar kasalliklari va xavflar — accordion
3. Statistika (manbalari ko'rsatilgan) + mutaxassis fikri [PLACEHOLDER]
4. Alomatlar — checkbox, tanlanganlar soni va tavsiya
5. Jigar muammolari qanday rivojlanadi — 4 bosqich
6. Mahsulot: GEPOMER, Complex / Pasta / Sirop, tarkib [PLACEHOLDER]
7. Kimlar uchun + qo'llash tartibi [PLACEHOLDER]
8. YouTube video sharhlar — gorizontal scroll, sayt ichida modalda ochiladi
9. Buyurtma: 3 qadam + forma (ism, +998 telefon)
10. Mijozlar fikri [PLACEHOLDER], FAQ accordion, yakuniy CTA, footer
+ Pastki sticky "Buyurtma berish" paneli (formaga scroll qiladi)

## Matnlarni o'zgartirish
Barcha matnlar: `src/data/content.js`. `[PLACEHOLDER]` yozuvlarini qidirib, haqiqiy ma'lumot bilan almashtiring:
- Gepomer Complex tavsifi (gepomer.uz da yo'q)
- Tarkib ro'yxati, qo'llash dozasi, qarshi ko'rsatmalar (qadoqdan)
- Mutaxassis fikri (ism, lavozim, rasm — ruxsat bilan)
- Mijozlar sharhlari (faqat haqiqiy, roziligi olingan)
- Yetkazib berish va to'lov shartlari
- Oila fotosurati (yakuniy CTA), maxfiylik siyosati havolasi

## Rasmlar
Mahsulot rasmlari `src/assets/products/` papkasida: complex, paste, syrup (.webp, katta va `-sm` kichik versiya).
Almashtirish uchun shu nomlar bilan yangi rasm qo'ying.

## Forma
Forma backendga ulangan: `POST /api/orders`. Sozlash va ishga tushirish — loyiha ildizidagi `README.md` da.
Meta Pixel: `index.html` dagi izoh joyiga pixel kodini qo'ying — muvaffaqiyatli arizada `fbq('track','Lead')` avtomatik chaqiriladi.
