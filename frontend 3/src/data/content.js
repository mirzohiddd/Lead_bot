// =====================================================================
//  DERMOLIFE COMPLEX — Target landing. Barcha matnlar shu faylda (o'zbek kirill).
//
//  Qoidalar:
//   • Mahsulot kasallikni davolaydi, degan da'volar YO'Q.
//   • Statistikalar faqat manbasi ko'rsatilgan ishonchli tadqiqotlardan.
//   • Sertifikat, mutaxassis fikri, mijoz sharhi, tarkib, qo'llash tartibi, narx —
//     tasdiqlangan ma'lumot kelguncha [ТЎЛДИРИШ] belgisi bilan qoldirilgan.
// =====================================================================
import soapImg from '../assets/products/soap.webp'
import creamImg from '../assets/products/cream.webp'
import detoxImg from '../assets/products/detox.webp'
import soapSm from '../assets/products/soap-sm.webp'
import creamSm from '../assets/products/cream-sm.webp'
import detoxSm from '../assets/products/detox-sm.webp'

export const images = { soapImg, creamImg, detoxImg, soapSm, creamSm, detoxSm }

// Bo'sh qiymat — tegishli tugma/havola sahifada ko'rsatilmaydi.
export const contacts = {
  phone: '', // [ТЎЛДИРИШ] масалан: '+998 90 123 45 67'
  phoneHref: '', // [ТЎЛДИРИШ] масалан: 'tel:+998901234567'
  telegram: '', // [ТЎЛДИРИШ] https://t.me/...
  telegramLabel: '',
  instagram: '', // [ТЎЛДИРИШ] https://www.instagram.com/...
  instagramHandle: '',
  youtube: '' // [ТЎЛДИРИШ] https://www.youtube.com/@...
}

export const company = {
  name: '[ТЎЛДИРИШ: компания номи]',
  address: '[ТЎЛДИРИШ: манзил]'
}

// Maxfiylik siyosati sahifasi (public/privacy.html). Boshqa manzil bo'lsa — VITE_PRIVACY_URL.
export const privacyUrl = import.meta.env.VITE_PRIVACY_URL || './privacy.html'

// Buyurtmada yuboriladigan mahsulot identifikatori.
// code — umumiy backenddagi mahsulot kodi (gepomer | dermolife | halila): buyurtma DERMOLIFE guruhiga tushadi.
export const ORDER_PRODUCT = {
  code: 'dermolife',
  id: 'dermolife_complex',
  name: 'DERMOLIFE COMPLEX',
  brand: 'dermolife',
  source: 'Dermolife Landing'
}

// 0. Ustki panel
export const topBadges = ['Табиий таркиб', 'Тери парвариши', 'Бепул маслаҳат']

// 1. Hero
export const hero = {
  kicker: 'Тери саломатлиги ҳақида',
  title: 'Терингизга ҳар куни эътибор ва парвариш керак',
  text:
    'Қуруқлик, қичишиш ва қизариш кундалик ҳаётга халал беради. Тўғри парвариш ва вақтида мутахассисга мурожаат қилиш терини ҳимоялашнинг асосидир.',
  text2:
    'DERMOLIFE COMPLEX — тери парвариши учун мўлжалланган маҳсулотлар тўплами: табиий совун, крем ва Dermo Detox сиропи.',
  ctaPrimary: 'БЕПУЛ МАСЛАҲАТ ОЛИШ',
  ctaSecondary: 'МАҲСУЛОТ БИЛАН ТАНИШИШ',
  chips: ['100% табиий совун', 'Тери парвариши']
}

// 2. Teri muammolari haqida ma'lumot — tasdiqlangan statistika
export const info = {
  title: 'Тери — организмнинг энг катта аъзоси',
  lead:
    'Тери организмни ташқи муҳитдан ҳимоя қилади. Шунинг учун тери касалликлари дунёдаги энг кенг тарқалган соғлиқ муаммолари қаторига киради.',
  stats: [
    {
      value: '~900 млн',
      label: 'киши дунёда исталган пайтда тери касалликларига дуч келади',
      source: 'ЖССТ (WHO), 2018'
    },
    {
      value: '100 млн+',
      label: 'киши дунё бўйича псориаз билан яшайди',
      source: 'ЖССТ, Global report on psoriasis, 2016'
    },
    {
      value: '~204 млн',
      label: 'катталар ва болалар атопик дерматит (экзема) билан яшайди',
      source: 'British Journal of Dermatology, 2023'
    }
  ],
  note: 'Тери касалликлари ЖССТ маълумотига кўра энг кўп учрайдиган касалликлар учлигига киради.'
}

