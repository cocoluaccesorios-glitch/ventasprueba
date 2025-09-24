#!/usr/bin/env node

/**
 * Script para analizar por qué los números no cuadran
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
 * Analizar por qué los números no cuadran
 */
async function analizarNumerosInconsistentes() {
  try {
    console.log('🔍 Analizando por qué los números no cuadran...')
    
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
    
    if (error) throw error
    
    console.log(`📊 Total de pedidos: ${pedidos.length}`)
    
    // Calcular ventas totales
    const ventasTotales = pedidos.reduce((sum, p) => sum + (p.total_usd || 0), 0)
    console.log(`💰 Ventas totales: $${ventasTotales.toFixed(2)}`)
    
    // Calcular ingresos reales (con límite)
    const ingresosReales = pedidos.reduce((sum, p) => {
      let ingresosPedido = 0
      
      if (p.metodo_pago === 'Contado') {
        ingresosPedido = p.total_usd || 0
      }
      
      if (p.es_pago_mixto) {
        ingresosPedido = (p.monto_mixto_usd || 0) + (p.monto_mixto_ves || 0) / (p.tasa_bcv || 1)
      }
      
      if (p.es_abono) {
        if (p.tipo_pago_abono === 'simple') {
          ingresosPedido = p.monto_abono_simple || 0
        } else if (p.tipo_pago_abono === 'mixto') {
          ingresosPedido = (p.monto_abono_usd || 0) + (p.monto_abono_ves || 0) / (p.tasa_bcv || 1)
        }
      }
      
      // Limitar al total del pedido
      const totalPedido = p.total_usd || 0
      if (ingresosPedido > totalPedido) {
        ingresosPedido = totalPedido
      }
      
      return sum + ingresosPedido
    }, 0)
    
    console.log(`💵 Ingresos reales: $${ingresosReales.toFixed(2)}`)
    
    // Calcular detalle SIN límite (para ver el problema)
    const detalleSinLimite = pedidos.reduce((detalle, p) => {
      if (p.metodo_pago === 'Contado') {
        detalle.usd.contado += p.total_usd || 0
      }
      
      if (p.es_pago_mixto) {
        detalle.usd.mixto += p.monto_mixto_usd || 0
        detalle.ves.mixto += p.monto_mixto_ves || 0
      }
      
      if (p.es_abono) {
        if (p.tipo_pago_abono === 'simple') {
          detalle.usd.abono += p.monto_abono_simple || 0
        } else if (p.tipo_pago_abono === 'mixto') {
          detalle.usd.abono += p.monto_abono_usd || 0
          detalle.ves.abono += p.monto_abono_ves || 0
        }
      }
      
      return detalle
    }, {
      usd: { contado: 0, mixto: 0, abono: 0 },
      ves: { mixto: 0, abono: 0 }
    })
    
    const totalDetalleUSD = detalleSinLimite.usd.contado + detalleSinLimite.usd.mixto + detalleSinLimite.usd.abono
    const totalVESEnUSD = (detalleSinLimite.ves.mixto + detalleSinLimite.ves.abono) / (pedidos[0]?.tasa_bcv || 1)
    
    console.log('')
    console.log('📈 Detalle SIN límite (problema):')
    console.log(`   Contado: $${detalleSinLimite.usd.contado.toFixed(2)}`)
    console.log(`   Mixto USD: $${detalleSinLimite.usd.mixto.toFixed(2)}`)
    console.log(`   Abono USD: $${detalleSinLimite.usd.abono.toFixed(2)}`)
    console.log(`   Total USD: $${totalDetalleUSD.toFixed(2)}`)
    console.log(`   Total VES: ${(detalleSinLimite.ves.mixto + detalleSinLimite.ves.abono).toFixed(2)} Bs`)
    console.log(`   VES en USD: $${totalVESEnUSD.toFixed(2)}`)
    console.log(`   TOTAL DETALLE: $${(totalDetalleUSD + totalVESEnUSD).toFixed(2)}`)
    
    console.log('')
    console.log('❌ PROBLEMA IDENTIFICADO:')
    console.log(`   Ventas totales: $${ventasTotales.toFixed(2)}`)
    console.log(`   Detalle total: $${(totalDetalleUSD + totalVESEnUSD).toFixed(2)}`)
    console.log(`   Diferencia: $${((totalDetalleUSD + totalVESEnUSD) - ventasTotales).toFixed(2)}`)
    
    // Buscar pedidos problemáticos
    console.log('')
    console.log('🔍 Buscando pedidos problemáticos:')
    
    pedidos.forEach(pedido => {
      let ingresosPedido = 0
      
      if (pedido.metodo_pago === 'Contado') {
        ingresosPedido = pedido.total_usd || 0
      }
      
      if (pedido.es_pago_mixto) {
        ingresosPedido = (pedido.monto_mixto_usd || 0) + (pedido.monto_mixto_ves || 0) / (pedido.tasa_bcv || 1)
      }
      
      if (pedido.es_abono) {
        if (pedido.tipo_pago_abono === 'simple') {
          ingresosPedido = pedido.monto_abono_simple || 0
        } else if (pedido.tipo_pago_abono === 'mixto') {
          ingresosPedido = (pedido.monto_abono_usd || 0) + (pedido.monto_abono_ves || 0) / (pedido.tasa_bcv || 1)
        }
      }
      
      const totalPedido = pedido.total_usd || 0
      if (ingresosPedido > totalPedido) {
        console.log(`   ⚠️ Pedido #${pedido.id}:`)
        console.log(`      Total: $${totalPedido.toFixed(2)}`)
        console.log(`      Ingresos: $${ingresosPedido.toFixed(2)}`)
        console.log(`      Método: ${pedido.metodo_pago}`)
        console.log(`      Abono simple: $${pedido.monto_abono_simple || 0}`)
        console.log(`      Abono USD: $${pedido.monto_abono_usd || 0}`)
        console.log(`      Abono VES: ${pedido.monto_abono_ves || 0}`)
        console.log('')
      }
    })
    
  } catch (error) {
    console.error('❌ Error analizando números:', error.message)
    throw error
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🧪 Análisis de Números Inconsistentes')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    await analizarNumerosInconsistentes()
    
    console.log('')
    console.log('💡 SOLUCIÓN:')
    console.log('   El detalle debe aplicar la misma lógica de límite que los ingresos reales')
    console.log('   No puede mostrar más dinero del que realmente se puede cobrar')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
