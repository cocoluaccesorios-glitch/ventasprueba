import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'
import './assets/styles.css'

// ========================================
// VERSIÓN 4.0 - CAMBIO DRÁSTICO
// ========================================
// Timestamp: 2025-09-23T23:05:00Z
// Forzar nueva versión para eliminar cache
// ========================================

console.log('🚀 VERSIÓN 4.0 - NUEVA LÓGICA BCV IMPLEMENTADA')

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')