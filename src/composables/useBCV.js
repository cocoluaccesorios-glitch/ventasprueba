/**
 * Composable para manejar la tasa de cambio del BCV
 * Proporciona funciones reactivas para obtener y usar la tasa automáticamente
 */

import { ref, computed, onMounted } from 'vue'
import { getTasaBCV, actualizarTasaBCV, convertirUSDaVES, convertirVESaUSD } from '../services/bcvService.js'
import { verificarYActualizarTasaBCV, obtenerTasaBCVActual } from '../services/tasaBCVService.js'

export function useBCV() {
  // Estado reactivo
  const tasaBCV = ref(36.0) // Tasa por defecto más realista
  const isLoading = ref(false)
  const lastUpdated = ref(null)
  const error = ref(null)
  const isInitialized = ref(false)

  /**
   * Cargar la tasa BCV del día actual con verificación automática
   */
  const cargarTasaBCV = async () => {
    // Evitar cargar múltiples veces en la misma sesión
    if (isInitialized.value && !necesitaActualizacion.value) {
      console.log('🔄 Tasa BCV ya cargada, usando caché')
      return tasaBCV.value
    }

    try {
      isLoading.value = true
      error.value = null
      
      console.log('🔄 Verificando y actualizando tasa BCV automáticamente...')
      
      // Usar el nuevo servicio que verifica automáticamente
      const resultado = await verificarYActualizarTasaBCV()
      
      if (resultado.success) {
        tasaBCV.value = resultado.tasa
        lastUpdated.value = new Date()
        isInitialized.value = true
        
        const fechaHoy = new Date().toLocaleDateString('es-VE')
        console.log(`✅ Tasa BCV del ${fechaHoy} verificada: ${resultado.tasa} Bs/USD`)
        console.log(`📊 Acción realizada: ${resultado.action}`)
        
        if (resultado.action === 'updated') {
          console.log(`🔄 Tasa anterior: ${resultado.tasaAnterior} Bs/USD`)
        }
        
        return resultado.tasa
      } else {
        throw new Error(resultado.error)
      }
      
    } catch (err) {
      error.value = err.message
      console.error('❌ Error al cargar tasa BCV:', err)
      
      // Si hay error, intentar obtener la última tasa guardada
      try {
        const ultimaTasa = await obtenerTasaBCVActual()
        if (ultimaTasa) {
          tasaBCV.value = ultimaTasa.tasa_bcv
          lastUpdated.value = new Date(ultimaTasa.fecha_hora)
          isInitialized.value = true
          console.log(`🔄 Usando última tasa guardada: ${ultimaTasa.tasa_bcv} Bs/USD`)
          return ultimaTasa.tasa_bcv
        }
      } catch (fallbackError) {
        console.error('❌ Error al obtener última tasa:', fallbackError)
      }
      
      // Si todo falla, usar tasa por defecto
      if (!isInitialized.value) {
        console.log('🔄 Usando tasa BCV por defecto debido a error de conexión')
        tasaBCV.value = 169.9761 // Tasa más realista
        lastUpdated.value = new Date()
        isInitialized.value = true
      }
      
      return tasaBCV.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Actualizar la tasa BCV del día actual
   */
  const actualizarTasa = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const tasa = await actualizarTasaBCV()
      tasaBCV.value = tasa
      lastUpdated.value = new Date()
      
      const fechaHoy = new Date().toLocaleDateString('es-VE')
      console.log(`🔄 Tasa BCV del ${fechaHoy} actualizada: ${tasa} Bs/USD`)
      
    } catch (err) {
      error.value = err.message
      console.error('❌ Error al actualizar tasa BCV:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Convertir USD a VES
   */
  const convertirUSD = async (usd) => {
    try {
      return await convertirUSDaVES(usd)
    } catch (err) {
      console.error('❌ Error al convertir USD:', err)
      return usd * tasaBCV.value
    }
  }

  /**
   * Convertir VES a USD
   */
  const convertirVES = async (ves) => {
    try {
      return await convertirVESaUSD(ves)
    } catch (err) {
      console.error('❌ Error al convertir VES:', err)
      return ves / tasaBCV.value
    }
  }

  // Computed properties
  const tasaFormateada = computed(() => {
    return tasaBCV.value.toFixed(2)
  })

  const tiempoTranscurrido = computed(() => {
    if (!lastUpdated.value) return 'Nunca'
    
    const ahora = new Date()
    const diferencia = ahora - lastUpdated.value
    const minutos = Math.floor(diferencia / (1000 * 60))
    const horas = Math.floor(minutos / 60)
    
    if (horas > 0) {
      return `Hace ${horas}h ${minutos % 60}m`
    } else if (minutos > 0) {
      return `Hace ${minutos}m`
    } else {
      return 'Recién actualizado'
    }
  })

  const necesitaActualizacion = computed(() => {
    if (!lastUpdated.value) return true
    
    const ahora = new Date()
    const fechaActual = ahora.toISOString().split('T')[0]
    const fechaUltima = lastUpdated.value.toISOString().split('T')[0]
    
    // Necesita actualización si es un día diferente
    return fechaActual !== fechaUltima
  })

  // Cargar tasa al montar el componente solo si no está inicializada
  onMounted(() => {
    if (!isInitialized.value) {
      cargarTasaBCV()
    }
  })

  return {
    // Estado
    tasaBCV,
    isLoading,
    lastUpdated,
    error,
    isInitialized,
    
    // Computed
    tasaFormateada,
    tiempoTranscurrido,
    necesitaActualizacion,
    
    // Métodos
    cargarTasaBCV,
    actualizarTasa,
    convertirUSD,
    convertirVES
  }
}
