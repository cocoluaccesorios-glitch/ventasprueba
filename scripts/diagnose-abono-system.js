#!/usr/bin/env node

/**
 * Script para diagnosticar y arreglar completamente el sistema de abonos
 * - Verifica el estado actual
 * - Identifica problemas específicos
 * - Corrige los datos incorrectos
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
 * Verificar estado actual del sistema
 */
async function verificarEstadoActual() {
  try {
    console.log('🔍 Verificando estado actual del sistema...')
    
    // 1. Verificar pedidos de abono
    const { data: pedidosAbono, error: pedidosError } = await supabase
      .from('pedidos')
      .select(`
        id,
        cliente_nombre,
        total_usd,
        tasa_bcv,
        metodo_pago,
        es_abono,
        tipo_pago_abono,
        metodo_pago_abono,
        monto_abono_simple,
        monto_abono_usd,
        monto_abono_ves,
        total_abono_usd,
        estado_entrega,
        fecha_pedido
      `)
      .or('es_abono.eq.true,metodo_pago.eq.Abono,tipo_pago_abono.not.is.null')
      .order('id', { ascending: false })
      .limit(10)
    
    if (pedidosError) {
      console.error('❌ Error al obtener pedidos de abono:', pedidosError.message)
      return false
    }
    
    console.log(`\n📊 Pedidos de abono encontrados: ${pedidosAbono.length}`)
    
    for (const pedido of pedidosAbono) {
      console.log(`\n🔍 Pedido #${pedido.id} (${pedido.cliente_nombre}):`)
      console.log(`   - Total: $${pedido.total_usd}`)
      console.log(`   - Tasa BCV: ${pedido.tasa_bcv} Bs/USD`)
      console.log(`   - Método pago: ${pedido.metodo_pago}`)
      console.log(`   - Es abono: ${pedido.es_abono}`)
      console.log(`   - Tipo pago abono: ${pedido.tipo_pago_abono}`)
      console.log(`   - Método pago abono: ${pedido.metodo_pago_abono}`)
      console.log(`   - Monto abono simple: ${pedido.monto_abono_simple}`)
      console.log(`   - Monto abono USD: ${pedido.monto_abono_usd}`)
      console.log(`   - Monto abono VES: ${pedido.monto_abono_ves}`)
      console.log(`   - Total abono USD: ${pedido.total_abono_usd}`)
      console.log(`   - Estado: ${pedido.estado_entrega}`)
    }
    
    // 2. Verificar si existe tabla abonos
    try {
      const { data: abonos, error: abonosError } = await supabase
        .from('abonos')
        .select('id, pedido_id, monto_abono_usd')
        .limit(5)
      
      if (abonosError) {
        console.log('\n⚠️ Tabla abonos no existe o no es accesible')
        console.log(`   Error: ${abonosError.message}`)
      } else {
        console.log(`\n✅ Tabla abonos existe con ${abonos.length} registros`)
      }
    } catch (error) {
      console.log('\n⚠️ Tabla abonos no existe')
    }
    
    // 3. Verificar si existe tabla tasa_cambio
    try {
      const { data: tasas, error: tasasError } = await supabase
        .from('tasa_cambio')
        .select('id, fecha, tasa_bcv')
        .limit(5)
      
      if (tasasError) {
        console.log('\n⚠️ Tabla tasa_cambio no existe o no es accesible')
        console.log(`   Error: ${tasasError.message}`)
      } else {
        console.log(`\n✅ Tabla tasa_cambio existe con ${tasas.length} registros`)
      }
    } catch (error) {
      console.log('\n⚠️ Tabla tasa_cambio no existe')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error verificando estado:', error.message)
    return false
  }
}

/**
 * Corregir datos específicos de pedidos
 */
async function corregirDatosPedidos() {
  try {
    console.log('\n🔧 Corrigiendo datos específicos de pedidos...')
    
    // 1. Corregir tasa BCV en pedidos de abono
    console.log('\n📋 Corrigiendo tasa BCV en pedidos de abono...')
    
    const { data: pedidosActualizados, error: updateError } = await supabase
      .from('pedidos')
      .update({ 
        tasa_bcv: 166.58 
      })
      .or('es_abono.eq.true,metodo_pago.eq.Abono,tipo_pago_abono.not.is.null')
      .neq('tasa_bcv', 166.58)
      .select('id, tasa_bcv')
    
    if (updateError) {
      console.error('❌ Error actualizando tasa BCV:', updateError.message)
    } else {
      console.log(`✅ Tasa BCV actualizada en ${pedidosActualizados.length} pedidos`)
    }
    
    // 2. Corregir total_abono_usd en pedidos específicos
    console.log('\n📋 Corrigiendo total_abono_usd...')
    
    // Obtener pedidos que necesitan corrección
    const { data: pedidosCorregir, error: pedidosError } = await supabase
      .from('pedidos')
      .select(`
        id,
        total_usd,
        monto_abono_simple,
        monto_abono_usd,
        monto_abono_ves,
        tipo_pago_abono,
        metodo_pago_abono,
        tasa_bcv
      `)
      .or('es_abono.eq.true,metodo_pago.eq.Abono,tipo_pago_abono.not.is.null')
      .eq('total_abono_usd', 0)
    
    if (pedidosError) {
      console.error('❌ Error obteniendo pedidos para corregir:', pedidosError.message)
      return false
    }
    
    console.log(`📊 Pedidos que necesitan corrección: ${pedidosCorregir.length}`)
    
    for (const pedido of pedidosCorregir) {
      let totalAbonoUSD = 0
      
      // Calcular total abonado basado en los datos disponibles
      if (pedido.tipo_pago_abono === 'simple' && pedido.monto_abono_simple > 0) {
        if (pedido.metodo_pago_abono && (
          pedido.metodo_pago_abono.toLowerCase().includes('efectivo') ||
          pedido.metodo_pago_abono.toLowerCase().includes('zelle')
        )) {
          // Es USD
          totalAbonoUSD = pedido.monto_abono_simple
        } else {
          // Es VES, convertir a USD
          totalAbonoUSD = pedido.monto_abono_simple / (pedido.tasa_bcv || 166.58)
        }
      } else if (pedido.tipo_pago_abono === 'mixto') {
        // Abono mixto
        totalAbonoUSD = (pedido.monto_abono_usd || 0) + ((pedido.monto_abono_ves || 0) / (pedido.tasa_bcv || 166.58))
      } else if (pedido.monto_abono_simple > 0) {
        // Asumir que es USD si no hay tipo específico
        totalAbonoUSD = pedido.monto_abono_simple
      }
      
      if (totalAbonoUSD > 0) {
        const { error: updateError } = await supabase
          .from('pedidos')
          .update({ total_abono_usd: totalAbonoUSD })
          .eq('id', pedido.id)
        
        if (updateError) {
          console.error(`❌ Error actualizando pedido ${pedido.id}:`, updateError.message)
        } else {
          console.log(`✅ Pedido #${pedido.id}: total_abono_usd = $${totalAbonoUSD.toFixed(2)}`)
        }
      }
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error corrigiendo datos:', error.message)
    return false
  }
}

/**
 * Verificar correcciones aplicadas
 */
async function verificarCorrecciones() {
  try {
    console.log('\n🔍 Verificando correcciones aplicadas...')
    
    // Obtener pedidos de abono actualizados
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select(`
        id,
        cliente_nombre,
        total_usd,
        tasa_bcv,
        total_abono_usd,
        estado_entrega
      `)
      .or('es_abono.eq.true,metodo_pago.eq.Abono,tipo_pago_abono.not.is.null')
      .order('id', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Error verificando correcciones:', error.message)
      return false
    }
    
    console.log('\n📊 Estado después de las correcciones:')
    
    for (const pedido of pedidos) {
      const saldoPendiente = pedido.total_usd - (pedido.total_abono_usd || 0)
      
      console.log(`\n🔍 Pedido #${pedido.id} (${pedido.cliente_nombre}):`)
      console.log(`   - Total: $${pedido.total_usd}`)
      console.log(`   - Tasa BCV: ${pedido.tasa_bcv} Bs/USD`)
      console.log(`   - Total abonado: $${(pedido.total_abono_usd || 0).toFixed(2)}`)
      console.log(`   - Saldo pendiente: $${saldoPendiente.toFixed(2)}`)
      console.log(`   - Estado: ${pedido.estado_entrega}`)
      
      if (saldoPendiente <= 0.01) {
        console.log(`   ✅ PAGADO COMPLETAMENTE`)
      } else {
        console.log(`   ⚠️ PENDIENTE: $${saldoPendiente.toFixed(2)}`)
      }
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error verificando correcciones:', error.message)
    return false
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando diagnóstico y corrección del sistema de abonos...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  
  try {
    // 1. Verificar estado actual
    console.log('\n📋 Paso 1: Verificando estado actual...')
    await verificarEstadoActual()
    
    // 2. Corregir datos específicos
    console.log('\n📋 Paso 2: Corrigiendo datos específicos...')
    await corregirDatosPedidos()
    
    // 3. Verificar correcciones
    console.log('\n📋 Paso 3: Verificando correcciones...')
    await verificarCorrecciones()
    
    console.log('\n🎉 ¡Diagnóstico y corrección completados!')
    console.log('📋 Próximos pasos:')
    console.log('   1. Refrescar la aplicación en el navegador')
    console.log('   2. Verificar que los saldos se muestren correctamente')
    console.log('   3. Probar crear un nuevo abono')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar
main()
