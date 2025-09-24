import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'
import './assets/styles.css'
import { setupGlobalErrorHandling } from './services/errorHandlerService.js'

// VERSIÓN 8.1 - MEJORAS DE ESTABILIDAD
console.log('🚀 VERSIÓN 8.1 - MEJORAS DE ESTABILIDAD')

// Configurar manejo global de errores
setupGlobalErrorHandling()

const app = createApp(App)
const pinia = createPinia()

// Configurar manejo de errores en la app
app.config.errorHandler = (err, instance, info) => {
  console.error('Error en Vue:', err)
  console.error('Info:', info)
  // No hacer throw para evitar que la app se cuelgue
}

app.use(pinia)
app.use(router)

// Montar con manejo de errores
try {
  app.mount('#app')
  console.log('✅ Aplicación montada correctamente')
} catch (error) {
  console.error('❌ Error al montar la aplicación:', error)
}