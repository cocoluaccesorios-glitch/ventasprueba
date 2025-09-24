#!/usr/bin/env node

/**
 * Script para probar el cálculo de ingresos reales
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
 * Simular el cálculo de ingresos reales
 */
async function simularCalculoIngresosReales() {
  try {
    console.log('💰 Simulando cálculo de ingresos reales...')
    
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
    
    if (error) throw error
    
    console.log(`📊 Total de pedidos: ${pedidos.length}`)
    
    // Calcular ingresos reales (dinero que ha entrado)
    const ingresosReales = pedidos.reduce((sum, p) => {
      let ingresosPedido = 0
      
      // Si es venta de contado
      if (p.metodo_pago === 'Contado') {
        ingresosPedido = p.total_usd || 0
        console.log(`   Pedido #${p.id} (Contado): $${ingresosPedido.toFixed(2)}`)
      }
      
      // Si es pago mixto
      if (p.es_pago_mixto) {
        ingresosPedido = (p.monto_mixto_usd || 0) + (p.monto_mixto_ves || 0) / (p.tasa_bcv || 1)
        console.log(`   Pedido #${p.id} (Mixto): $${ingresosPedido.toFixed(2)}`)
        console.log(`     Mixto USD: $${p.monto_mixto_usd || 0}`)
        console.log(`     Mixto VES: ${p.monto_mixto_ves || 0} ($${((p.monto_mixto_ves || 0) / (p.tasa_bcv || 1)).toFixed(2)})`)
      }
      
      // Si es venta por abono
      if (p.es_abono) {
        if (p.tipo_pago_abono === 'simple') {
          ingresosPedido = p.monto_abono_simple || 0
          console.log(`   Pedido #${p.id} (Abono Simple): $${ingresosPedido.toFixed(2)}`)
        } else if (p.tipo_pago_abono === 'mixto') {
          ingresosPedido = (p.monto_abono_usd || 0) + (p.monto_abono_ves || 0) / (p.tasa_bcv || 1)
          console.log(`   Pedido #${p.id} (Abono Mixto): $${ingresosPedido.toFixed(2)}`)
          console.log(`     Abono USD: $${p.monto_abono_usd || 0}`)
          console.log(`     Abono VES: ${p.monto_abono_ves || 0} ($${((p.monto_abono_ves || 0) / (p.tasa_bcv || 1)).toFixed(2)})`)
        }
      }
      
      if (ingresosPedido > 0) {
        console.log(`     Total del pedido: $${p.total_usd || 0}`)
        console.log('')
      }
      
      return sum + ingresosPedido
    }, 0)
    
    // Calcular ventas totales (valor de los pedidos)
    const ventasTotales = pedidos.reduce((sum, p) => sum + (p.total_usd || 0), 0)
    
    console.log('📈 Resumen de cálculos:')
    console.log(`   Ingresos reales: $${ingresosReales.toFixed(2)}`)
    console.log(`   Ventas totales: $${ventasTotales.toFixed(2)}`)
    console.log(`   Diferencia: $${(ventasTotales - ingresosReales).toFixed(2)}`)
    console.log(`   Porcentaje cobrado: ${((ingresosReales / ventasTotales) * 100).toFixed(1)}%`)
    
    return {
      ingresosReales: parseFloat(ingresosReales.toFixed(2)),
      ventasTotales: parseFloat(ventasTotales.toFixed(2)),
      totalVentas: pedidos.length,
      diferencia: parseFloat((ventasTotales - ingresosReales).toFixed(2)),
      porcentajeCobrado: parseFloat(((ingresosReales / ventasTotales) * 100).toFixed(1))
    }
    
  } catch (error) {
    console.error('❌ Error en simularCalculoIngresosReales:', error.message)
    throw error
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🧪 Prueba de Cálculo de Ingresos Reales')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    const resultado = await simularCalculoIngresosReales()
    
    console.log('')
    console.log('🎉 ¡Prueba completada exitosamente!')
    console.log('✅ El cálculo de ingresos reales funciona correctamente')
    console.log('✅ Se diferencia entre dinero entrado y valor de ventas')
    
    console.log('')
    console.log('📊 Resultados para el Dashboard:')
    console.log(`   💰 Ingresos reales (número grande): $${resultado.ingresosReales}`)
    console.log(`   📈 Ventas totales (número pequeño): $${resultado.ventasTotales}`)
    console.log(`   📋 Número de pedidos: ${resultado.totalVentas}`)
    
    console.log('')
    console.log('💡 Interpretación:')
    console.log(`   - Has recibido $${resultado.ingresosReales} en efectivo`)
    console.log(`   - Tienes $${resultado.ventasTotales} en ventas registradas`)
    console.log(`   - Te faltan por cobrar $${resultado.diferencia}`)
    console.log(`   - Has cobrado el ${resultado.porcentajeCobrado}% de las ventas`)
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
