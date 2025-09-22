#!/usr/bin/env node

/**
 * Script para configurar el sistema de actualización automática del BCV
 * Crea la tabla necesaria y prueba la conexión
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
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
 * Crear la tabla tasa_cambio
 */
async function crearTablaTasaCambio() {
  try {
    console.log('🔧 Creando tabla tasa_cambio...')
    
    // Leer el archivo SQL
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const sqlFile = join(__dirname, 'create-tasa-cambio-table.sql')
    
    const sqlContent = readFileSync(sqlFile, 'utf8')
    
    // Ejecutar el SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    })
    
    if (error) {
      console.error('❌ Error al crear tabla:', error.message)
      return false
    }
    
    console.log('✅ Tabla tasa_cambio creada exitosamente')
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
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
        console.log('⚠️  La tabla tasa_cambio no existe')
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
 * Probar la inserción de una tasa
 */
async function probarInsercion() {
  try {
    console.log('🧪 Probando inserción de tasa...')
    
    const { data, error } = await supabase
      .from('tasa_cambio')
      .insert({
        fecha: new Date().toISOString().split('T')[0],
        tasa_bcv: 166.58
      })
      .select()
    
    if (error) {
      console.error('❌ Error al insertar tasa:', error.message)
      return false
    }
    
    console.log('✅ Inserción de tasa exitosa')
    console.log('📊 Datos insertados:', data)
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
  console.log('🚀 Configurando sistema de actualización BCV...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  
  try {
    // Verificar si la tabla existe
    const tablaExiste = await verificarTabla()
    
    if (!tablaExiste) {
      console.log('📝 La tabla no existe, creándola...')
      const creada = await crearTablaTasaCambio()
      
      if (!creada) {
        console.log('❌ No se pudo crear la tabla automáticamente')
        console.log('📋 Ejecuta manualmente el archivo: scripts/create-tasa-cambio-table.sql')
        console.log('   en tu dashboard de Supabase (SQL Editor)')
        return
      }
    }
    
    // Probar inserción
    const insercionOk = await probarInsercion()
    
    if (insercionOk) {
      console.log('\n🎉 ¡Sistema BCV configurado exitosamente!')
      console.log('\n📋 Comandos disponibles:')
      console.log('   npm run bcv:update    - Actualizar tasa una vez')
      console.log('   npm run bcv:auto      - Modo automático continuo')
      console.log('   npm run bcv:test      - Probar el scraper')
    } else {
      console.log('\n⚠️  Sistema configurado pero con problemas de permisos')
      console.log('📋 Verifica las políticas RLS en Supabase')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar
main()
