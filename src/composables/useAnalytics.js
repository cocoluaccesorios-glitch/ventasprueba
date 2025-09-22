import { ref, reactive } from 'vue'

// Estado global de analytics
const analytics = reactive({
  events: [],
  pageViews: [],
  userActions: [],
  performance: [],
  errors: []
})

// Configuración
const config = reactive({
  enabled: true,
  debug: false,
  batchSize: 10,
  flushInterval: 30000, // 30 segundos
  maxEvents: 1000
})

export function useAnalytics() {
  
  // Función para trackear eventos
  function track(eventName, properties = {}) {
    if (!config.enabled) return
    
    const event = {
      id: generateId(),
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: getSessionId()
    }
    
    analytics.events.push(event)
    
    if (config.debug) {
      console.log('📊 Analytics Event:', event)
    }
    
    // Limpiar eventos antiguos si excede el límite
    if (analytics.events.length > config.maxEvents) {
      analytics.events.splice(0, analytics.events.length - config.maxEvents)
    }
    
    // Flush si alcanza el batch size
    if (analytics.events.length >= config.batchSize) {
      flush()
    }
  }
  
  // Función para trackear page views
  function trackPageView(pageName, properties = {}) {
    const pageView = {
      id: generateId(),
      page: pageName,
      properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      sessionId: getSessionId()
    }
    
    analytics.pageViews.push(pageView)
    
    if (config.debug) {
      console.log('📄 Page View:', pageView)
    }
  }
  
  // Función para trackear acciones de usuario
  function trackUserAction(action, element, properties = {}) {
    const userAction = {
      id: generateId(),
      action,
      element: element?.tagName || 'unknown',
      elementId: element?.id || null,
      elementClass: element?.className || null,
      properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      sessionId: getSessionId()
    }
    
    analytics.userActions.push(userAction)
    
    if (config.debug) {
      console.log('👆 User Action:', userAction)
    }
  }
  
  // Función para trackear performance
  function trackPerformance(metric, value, properties = {}) {
    const performanceMetric = {
      id: generateId(),
      metric,
      value,
      properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      sessionId: getSessionId()
    }
    
    analytics.performance.push(performanceMetric)
    
    if (config.debug) {
      console.log('⚡ Performance:', performanceMetric)
    }
  }
  
  // Función para trackear errores
  function trackError(error, properties = {}) {
    const errorEvent = {
      id: generateId(),
      message: error.message || error,
      stack: error.stack || null,
      properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      sessionId: getSessionId()
    }
    
    analytics.errors.push(errorEvent)
    
    if (config.debug) {
      console.log('❌ Error:', errorEvent)
    }
  }
  
  // Función para trackear conversiones
  function trackConversion(conversionType, value, properties = {}) {
    track('conversion', {
      type: conversionType,
      value,
      ...properties
    })
  }
  
  // Función para trackear tiempo en página
  function trackTimeOnPage(pageName, timeSpent) {
    track('time_on_page', {
      page: pageName,
      timeSpent,
      timeSpentSeconds: Math.round(timeSpent / 1000)
    })
  }
  
  // Función para trackear búsquedas
  function trackSearch(query, results, properties = {}) {
    track('search', {
      query,
      resultsCount: results?.length || 0,
      ...properties
    })
  }
  
  // Función para trackear formularios
  function trackForm(formName, action, properties = {}) {
    track('form', {
      form: formName,
      action, // submit, start, abandon
      ...properties
    })
  }
  
  // Función para trackear clicks
  function trackClick(element, properties = {}) {
    trackUserAction('click', element, properties)
  }
  
  // Función para trackear scroll
  function trackScroll(percentage, properties = {}) {
    track('scroll', {
      percentage,
      ...properties
    })
  }
  
  // Función para trackear hover
  function trackHover(element, duration, properties = {}) {
    trackUserAction('hover', element, {
      duration,
      ...properties
    })
  }
  
  // Función para obtener estadísticas
  function getStats() {
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    return {
      totalEvents: analytics.events.length,
      totalPageViews: analytics.pageViews.length,
      totalUserActions: analytics.userActions.length,
      totalErrors: analytics.errors.length,
      eventsLast24h: analytics.events.filter(e => new Date(e.timestamp) > last24h).length,
      pageViewsLast24h: analytics.pageViews.filter(p => new Date(p.timestamp) > last24h).length,
      errorsLast24h: analytics.errors.filter(e => new Date(e.timestamp) > last24h).length
    }
  }
  
  // Función para obtener eventos por tipo
  function getEventsByType(type) {
    return analytics.events.filter(e => e.name === type)
  }
  
  // Función para obtener página más visitada
  function getMostVisitedPage() {
    const pageCounts = {}
    analytics.pageViews.forEach(pv => {
      pageCounts[pv.page] = (pageCounts[pv.page] || 0) + 1
    })
    
    return Object.entries(pageCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 1)[0]
  }
  
  // Función para obtener errores más comunes
  function getMostCommonErrors() {
    const errorCounts = {}
    analytics.errors.forEach(error => {
      const key = error.message
      errorCounts[key] = (errorCounts[key] || 0) + 1
    })
    
    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
  }
  
  // Función para limpiar datos
  function clear() {
    analytics.events = []
    analytics.pageViews = []
    analytics.userActions = []
    analytics.performance = []
    analytics.errors = []
  }
  
  // Función para configurar analytics
  function configure(newConfig) {
    Object.assign(config, newConfig)
  }
  
  // Función para habilitar/deshabilitar
  function setEnabled(enabled) {
    config.enabled = enabled
  }
  
  // Función para habilitar/deshabilitar debug
  function setDebug(debug) {
    config.debug = debug
  }
  
  // Función para exportar datos
  function exportData() {
    return {
      events: analytics.events,
      pageViews: analytics.pageViews,
      userActions: analytics.userActions,
      performance: analytics.performance,
      errors: analytics.errors,
      exportedAt: new Date().toISOString()
    }
  }
  
  // Función para importar datos
  function importData(data) {
    if (data.events) analytics.events = data.events
    if (data.pageViews) analytics.pageViews = data.pageViews
    if (data.userActions) analytics.userActions = data.userActions
    if (data.performance) analytics.performance = data.performance
    if (data.errors) analytics.errors = data.errors
  }
  
  // Funciones de utilidad
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
  
  function getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id')
    if (!sessionId) {
      sessionId = generateId()
      sessionStorage.setItem('analytics_session_id', sessionId)
    }
    return sessionId
  }
  
  // Función para flush (enviar datos)
  function flush() {
    if (analytics.events.length === 0) return
    
    const data = {
      events: analytics.events.splice(0, config.batchSize),
      pageViews: analytics.pageViews.splice(0, config.batchSize),
      userActions: analytics.userActions.splice(0, config.batchSize),
      performance: analytics.performance.splice(0, config.batchSize),
      errors: analytics.errors.splice(0, config.batchSize)
    }
    
    // Aquí puedes enviar los datos a tu servicio de analytics
    if (config.debug) {
      console.log('📤 Flushing analytics data:', data)
    }
    
    // Ejemplo de envío a un endpoint
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // }).catch(error => {
    //   console.error('Error sending analytics data:', error)
    // })
  }
  
  // Auto-flush cada cierto tiempo
  if (typeof window !== 'undefined') {
    setInterval(flush, config.flushInterval)
    
    // Flush al cerrar la página
    window.addEventListener('beforeunload', flush)
  }
  
  return {
    // Estado
    analytics,
    config,
    
    // Funciones principales
    track,
    trackPageView,
    trackUserAction,
    trackPerformance,
    trackError,
    
    // Funciones específicas
    trackConversion,
    trackTimeOnPage,
    trackSearch,
    trackForm,
    trackClick,
    trackScroll,
    trackHover,
    
    // Funciones de análisis
    getStats,
    getEventsByType,
    getMostVisitedPage,
    getMostCommonErrors,
    
    // Funciones de gestión
    clear,
    configure,
    setEnabled,
    setDebug,
    exportData,
    importData,
    flush
  }
}

// Composable para analytics de performance
export function usePerformanceAnalytics() {
  const { trackPerformance } = useAnalytics()
  
  // Trackear Core Web Vitals
  function trackCoreWebVitals() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          trackPerformance('LCP', entry.startTime)
        }
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    }
    
    // First Input Delay
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          trackPerformance('FID', entry.processingStart - entry.startTime)
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
    }
    
    // Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        trackPerformance('CLS', clsValue)
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    }
  }
  
  // Trackear tiempo de carga de página
  function trackPageLoadTime() {
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      trackPerformance('page_load_time', loadTime)
    })
  }
  
  // Trackear tiempo de respuesta de API
  function trackApiResponseTime(url, startTime, endTime) {
    const responseTime = endTime - startTime
    trackPerformance('api_response_time', responseTime, { url })
  }
  
  return {
    trackCoreWebVitals,
    trackPageLoadTime,
    trackApiResponseTime
  }
}
