#!/usr/bin/env node

/**
 * Script para corregir las tasas BCV en pedidos de abono
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
 * Corregir tasas BCV en pedidos de abono
 */
async function corregirTasasAbono() {
  try {
    console.log('🔄 Corrigiendo tasas BCV en pedidos de abono...')
    
    // Buscar pedidos de abono con tasa BCV = 160
    const { data: pedidosAbono, error: selectError } = await supabase
      .from('pedidos')
      .select('id, metodo_pago, tasa_bcv, es_abono, tipo_pago_abono')
      .or('metodo_pago.eq.Abono,es_abono.eq.true,tipo_pago_abono.not.is.null')
      .eq('tasa_bcv', 160)
    
    if (selectError) {
      console.error('❌ Error al buscar pedidos de abono:', selectError.message)
      return false
    }
    
    if (!pedidosAbono || pedidosAbono.length === 0) {
      console.log('✅ No hay pedidos de abono con tasa BCV = 160 para corregir')
      return true
    }
    
    console.log(`📊 Encontrados ${pedidosAbono.length} pedidos de abono con tasa BCV = 160`)
    
    // Mostrar detalles de los pedidos
    console.log('\n📋 Pedidos de abono a corregir:')
    pedidosAbono.forEach(pedido => {
      console.log(`   - Pedido #${pedido.id}: ${pedido.metodo_pago} (tasa: ${pedido.tasa_bcv})`)
    })
    
    // Actualizar cada pedido
    for (const pedido of pedidosAbono) {
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({ tasa_bcv: 166.58 })
        .eq('id', pedido.id)
      
      if (updateError) {
        console.error(`❌ Error al actualizar pedido ${pedido.id}:`, updateError.message)
      } else {
        console.log(`✅ Pedido #${pedido.id} actualizado: 160 → 166.58`)
      }
    }
    
    console.log('\n🎉 Corrección de pedidos de abono completada')
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Verificar pedidos de abono con tasa nula
 */
async function verificarAbonosTasaNula() {
  try {
    console.log('🔍 Verificando pedidos de abono con tasa BCV nula...')
    
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('id, metodo_pago, tasa_bcv, es_abono, tipo_pago_abono')
      .or('metodo_pago.eq.Abono,es_abono.eq.true,tipo_pago_abono.not.is.null')
      .is('tasa_bcv', null)
    
    if (error) {
      console.error('❌ Error al buscar pedidos:', error.message)
      return false
    }
    
    if (!pedidos || pedidos.length === 0) {
      console.log('✅ No hay pedidos de abono con tasa BCV nula')
      return true
    }
    
    console.log(`📊 Encontrados ${pedidos.length} pedidos de abono con tasa BCV nula`)
    
    // Actualizar pedidos con tasa nula
    for (const pedido of pedidos) {
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({ tasa_bcv: 166.58 })
        .eq('id', pedido.id)
      
      if (updateError) {
        console.error(`❌ Error al actualizar pedido ${pedido.id}:`, updateError.message)
      } else {
        console.log(`✅ Pedido #${pedido.id} actualizado: null → 166.58`)
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
  console.log('🚀 Iniciando corrección de tasas BCV en pedidos de abono...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  
  try {
    // Corregir pedidos de abono con tasa = 160
    const correccion1 = await corregirTasasAbono()
    
    // Verificar y corregir pedidos de abono con tasa nula
    const correccion2 = await verificarAbonosTasaNula()
    
    if (correccion1 && correccion2) {
      console.log('\n🎉 ¡Corrección de pedidos de abono completada exitosamente!')
      console.log('📋 Todos los pedidos de abono ahora tienen la tasa BCV correcta (166.58)')
    } else {
      console.log('\n⚠️  Corrección completada con algunos errores')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar
main()
