#!/usr/bin/env node

/**
 * Script para revisar la base de datos de tasa BCV (CORREGIDO)
 * Estructura real: id, fecha, tasa_bcv
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan credenciales de Supabase en el archivo .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Función principal
 */
async function main() {
  console.log('🚀 REVISIÓN COMPLETA DE BASE DE DATOS TASA BCV')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log(`📅 Fecha de hoy: ${new Date().toISOString().split('T')[0]}`)
  
  try {
    // 1. Todos los registros
    console.log('\n📋 TODOS LOS REGISTROS')
    console.log('=' .repeat(50))
    
    const { data: todosRegistros, error: errorTodos } = await supabase
      .from('tasa_cambio')
      .select('*')
      .order('fecha', { ascending: false })
      .order('id', { ascending: false })
    
    if (errorTodos) {
      console.error('❌ Error:', errorTodos.message)
      return
    }
    
    if (!todosRegistros || todosRegistros.length === 0) {
      console.log('⚠️ No hay registros en la base de datos')
      return
    }
    
    todosRegistros.forEach((registro, index) => {
      console.log(`${index + 1}. ID: ${registro.id}, Fecha: ${registro.fecha}, Tasa: ${registro.tasa_bcv} Bs/USD`)
    })
    
    // 2. Tasa más reciente
    console.log('\n🎯 TASA MÁS RECIENTE')
    console.log('=' .repeat(50))
    const tasaReciente = todosRegistros[0]
    console.log(`✅ ID: ${tasaReciente.id}`)
    console.log(`📅 Fecha: ${tasaReciente.fecha}`)
    console.log(`💰 Tasa: ${tasaReciente.tasa_bcv} Bs/USD`)
    
    // 3. Tasa de hoy
    const fechaHoy = new Date().toISOString().split('T')[0]
    console.log(`\n📅 TASA DE HOY (${fechaHoy})`)
    console.log('=' .repeat(50))
    
    const tasaHoy = todosRegistros.find(t => t.fecha === fechaHoy)
    if (tasaHoy) {
      console.log(`✅ ID: ${tasaHoy.id}`)
      console.log(`💰 Tasa: ${tasaHoy.tasa_bcv} Bs/USD`)
    } else {
      console.log('⚠️ No hay tasa registrada para hoy')
    }
    
    // 4. Estadísticas generales
    console.log('\n📊 ESTADÍSTICAS GENERALES')
    console.log('=' .repeat(50))
    
    const totalRegistros = todosRegistros.length
    const diasUnicos = new Set(todosRegistros.map(t => t.fecha)).size
    const tasaMaxima = Math.max(...todosRegistros.map(t => t.tasa_bcv))
    const tasaMinima = Math.min(...todosRegistros.map(t => t.tasa_bcv))
    const tasaPromedio = todosRegistros.reduce((sum, t) => sum + t.tasa_bcv, 0) / totalRegistros
    
    console.log(`📈 Total de registros: ${totalRegistros}`)
    console.log(`📅 Días con tasa: ${diasUnicos}`)
    console.log(`📊 Tasa máxima: ${tasaMaxima} Bs/USD`)
    console.log(`📊 Tasa mínima: ${tasaMinima} Bs/USD`)
    console.log(`📊 Tasa promedio: ${tasaPromedio.toFixed(4)} Bs/USD`)
    
    // 5. Tasas de los últimos 7 días
    console.log('\n📅 TASAS DE LOS ÚLTIMOS 7 DÍAS')
    console.log('=' .repeat(50))
    
    const fecha7DiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const tasas7Dias = todosRegistros.filter(t => t.fecha >= fecha7DiasAtras)
    
    if (tasas7Dias.length > 0) {
      tasas7Dias.forEach((tasa, index) => {
        console.log(`${index + 1}. ${tasa.fecha}: ${tasa.tasa_bcv} Bs/USD (ID: ${tasa.id})`)
      })
    } else {
      console.log('⚠️ No hay tasas en los últimos 7 días')
    }
    
    // 6. Verificar duplicados por fecha
    console.log('\n🔍 VERIFICACIÓN DE DUPLICADOS')
    console.log('=' .repeat(50))
    
    const fechasConDuplicados = {}
    todosRegistros.forEach(registro => {
      if (!fechasConDuplicados[registro.fecha]) {
        fechasConDuplicados[registro.fecha] = []
      }
      fechasConDuplicados[registro.fecha].push(registro.id)
    })
    
    const duplicados = Object.entries(fechasConDuplicados).filter(([fecha, ids]) => ids.length > 1)
    
    if (duplicados.length > 0) {
      console.log('⚠️ Fechas con múltiples registros:')
      duplicados.forEach(([fecha, ids]) => {
        console.log(`   ${fecha}: IDs ${ids.join(', ')}`)
      })
    } else {
      console.log('✅ No hay duplicados por fecha')
    }
    
    // 7. Cambios en las tasas
    console.log('\n📈 CAMBIOS EN LAS TASAS')
    console.log('=' .repeat(50))
    
    for (let i = 0; i < Math.min(5, todosRegistros.length - 1); i++) {
      const actual = todosRegistros[i]
      const anterior = todosRegistros[i + 1]
      
      if (actual.fecha !== anterior.fecha) {
        const cambio = actual.tasa_bcv - anterior.tasa_bcv
        const porcentaje = ((cambio / anterior.tasa_bcv) * 100).toFixed(2)
        
        let tipoCambio = 'Sin cambio'
        if (cambio > 0) tipoCambio = 'Aumentó'
        else if (cambio < 0) tipoCambio = 'Disminuyó'
        
        console.log(`${actual.fecha}: ${actual.tasa_bcv} Bs/USD (${tipoCambio} ${cambio > 0 ? '+' : ''}${cambio.toFixed(4)}, ${porcentaje}%)`)
      }
    }
    
    // 8. Resumen ejecutivo
    console.log('\n📋 RESUMEN EJECUTIVO')
    console.log('=' .repeat(50))
    console.log(`✅ Base de datos funcionando correctamente`)
    console.log(`📊 ${totalRegistros} registros en ${diasUnicos} días diferentes`)
    console.log(`💰 Tasa actual: ${tasaReciente.tasa_bcv} Bs/USD`)
    console.log(`📅 Última actualización: ${tasaReciente.fecha}`)
    console.log(`🎯 Tasa para hoy: ${tasaHoy ? `${tasaHoy.tasa_bcv} Bs/USD` : 'No disponible'}`)
    
    console.log('\n✅ Revisión completada exitosamente')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar
main()