// 3. Muammolar va alomatlar — accordion (umumiy ma'lumot)
export const conditions = {
  title: 'Кенг тарқалган тери муаммолари',
  lead: 'Ҳар бирини босиб, қисқача маълумот билан танишинг.',
  items: [
    {
      icon: 'drop',
      title: 'Атопик дерматит (экзема)',
      text:
        'Терининг сурункали яллиғланиши. Асосий белгилари — кучли қичишиш, қуруқлик ва қизариш. Кўпинча болаликда бошланади, лекин катталарда ҳам учрайди. Даврий кучайиш ва тинчиш даврлари бўлиши мумкин.'
    },
    {
      icon: 'alert',
      title: 'Псориаз',
      text:
        'Сурункали, юқумли бўлмаган касаллик. Терида аниқ чегарали, оқиш пўст билан қопланган доғлар пайдо бўлади. ЖССТ маълумотига кўра, псориазни бутунлай даволовчи усул ҳозирча йўқ, лекин тўғри назорат ҳолатни енгиллаштиради.'
    },
    {
      icon: 'shield',
      title: 'Контакт дерматит',
      text:
        'Тери бирор модда (кимёвий восита, металл, косметика ва ҳ.к.) билан тўқнашганда пайдо бўладиган қизариш ва қичишиш. Сабабчи моддадан узоқлашиш муҳим.'
    },
    {
      icon: 'leaf',
      title: 'Тери қуруқлиги',
      text:
        'Совуқ ҳаво, иссиқ сув, тажовузкор ювиш воситалари ва ёшга боғлиқ ўзгаришлар терини қуритади. Қуруқ тери тез таъсирланади ва қичишади.'
    },
    {
      icon: 'skin',
      title: 'Акне (ҳуснбузар)',
      text:
        'Ёғ безлари ва тери тешикчаларининг тиқилиши билан боғлиқ ҳолат. Кўпинча ўсмирлик даврида учрайди, лекин катталарда ҳам бўлиши мумкин.'
    }
  ],
  footer: 'Аниқ ташхисни фақат дерматолог кўрик асосида қўяди. Белгилар кучли бўлса, шифокорга мурожаат қилинг.',
  cta: 'БАТАФСИЛ МАЪЛУМОТ'
}

// 4. Mutaxassis tavsiyasi — [ТЎЛДИРИШ]
export const expert = {
  placeholder: true,
  title: 'Мутахассис тавсияси',
  name: '[ТЎЛДИРИШ: мутахассис исми]',
  role: '[ТЎЛДИРИШ: лавозими, иш тажрибаси]',
  quote:
    '[ТЎЛДИРИШ: мутахассиснинг розилиги билан олинган ҳақиқий фикри. Исм, лавозим ва фотосурат фақат рухсат билан жойлаштирилсин.]',
  photo: null,
  cta: 'МУТАХАССИС БИЛАН БОҒЛАНИШ'
}

// 5. Alomatlar — checkbox
export const symptoms = {
  title: 'Қуйидаги ҳолатлардан қайсиларини сезасиз?',
  lead: 'Ўзингизга тегишлиларини белгиланг. Бу ташхис эмас — фақат ўз ҳолатингизга эътибор беришга ёрдам беради.',
  items: [
    'Тери қуруқлиги ва таранглашиш',
    'Доимий қичишиш',
    'Қизариш ёки доғлар',
    'Пўст ташлаш',
    'Тери ёрилиши',
    'Тошмалар',
    'Ювингандан кейин ачишиш',
    'Ҳолат қайта-қайта такрорланади',
    'Қичишиш сабабли уйқу бузилади'
  ],
  resultNone: 'Белгилардан бирортасини танланг.',
  resultSome:
    'Бу белгилар турли сабабларга боғлиқ бўлиши мумкин. Дерматолог кўригидан ўтинг ва мутахассисимиздан бепул маслаҳат олинг.',
  cta: 'НАТИЖА БЎЙИЧА МАСЛАҲАТ',
  emergency:
    'Тошма тез тарқалса, юз ёки лаб шишса, нафас олиш қийинлашса ёки юқори ҳарорат бўлса — зудлик билан 103 га қўнғироқ қилинг.'
}

// 6. Teri parvarishi haqida tushuntirish
export const care = {
  title: 'Тери парвариши қандай бўлиши керак?',
  lead: 'Дерматологлар тавсия қиладиган оддий кундалик қоидалар:',
  items: [
    {
      title: 'Юмшоқ тозалаш',
      text: 'Илиқ (иссиқ эмас) сув ва юмшоқ ювиш воситасидан фойдаланинг. Терини қаттиқ ишқаламанг.'
    },
    {
      title: 'Намлаш',
      text: 'Ювингандан кейин, тери ҳали бироз нам пайтида парвариш кремини суртинг.'
    },
    {
      title: 'Ҳимоя',
      text: 'Тирнамасликка ҳаракат қилинг, таъсирловчи моддалар ва кучли қуёшдан сақланинг.'
    },
    {
      title: 'Мунтазамлик',
      text: 'Парвариш ҳар куни такрорланганда натижа беради. Ҳолат ўзгармаса — дерматологга мурожаат қилинг.'
    }
  ],
  footer: 'DERMOLIFE COMPLEX маҳсулотлари айнан шу кундалик парваришни бир тўпламда жамлайди.'
}

