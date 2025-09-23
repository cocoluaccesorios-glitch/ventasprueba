import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'
import './assets/styles.css'

// ========================================
// VERSIÓN 6.0 - CAMBIO ULTRA DRÁSTICO
// ========================================
// Timestamp: 2025-09-23T23:20:00Z
// CAMBIO COMPLETO PARA FORZAR NUEVA VERSIÓN
// SOLO BASE DE DATOS - SIN PROXIES CORS
// ========================================

console.log('🚀🚀🚀 VERSIÓN 6.0 - CAMBIO ULTRA DRÁSTICO - SOLO BD 🚀🚀🚀')
console.log('🔥 NUEVA LÓGICA BCV IMPLEMENTADA - SIN PROXIES CORS 🔥')
console.log('✅ SOLO BUSCA EN BASE DE DATOS - TASA: 168.4157 Bs/USD ✅')

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')