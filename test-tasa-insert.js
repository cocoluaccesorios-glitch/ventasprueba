#!/usr/bin/env node

/**
 * Script para probar la inserción directa en la tabla tasa_cambio
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

async function testInsert() {
  try {
    console.log('🧪 Probando inserción directa en tasa_cambio...')
    
    // Intentar insertar una tasa de prueba
    const { data, error } = await supabase
      .from('tasa_cambio')
      .insert({
        fecha: new Date().toISOString().split('T')[0],
        tasa_bcv: 166.58
      })
      .select()
    
    if (error) {
      console.error('❌ Error al insertar:', error.message)
      console.error('📋 Detalles del error:', error)
      return false
    }
    
    console.log('✅ Inserción exitosa!')
    console.log('📊 Datos insertados:', data)
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

async function testSelect() {
  try {
    console.log('🔍 Probando lectura de tasa_cambio...')
    
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('❌ Error al leer:', error.message)
      return false
    }
    
    console.log('✅ Lectura exitosa!')
    console.log('📊 Datos encontrados:', data)
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Probando tabla tasa_cambio...')
  
  // Probar lectura primero
  const lecturaOk = await testSelect()
  
  if (lecturaOk) {
    // Probar inserción
    const insercionOk = await testInsert()
    
    if (insercionOk) {
      console.log('\n🎉 ¡Tabla tasa_cambio funcionando correctamente!')
    } else {
      console.log('\n⚠️  Problema con la inserción')
    }
  } else {
    console.log('\n❌ Problema con la lectura de la tabla')
  }
}

main()

