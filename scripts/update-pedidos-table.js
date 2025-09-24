#!/usr/bin/env node

/**
 * Script para actualizar la tabla pedidos con las columnas faltantes
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
 * Función para crear las columnas faltantes en la tabla pedidos
 */
async function actualizarTablaPedidos() {
  try {
    console.log('🔧 Actualizando tabla pedidos...')
    
    // Lista de columnas que necesitamos agregar
    const columnasFaltantes = [
      {
        nombre: 'metodo_pago_abono_usd',
        tipo: 'text',
        descripcion: 'Método de pago para la parte USD del abono mixto'
      },
      {
        nombre: 'metodo_pago_abono_ves', 
        tipo: 'text',
        descripcion: 'Método de pago para la parte VES del abono mixto'
      },
      {
        nombre: 'referencia_abono_usd',
        tipo: 'text',
        descripcion: 'Referencia de pago para la parte USD del abono mixto'
      },
      {
        nombre: 'referencia_abono_ves',
        tipo: 'text', 
        descripcion: 'Referencia de pago para la parte VES del abono mixto'
      },
      {
        nombre: 'detalles_pedido',
        tipo: 'jsonb',
        descripcion: 'Detalles de los productos del pedido'
      }
    ]
    
    console.log('📋 Columnas a agregar:')
    columnasFaltantes.forEach(col => {
      console.log(`   - ${col.nombre} (${col.tipo}): ${col.descripcion}`)
    })
    
    // Nota: No podemos ejecutar ALTER TABLE directamente desde el cliente
    // Necesitamos proporcionar el SQL para que el usuario lo ejecute manualmente
    console.log('\\n⚠️  IMPORTANTE: No se pueden ejecutar comandos ALTER TABLE desde el cliente de Supabase')
    console.log('📝 Debes ejecutar el siguiente SQL en el editor SQL de Supabase:')
    console.log('')
    
    const sqlCommands = columnasFaltantes.map(col => {
      return `ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS ${col.nombre} ${col.tipo};`
    }).join('\\n')
    
    console.log(sqlCommands)
    console.log('')
    console.log('🔍 Después de ejecutar el SQL, ejecuta este script nuevamente para verificar')
    
    return true
    
  } catch (err) {
    console.error('❌ Error al actualizar tabla:', err.message)
    return false
  }
}

/**
 * Función para verificar la estructura actual
 */
async function verificarEstructura() {
  try {
    console.log('🔍 Verificando estructura actual de la tabla pedidos...')
    
    const { data, error } = await supabase
      .from('pedidos')
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
      
      // Verificar columnas faltantes
      const columnasNecesarias = [
        'metodo_pago_abono_usd',
        'metodo_pago_abono_ves', 
        'referencia_abono_usd',
        'referencia_abono_ves',
        'detalles_pedido'
      ]
      
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
      console.log('📋 La tabla pedidos está vacía')
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
  console.log('🧪 Actualizador de tabla pedidos')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    // Verificar estructura actual
    const estructuraOk = await verificarEstructura()
    
    if (!estructuraOk) {
      console.log('\\n🔧 Generando comandos SQL para actualizar la tabla...')
      await actualizarTablaPedidos()
    } else {
      console.log('\\n🎉 ¡La tabla pedidos está actualizada correctamente!')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