// 7. Mahsulotlar
export const productIntro = {
  title: 'DERMOLIFE COMPLEX',
  text:
    'Тери парвариши учун уч қисмли тўплам: тозалаш учун табиий совун, парвариш учун крем ва ичишга мўлжалланган Dermo Detox сиропи.',
  badges: ['Совун', 'Крем', 'Сироп']
}

export const products = [
  {
    id: 'soap',
    name: 'Dermolife Complex совуни',
    image: soapSm,
    text: 'Қадоқдаги маълумотга кўра — 100% табиий совун, терини ҳимоялайди. Оғирлиги 160 г.',
    tags: ['160 г', '100% табиий', 'Ҳинд формуласи']
  },
  {
    id: 'cream',
    name: 'Dermo Complex крем',
    image: creamSm,
    text: 'Тери парвариши учун крем. [ТЎЛДИРИШ: таркиби ва хусусиятлари қадоқдан]',
    tags: ['Крем', 'Кундалик парвариш']
  },
  {
    id: 'detox',
    name: 'Dermo Detox сироп',
    image: detoxSm,
    text: 'Ўсимлик асосидаги сироп. [ТЎЛДИРИШ: таркиби, ҳажми ва қабул тартиби қадоқдан]',
    tags: ['Сироп', 'Ичишга']
  }
]

// 8. Tarkib va xususiyatlar
export const ingredients = {
  title: 'Таркиби',
  lead: 'Аниқ таркиб ва миқдорлар ҳар бир маҳсулот қадоғида кўрсатилган.',
  items: [
    { name: '[ТЎЛДИРИШ: компонент 1]', text: '[Қисқача тавсиф — қадоқдан]' },
    { name: '[ТЎЛДИРИШ: компонент 2]', text: '[Қисқача тавсиф — қадоқдан]' },
    { name: '[ТЎЛДИРИШ: компонент 3]', text: '[Қисқача тавсиф — қадоқдан]' },
    { name: '[ТЎЛДИРИШ: компонент 4]', text: '[Қисқача тавсиф — қадоқдан]' }
  ]
}

export const features = {
  title: 'Хусусиятлари',
  items: [
    'Совун — 100% табиий (қадоқдаги маълумот)',
    'Ҳинд формуласи асосида (қадоқдаги маълумот)',
    'Тозалаш, парвариш ва ички қўллаб-қувватлаш — бир тўпламда',
    'Сертификат ва рухсатномалар: [ТЎЛДИРИШ: ҳужжат рақами]'
  ],
  cta: 'НАРХИНИ БИЛИШ'
}

// 9. Kimlar uchun + qo'llash
export const audience = {
  title: 'DERMOLIFE COMPLEX кимлар учун?',
  lead: 'Терисига кундалик парвариш керак бўлган катталар учун, айниқса:',
  items: [
    'Териси қуруқ ва тез таъсирланадиганлар',
    'Қичишиш ва қизаришдан безовта бўлаётганлар',
    'Юмшоқ, табиий ювиш воситасини афзал кўрадиганлар',
    'Дерматолог тавсиясига кўра кундалик парвариш қилаётганлар'
  ]
}

export const usage = {
  title: 'Қўллаш тартиби',
  rows: [
    { label: 'Совун', value: '[ТЎЛДИРИШ: қадоқдаги йўриқномага мувофиқ]' },
    { label: 'Крем', value: '[ТЎЛДИРИШ: қадоқдаги йўриқномага мувофиқ]' },
    { label: 'Dermo Detox сироп', value: '[ТЎЛДИРИШ: қабул миқдори ва вақти]' }
  ],
  warnings: [
    'Биринчи марта ишлатишдан олдин терининг кичик қисмида синаб кўринг.',
    'Очиқ яра, кучли яллиғланиш ёки йиринг бўлса — аввал шифокорга мурожаат қилинг.',
    'Ҳомиладорлик, эмизиш даври ва болаларда — фақат шифокор билан маслаҳатлашиб.',
    'Шифокор буюрган даволашни ўзбошимчалик билан тўхтатманг.'
  ]
}

