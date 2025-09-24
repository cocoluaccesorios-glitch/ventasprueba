#!/usr/bin/env node

/**
 * Script de prueba para verificar la lógica de verificación automática de tasas BCV
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
 * Simular la lógica de verificación automática
 */
async function simularVerificacionTasaBCV() {
  try {
    console.log('🧪 Simulando verificación automática de tasa BCV...')
    
    // Simular tasa actual del BCV (en la realidad vendría del web scraping)
    const tasaActualBCV = 169.9761
    console.log(`📊 Tasa actual del BCV: ${tasaActualBCV} Bs/USD`)
    
    // Verificar si existe una tasa para hoy
    const { data: tasaHoy, error: checkError } = await supabase
      .from('tasa_cambio')
      .select('*')
      .eq('fecha', new Date().toISOString().split('T')[0])
      .order('id', { ascending: false })
      .limit(1)
      .single()
    
    if (checkError && !checkError.message.includes('No rows')) {
      console.error('❌ Error al verificar tasa existente:', checkError.message)
      return false
    }
    
    console.log('📋 Verificación completada')
    
    if (!tasaHoy) {
      // Escenario 1: No existe tasa para hoy
      console.log('📅 Escenario 1: No existe tasa para hoy')
      console.log('✅ Acción: Guardar nueva tasa')
      
      const { data: nuevaTasa, error: insertError } = await supabase
        .from('tasa_cambio')
        .insert({
          fecha: new Date().toISOString().split('T')[0],
          tasa_bcv: tasaActualBCV
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('❌ Error al insertar nueva tasa:', insertError.message)
        return false
      }
      
      console.log('✅ Nueva tasa guardada:', nuevaTasa)
      return { action: 'inserted', tasa: tasaActualBCV, data: nuevaTasa }
      
    } else {
      // Escenario 2: Existe tasa para hoy, verificar si es diferente
      const tasaExistente = tasaHoy.tasa_bcv
      const diferencia = Math.abs(tasaActualBCV - tasaExistente)
      const tolerancia = 0.01
      
      console.log(`📊 Tasa existente: ${tasaExistente} Bs/USD`)
      console.log(`📊 Diferencia: ${diferencia.toFixed(4)} Bs/USD`)
      console.log(`📊 Tolerancia: ${tolerancia} Bs/USD`)
      
      if (diferencia > tolerancia) {
        // Escenario 2a: La tasa es diferente
        console.log('🔄 Escenario 2a: Tasa diferente detectada')
        console.log('✅ Acción: Guardar nueva entrada')
        
        const { data: nuevaTasa, error: insertError } = await supabase
          .from('tasa_cambio')
          .insert({
            fecha: new Date().toISOString().split('T')[0],
            tasa_bcv: tasaActualBCV
          })
          .select()
          .single()
        
        if (insertError) {
          console.error('❌ Error al insertar nueva tasa:', insertError.message)
          return false
        }
        
        console.log('✅ Nueva tasa guardada (diferente):', nuevaTasa)
        return { action: 'updated', tasa: tasaActualBCV, tasaAnterior: tasaExistente, data: nuevaTasa }
        
      } else {
        // Escenario 2b: La tasa es la misma
        console.log('✅ Escenario 2b: Tasa actual es la misma')
        console.log('✅ Acción: Usar tasa existente')
        return { action: 'unchanged', tasa: tasaExistente, data: tasaHoy }
      }
    }
    
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
      .order('id', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Error al obtener datos:', error.message)
      return
    }
    
    console.log(`📋 Total de registros: ${data.length}`)
    console.log('')
    
    data.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id} | Fecha: ${row.fecha} | Tasa: ${row.tasa_bcv} Bs/USD`)
    })
    
    console.log('')
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🧪 Prueba de lógica de verificación automática de tasas BCV')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    // Mostrar estado inicial
    await mostrarEstadoTabla()
    
    // Simular verificación
    const resultado = await simularVerificacionTasaBCV()
    
    if (resultado) {
      console.log('')
      console.log('🎉 ¡Simulación completada exitosamente!')
      console.log(`📊 Acción realizada: ${resultado.action}`)
      console.log(`💰 Tasa: ${resultado.tasa} Bs/USD`)
      
      if (resultado.action === 'updated') {
        console.log(`🔄 Tasa anterior: ${resultado.tasaAnterior} Bs/USD`)
      }
      
    } else {
      console.log('')
      console.log('⚠️ La simulación falló')
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
