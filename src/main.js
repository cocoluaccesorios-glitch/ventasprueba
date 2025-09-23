import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'
import './assets/styles.css'

// ========================================
// VERSIÓN 5.0 - CAMBIO DRÁSTICO
// ========================================
// Timestamp: 2025-09-23T23:15:00Z
// Forzar nueva versión para eliminar cache
// ========================================

console.log('🚀 VERSIÓN 5.0 - NUEVA LÓGICA BCV IMPLEMENTADA - SOLO BD')

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')