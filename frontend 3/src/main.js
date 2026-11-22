import { createApp } from 'vue'
import App from './App.vue'
import { reveal } from './directives/reveal.js'
import { captureUtm } from './utils/utm.js'
import { initPixel, initCtaTracking } from './utils/metaPixel.js'
import { warmUpBackend } from './api/orders.js'
import './styles/main.css'

captureUtm() // UTM parametrlarini saqlash (buyurtma bilan backendga yuboriladi)
initPixel() // faqat VITE_META_PIXEL_ID berilganda yuklanadi
initCtaTracking() // CTA_Click — data-cta atributli tugmalar
warmUpBackend() // faqat VITE_API_URL berilganda
createApp(App).directive('reveal', reveal).mount('#app')
