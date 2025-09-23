#!/usr/bin/env node

/**
 * Script para verificar la base de datos de tasa de cambio
 * Ejecuta consultas SQL para analizar el estado de la tabla tasa_cambio
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
 * Ejecuta una consulta SQL y muestra los resultados
 */
async function ejecutarConsulta(nombre, consulta) {
  try {
    console.log(`\n🔍 ${nombre}`)
    console.log('=' .repeat(50))
    
    const { data, error } = await supabase.rpc('ejecutar_sql', { sql: consulta })
    
    if (error) {
      console.error(`❌ Error: ${error.message}`)
      return
    }
    
    if (data && data.length > 0) {
      console.table(data)
    } else {
      console.log('📭 No hay datos para mostrar')
    }
    
  } catch (error) {
    console.error(`❌ Error ejecutando consulta: ${error.message}`)
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando verificación de base de datos de tasa de cambio...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  
  // 1. Verificar si existe la tabla
  await ejecutarConsulta(
    'Verificar existencia de tabla tasa_cambio',
    `SELECT table_name, table_type FROM information_schema.tables WHERE table_name = 'tasa_cambio'`
  )
  
  // 2. Ver estructura de la tabla
  await ejecutarConsulta(
    'Estructura de la tabla tasa_cambio',
    `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'tasa_cambio' ORDER BY ordinal_position`
  )
  
  // 3. Ver todos los registros
  await ejecutarConsulta(
    'Todos los registros de tasa de cambio',
    `SELECT id, fecha, tasa_bcv, fuente, created_at FROM tasa_cambio ORDER BY fecha DESC, id DESC LIMIT 20`
  )
  
  // 4. Ver tasa más reciente
  await ejecutarConsulta(
    'Tasa más reciente',
    `SELECT id, fecha, tasa_bcv, fuente, created_at FROM tasa_cambio ORDER BY fecha DESC, id DESC LIMIT 1`
  )
  
  // 5. Ver estadísticas por fuente
  await ejecutarConsulta(
    'Estadísticas por fuente',
    `SELECT fuente, COUNT(*) as cantidad_registros, MIN(fecha) as fecha_mas_antigua, MAX(fecha) as fecha_mas_reciente, AVG(tasa_bcv) as tasa_promedio FROM tasa_cambio GROUP BY fuente ORDER BY cantidad_registros DESC`
  )
  
  // 6. Ver tasas del último mes
  await ejecutarConsulta(
    'Tasas del último mes',
    `SELECT fecha, tasa_bcv, fuente, created_at FROM tasa_cambio WHERE fecha >= CURRENT_DATE - INTERVAL '30 days' ORDER BY fecha DESC`
  )
  
  // 7. Ver estadísticas generales
  await ejecutarConsulta(
    'Estadísticas generales',
    `SELECT COUNT(*) as total_registros, COUNT(DISTINCT fecha) as dias_con_registros, MIN(fecha) as fecha_mas_antigua, MAX(fecha) as fecha_mas_reciente, MIN(tasa_bcv) as tasa_minima, MAX(tasa_bcv) as tasa_maxima, AVG(tasa_bcv) as tasa_promedio FROM tasa_cambio`
  )
  
  // 8. Ver tasas de hoy
  await ejecutarConsulta(
    'Tasas de hoy',
    `SELECT id, fecha, tasa_bcv, fuente, created_at FROM tasa_cambio WHERE fecha = CURRENT_DATE ORDER BY created_at DESC`
  )
  
  console.log('\n✅ Verificación completada')
}

// Ejecutar
main().catch(console.error)
