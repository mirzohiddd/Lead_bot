import { createApp } from 'vue'
import App from './App.vue'
import { reveal } from './directives/reveal.js'
import { captureUtm } from './utils/utm.js'
import { initCtaTracking } from './utils/metaPixel.js'
import { warmUpBackend } from './api/orders.js'
import './styles/main.css'

captureUtm()
initCtaTracking()
warmUpBackend()
createApp(App).directive('reveal', reveal).mount('#app')