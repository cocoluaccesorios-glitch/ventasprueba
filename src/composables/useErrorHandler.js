import { ref, reactive } from 'vue'
import Swal from 'sweetalert2'

// Estado global de errores
const errors = reactive({
  global: null,
  forms: {},
  api: {}
})

// Estado de carga global
const loading = reactive({
  global: false,
  forms: {},
  api: {}
})

export function useErrorHandler() {
  
  // Función para manejar errores de API
  function handleApiError(error, context = 'general') {
    console.error(`[${context}] API Error:`, error)
    
    let errorMessage = 'Ha ocurrido un error inesperado'
    let errorTitle = 'Error'
    
    if (error?.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }
    
    // Errores específicos de Supabase
    if (error?.code) {
      switch (error.code) {
        case 'PGRST116':
          errorTitle = 'Error de Conexión'
          errorMessage = 'No se pudo conectar con la base de datos. Verifica tu conexión a internet.'
          break
        case '23505':
          errorTitle = 'Dato Duplicado'
          errorMessage = 'Ya existe un registro con estos datos.'
          break
        case '23503':
          errorTitle = 'Error de Referencia'
          errorMessage = 'No se puede eliminar porque está siendo usado en otros registros.'
          break
        case '42501':
          errorTitle = 'Sin Permisos'
          errorMessage = 'No tienes permisos para realizar esta acción.'
          break
        default:
          errorTitle = 'Error de Base de Datos'
      }
    }
    
    // Mostrar error al usuario
    Swal.fire({
      title: errorTitle,
      text: errorMessage,
      icon: 'error',
      confirmButtonText: 'Entendido',
      customClass: {
        popup: 'swal2-popup-modern'
      }
    })
    
    // Guardar error en estado global
    errors.api[context] = {
      message: errorMessage,
      timestamp: new Date().toISOString(),
      details: error
    }
    
    return errorMessage
  }
  
  // Función para manejar errores de formularios
  function handleFormError(field, message, formName = 'default') {
    if (!errors.forms[formName]) {
      errors.forms[formName] = {}
    }
    
    errors.forms[formName][field] = message
    
    console.warn(`[Form ${formName}] Field ${field}:`, message)
  }
  
  // Función para limpiar errores de formulario
  function clearFormErrors(formName = 'default') {
    if (errors.forms[formName]) {
      delete errors.forms[formName]
    }
  }
  
  // Función para limpiar error específico
  function clearFieldError(field, formName = 'default') {
    if (errors.forms[formName] && errors.forms[formName][field]) {
      delete errors.forms[formName][field]
    }
  }
  
  // Función para verificar si hay errores en un formulario
  function hasFormErrors(formName = 'default') {
    return errors.forms[formName] && Object.keys(errors.forms[formName]).length > 0
  }
  
  // Función para obtener error de un campo específico
  function getFieldError(field, formName = 'default') {
    return errors.forms[formName]?.[field] || null
  }
  
  // Función para manejar errores de validación
  function handleValidationErrors(validationErrors, formName = 'default') {
    clearFormErrors(formName)
    
    if (Array.isArray(validationErrors)) {
      validationErrors.forEach(error => {
        if (error.field && error.message) {
          handleFormError(error.field, error.message, formName)
        }
      })
    } else if (typeof validationErrors === 'object') {
      Object.entries(validationErrors).forEach(([field, message]) => {
        handleFormError(field, message, formName)
      })
    }
  }
  
  // Función para mostrar error global
  function showGlobalError(message, title = 'Error') {
    errors.global = {
      message,
      title,
      timestamp: new Date().toISOString()
    }
    
    Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
  }
  
  // Función para limpiar error global
  function clearGlobalError() {
    errors.global = null
  }
  
  return {
    // Estado
    errors,
    loading,
    
    // Funciones de manejo de errores
    handleApiError,
    handleFormError,
    handleValidationErrors,
    showGlobalError,
    clearGlobalError,
    
    // Funciones de limpieza
    clearFormErrors,
    clearFieldError,
    
    // Funciones de verificación
    hasFormErrors,
    getFieldError
  }
}

// Composable para estados de carga
export function useLoading() {
  
  function setLoading(isLoading, context = 'global') {
    loading[context] = isLoading
  }
  
  function setFormLoading(formName, isLoading) {
    if (!loading.forms[formName]) {
      loading.forms[formName] = {}
    }
    loading.forms[formName] = isLoading
  }
  
  function setApiLoading(apiName, isLoading) {
    if (!loading.api[apiName]) {
      loading.api[apiName] = {}
    }
    loading.api[apiName] = isLoading
  }
  
  function isLoading(context = 'global') {
    return loading[context] === true
  }
  
  function isFormLoading(formName) {
    return loading.forms[formName] === true
  }
  
  function isApiLoading(apiName) {
    return loading.api[apiName] === true
  }
  
  return {
    setLoading,
    setFormLoading,
    setApiLoading,
    isLoading,
    isFormLoading,
    isApiLoading
  }
}
