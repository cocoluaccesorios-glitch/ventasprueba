import { ref, reactive } from 'vue'

// Cache global
const cache = reactive({
  data: new Map(),
  timestamps: new Map(),
  config: {
    defaultTTL: 5 * 60 * 1000, // 5 minutos por defecto
    maxSize: 100, // Máximo 100 items en cache
    cleanupInterval: 10 * 60 * 1000 // Limpiar cada 10 minutos
  }
})

// Configuración de TTL por tipo de dato
const TTL_CONFIG = {
  productos: 10 * 60 * 1000, // 10 minutos
  clientes: 15 * 60 * 1000, // 15 minutos
  pedidos: 2 * 60 * 1000, // 2 minutos
  estadisticas: 5 * 60 * 1000, // 5 minutos
  categorias: 30 * 60 * 1000, // 30 minutos
  default: 5 * 60 * 1000 // 5 minutos
}

export function useCache() {
  
  // Función para generar clave de cache
  function generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|')
    
    return sortedParams ? `${prefix}:${sortedParams}` : prefix
  }
  
  // Función para obtener TTL
  function getTTL(key) {
    const prefix = key.split(':')[0]
    return TTL_CONFIG[prefix] || cache.config.defaultTTL
  }
  
  // Función para verificar si un item está expirado
  function isExpired(key) {
    const timestamp = cache.timestamps.get(key)
    if (!timestamp) return true
    
    const ttl = getTTL(key)
    return Date.now() - timestamp > ttl
  }
  
  // Función para obtener datos del cache
  function get(key) {
    if (!cache.data.has(key)) {
      return null
    }
    
    if (isExpired(key)) {
      // Limpiar item expirado
      cache.data.delete(key)
      cache.timestamps.delete(key)
      return null
    }
    
    return cache.data.get(key)
  }
  
  // Función para guardar datos en cache
  function set(key, data) {
    // Verificar límite de cache
    if (cache.data.size >= cache.config.maxSize) {
      // Eliminar el item más antiguo
      const oldestKey = cache.timestamps.entries()
        .reduce((oldest, [key, timestamp]) => 
          timestamp < cache.timestamps.get(oldest) ? key : oldest
        )
      
      cache.data.delete(oldestKey)
      cache.timestamps.delete(oldestKey)
    }
    
    cache.data.set(key, data)
    cache.timestamps.set(key, Date.now())
  }
  
  // Función para invalidar cache
  function invalidate(pattern) {
    const keysToDelete = []
    
    for (const key of cache.data.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => {
      cache.data.delete(key)
      cache.timestamps.delete(key)
    })
    
    return keysToDelete.length
  }
  
  // Función para limpiar todo el cache
  function clear() {
    cache.data.clear()
    cache.timestamps.clear()
  }
  
  // Función para limpiar items expirados
  function cleanup() {
    const expiredKeys = []
    
    for (const [key, timestamp] of cache.timestamps.entries()) {
      if (isExpired(key)) {
        expiredKeys.push(key)
      }
    }
    
    expiredKeys.forEach(key => {
      cache.data.delete(key)
      cache.timestamps.delete(key)
    })
    
    return expiredKeys.length
  }
  
  // Función para obtener estadísticas del cache
  function getStats() {
    const now = Date.now()
    let expiredCount = 0
    
    for (const [key, timestamp] of cache.timestamps.entries()) {
      if (now - timestamp > getTTL(key)) {
        expiredCount++
      }
    }
    
    return {
      totalItems: cache.data.size,
      expiredItems: expiredCount,
      validItems: cache.data.size - expiredCount,
      memoryUsage: JSON.stringify([...cache.data.values()]).length
    }
  }
  
  // Función para configurar cache
  function configure(newConfig) {
    Object.assign(cache.config, newConfig)
  }
  
  // Función para obtener o establecer datos con fallback
  async function getOrSet(key, fetchFunction, ttl = null) {
    // Intentar obtener del cache
    const cachedData = get(key)
    if (cachedData !== null) {
      console.log(`📦 Cache hit: ${key}`)
      return cachedData
    }
    
    console.log(`🔄 Cache miss: ${key}, fetching...`)
    
    try {
      // Obtener datos frescos
      const freshData = await fetchFunction()
      
      // Guardar en cache
      set(key, freshData)
      
      return freshData
    } catch (error) {
      console.error(`❌ Error fetching data for ${key}:`, error)
      throw error
    }
  }
  
  // Función para precargar datos
  async function preload(key, fetchFunction) {
    try {
      const data = await fetchFunction()
      set(key, data)
      console.log(`🚀 Preloaded: ${key}`)
      return data
    } catch (error) {
      console.error(`❌ Error preloading ${key}:`, error)
      throw error
    }
  }
  
  // Inicializar limpieza automática
  if (typeof window !== 'undefined') {
    setInterval(cleanup, cache.config.cleanupInterval)
  }
  
  return {
    // Funciones principales
    get,
    set,
    getOrSet,
    preload,
    
    // Funciones de gestión
    invalidate,
    clear,
    cleanup,
    
    // Funciones de utilidad
    generateKey,
    getStats,
    configure,
    
    // Estado
    cache: cache.data,
    timestamps: cache.timestamps
  }
}

// Composable específico para cache de API
export function useApiCache() {
  const { getOrSet, generateKey, invalidate } = useCache()
  
  // Función para cachear llamadas a API
  async function cachedApiCall(apiFunction, params = {}, cacheKey = null) {
    const key = cacheKey || generateKey(apiFunction.name, params)
    return getOrSet(key, () => apiFunction(params))
  }
  
  // Función para invalidar cache de API específica
  function invalidateApiCache(apiName) {
    return invalidate(apiName)
  }
  
  return {
    cachedApiCall,
    invalidateApiCache
  }
}
