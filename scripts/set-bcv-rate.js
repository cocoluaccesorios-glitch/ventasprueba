#!/usr/bin/env node

/**
 * Script simplificado para obtener y guardar la tasa del BCV
 * Usa una tasa por defecto y la guarda en la base de datos
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
 * Obtener tasa por defecto (simulando obtención del BCV)
 */
function obtenerTasaPorDefecto() {
  // Tasa por defecto más realista para Venezuela
  const tasaPorDefecto = 36.0
  
  console.log(`💰 Usando tasa por defecto: ${tasaPorDefecto} Bs/USD`)
  console.log('ℹ️ Nota: Esta es una tasa estimada. Para obtener la tasa real del BCV,')
  console.log('   visita https://www.bcv.org.ve/ y actualiza manualmente.')
  
  return tasaPorDefecto
}

/**
 * Guardar la tasa en Supabase
 */
async function guardarTasaEnBD(tasa) {
  try {
    console.log('💾 Guardando tasa en la base de datos...')
    
    const fechaHoy = new Date().toISOString().split('T')[0]
    
    // Verificar si ya existe una tasa para hoy
    const { data: existingRate, error: checkError } = await supabase
      .from('tasa_cambio')
      .select('id')
      .eq('fecha', fechaHoy)
      .single()
    
    if (checkError && !checkError.message.includes('No rows')) {
      console.error('❌ Error al verificar tasa existente:', checkError.message)
      return false
    }
    
    if (existingRate) {
      // Actualizar tasa existente
      const { data, error } = await supabase
        .from('tasa_cambio')
        .update({ 
          tasa_bcv: tasa
        })
        .eq('fecha', fechaHoy)
        .select()
      
      if (error) {
        console.error('❌ Error al actualizar tasa:', error.message)
        return false
      }
      
      console.log('✅ Tasa actualizada exitosamente')
      console.log('📊 Datos actualizados:', data)
      
    } else {
      // Insertar nueva tasa
      const { data, error } = await supabase
        .from('tasa_cambio')
        .insert({
          fecha: fechaHoy,
          tasa_bcv: tasa
        })
        .select()
      
      if (error) {
        console.error('❌ Error al insertar tasa:', error.message)
        return false
      }
      
      console.log('✅ Tasa insertada exitosamente')
      console.log('📊 Datos insertados:', data)
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado al guardar tasa:', error.message)
    return false
  }
}

/**
 * Obtener la última tasa guardada
 */
async function obtenerUltimaTasa() {
  try {
    console.log('📊 Obteniendo última tasa guardada...')
    
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(1)
      .single()
    
    if (error) {
      if (error.message.includes('No rows')) {
        console.log('⚠️ No hay tasas guardadas en la base de datos')
        return null
      }
      console.error('❌ Error al obtener última tasa:', error.message)
      return null
    }
    
    console.log('✅ Última tasa encontrada:')
    console.log(`   Fecha: ${data.fecha}`)
    console.log(`   Tasa: ${data.tasa_bcv} Bs/USD`)
    console.log(`   Creada: ${data.created_at}`)
    
    return data
    
  } catch (error) {
    console.error('❌ Error inesperado al obtener última tasa:', error.message)
    return null
  }
}

/**
 * Verificar si la tabla existe
 */
async function verificarTabla() {
  try {
    console.log('🔍 Verificando tabla tasa_cambio...')
    
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('count')
      .limit(1)
    
    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('⚠️ La tabla tasa_cambio no existe')
        return false
      } else {
        console.error('❌ Error al verificar tabla:', error.message)
        return false
      }
    }
    
    console.log('✅ Tabla tasa_cambio existe')
    return true
    
  } catch (error) {
    console.error('❌ Error al verificar tabla:', error.message)
    return false
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Obteniendo tasa del BCV...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    // Verificar si la tabla existe
    const tablaExiste = await verificarTabla()
    
    if (!tablaExiste) {
      console.log('❌ La tabla tasa_cambio no existe.')
      console.log('📋 Para crear la tabla, ejecuta:')
      console.log('   node scripts/setup-bcv-system.js')
      console.log('')
      console.log('   O ejecuta manualmente el archivo SQL:')
      console.log('   scripts/create-tasa-cambio-table.sql')
      return
    }
    
    // Obtener tasa
    const tasa = obtenerTasaPorDefecto()
    
    // Guardar en la base de datos
    const guardado = await guardarTasaEnBD(tasa)
    
    if (guardado) {
      console.log('')
      console.log('🎉 ¡Tasa BCV guardada exitosamente!')
      console.log(`💰 Tasa actual: ${tasa} Bs/USD`)
      
      // Mostrar última tasa guardada
      console.log('')
      await obtenerUltimaTasa()
      
    } else {
      console.log('')
      console.log('⚠️ No se pudo guardar la tasa en la base de datos')
      console.log(`💰 Tasa obtenida: ${tasa} Bs/USD`)
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
