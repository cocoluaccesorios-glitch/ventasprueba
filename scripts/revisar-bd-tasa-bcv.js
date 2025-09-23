#!/usr/bin/env node

/**
 * Script para revisar la base de datos de tasa BCV
 * Ejecuta consultas SQL y muestra resultados formateados
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan credenciales de Supabase en el archivo .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Ejecuta una consulta SQL y muestra el resultado
 */
async function ejecutarConsulta(nombre, consulta) {
  try {
    console.log(`\n🔍 ${nombre}`)
    console.log('=' .repeat(50))
    
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('*')
      .order('fecha', { ascending: false })
    
    if (error) {
      console.error(`❌ Error: ${error.message}`)
      return
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No hay datos')
      return
    }
    
    // Mostrar datos formateados
    data.slice(0, 10).forEach((registro, index) => {
      console.log(`${index + 1}. ID: ${registro.id}, Fecha: ${registro.fecha}, Tasa: ${registro.tasa_bcv} Bs/USD`)
    })
    
    if (data.length > 10) {
      console.log(`... y ${data.length - 10} registros más`)
    }
    
  } catch (error) {
    console.error(`❌ Error ejecutando ${nombre}:`, error.message)
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 REVISIÓN COMPLETA DE BASE DE DATOS TASA BCV')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log(`📅 Fecha de hoy: ${new Date().toISOString().split('T')[0]}`)
  
  try {
    // 1. Verificar existencia de tabla
    console.log('\n📋 Verificando estructura de la tabla...')
    const { data: estructura, error: errorEstructura } = await supabase
      .from('tasa_cambio')
      .select('*')
      .limit(1)
    
    if (errorEstructura) {
      console.error('❌ Error al verificar tabla:', errorEstructura.message)
      return
    }
    
    console.log('✅ Tabla tasa_cambio existe')
    
    // 2. Todos los registros
    await ejecutarConsulta('TODOS LOS REGISTROS (últimos 10)', '')
    
    // 3. Tasa más reciente
    console.log('\n🎯 TASA MÁS RECIENTE')
    console.log('=' .repeat(50))
    const { data: tasaReciente, error: errorReciente } = await supabase
      .from('tasa_cambio')
      .select('*')
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (errorReciente) {
      console.error('❌ Error:', errorReciente.message)
    } else {
      console.log(`✅ Tasa: ${tasaReciente.tasa_bcv} Bs/USD`)
      console.log(`📅 Fecha: ${tasaReciente.fecha}`)
      console.log(`🕐 Creado: ${tasaReciente.created_at}`)
      console.log(`🔄 Actualizado: ${tasaReciente.updated_at}`)
    }
    
    // 4. Tasa de hoy
    const fechaHoy = new Date().toISOString().split('T')[0]
    console.log(`\n📅 TASA DE HOY (${fechaHoy})`)
    console.log('=' .repeat(50))
    
    const { data: tasaHoy, error: errorHoy } = await supabase
      .from('tasa_cambio')
      .select('*')
      .eq('fecha', fechaHoy)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (errorHoy && errorHoy.code !== 'PGRST116') {
      console.error('❌ Error:', errorHoy.message)
    } else if (tasaHoy) {
      console.log(`✅ Tasa de hoy: ${tasaHoy.tasa_bcv} Bs/USD`)
      console.log(`🕐 Actualizada: ${tasaHoy.updated_at}`)
    } else {
      console.log('⚠️ No hay tasa registrada para hoy')
    }
    
    // 5. Estadísticas
    console.log('\n📊 ESTADÍSTICAS GENERALES')
    console.log('=' .repeat(50))
    
    const { data: todasLasTasas, error: errorTodas } = await supabase
      .from('tasa_cambio')
      .select('tasa_bcv, fecha')
      .order('fecha', { ascending: false })
    
    if (errorTodas) {
      console.error('❌ Error:', errorTodas.message)
    } else {
      const totalRegistros = todasLasTasas.length
      const diasUnicos = new Set(todasLasTasas.map(t => t.fecha)).size
      const tasaMaxima = Math.max(...todasLasTasas.map(t => t.tasa_bcv))
      const tasaMinima = Math.min(...todasLasTasas.map(t => t.tasa_bcv))
      const tasaPromedio = todasLasTasas.reduce((sum, t) => sum + t.tasa_bcv, 0) / totalRegistros
      
      console.log(`📈 Total de registros: ${totalRegistros}`)
      console.log(`📅 Días con tasa: ${diasUnicos}`)
      console.log(`📊 Tasa máxima: ${tasaMaxima} Bs/USD`)
      console.log(`📊 Tasa mínima: ${tasaMinima} Bs/USD`)
      console.log(`📊 Tasa promedio: ${tasaPromedio.toFixed(4)} Bs/USD`)
    }
    
    // 6. Tasas de los últimos 7 días
    console.log('\n📅 TASAS DE LOS ÚLTIMOS 7 DÍAS')
    console.log('=' .repeat(50))
    
    const fecha7DiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const { data: tasas7Dias, error: error7Dias } = await supabase
      .from('tasa_cambio')
      .select('*')
      .gte('fecha', fecha7DiasAtras)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error7Dias) {
      console.error('❌ Error:', error7Dias.message)
    } else if (tasas7Dias && tasas7Dias.length > 0) {
      tasas7Dias.forEach((tasa, index) => {
        console.log(`${index + 1}. ${tasa.fecha}: ${tasa.tasa_bcv} Bs/USD`)
      })
    } else {
      console.log('⚠️ No hay tasas en los últimos 7 días')
    }
    
    console.log('\n✅ Revisión completada exitosamente')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar
main()
