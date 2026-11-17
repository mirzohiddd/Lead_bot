// =====================================================================
//  GEPOMER — Target landing. Barcha matnlar shu faylda.
//  Mahsulot ma'lumotlari manbasi: https://www.gepomer.uz/
//  [PLACEHOLDER] deb belgilangan joylarni haqiqiy, tasdiqlangan
//  ma'lumot bilan almashtiring. Tasdiqlanmagan da'volar qo'shilmagan.
// =====================================================================

import complexImg from '../assets/products/complex.webp'
import pasteImg from '../assets/products/paste.webp'
import syrupImg from '../assets/products/syrup.webp'
import complexSm from '../assets/products/complex-sm.webp'
import pasteSm from '../assets/products/paste-sm.webp'
import syrupSm from '../assets/products/syrup-sm.webp'

export const images = { complexImg, pasteImg, syrupImg, complexSm, pasteSm, syrupSm }

export const contacts = {
  phone: '+998 78 113 88 99',
  phoneHref: 'tel:+998781138899',
  telegram: 'https://t.me/jigar_kasalligi',
  instagramHandle: '@gepomer_uz',
  instagram: 'https://www.instagram.com/gepomer_uz/',
  youtube: 'https://www.youtube.com/@gepamer'
}

// 0. Ustki panel belgilari
export const topBadges = ["100% tabiiy tarkib", "Sun'iy qo'shimchalarsiz", 'Sifat nazorati']

// 1. Hero
export const hero = {
  kicker: "Jigar salomatligi haqida",
  title: "Jigar muammolari ko'pincha uzoq vaqt sezilmaydi",
  text:
    "Jigar organizmdagi eng katta ichki a'zolardan biri: u qonni zararli moddalardan tozalashda, hazm jarayonida va moddalar almashinuvida ishtirok etadi. Uning muammolari esa ko'pincha uzoq vaqt hech qanday belgisiz rivojlanadi.",
  text2:
    "GEPOMER — 40 dan ortiq giyoh, ildiz va minerallardan tayyorlangan o'simlik tarkibli mahsulotlar liniyasi: Complex, Pasta va Sirop.",
  ctaPrimary: 'Buyurtma berish',
  ctaSecondary: "Batafsil ma'lumot"
}

// 2. Xavflar — accordion (umumiy, ta'limiy ma'lumot)
export const risks = {
  title: 'Jigar kasalliklari va ularning xavfi',
  lead: "Quyida keng tarqalgan jigar kasalliklari haqida umumiy ma'lumot. Har birini bosib o'qing.",
  items: [
    {
      icon: 'drop',
      title: "Jigarning yog'lanishi (yog'li gepatoz)",
      text:
        "Jigar hujayralarida yog' to'planishi. Ko'pincha ortiqcha vazn, qandli diabet, kam harakat va noto'g'ri ovqatlanish bilan bog'liq. Uzoq vaqt belgisiz kechishi mumkin."
    },
    {
      icon: 'alert',
      title: 'Gepatit (jigar yallig\'lanishi)',
      text:
        "Jigarning yallig'lanishi. Viruslar, spirtli ichimliklar yoki ayrim dori vositalari sabab bo'lishi mumkin. Virusli gepatitlar faqat laboratoriya tahlillari orqali aniqlanadi."
    },
    {
      icon: 'weight',
      title: 'Fibroz',
      text:
        "Uzoq davom etgan zararlanish natijasida jigarda biriktiruvchi (chandiq) to'qima paydo bo'lishi. Jigarning ishlash qobiliyatiga ta'sir qiladi."
    },
    {
      icon: 'shield',
      title: 'Sirroz',
      text:
        "Jigar to'qimasining keng chandiqlanishi — surunkali jigar kasalliklarining og'ir bosqichi. Dunyo bo'yicha jigar bilan bog'liq o'limlarning asosiy sabablaridan biri."
    },
    {
      icon: 'stomach',
      title: "O't yo'llari muammolari",
      text:
        "O't suyuqligining dimlanishi va o't pufagi bilan bog'liq holatlar. Hazm qilish, ayniqsa yog'li ovqatni hazm qilish jarayoniga ta'sir qiladi."
    }
  ],
  footer:
    "Bu holatlar jiddiy bo'lishi mumkin. Aniq tashxisni faqat shifokor tekshiruv va tahlillar asosida qo'yadi."
}

