// Servicio de manejo de errores global
import Swal from 'sweetalert2'

// Configurar manejo global de errores
export function setupGlobalErrorHandling() {
  // Manejar errores de JavaScript
  window.addEventListener('error', (event) => {
    console.error('Error global capturado:', event.error)
    
    // Mostrar notificación de error al usuario
    Swal.fire({
      title: 'Error del Sistema',
      text: 'Ha ocurrido un error inesperado. La aplicación continuará funcionando.',
      icon: 'error',
      confirmButtonText: 'Entendido',
      timer: 5000,
      timerProgressBar: true
    })
    
    // Prevenir que la aplicación se cuelgue
    event.preventDefault()
  })

  // Manejar promesas rechazadas
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rechazada:', event.reason)
    
    // Mostrar notificación de error al usuario
    Swal.fire({
      title: 'Error de Conexión',
      text: 'Ha ocurrido un problema de conexión. Verificando...',
      icon: 'warning',
      confirmButtonText: 'Entendido',
      timer: 3000,
      timerProgressBar: true
    })
    
    // Prevenir que la aplicación se cuelgue
    event.preventDefault()
  })

  // Manejar errores de recursos (imágenes, scripts, etc.)
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      console.error('Error de recurso:', event.target.src || event.target.href)
      // No mostrar notificación para errores de recursos
    }
  }, true)
}

// Función para manejar errores específicos de la aplicación
export function handleAppError(error, context = '') {
  console.error(`Error en ${context}:`, error)
  
  // Determinar el tipo de error y mostrar mensaje apropiado
  let title = 'Error'
  let message = 'Ha ocurrido un error inesperado'
  
  if (error.message.includes('fetch failed') || error.message.includes('NetworkError')) {
    title = 'Error de Conexión'
    message = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
  } else if (error.message.includes('401') || error.message.includes('403')) {
    title = 'Error de Autenticación'
    message = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
  } else if (error.message.includes('timeout')) {
    title = 'Tiempo Agotado'
    message = 'La operación tardó demasiado tiempo. Intenta nuevamente.'
  } else if (error.message.includes('validation') || error.message.includes('required')) {
    title = 'Error de Validación'
    message = error.message
  }
  
  Swal.fire({
    title: title,
    text: message,
    icon: 'error',
    confirmButtonText: 'Entendido'
  })
}

// Función para manejar errores de formularios
export function handleFormError(error, formName = 'formulario') {
  console.error(`Error en ${formName}:`, error)
  
  Swal.fire({
    title: 'Error en el Formulario',
    text: `No se pudo procesar el ${formName}. ${error.message}`,
    icon: 'error',
    confirmButtonText: 'Entendido'
  })
}

// Función para manejar errores de API
export function handleApiError(error, operation = 'operación') {
  console.error(`Error de API en ${operation}:`, error)
  
  let message = `No se pudo completar la ${operation}.`
  
  if (error.response) {
    // Error de respuesta del servidor
    const status = error.response.status
    if (status === 404) {
      message = 'El recurso solicitado no fue encontrado.'
    } else if (status === 500) {
      message = 'Error interno del servidor. Intenta más tarde.'
    } else if (status >= 400 && status < 500) {
      message = 'Error en la solicitud. Verifica los datos ingresados.'
    }
  } else if (error.request) {
    // Error de red
    message = 'No se pudo conectar con el servidor. Verifica tu conexión.'
  }
  
  Swal.fire({
    title: 'Error de Conexión',
    text: message,
    icon: 'error',
    confirmButtonText: 'Entendido'
  })
}

// Función para manejar errores de validación
export function handleValidationError(errors) {
  console.error('Errores de validación:', errors)
  
  let message = 'Por favor corrige los siguientes errores:\n'
  if (Array.isArray(errors)) {
    message += errors.map(error => `• ${error}`).join('\n')
  } else if (typeof errors === 'object') {
    message += Object.values(errors).map(error => `• ${error}`).join('\n')
  } else {
    message += `• ${errors}`
  }
  
  Swal.fire({
    title: 'Errores de Validación',
    text: message,
    icon: 'warning',
    confirmButtonText: 'Entendido'
  })
}

// Función para mostrar errores de manera más amigable
export function showFriendlyError(error) {
  console.error('Error amigable:', error)
  
  // Mapear errores técnicos a mensajes amigables
  const friendlyMessages = {
    'fetch failed': 'Problema de conexión. Verifica tu internet.',
    'NetworkError': 'Error de red. Intenta nuevamente.',
    'timeout': 'La operación tardó demasiado. Intenta de nuevo.',
    'unauthorized': 'Sesión expirada. Inicia sesión nuevamente.',
    'forbidden': 'No tienes permisos para esta acción.',
    'not found': 'El recurso solicitado no existe.',
    'server error': 'Error del servidor. Intenta más tarde.'
  }
  
  let message = 'Ha ocurrido un error inesperado.'
  
  for (const [key, friendlyMessage] of Object.entries(friendlyMessages)) {
    if (error.message.toLowerCase().includes(key)) {
      message = friendlyMessage
      break
    }
  }
  
  Swal.fire({
    title: 'Oops!',
    text: message,
    icon: 'error',
    confirmButtonText: 'Entendido'
  })
}
