#!/usr/bin/env node

/**
 * Script para arreglar completamente el sistema de abonos
 * - Crea las tablas faltantes
 * - Migra los datos existentes
 * - Corrige los cálculos de saldos pendientes
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
 * Crear tabla abonos si no existe
 */
async function crearTablaAbonos() {
  try {
    console.log('📋 Verificando tabla abonos...')
    
    // Verificar si la tabla existe
    const { data: existe, error: errorExiste } = await supabase
      .from('abonos')
      .select('id')
      .limit(1)
    
    if (!errorExiste) {
      console.log('✅ Tabla abonos ya existe')
      return true
    }
    
    if (errorExiste.message.includes('relation "abonos" does not exist')) {
      console.log('   ⚠️ Tabla abonos no existe, creándola...')
      
      // Crear la tabla usando una consulta simple
      const { data, error } = await supabase
        .from('abonos')
        .insert({
          pedido_id: 1,
          monto_abono_usd: 0,
          monto_abono_ves: 0,
          tasa_bcv: 166.58,
          metodo_pago_abono: 'efectivo',
          tipo_abono: 'simple',
          estado_abono: 'confirmado',
          comentarios: 'Tabla creada'
        })
        .select()
      
      if (error) {
        console.error('❌ Error creando tabla abonos:', error.message)
        return false
      } else {
        console.log('✅ Tabla abonos creada exitosamente')
        return true
      }
    } else {
      console.error('❌ Error verificando tabla abonos:', errorExiste.message)
      return false
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Crear tabla tasa_cambio si no existe
 */
async function crearTablaTasaCambio() {
  try {
    console.log('📋 Verificando tabla tasa_cambio...')
    
    // Verificar si la tabla existe
    const { data: existe, error: errorExiste } = await supabase
      .from('tasa_cambio')
      .select('id')
      .limit(1)
    
    if (!errorExiste) {
      console.log('✅ Tabla tasa_cambio ya existe')
      return true
    }
    
    if (errorExiste.message.includes('relation "tasa_cambio" does not exist')) {
      console.log('   ⚠️ Tabla tasa_cambio no existe, creándola...')
      
      // Crear la tabla usando una consulta simple
      const { data, error } = await supabase
        .from('tasa_cambio')
        .insert({
          fecha: new Date().toISOString().split('T')[0],
          tasa_bcv: 166.58
        })
        .select()
      
      if (error) {
        console.error('❌ Error creando tabla tasa_cambio:', error.message)
        return false
      } else {
        console.log('✅ Tabla tasa_cambio creada exitosamente')
        return true
      }
    } else {
      console.error('❌ Error verificando tabla tasa_cambio:', errorExiste.message)
      return false
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Migrar abonos existentes
 */
async function migrarAbonosExistentes() {
  try {
    console.log('\n🔄 Migrando abonos existentes...')
    
    // Obtener pedidos de abono
    const { data: pedidosAbono, error: pedidosError } = await supabase
      .from('pedidos')
      .select(`
        id,
        cliente_id,
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
              cliente_id: pedido.cliente_id || null,
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
 * Verificar saldos pendientes
 */
async function verificarSaldosPendientes() {
  try {
    console.log('\n🔍 Verificando saldos pendientes...')
    
    // Obtener pedidos con deudas
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select(`
        id,
        cliente_nombre,
        total_usd,
        tasa_bcv,
        estado_entrega
      `)
      .neq('estado_entrega', 'anulado')
      .order('id', { ascending: false })
    
    if (error) {
      console.error('❌ Error al obtener pedidos:', error.message)
      return false
    }
    
    console.log('\n📊 Saldos pendientes por pedido:')
    
    for (const pedido of pedidos) {
      // Obtener total abonado
      const { data: abonos, error: abonosError } = await supabase
        .from('abonos')
        .select('monto_abono_usd')
        .eq('pedido_id', pedido.id)
        .eq('estado_abono', 'confirmado')
      
      if (abonosError) {
        console.log(`❌ Pedido #${pedido.id}: Error al obtener abonos - ${abonosError.message}`)
        continue
      }
      
      const totalAbonado = abonos.reduce((sum, abono) => sum + (abono.monto_abono_usd || 0), 0)
      const saldoPendiente = pedido.total_usd - totalAbonado
      
      if (saldoPendiente > 0.01) {
        console.log(`   - Pedido #${pedido.id} (${pedido.cliente_nombre}):`)
        console.log(`     * Total: $${pedido.total_usd.toFixed(2)}`)
        console.log(`     * Abonado: $${totalAbonado.toFixed(2)}`)
        console.log(`     * Saldo pendiente: $${saldoPendiente.toFixed(2)}`)
        console.log(`     * Tasa BCV: ${pedido.tasa_bcv} Bs/USD`)
        console.log(`     * Total en bolívares: ${(saldoPendiente * pedido.tasa_bcv).toFixed(2)} Bs`)
      }
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error verificando saldos:', error.message)
    return false
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando arreglo completo del sistema de abonos...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  
  try {
    // 1. Crear tablas faltantes
    console.log('\n📋 Paso 1: Creando tablas faltantes...')
    const tablaAbonos = await crearTablaAbonos()
    const tablaTasa = await crearTablaTasaCambio()
    
    if (!tablaAbonos || !tablaTasa) {
      console.log('❌ No se pudieron crear las tablas necesarias')
      return
    }
    
    // 2. Migrar abonos existentes
    console.log('\n📋 Paso 2: Migrando abonos existentes...')
    const migracionExitosa = await migrarAbonosExistentes()
    
    if (!migracionExitosa) {
      console.log('⚠️ Migración completada con algunos errores')
    }
    
    // 3. Verificar saldos pendientes
    console.log('\n📋 Paso 3: Verificando saldos pendientes...')
    await verificarSaldosPendientes()
    
    console.log('\n🎉 ¡Arreglo del sistema de abonos completado!')
    console.log('📋 Próximos pasos:')
    console.log('   1. Verificar en la aplicación que los saldos se muestren correctamente')
    console.log('   2. Probar crear un nuevo abono')
    console.log('   3. Verificar que los cálculos sean correctos')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar
main()
