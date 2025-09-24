#!/usr/bin/env node

/**
 * Script para analizar y corregir el cálculo de ingresos
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
 * Analizar pedidos problemáticos
 */
async function analizarPedidosProblematicos() {
  try {
    console.log('🔍 Analizando pedidos problemáticos...')
    
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('id', { ascending: false })
      .limit(10)
    
    if (error) throw error
    
    console.log(`📊 Analizando los últimos ${pedidos.length} pedidos:`)
    console.log('')
    
    pedidos.forEach(pedido => {
      const totalPedido = pedido.total_usd || 0
      let ingresosPedido = 0
      let detallesIngresos = []
      
      // Calcular ingresos según tipo de pago
      if (pedido.metodo_pago === 'Contado') {
        ingresosPedido = totalPedido
        detallesIngresos.push(`Contado: $${totalPedido}`)
      }
      
      if (pedido.es_pago_mixto) {
        const mixtoUSD = pedido.monto_mixto_usd || 0
        const mixtoVES = pedido.monto_mixto_ves || 0
        const mixtoVESUSD = mixtoVES / (pedido.tasa_bcv || 1)
        ingresosPedido = mixtoUSD + mixtoVESUSD
        detallesIngresos.push(`Mixto USD: $${mixtoUSD}`)
        detallesIngresos.push(`Mixto VES: ${mixtoVES} ($${mixtoVESUSD.toFixed(2)})`)
      }
      
      if (pedido.es_abono) {
        if (pedido.tipo_pago_abono === 'simple') {
          ingresosPedido = pedido.monto_abono_simple || 0
          detallesIngresos.push(`Abono Simple: $${ingresosPedido}`)
        } else if (pedido.tipo_pago_abono === 'mixto') {
          const abonoUSD = pedido.monto_abono_usd || 0
          const abonoVES = pedido.monto_abono_ves || 0
          const abonoVESUSD = abonoVES / (pedido.tasa_bcv || 1)
          ingresosPedido = abonoUSD + abonoVESUSD
          detallesIngresos.push(`Abono USD: $${abonoUSD}`)
          detallesIngresos.push(`Abono VES: ${abonoVES} ($${abonoVESUSD.toFixed(2)})`)
        }
      }
      
      // Verificar si hay problema
      const esProblematico = ingresosPedido > totalPedido
      const icono = esProblematico ? '⚠️' : '✅'
      
      console.log(`${icono} Pedido #${pedido.id}:`)
      console.log(`   Total pedido: $${totalPedido}`)
      console.log(`   Ingresos: $${ingresosPedido.toFixed(2)}`)
      console.log(`   Método: ${pedido.metodo_pago}`)
      console.log(`   Detalles: ${detallesIngresos.join(', ')}`)
      
      if (esProblematico) {
        console.log(`   ❌ PROBLEMA: Ingresos ($${ingresosPedido.toFixed(2)}) > Total ($${totalPedido})`)
        console.log(`   💡 Posible causa: Datos inconsistentes en la base de datos`)
      }
      
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error analizando pedidos:', error.message)
    throw error
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🧪 Análisis de Pedidos Problemáticos')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    await analizarPedidosProblematicos()
    
    console.log('')
    console.log('🎉 ¡Análisis completado!')
    console.log('💡 Recomendación: Revisar datos inconsistentes en la base de datos')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
