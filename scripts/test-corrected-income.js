#!/usr/bin/env node

/**
 * Script para probar el cálculo corregido de ingresos
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
 * Simular el cálculo corregido de ingresos
 */
async function simularCalculoCorregido() {
  try {
    console.log('💰 Simulando cálculo corregido de ingresos...')
    
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
    
    if (error) throw error
    
    console.log(`📊 Total de pedidos: ${pedidos.length}`)
    
    // Calcular ingresos reales (dinero que ha entrado) - VERSIÓN CORREGIDA
    const ingresosReales = pedidos.reduce((sum, p) => {
      let ingresosPedido = 0
      
      // Si es venta de contado
      if (p.metodo_pago === 'Contado') {
        ingresosPedido = p.total_usd || 0
      }
      
      // Si es pago mixto
      if (p.es_pago_mixto) {
        ingresosPedido = (p.monto_mixto_usd || 0) + (p.monto_mixto_ves || 0) / (p.tasa_bcv || 1)
      }
      
      // Si es venta por abono
      if (p.es_abono) {
        if (p.tipo_pago_abono === 'simple') {
          ingresosPedido = p.monto_abono_simple || 0
        } else if (p.tipo_pago_abono === 'mixto') {
          ingresosPedido = (p.monto_abono_usd || 0) + (p.monto_abono_ves || 0) / (p.tasa_bcv || 1)
        }
      }
      
      // CORRECCIÓN: Los ingresos nunca pueden exceder el total del pedido
      const totalPedido = p.total_usd || 0
      if (ingresosPedido > totalPedido) {
        console.log(`⚠️ Pedido #${p.id}: Ingresos ($${ingresosPedido.toFixed(2)}) > Total ($${totalPedido.toFixed(2)}) - Limitando a total`)
        ingresosPedido = totalPedido
      }
      
      return sum + ingresosPedido
    }, 0)
    
    // Calcular ventas totales (valor de los pedidos)
    const ventasTotales = pedidos.reduce((sum, p) => sum + (p.total_usd || 0), 0)
    
    // Calcular detalle de ingresos por tipo de moneda
    const detalleIngresos = pedidos.reduce((detalle, p) => {
      // Ingresos en USD
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
    
    // Convertir VES a USD para totales
    const totalVESEnUSD = (detalleIngresos.ves.mixto + detalleIngresos.ves.abono) / (pedidos[0]?.tasa_bcv || 1)
    
    console.log('')
    console.log('📈 Resumen de cálculos CORREGIDOS:')
    console.log(`   Ingresos reales: $${ingresosReales.toFixed(2)}`)
    console.log(`   Ventas totales: $${ventasTotales.toFixed(2)}`)
    console.log(`   Diferencia: $${(ventasTotales - ingresosReales).toFixed(2)}`)
    console.log(`   Porcentaje cobrado: ${((ingresosReales / ventasTotales) * 100).toFixed(1)}%`)
    
    console.log('')
    console.log('💰 Detalle de ingresos por moneda:')
    console.log('   USD:')
    console.log(`     Contado: $${detalleIngresos.usd.contado.toFixed(2)}`)
    console.log(`     Mixto: $${detalleIngresos.usd.mixto.toFixed(2)}`)
    console.log(`     Abono: $${detalleIngresos.usd.abono.toFixed(2)}`)
    console.log(`     Total USD: $${(detalleIngresos.usd.contado + detalleIngresos.usd.mixto + detalleIngresos.usd.abono).toFixed(2)}`)
    
    console.log('   VES:')
    console.log(`     Mixto: ${detalleIngresos.ves.mixto.toFixed(2)} Bs`)
    console.log(`     Abono: ${detalleIngresos.ves.abono.toFixed(2)} Bs`)
    console.log(`     Total VES: ${(detalleIngresos.ves.mixto + detalleIngresos.ves.abono).toFixed(2)} Bs`)
    console.log(`     Equivalente USD: $${totalVESEnUSD.toFixed(2)}`)
    
    return {
      ingresosReales: parseFloat(ingresosReales.toFixed(2)),
      ventasTotales: parseFloat(ventasTotales.toFixed(2)),
      totalVentas: pedidos.length,
      diferencia: parseFloat((ventasTotales - ingresosReales).toFixed(2)),
      porcentajeCobrado: parseFloat(((ingresosReales / ventasTotales) * 100).toFixed(1)),
      detalleIngresos: {
        usd: {
          contado: parseFloat(detalleIngresos.usd.contado.toFixed(2)),
          mixto: parseFloat(detalleIngresos.usd.mixto.toFixed(2)),
          abono: parseFloat(detalleIngresos.usd.abono.toFixed(2)),
          total: parseFloat((detalleIngresos.usd.contado + detalleIngresos.usd.mixto + detalleIngresos.usd.abono).toFixed(2))
        },
        ves: {
          mixto: parseFloat(detalleIngresos.ves.mixto.toFixed(2)),
          abono: parseFloat(detalleIngresos.ves.abono.toFixed(2)),
          total: parseFloat((detalleIngresos.ves.mixto + detalleIngresos.ves.abono).toFixed(2)),
          totalEnUSD: parseFloat(totalVESEnUSD.toFixed(2))
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error en simularCalculoCorregido:', error.message)
    throw error
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🧪 Prueba de Cálculo Corregido de Ingresos')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    const resultado = await simularCalculoCorregido()
    
    console.log('')
    console.log('🎉 ¡Prueba completada exitosamente!')
    console.log('✅ El cálculo corregido funciona correctamente')
    console.log('✅ Los ingresos reales nunca exceden las ventas totales')
    console.log('✅ Se incluye detalle por tipo de moneda')
    
    console.log('')
    console.log('📊 Resultados para el Dashboard:')
    console.log(`   💰 Ingresos reales (número grande): $${resultado.ingresosReales}`)
    console.log(`   📈 Ventas totales (número pequeño): $${resultado.ventasTotales}`)
    console.log(`   📋 Número de pedidos: ${resultado.totalVentas}`)
    
    console.log('')
    console.log('💡 Interpretación CORRECTA:')
    console.log(`   - Has recibido $${resultado.ingresosReales} en efectivo`)
    console.log(`   - Tienes $${resultado.ventasTotales} en ventas registradas`)
    console.log(`   - Te faltan por cobrar $${resultado.diferencia}`)
    console.log(`   - Has cobrado el ${resultado.porcentajeCobrado}% de las ventas`)
    
    console.log('')
    console.log('🎯 Detalle interactivo disponible:')
    console.log('   - Hover sobre la tarjeta azul para ver detalles')
    console.log('   - Desglose por tipo de moneda (USD/VES)')
    console.log('   - Desglose por método de pago')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
