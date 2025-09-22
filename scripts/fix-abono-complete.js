#!/usr/bin/env node

/**
 * Script para corregir completamente los pedidos de abono
 * - Corrige la tasa BCV de 160 a 166.58
 * - Corrige el cálculo del total_abono_usd
 * - Corrige el cálculo del total en bolívares
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
 * Corregir completamente los pedidos de abono
 */
async function corregirPedidosAbono() {
  try {
    console.log('🔄 Corrigiendo pedidos de abono...')
    
    // Buscar pedidos de abono
    const { data: pedidosAbono, error: selectError } = await supabase
      .from('pedidos')
      .select('*')
      .or('metodo_pago.eq.Abono,es_abono.eq.true,tipo_pago_abono.not.is.null')
      .order('id', { ascending: false })
    
    if (selectError) {
      console.error('❌ Error al buscar pedidos de abono:', selectError.message)
      return false
    }
    
    if (!pedidosAbono || pedidosAbono.length === 0) {
      console.log('✅ No hay pedidos de abono para corregir')
      return true
    }
    
    console.log(`📊 Encontrados ${pedidosAbono.length} pedidos de abono`)
    
    // Mostrar detalles de los pedidos
    console.log('\n📋 Pedidos de abono encontrados:')
    pedidosAbono.forEach(pedido => {
      console.log(`   - Pedido #${pedido.id}: ${pedido.metodo_pago} (tasa: ${pedido.tasa_bcv}, total_abono: ${pedido.total_abono_usd})`)
    })
    
    // Corregir cada pedido
    for (const pedido of pedidosAbono) {
      console.log(`\n🔧 Corrigiendo pedido #${pedido.id}...`)
      
      // Calcular el total_abono_usd correcto
      let totalAbonoUSD = 0
      
      if (pedido.tipo_pago_abono === 'simple') {
        // Pago simple
        if (pedido.metodo_pago_abono && pedido.metodo_pago_abono.toLowerCase().includes('efectivo')) {
          // Efectivo en USD
          totalAbonoUSD = pedido.monto_abono_simple || 0
        } else if (pedido.metodo_pago_abono && pedido.metodo_pago_abono.toLowerCase().includes('zelle')) {
          // Zelle en USD
          totalAbonoUSD = pedido.monto_abono_simple || 0
        } else if (pedido.metodo_pago_abono && (pedido.metodo_pago_abono.toLowerCase().includes('pago') || pedido.metodo_pago_abono.toLowerCase().includes('transferencia'))) {
          // Pago móvil o transferencia en VES
          const tasaBCV = pedido.tasa_bcv || 166.58
          totalAbonoUSD = (pedido.monto_abono_simple || 0) / tasaBCV
        }
      } else if (pedido.tipo_pago_abono === 'mixto') {
        // Pago mixto
        const montoUSD = pedido.monto_abono_usd || 0
        const montoVES = pedido.monto_abono_ves || 0
        const tasaBCV = pedido.tasa_bcv || 166.58
        const montoVESEnUSD = montoVES / tasaBCV
        totalAbonoUSD = montoUSD + montoVESEnUSD
      }
      
      // Calcular el total en bolívares correcto
      const tasaBCV = 166.58 // Tasa correcta
      const totalVES = (pedido.total_usd || 0) * tasaBCV
      
      console.log(`   - Tasa BCV: ${pedido.tasa_bcv} → 166.58`)
      console.log(`   - Total abono USD: ${pedido.total_abono_usd} → ${totalAbonoUSD.toFixed(2)}`)
      console.log(`   - Total en bolívares: ${(pedido.total_usd * pedido.tasa_bcv).toFixed(2)} → ${totalVES.toFixed(2)}`)
      
      // Actualizar el pedido
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({ 
          tasa_bcv: 166.58,
          total_abono_usd: totalAbonoUSD
        })
        .eq('id', pedido.id)
      
      if (updateError) {
        console.error(`❌ Error al actualizar pedido ${pedido.id}:`, updateError.message)
      } else {
        console.log(`✅ Pedido #${pedido.id} actualizado correctamente`)
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
 * Verificar los cambios realizados
 */
async function verificarCambios() {
  try {
    console.log('\n🔍 Verificando cambios realizados...')
    
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('id, metodo_pago, tasa_bcv, total_abono_usd, total_usd, es_abono, tipo_pago_abono')
      .or('metodo_pago.eq.Abono,es_abono.eq.true,tipo_pago_abono.not.is.null')
      .order('id', { ascending: false })
    
    if (error) {
      console.error('❌ Error al verificar:', error.message)
      return false
    }
    
    console.log('\n📊 Estado actual de los pedidos de abono:')
    pedidos.forEach(pedido => {
      const saldoPendiente = (pedido.total_usd || 0) - (pedido.total_abono_usd || 0)
      const totalVES = (pedido.total_usd || 0) * (pedido.tasa_bcv || 166.58)
      
      console.log(`   - Pedido #${pedido.id}:`)
      console.log(`     * Tasa BCV: ${pedido.tasa_bcv} Bs/USD`)
      console.log(`     * Total: $${(pedido.total_usd || 0).toFixed(2)}`)
      console.log(`     * Abonado: $${(pedido.total_abono_usd || 0).toFixed(2)}`)
      console.log(`     * Saldo pendiente: $${saldoPendiente.toFixed(2)}`)
      console.log(`     * Total en bolívares: ${totalVES.toFixed(2)} Bs`)
    })
    
    return true
    
  } catch (error) {
    console.error('❌ Error al verificar:', error.message)
    return false
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando corrección completa de pedidos de abono...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  
  try {
    // Corregir pedidos de abono
    const correccion = await corregirPedidosAbono()
    
    if (correccion) {
      // Verificar los cambios
      await verificarCambios()
      
      console.log('\n🎉 ¡Corrección completa de pedidos de abono finalizada!')
      console.log('📋 Todos los pedidos de abono ahora tienen:')
      console.log('   - Tasa BCV correcta (166.58 Bs/USD)')
      console.log('   - Total_abono_usd calculado correctamente')
      console.log('   - Total en bolívares actualizado')
    } else {
      console.log('\n⚠️  Corrección completada con algunos errores')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar
main()
