import { ref, reactive } from 'vue'
import Toast from '../components/Toast.vue'

// Estado global de toasts
const toasts = ref([])
let toastId = 0

export function useToast() {
  
  // Función para mostrar toast
  function show(options) {
    const id = ++toastId
    const toast = {
      id,
      type: 'info',
      title: '',
      message: '',
      duration: 5000,
      position: 'top-right',
      closable: true,
      persistent: false,
      ...options
    }
    
    toasts.value.push(toast)
    
    // Auto-remove si no es persistente
    if (!toast.persistent && toast.duration > 0) {
      setTimeout(() => {
        remove(id)
      }, toast.duration)
    }
    
    return id
  }
  
  // Función para remover toast
  function remove(id) {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  // Función para limpiar todos los toasts
  function clear() {
    toasts.value = []
  }
  
  // Funciones de conveniencia
  function success(message, options = {}) {
    return show({
      type: 'success',
      message,
      ...options
    })
  }
  
  function error(message, options = {}) {
    return show({
      type: 'error',
      message,
      duration: 7000, // Errores se muestran más tiempo
      ...options
    })
  }
  
  function warning(message, options = {}) {
    return show({
      type: 'warning',
      message,
      duration: 6000,
      ...options
    })
  }
  
  function info(message, options = {}) {
    return show({
      type: 'info',
      message,
      ...options
    })
  }
  
  // Función para mostrar toast de confirmación
  function confirm(message, options = {}) {
    return new Promise((resolve) => {
      const id = show({
        type: 'info',
        message,
        persistent: true,
        closable: true,
        duration: 0,
        ...options
      })
      
      // Crear botones de acción
      const toast = toasts.value.find(t => t.id === id)
      if (toast) {
        toast.actions = [
          {
            text: 'Cancelar',
            action: () => {
              remove(id)
              resolve(false)
            }
          },
          {
            text: 'Confirmar',
            action: () => {
              remove(id)
              resolve(true)
            }
          }
        ]
      }
    })
  }
  
  // Función para mostrar toast de progreso
  function progress(message, options = {}) {
    return show({
      type: 'info',
      message,
      persistent: true,
      closable: false,
      duration: 0,
      showProgress: true,
      ...options
    })
  }
  
  // Función para actualizar toast existente
  function update(id, updates) {
    const toast = toasts.value.find(t => t.id === id)
    if (toast) {
      Object.assign(toast, updates)
    }
  }
  
  // Función para obtener toast por ID
  function get(id) {
    return toasts.value.find(t => t.id === id)
  }
  
  // Función para contar toasts
  function count() {
    return toasts.value.length
  }
  
  // Función para verificar si hay toasts
  function hasToasts() {
    return toasts.value.length > 0
  }
  
  // Función para agrupar toasts por posición
  function getToastsByPosition(position) {
    return toasts.value.filter(toast => toast.position === position)
  }
  
  // Función para mostrar toast de carga
  function loading(message, options = {}) {
    return show({
      type: 'info',
      message,
      persistent: true,
      closable: false,
      duration: 0,
      loading: true,
      ...options
    })
  }
  
  // Función para mostrar toast de éxito con auto-dismiss
  function successAuto(message, duration = 3000) {
    return success(message, { duration })
  }
  
  // Función para mostrar toast de error con auto-dismiss
  function errorAuto(message, duration = 5000) {
    return error(message, { duration })
  }
  
  // Función para mostrar toast de información con auto-dismiss
  function infoAuto(message, duration = 4000) {
    return info(message, { duration })
  }
  
  // Función para mostrar toast de advertencia con auto-dismiss
  function warningAuto(message, duration = 4500) {
    return warning(message, { duration })
  }
  
  // Función para mostrar toast con acción personalizada
  function action(message, actionText, actionCallback, options = {}) {
    const id = show({
      type: 'info',
      message,
      persistent: true,
      closable: true,
      duration: 0,
      ...options
    })
    
    const toast = toasts.value.find(t => t.id === id)
    if (toast) {
      toast.actions = [
        {
          text: actionText,
          action: () => {
            actionCallback()
            remove(id)
          }
        }
      ]
    }
    
    return id
  }
  
  // Función para mostrar toast de notificación
  function notification(title, message, options = {}) {
    return show({
      type: 'info',
      title,
      message,
      duration: 6000,
      ...options
    })
  }
  
  // Función para mostrar toast de error de validación
  function validationError(errors, options = {}) {
    const message = Array.isArray(errors) 
      ? errors.join(', ') 
      : errors
    
    return error(`Error de validación: ${message}`, {
      duration: 8000,
      ...options
    })
  }
  
  // Función para mostrar toast de éxito de operación
  function operationSuccess(operation, options = {}) {
    return success(`${operation} completado exitosamente`, {
      duration: 3000,
      ...options
    })
  }
  
  // Función para mostrar toast de error de operación
  function operationError(operation, error, options = {}) {
    return error(`Error al ${operation}: ${error}`, {
      duration: 7000,
      ...options
    })
  }
  
  return {
    // Estado
    toasts,
    
    // Funciones principales
    show,
    remove,
    clear,
    update,
    get,
    count,
    hasToasts,
    getToastsByPosition,
    
    // Funciones de conveniencia
    success,
    error,
    warning,
    info,
    confirm,
    progress,
    loading,
    
    // Funciones con auto-dismiss
    successAuto,
    errorAuto,
    infoAuto,
    warningAuto,
    
    // Funciones especializadas
    action,
    notification,
    validationError,
    operationSuccess,
    operationError
  }
}

// Composable para toast manager global
export function useToastManager() {
  const { toasts, remove, clear } = useToast()
  
  // Función para limpiar toasts expirados
  function cleanupExpired() {
    const now = Date.now()
    toasts.value = toasts.value.filter(toast => {
      if (toast.persistent || toast.duration <= 0) return true
      
      const elapsed = now - toast.timestamp
      return elapsed < toast.duration
    })
  }
  
  // Función para limpiar toasts por tipo
  function clearByType(type) {
    toasts.value = toasts.value.filter(toast => toast.type !== type)
  }
  
  // Función para limpiar toasts por posición
  function clearByPosition(position) {
    toasts.value = toasts.value.filter(toast => toast.position !== position)
  }
  
  // Función para pausar todos los toasts
  function pauseAll() {
    toasts.value.forEach(toast => {
      if (toast.timer) {
        clearTimeout(toast.timer)
        toast.paused = true
      }
    })
  }
  
  // Función para reanudar todos los toasts
  function resumeAll() {
    toasts.value.forEach(toast => {
      if (toast.paused && toast.duration > 0) {
        toast.timer = setTimeout(() => {
          remove(toast.id)
        }, toast.duration)
        toast.paused = false
      }
    })
  }
  
  return {
    toasts,
    remove,
    clear,
    cleanupExpired,
    clearByType,
    clearByPosition,
    pauseAll,
    resumeAll
  }
}