// 3. Statistika — tasdiqlangan manbalar
export const stats = {
  title: 'Raqamlar nima deydi?',
  items: [
    {
      value: '2 mln',
      label: "kishi har yili dunyoda jigar kasalliklari sababli vafot etadi",
      source: 'Journal of Hepatology, 2023'
    },
    {
      value: '1 / 25',
      label: "dunyodagi har 25 ta o'limdan biri jigar kasalliklari bilan bog'liq (4%)",
      source: 'Journal of Hepatology, 2023'
    },
    {
      value: '1,3 mlrd',
      label: "kishi 2023-yilda jigar yog'lanishi (MASLD) bilan yashagan — aholining 16,1%",
      source: 'The Lancet Gastroenterology & Hepatology, GBD 2023'
    }
  ],
  note: "Tadqiqotchilar fikricha, jigar kasalliklarining aksariyat sabablarining oldini olish mumkin."
}

// Mutaxassis fikri — [PLACEHOLDER]
export const expert = {
  placeholder: true,
  name: '[Mutaxassis ismi]',
  role: '[Lavozimi, ish tajribasi]',
  quote:
    "[Bu yerga haqiqiy, ruxsat berilgan mutaxassis fikri qo'yiladi. Ism, lavozim va fotosurat mutaxassisning roziligi bilan joylashtirilsin.]",
  photo: null
}

export const proverb = "Kasallikning oldini olish uni davolashdan osonroq."

// 4. Alomatlar — checkbox
export const symptoms = {
  title: 'Quyidagi holatlardan qaysilarini sezasiz?',
  lead: "O'zingizga tegishlilarini belgilang. Bu tashxis emas — faqat o'z holatingizga e'tibor berishga yordam beradi.",
  items: [
    'Doimiy charchoq va holsizlik',
    "O'ng qovurg'a ostida og'irlik",
    "Og'izda achchiq ta'm",
    "Ovqatdan keyin dam bo'lish",
    "Ko'ngil aynishi, ishtaha pasayishi",
    "Teri xiralashishi yoki qichishishi",
    'Yog\'li ovqatdan keyin noqulaylik',
    'Uyqu buzilishi',
    "Tez-tez bosh og'rig'i"
  ],
  resultNone: 'Belgilardan birortasini tanlang.',
  resultSome:
    "Bu belgilar turli sabablarga bog'liq bo'lishi mumkin. Shifokor ko'rigidan o'ting va mutaxassisimizdan bepul maslahat oling.",
  emergency:
    "Teri yoki ko'z oqi keskin sarg'aysa, qorinda kuchli og'riq bo'lsa yoki qusuqda qon ko'rinsa — zudlik bilan 103 ga qo'ng'iroq qiling."
}

// 5. Jigarda nima sodir bo'ladi
export const stages = {
  title: "Jigar muammolari qanday rivojlanadi?",
  lead: "Ko'p hollarda jarayon yillar davomida, sekin va sezilmasdan kechadi.",
  items: [
    {
      title: "Sog'lom jigar",
      text: "Jigar har kuni qonni tozalaydi, o't suyuqligi ishlab chiqaradi va moddalar almashinuvida qatnashadi."
    },
    {
      title: "Yog' to'planishi",
      text: "Noto'g'ri ovqatlanish, kam harakat va ortiqcha vazn sababli jigar hujayralarida yog' to'plana boshlaydi."
    },
    {
      title: "Yallig'lanish",
      text: "Yuklama davom etsa, jigarda yallig'lanish jarayoni rivojlanishi mumkin. Bu bosqich ham ko'pincha belgisiz kechadi."
    },
    {
      title: 'Chandiqlanish',
      text: "Uzoq davom etgan zararlanish fibroz va sirrozga olib kelishi mumkin. Shu sababli erta e'tibor muhim."
    }
  ],
  footer: "Muntazam tibbiy ko'rik va sog'lom turmush tarzi — jigarga g'amxo'rlikning asosi."
}

