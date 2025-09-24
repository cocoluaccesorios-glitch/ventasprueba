#!/usr/bin/env node

/**
 * Script para revisar la estructura de la tabla pedidos
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
 * Revisar estructura de la tabla pedidos
 */
async function revisarEstructuraPedidos() {
  try {
    console.log('🔍 Revisando estructura de la tabla pedidos...')
    
    // Obtener un pedido de ejemplo para ver la estructura
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
      .limit(1)
    
    if (error) throw error
    
    if (pedidos.length === 0) {
      console.log('❌ No hay pedidos en la base de datos')
      return
    }
    
    const pedido = pedidos[0]
    console.log('📋 Estructura del pedido:')
    console.log(JSON.stringify(pedido, null, 2))
    
    console.log('')
    console.log('🔍 Campos relacionados con pagos:')
    const camposPago = Object.keys(pedido).filter(key => 
      key.includes('pago') || 
      key.includes('abono') || 
      key.includes('efectivo') || 
      key.includes('transferencia') || 
      key.includes('zelle') || 
      key.includes('movil')
    )
    
    camposPago.forEach(campo => {
      console.log(`   ${campo}: ${pedido[campo]}`)
    })
    
    if (camposPago.length === 0) {
      console.log('❌ No se encontraron campos de pago en la tabla pedidos')
      console.log('💡 Necesitamos agregar estos campos a la tabla')
    }
    
  } catch (error) {
    console.error('❌ Error revisando estructura:', error.message)
    throw error
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🧪 Revisión de Estructura de Tabla Pedidos')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    await revisarEstructuraPedidos()
    
    console.log('')
    console.log('🎉 ¡Revisión completada!')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
