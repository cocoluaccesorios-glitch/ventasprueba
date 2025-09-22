#!/usr/bin/env node

/**
 * Script para actualizar la tasa BCV en pedidos existentes
 * Útil cuando se cambia la tasa por defecto
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
 * Actualizar pedidos con tasa BCV incorrecta
 */
async function actualizarPedidosTasaBCV() {
  try {
    console.log('🔄 Actualizando pedidos con tasa BCV incorrecta...')
    
    // Buscar pedidos con tasa BCV = 160 (tasa antigua)
    const { data: pedidos, error: selectError } = await supabase
      .from('pedidos')
      .select('id, tasa_bcv')
      .eq('tasa_bcv', 160)
    
    if (selectError) {
      console.error('❌ Error al buscar pedidos:', selectError.message)
      return false
    }
    
    if (!pedidos || pedidos.length === 0) {
      console.log('✅ No hay pedidos con tasa BCV = 160 para actualizar')
      return true
    }
    
    console.log(`📊 Encontrados ${pedidos.length} pedidos con tasa BCV = 160`)
    
    // Actualizar cada pedido
    for (const pedido of pedidos) {
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({ tasa_bcv: 166.58 })
        .eq('id', pedido.id)
      
      if (updateError) {
        console.error(`❌ Error al actualizar pedido ${pedido.id}:`, updateError.message)
      } else {
        console.log(`✅ Pedido ${pedido.id} actualizado: 160 → 166.58`)
      }
    }
    
    console.log('🎉 Actualización de pedidos completada')
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Verificar pedidos con tasa BCV nula
 */
async function verificarPedidosTasaNula() {
  try {
    console.log('🔍 Verificando pedidos con tasa BCV nula...')
    
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('id, tasa_bcv')
      .is('tasa_bcv', null)
    
    if (error) {
      console.error('❌ Error al buscar pedidos:', error.message)
      return false
    }
    
    if (!pedidos || pedidos.length === 0) {
      console.log('✅ No hay pedidos con tasa BCV nula')
      return true
    }
    
    console.log(`📊 Encontrados ${pedidos.length} pedidos con tasa BCV nula`)
    
    // Actualizar pedidos con tasa nula
    for (const pedido of pedidos) {
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({ tasa_bcv: 166.58 })
        .eq('id', pedido.id)
      
      if (updateError) {
        console.error(`❌ Error al actualizar pedido ${pedido.id}:`, updateError.message)
      } else {
        console.log(`✅ Pedido ${pedido.id} actualizado: null → 166.58`)
      }
    }
    
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
  console.log('🚀 Iniciando actualización de tasas BCV en pedidos existentes...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  
  try {
    // Actualizar pedidos con tasa = 160
    const actualizacion1 = await actualizarPedidosTasaBCV()
    
    // Verificar y actualizar pedidos con tasa nula
    const actualizacion2 = await verificarPedidosTasaNula()
    
    if (actualizacion1 && actualizacion2) {
      console.log('\n🎉 ¡Actualización completada exitosamente!')
      console.log('📋 Todos los pedidos ahora tienen la tasa BCV correcta (166.58)')
    } else {
      console.log('\n⚠️  Actualización completada con algunos errores')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar
main()
