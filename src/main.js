import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'
import './assets/styles.css'

// ========================================
// VERSIÓN 7.0 - CAMBIO EXTREMO
// ========================================
// Timestamp: 2025-09-23T23:25:00Z
// CAMBIO EXTREMO PARA FORZAR DEPLOY
// SOLO BASE DE DATOS - SIN PROXIES CORS
// ========================================

console.log('🚀🚀🚀 VERSIÓN 7.0 - CAMBIO EXTREMO - SOLO BD 🚀🚀🚀')
console.log('🔥 NUEVA LÓGICA BCV IMPLEMENTADA - SIN PROXIES CORS 🔥')
console.log('✅ SOLO BUSCA EN BASE DE DATOS - TASA: 168.4157 Bs/USD ✅')
console.log('🎯 ESTA ES LA VERSIÓN CORRECTA - NO DEBE HABER PROXIES 🎯')

// Forzar que se ejecute inmediatamente
window.addEventListener('load', () => {
  console.log('🎉 VERSIÓN 7.0 CARGADA CORRECTAMENTE')
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')