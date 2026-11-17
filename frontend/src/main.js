import { createApp } from 'vue'
import App from './App.vue'
import { reveal } from './directives/reveal.js'
import { captureUtm } from './utils/utm.js'
import './styles/main.css'

captureUtm()
createApp(App).directive('reveal', reveal).mount('#app')
