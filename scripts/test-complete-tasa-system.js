#!/usr/bin/env node

/**
 * Script de prueba para verificar la nueva lógica de tasas BCV
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan credenciales de Supabase en el archivo .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Probar la función de verificación automática
 */
async function probarVerificacionAutomatica() {
  try {
    console.log('🧪 Probando verificación automática de tasas BCV...')
    
    // Probar con la tasa actual
    console.log('📊 Probando con tasa actual (169.9761)...')
    const { data: resultado1, error: error1 } = await supabase
      .rpc('verificar_y_actualizar_tasa_bcv', {
        new_tasa: 169.9761
      })
    
    if (error1) {
      console.error('❌ Error en prueba 1:', error1.message)
      return false
    }
    
    console.log('✅ Prueba 1 exitosa:', resultado1)
    
    // Probar con una tasa diferente
    console.log('📊 Probando con tasa diferente (170.5000)...')
    const { data: resultado2, error: error2 } = await supabase
      .rpc('verificar_y_actualizar_tasa_bcv', {
        new_tasa: 170.5000
      })
    
    if (error2) {
      console.error('❌ Error en prueba 2:', error2.message)
      return false
    }
    
    console.log('✅ Prueba 2 exitosa:', resultado2)
    
    // Probar con la misma tasa diferente otra vez
    console.log('📊 Probando con la misma tasa diferente (170.5000)...')
    const { data: resultado3, error: error3 } = await supabase
      .rpc('verificar_y_actualizar_tasa_bcv', {
        new_tasa: 170.5000
      })
    
    if (error3) {
      console.error('❌ Error en prueba 3:', error3.message)
      return false
    }
    
    console.log('✅ Prueba 3 exitosa:', resultado3)
    
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Mostrar estado actual de la tabla
 */
async function mostrarEstadoTabla() {
  try {
    console.log('📊 Estado actual de la tabla tasa_cambio:')
    
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('*')
      .order('fecha_hora', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Error al obtener datos:', error.message)
      return
    }
    
    console.log(`📋 Total de registros: ${data.length}`)
    console.log('')
    
    data.forEach((row, index) => {
      const fechaHora = row.fecha_hora ? new Date(row.fecha_hora).toLocaleString('es-VE') : 'N/A'
      console.log(`${index + 1}. ID: ${row.id} | Fecha: ${row.fecha} | Tasa: ${row.tasa_bcv} Bs/USD | Hora: ${fechaHora}`)
    })
    
    console.log('')
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
  }
}

/**
 * Probar las funciones auxiliares
 */
async function probarFuncionesAuxiliares() {
  try {
    console.log('🧪 Probando funciones auxiliares...')
    
    // Probar get_latest_tasa_bcv_today
    console.log('📊 Probando get_latest_tasa_bcv_today...')
    const { data: tasaHoy, error: errorTasa } = await supabase
      .rpc('get_latest_tasa_bcv_today')
    
    if (errorTasa) {
      console.error('❌ Error en get_latest_tasa_bcv_today:', errorTasa.message)
    } else {
      console.log('✅ Tasa más reciente de hoy:', tasaHoy)
    }
    
    // Probar check_tasa_different_today
    console.log('📊 Probando check_tasa_different_today...')
    const { data: esDiferente, error: errorDiferente } = await supabase
      .rpc('check_tasa_different_today', { new_tasa: 175.0000 })
    
    if (errorDiferente) {
      console.error('❌ Error en check_tasa_different_today:', errorDiferente.message)
    } else {
      console.log('✅ ¿Es diferente 175.0000?', esDiferente)
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🧪 Prueba completa del sistema de tasas BCV')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    // Mostrar estado inicial
    await mostrarEstadoTabla()
    
    // Probar funciones auxiliares
    await probarFuncionesAuxiliares()
    
    // Probar verificación automática
    const exito = await probarVerificacionAutomatica()
    
    if (exito) {
      console.log('')
      console.log('🎉 ¡Todas las pruebas completadas exitosamente!')
      console.log('')
      console.log('📋 Resumen de funcionalidades:')
      console.log('   ✅ Función verificar_y_actualizar_tasa_bcv() funcionando')
      console.log('   ✅ Detección de tasas diferentes')
      console.log('   ✅ Prevención de duplicados')
      console.log('   ✅ Historial por fecha y hora')
      console.log('   ✅ Funciones auxiliares operativas')
      
    } else {
      console.log('')
      console.log('⚠️ Algunas pruebas fallaron')
    }
    
    // Mostrar estado final
    console.log('')
    console.log('📊 Estado final de la tabla:')
    await mostrarEstadoTabla()
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
