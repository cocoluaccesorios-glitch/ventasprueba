#!/usr/bin/env node

/**
 * Script para verificar la estructura de la tabla clientes
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
 * Función para verificar la estructura de la tabla clientes
 */
async function verificarEstructuraClientes() {
  try {
    console.log('🔍 Verificando estructura de la tabla clientes...')
    
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Error al acceder a la tabla:', error.message)
      return false
    }
    
    if (data && data.length > 0) {
      console.log('📋 Columnas actuales:')
      Object.keys(data[0]).forEach(key => {
        console.log(`   ✅ ${key}`)
      })
      
      // Verificar columnas necesarias
      const columnasNecesarias = ['activo', 'fecha_registro']
      
      const columnasFaltantes = columnasNecesarias.filter(col => 
        !Object.keys(data[0]).includes(col)
      )
      
      if (columnasFaltantes.length > 0) {
        console.log('\\n❌ Columnas faltantes:')
        columnasFaltantes.forEach(col => {
          console.log(`   ❌ ${col}`)
        })
        return false
      } else {
        console.log('\\n✅ Todas las columnas necesarias están presentes')
        return true
      }
    } else {
      console.log('📋 La tabla clientes está vacía')
      return false
    }
    
  } catch (err) {
    console.error('❌ Error al verificar estructura:', err.message)
    return false
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🧪 Verificador de tabla clientes')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    const estructuraOk = await verificarEstructuraClientes()
    
    if (!estructuraOk) {
      console.log('\\n🔧 Necesitas ejecutar el SQL para agregar las columnas faltantes:')
      console.log('📝 Archivo: scripts/update-clientes-simple.sql')
      console.log('')
      console.log('SQL a ejecutar:')
      console.log('ALTER TABLE clientes ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true;')
      console.log('ALTER TABLE clientes ADD COLUMN IF NOT EXISTS fecha_registro timestamp with time zone DEFAULT now();')
    } else {
      console.log('\\n🎉 ¡La tabla clientes está actualizada correctamente!')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