// 10. Video sharhlar (haqiqiy YouTube havolalari)
export const videos = [
  { id: 'c9yZZRbnpyc', title: 'Видео шарҳ #1' },
  { id: 'XKMJlHBZCHc', title: 'Видео шарҳ #2' },
  { id: 'BtpYhsWyXl0', title: 'Видео шарҳ #3' },
  { id: 'KCghaa1VTxg', title: 'Видео шарҳ #4' }
]

// 11. Buyurtma
export const order = {
  title: 'Қандай буюртма берилади?',
  steps: [
    { title: 'Ариза қолдиринг', text: 'Исм ва телефон рақамингизни ёзинг.' },
    { title: 'Оператор қўнғироқ қилади', text: 'Саволларингизга жавоб беради ва буюртмани тасдиқлайди.' },
    { title: 'Етказиб бериш', text: '[ТЎЛДИРИШ: етказиб бериш муддати ва шартлари]' }
  ],
  formTitle: 'Буюртма формаси',
  formLead: 'Маълумотларингизни қолдиринг — мутахассис бепул маслаҳат беради',
  trust: ['Бепул маслаҳат', 'Олдиндан тўлов йўқ', 'Маълумотларингиз ҳимояланган']
}

// 12. Mijozlar fikri — faqat tasdiqlangan, rozilik bilan olingan sharhlar
export const reviews = {
  title: 'Мижозлар фикри',
  items: [
    { placeholder: true, name: '[ТЎЛДИРИШ: мижоз исми, ёши]', city: '[Шаҳар]', text: '[Мижознинг розилиги билан олинган ҳақиқий шарҳ матни]' },
    { placeholder: true, name: '[ТЎЛДИРИШ: мижоз исми, ёши]', city: '[Шаҳар]', text: '[Мижознинг розилиги билан олинган ҳақиқий шарҳ матни]' },
    { placeholder: true, name: '[ТЎЛДИРИШ: мижоз исми, ёши]', city: '[Шаҳар]', text: '[Мижознинг розилиги билан олинган ҳақиқий шарҳ матни]' }
  ],
  note: 'Натижалар ҳар бир инсонда индивидуал бўлиши мумкин.',
  cta: 'ВИДЕО ШАРҲЛАРНИ КЎРИШ'
}

// 13. FAQ
export const faq = [
  {
    q: 'DERMOLIFE COMPLEX дори воситасими?',
    a: 'DERMOLIFE COMPLEX — тери парвариши учун маҳсулотлар тўплами. У шифокор буюрган даволаш ўрнини босмайди. Қўллашдан олдин мутахассис билан маслаҳатлашинг.'
  },
  {
    q: 'Тўпламга нималар киради?',
    a: 'Табиий совун (160 г), Dermo Complex крем ва Dermo Detox сироп. Аниқ таркиб ҳар бир маҳсулот қадоғида кўрсатилган.'
  },
  {
    q: 'Нархи қанча?',
    a: '[ТЎЛДИРИШ: нарх ва тўлов шартлари] Аниқ нархни оператор буюртмани тасдиқлашда айтади.'
  },
  {
    q: 'Буюртмадан кейин нима бўлади?',
    a: 'Оператор сиз билан боғланиб, буюртмани тасдиқлайди, саволларингизга жавоб беради ва етказиб беришни келишиб олади.'
  },
  {
    q: 'Кимларга мумкин эмас?',
    a: 'Таркибдаги компонентларга сезувчанлиги бор кишилар, ҳомиладор ва эмизикли аёллар ҳамда болалар фойдаланишдан олдин шифокор билан маслаҳатлашиши керак. [ТЎЛДИРИШ: қадоқдаги қарши кўрсатмалар]'
  }
]

// 14. Yakuniy CTA
export const finalCta = {
  title: 'Терингизга бугундан эътибор беринг',
  text: 'Ариза қолдиринг — мутахассисимиз сиз билан боғланиб, бепул маслаҳат беради.',
  button: 'АРИЗА ҚОЛДИРИШ'
}

export const sticky = { button: 'ҚЎШИМЧА МАЪЛУМОТ ОЛИШ' }

export const disclaimer =
  'DERMOLIFE COMPLEX маҳсулотлари дори воситаси эмас ва касалликни даволаш учун мўлжалланмаган. Қўллашдан олдин мутахассис билан маслаҳатлашинг.'

export const sources = [
  'WHO. Recognizing neglected skin diseases: WHO publishes pictorial training guide, 2018.',
  'WHO. Global report on psoriasis, 2016.',
  'Global epidemiology of atopic dermatitis: a comprehensive systematic analysis and modelling study. British Journal of Dermatology, 2023;190(1):55–61.',
  'WHO. Skin-related neglected tropical diseases — integrated approach (тери касалликлари — энг кенг тарқалган касалликлар учлигида).'
]