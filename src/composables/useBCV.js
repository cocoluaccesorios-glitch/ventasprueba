/**
 * Composable para manejar la tasa de cambio del BCV
 * Proporciona funciones reactivas para obtener y usar la tasa automáticamente
 */

import { ref, computed, onMounted } from 'vue'
import { getTasaBCV, actualizarTasaBCV, convertirUSDaVES, convertirVESaUSD } from '../services/bcvService.js'

export function useBCV() {
  // Estado reactivo
  const tasaBCV = ref(166.58) // Tasa por defecto
  const isLoading = ref(false)
  const lastUpdated = ref(null)
  const error = ref(null)

  /**
   * Cargar la tasa BCV del día actual
   */
  const cargarTasaBCV = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const tasa = await getTasaBCV()
      tasaBCV.value = tasa
      lastUpdated.value = new Date()
      
      const fechaHoy = new Date().toLocaleDateString('es-VE')
      console.log(`✅ Tasa BCV del ${fechaHoy} cargada: ${tasa} Bs/USD`)
      
    } catch (err) {
      error.value = err.message
      console.error('❌ Error al cargar tasa BCV:', err)
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

  // Cargar tasa al montar el componente
  onMounted(() => {
    cargarTasaBCV()
  })

  return {
    // Estado
    tasaBCV,
    isLoading,
    lastUpdated,
    error,
    
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
