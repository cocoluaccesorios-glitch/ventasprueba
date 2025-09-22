#!/usr/bin/env node

/**
 * Script para migrar abonos existentes a la nueva tabla de abonos
 * - Extrae información de abonos de la tabla pedidos
 * - Crea registros en la nueva tabla abonos
 * - Actualiza la lógica de cálculo de deudas
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
 * Migrar abonos existentes
 */
async function migrarAbonosExistentes() {
  try {
    console.log('🔄 Iniciando migración de abonos existentes...')
    
    // 1. Verificar si la tabla abonos existe
    const { data: tablaExiste, error: checkError } = await supabase
      .from('abonos')
      .select('id')
      .limit(1)
    
    if (checkError && checkError.message.includes('relation "abonos" does not exist')) {
      console.log('❌ La tabla abonos no existe. Ejecuta primero el script SQL create-abonos-table.sql')
      return false
    }
    
    // 2. Obtener pedidos con información de abonos
    const { data: pedidosAbono, error: pedidosError } = await supabase
      .from('pedidos')
      .select(`
        id,
        cliente_cedula,
        cliente_nombre,
        cliente_apellido,
        total_usd,
        tasa_bcv,
        es_abono,
        tipo_pago_abono,
        metodo_pago_abono,
        monto_abono_simple,
        monto_abono_usd,
        monto_abono_ves,
        total_abono_usd,
        referencia_pago,
        fecha_vencimiento
      `)
      .or('es_abono.eq.true,metodo_pago.eq.Abono,tipo_pago_abono.not.is.null')
      .order('id', { ascending: true })
    
    if (pedidosError) {
      console.error('❌ Error al obtener pedidos de abono:', pedidosError.message)
      return false
    }
    
    console.log(`📊 Encontrados ${pedidosAbono.length} pedidos de abono para migrar`)
    
    // 3. Procesar cada pedido de abono
    let abonosMigrados = 0
    let errores = 0
    
    for (const pedido of pedidosAbono) {
      console.log(`\n🔧 Procesando pedido #${pedido.id}...`)
      
      try {
        // Calcular el monto del abono
        let montoAbonoUSD = 0
        let montoAbonoVES = 0
        let metodoPagoAbono = pedido.metodo_pago_abono || 'efectivo'
        let tipoAbono = pedido.tipo_pago_abono || 'simple'
        
        if (tipoAbono === 'simple') {
          // Abono simple
          if (pedido.monto_abono_simple && pedido.monto_abono_simple > 0) {
            // Determinar si es USD o VES basado en el método de pago
            if (metodoPagoAbono.toLowerCase().includes('efectivo') || 
                metodoPagoAbono.toLowerCase().includes('zelle')) {
              // Es USD
              montoAbonoUSD = pedido.monto_abono_simple
              montoAbonoVES = montoAbonoUSD * (pedido.tasa_bcv || 166.58)
            } else {
              // Es VES (pago móvil, transferencia)
              montoAbonoVES = pedido.monto_abono_simple
              montoAbonoUSD = montoAbonoVES / (pedido.tasa_bcv || 166.58)
            }
          }
        } else if (tipoAbono === 'mixto') {
          // Abono mixto
          montoAbonoUSD = pedido.monto_abono_usd || 0
          montoAbonoVES = pedido.monto_abono_ves || 0
        }
        
        // Si no hay monto, usar el total_abono_usd si existe
        if (montoAbonoUSD === 0 && pedido.total_abono_usd && pedido.total_abono_usd > 0) {
          montoAbonoUSD = pedido.total_abono_usd
          montoAbonoVES = montoAbonoUSD * (pedido.tasa_bcv || 166.58)
        }
        
        // Solo crear abono si hay un monto válido
        if (montoAbonoUSD > 0 || montoAbonoVES > 0) {
          const { data: abonoData, error: abonoError } = await supabase
            .from('abonos')
            .insert({
              pedido_id: pedido.id,
              cliente_id: null, // Se puede actualizar después si hay tabla de clientes
              monto_abono_usd: montoAbonoUSD,
              monto_abono_ves: montoAbonoVES,
              tasa_bcv: pedido.tasa_bcv || 166.58,
              metodo_pago_abono: metodoPagoAbono,
              referencia_pago: pedido.referencia_pago,
              tipo_abono: tipoAbono,
              fecha_vencimiento: pedido.fecha_vencimiento,
              estado_abono: 'confirmado',
              comentarios: `Migrado desde pedido #${pedido.id}`
            })
            .select()
          
          if (abonoError) {
            console.error(`❌ Error al crear abono para pedido ${pedido.id}:`, abonoError.message)
            errores++
          } else {
            console.log(`✅ Abono creado para pedido #${pedido.id}:`)
            console.log(`   - Monto USD: $${montoAbonoUSD.toFixed(2)}`)
            console.log(`   - Monto VES: ${montoAbonoVES.toFixed(2)} Bs`)
            console.log(`   - Método: ${metodoPagoAbono}`)
            console.log(`   - Tipo: ${tipoAbono}`)
            abonosMigrados++
          }
        } else {
          console.log(`⚠️ Pedido #${pedido.id}: No se pudo determinar el monto del abono`)
          console.log(`   - monto_abono_simple: ${pedido.monto_abono_simple}`)
          console.log(`   - monto_abono_usd: ${pedido.monto_abono_usd}`)
          console.log(`   - monto_abono_ves: ${pedido.monto_abono_ves}`)
          console.log(`   - total_abono_usd: ${pedido.total_abono_usd}`)
        }
        
      } catch (error) {
        console.error(`❌ Error procesando pedido ${pedido.id}:`, error.message)
        errores++
      }
    }
    
    console.log('\n📊 Resumen de migración:')
    console.log(`   - Abonos migrados: ${abonosMigrados}`)
    console.log(`   - Errores: ${errores}`)
    console.log(`   - Total procesados: ${pedidosAbono.length}`)
    
    return abonosMigrados > 0
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Verificar la migración
 */
async function verificarMigracion() {
  try {
    console.log('\n🔍 Verificando migración...')
    
    // Obtener resumen de abonos migrados
    const { data: abonos, error: abonosError } = await supabase
      .from('abonos')
      .select(`
        id,
        pedido_id,
        monto_abono_usd,
        monto_abono_ves,
        tasa_bcv,
        metodo_pago_abono,
        tipo_abono,
        fecha_abono
      `)
      .order('pedido_id', { ascending: true })
    
    if (abonosError) {
      console.error('❌ Error al verificar abonos:', abonosError.message)
      return false
    }
    
    console.log(`📊 Total de abonos en la nueva tabla: ${abonos.length}`)
    
    if (abonos.length > 0) {
      console.log('\n📋 Abonos migrados:')
      abonos.forEach(abono => {
        console.log(`   - Pedido #${abono.pedido_id}: $${abono.monto_abono_usd.toFixed(2)} USD (${abono.monto_abono_ves.toFixed(2)} Bs)`)
        console.log(`     Método: ${abono.metodo_pago_abono}, Tipo: ${abono.tipo_abono}`)
      })
    }
    
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
  console.log('🚀 Iniciando migración de abonos existentes...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  
  try {
    // Migrar abonos existentes
    const migracionExitosa = await migrarAbonosExistentes()
    
    if (migracionExitosa) {
      // Verificar la migración
      await verificarMigracion()
      
      console.log('\n🎉 ¡Migración de abonos completada exitosamente!')
      console.log('📋 Próximos pasos:')
      console.log('   1. Verificar que los abonos se crearon correctamente')
      console.log('   2. Actualizar la lógica de cálculo de deudas')
      console.log('   3. Probar el sistema con la nueva estructura')
    } else {
      console.log('\n⚠️ Migración completada con algunos errores')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar
main()