// 6. Mahsulotlar
// Haqiqiy rasm: src/assets/products/ ga joylab, import qilib `image` ga bering.
export const productIntro = {
  title: 'GEPOMER — tabiiy kuch, sog\'lom jigar',
  text:
    "GEPOMER mahsulotlari giyohlar, ildizlar va minerallardan tayyorlanadi. An'anaviy retseptlar zamonaviy texnologiya bilan uyg'unlashtirilgan, har bir partiya sifat nazoratidan o'tadi.",
  bullets: [
    "40 dan ortiq tabiiy giyoh, ildiz va mineral",
    "Hech qanday sun'iy qo'shimchalarsiz",
    "Har bir partiya sifat nazoratidan o'tadi",
    "An'anaviy retsept + zamonaviy texnologiya"
  ],
  badges: ['100% tabiiy', '40+ giyoh', 'Dori vositasi emas']
}

export const products = [
  {
    id: 'complex',
    name: 'Gepomer Complex',
    art: 'complex',
    image: complexSm,
    text: "Qutida porsiyali paketchalar ko'rinishidagi kompleks mahsulot. [PLACEHOLDER: tarkib va qabul tartibi qadoqdan kiritiladi]",
    tags: ['Kompleks', 'Paketchalarda']
  },
  {
    id: 'paste',
    name: 'Gepomer Pasta',
    art: 'paste',
    image: pasteSm,
    text: "Jigarni tozalash va organizmni toksinlardan xalos qilish uchun o'simlik tarkibli pasta.",
    tags: ['40+ giyoh', 'Kunlik qabul']
  },
  {
    id: 'syrup',
    name: 'Gepomer Sirop',
    art: 'syrup',
    image: syrupSm,
    text: "Sog'lom hazm qilishni qo'llab-quvvatlovchi ayurvedik sirop. O'lchov stakanchasi bilan.",
    tags: ['Ayurvedik tarkib', 'Hazm']
  }
]

// Tarkib — [PLACEHOLDER]: aniq ro'yxat qadoqdan kiritiladi
export const ingredients = {
  title: 'Tarkibi',
  lead: "40 dan ortiq tabiiy komponent. Aniq ro'yxat va miqdorlar mahsulot qadog'ida ko'rsatilgan.",
  items: [
    { name: '[Komponent 1]', text: '[Qisqacha tavsif — qadoqdan]' },
    { name: '[Komponent 2]', text: '[Qisqacha tavsif — qadoqdan]' },
    { name: '[Komponent 3]', text: '[Qisqacha tavsif — qadoqdan]' },
    { name: '[Komponent 4]', text: '[Qisqacha tavsif — qadoqdan]' },
    { name: '[Komponent 5]', text: '[Qisqacha tavsif — qadoqdan]' },
    { name: '[Komponent 6]', text: '[Qisqacha tavsif — qadoqdan]' }
  ]
}

// 7. Kimlar uchun + qo'llash
export const audience = {
  title: 'GEPOMER kimlar uchun?',
  lead: "Jigariga g'amxo'rlik qilishni istagan kattalar uchun, ayniqsa:",
  items: [
    "Yog'li va qovurilgan ovqatni ko'p iste'mol qiladiganlar",
    "Kam harakatli ish bilan band bo'lganlar",
    '40 yoshdan oshganlar',
    'Uzoq vaqt dori vositalari qabul qilayotganlar (shifokor bilan kelishgan holda)',
    'Doimiy stress va uyqusizlikka duch keladiganlar',
    "Hazm qilish jarayonini qo'llab-quvvatlamoqchi bo'lganlar"
  ]
}

export const usage = {
  title: "Qo'llash tartibi",
  rows: [
    { label: 'Kattalar', value: "[PLACEHOLDER] Qadoqdagi yo'riqnomaga muvofiq" },
    { label: 'Qabul vaqti', value: '[PLACEHOLDER] Qadoqdan kiritiladi' },
    { label: 'Kurs davomiyligi', value: '[PLACEHOLDER] Mutaxassis tavsiyasiga ko\'ra' }
  ],
  warnings: [
    'Homiladorlik va emizish davrida — faqat shifokor bilan maslahatlashib.',
    "Shifokor buyurgan dori vositalarini o'zboshimchalik bilan to'xtatmang.",
    "Mahsulot dori vositasi emas. Qo'llashdan oldin mutaxassis bilan maslahatlashing."
  ]
}

