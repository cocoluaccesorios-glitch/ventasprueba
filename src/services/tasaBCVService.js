/**
 * Servicio para manejo automático de tasas BCV
 * Verifica y actualiza la tasa del BCV automáticamente
 */

import { supabase } from '../lib/supabaseClient.js'
import { obtenerTasaOficialBCV } from './bcvService.js'

/**
 * Verificar y actualizar la tasa BCV automáticamente usando la función de Supabase
 * Esta función debe llamarse cada vez que se abre el formulario de venta
 */
export async function verificarYActualizarTasaBCV() {
  try {
    console.log('🔄 Verificando tasa BCV automáticamente...')
    
    // Paso 1: Obtener la tasa actual del BCV desde su sitio web
    const tasaActualBCV = await obtenerTasaOficialBCV()
    console.log(`📊 Tasa actual del BCV: ${tasaActualBCV} Bs/USD`)
    
    // Paso 2: Usar la función de Supabase para verificar y actualizar automáticamente
    const { data: resultado, error: functionError } = await supabase
      .rpc('verificar_y_actualizar_tasa_bcv', {
        new_tasa: tasaActualBCV
      })
    
    if (functionError) {
      console.error('❌ Error al ejecutar función de verificación:', functionError.message)
      return { success: false, error: functionError.message }
    }
    
    // Paso 3: Procesar el resultado de la función
    if (resultado && resultado.success) {
      console.log(`✅ Verificación completada: ${resultado.action}`)
      console.log(`💰 Tasa: ${resultado.tasa} Bs/USD`)
      
      if (resultado.action === 'updated') {
        console.log(`🔄 Tasa anterior: ${resultado.tasa_anterior} Bs/USD`)
        console.log(`📊 Diferencia: ${resultado.diferencia} Bs/USD`)
      }
      
      return {
        success: true,
        action: resultado.action,
        tasa: resultado.tasa,
        tasaAnterior: resultado.tasa_anterior,
        diferencia: resultado.diferencia,
        id: resultado.id
      }
    } else {
      console.error('❌ La función no retornó un resultado válido')
      return { success: false, error: 'Resultado inválido de la función' }
    }
    
  } catch (error) {
    console.error('❌ Error en verificarYActualizarTasaBCV:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Obtener la tasa BCV más reciente
 */
export async function obtenerTasaBCVActual() {
  try {
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('*')
      .order('fecha_hora', { ascending: false })
      .limit(1)
      .single()
    
    if (error) {
      console.error('❌ Error al obtener tasa actual:', error.message)
      return null
    }
    
    return data
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return null
  }
}

/**
 * Obtener todas las tasas del día actual
 */
export async function obtenerTasasDelDia() {
  try {
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('*')
      .eq('fecha', new Date().toISOString().split('T')[0])
      .order('fecha_hora', { ascending: false })
    
    if (error) {
      console.error('❌ Error al obtener tasas del día:', error.message)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return []
  }
}

/**
 * Obtener historial de tasas BCV
 */
export async function obtenerHistorialTasas(limite = 10) {
  try {
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('*')
      .order('fecha_hora', { ascending: false })
      .limit(limite)
    
    if (error) {
      console.error('❌ Error al obtener historial:', error.message)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return []
  }
}

/**
 * Función para obtener la tasa oficial del BCV desde su sitio web
 * Esta función debe ser implementada en bcvService.js
 */
async function obtenerTasaOficialBCV() {
  // Esta función debe implementarse en bcvService.js
  // Por ahora retornamos una tasa por defecto
  return 169.9761
}
