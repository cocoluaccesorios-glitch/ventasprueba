import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'
import './assets/styles.css'

// VERSIÓN 8.0 - CAMBIO MÍNIMO PARA PROBAR BUILD
console.log('🚀 VERSIÓN 8.0 - CAMBIO MÍNIMO')

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')