// 8. Video sharhlar
export const videos = [
  { id: 'OyoX_rIkFac', title: 'Video sharh #1' },
  { id: 'C24oFGmL1Js', title: 'Video sharh #2' },
  { id: 'Jilfmhh3snk', title: 'Video sharh #3' },
  { id: 'Y81vTYzsies', title: 'Video sharh #4' },
  { id: 'IBC0uR3tk28', title: 'Video sharh #5' }
]

// 9. Buyurtma
export const order = {
  title: 'Qanday buyurtma beriladi?',
  steps: [
    { title: 'Ariza qoldiring', text: 'Ism va telefon raqamingizni yozing.' },
    { title: "Operator qo'ng'iroq qiladi", text: "15 daqiqa ichida bog'lanamiz va savollaringizga javob beramiz." },
    { title: 'Yetkazib berish', text: '[PLACEHOLDER] Yetkazib berish muddati va shartlari.' }
  ],
  formTitle: 'Buyurtma berish',
  formLead: "Ma'lumotlaringizni qoldiring — mutaxassis bepul maslahat beradi",
  trust: [
    "Bepul maslahat",
    "15 daqiqada qo'ng'iroq",
    "Ma'lumotlaringiz himoyalangan"
  ]
}

// 10. Mijozlar fikri — [PLACEHOLDER]: faqat haqiqiy, ruxsat berilgan sharhlar
export const reviews = {
  title: 'Mijozlar fikri',
  items: [
    { placeholder: true, name: '[Mijoz ismi, yoshi]', city: '[Shahar]', text: "[Mijozning roziligi bilan olingan haqiqiy sharh matni]" },
    { placeholder: true, name: '[Mijoz ismi, yoshi]', city: '[Shahar]', text: "[Mijozning roziligi bilan olingan haqiqiy sharh matni]" },
    { placeholder: true, name: '[Mijoz ismi, yoshi]', city: '[Shahar]', text: "[Mijozning roziligi bilan olingan haqiqiy sharh matni]" }
  ],
  note: "Natijalar har bir insonda individual bo'lishi mumkin."
}

export const faq = [
  {
    q: "To'lov qanday amalga oshiriladi?",
    a: "[PLACEHOLDER] To'lov shartlari operator tomonidan buyurtmani tasdiqlashda tushuntiriladi."
  },
  {
    q: 'GEPOMER dori vositasimi?',
    a: "Yo'q. GEPOMER mahsulotlari dori vositasi emas. Qo'llashdan oldin mutaxassis bilan maslahatlashing."
  },
  {
    q: 'Shifokor buyurgan dorilar bilan birga qabul qilsa bo\'ladimi?',
    a: "Buni albatta davolovchi shifokoringiz bilan kelishib oling. Buyurilgan dorilarni o'zboshimchalik bilan to'xtatmang."
  },
  {
    q: 'Buyurtmadan keyin nima bo\'ladi?',
    a: "Operatorimiz 15 daqiqa ichida qo'ng'iroq qilib, buyurtmani tasdiqlaydi, savollaringizga javob beradi va yetkazib berishni kelishib oladi."
  },
  {
    q: 'Kimlarga mumkin emas?',
    a: "Homilador va emizikli ayollar, bolalar hamda tarkibdagi komponentlarga sezuvchanligi bor kishilar qabul qilishdan oldin shifokor bilan maslahatlashishi kerak. [PLACEHOLDER: qadoqdagi qarshi ko'rsatmalar]"
  }
]

export const finalCta = {
  title: "Yaqinlaringiz uchun sog'lom bo'ling",
  text: "Jigaringizga bugundan g'amxo'rlik qilishni boshlang. Ariza qoldiring — mutaxassis bepul maslahat beradi.",
  button: 'Buyurtma berish'
}

export const disclaimer =
  "GEPOMER mahsulotlari dori vositasi emas. Qo'llashdan oldin mutaxassis bilan maslahatlashing."

export const sources = [
  'Devarbhavi H. va boshq. Global burden of liver disease: 2023 update. Journal of Hepatology, 2023.',
  'GBD 2023 MASLD Collaborators. The Lancet Gastroenterology & Hepatology, 2026.'
]
