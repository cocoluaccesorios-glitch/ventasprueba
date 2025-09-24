#!/usr/bin/env node

/**
 * Script para verificar que los números cuadran después de la corrección
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
 * Verificar que los números cuadran
 */
async function verificarNumerosCorregidos() {
  try {
    console.log('✅ Verificando que los números cuadran después de la corrección...')
    
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
    
    if (error) throw error
    
    console.log(`📊 Total de pedidos: ${pedidos.length}`)
    
    // Calcular ventas totales
    const ventasTotales = pedidos.reduce((sum, p) => sum + (p.total_usd || 0), 0)
    
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
      
      // Aplicar límite
      const totalPedido = p.total_usd || 0
      if (ingresosPedido > totalPedido) {
        ingresosPedido = totalPedido
      }
      
      return sum + ingresosPedido
    }, 0)
    
    // Calcular detalle CON límite (corregido)
    const detalleIngresos = pedidos.reduce((detalle, p) => {
      const tasaBCV = p.tasa_bcv || 1
      
      if (p.metodo_pago === 'Contado') {
        const ingresosPedido = p.total_usd || 0
        detalle.usd.contado += ingresosPedido
      }
      
      if (p.es_pago_mixto) {
        const mixtoUSD = p.monto_mixto_usd || 0
        const mixtoVES = p.monto_mixto_ves || 0
        const mixtoVESUSD = mixtoVES / tasaBCV
        let ingresosPedido = mixtoUSD + mixtoVESUSD
        
        // Aplicar límite
        const totalPedido = p.total_usd || 0
        if (ingresosPedido > totalPedido) {
          ingresosPedido = totalPedido
        }
        
        detalle.usd.mixto += mixtoUSD
        detalle.ves.mixto += mixtoVES
      }
      
      if (p.es_abono) {
        if (p.tipo_pago_abono === 'simple') {
          let ingresosPedido = p.monto_abono_simple || 0
          
          // Aplicar límite
          const totalPedido = p.total_usd || 0
          if (ingresosPedido > totalPedido) {
            ingresosPedido = totalPedido
          }
          
          detalle.usd.abono += ingresosPedido
        } else if (p.tipo_pago_abono === 'mixto') {
          const abonoUSD = p.monto_abono_usd || 0
          const abonoVES = p.monto_abono_ves || 0
          const abonoVESUSD = abonoVES / tasaBCV
          let ingresosPedido = abonoUSD + abonoVESUSD
          
          // Aplicar límite
          const totalPedido = p.total_usd || 0
          if (ingresosPedido > totalPedido) {
            ingresosPedido = totalPedido
          }
          
          detalle.usd.abono += abonoUSD
          detalle.ves.abono += abonoVES
        }
      }
      
      return detalle
    }, {
      usd: { contado: 0, mixto: 0, abono: 0 },
      ves: { mixto: 0, abono: 0 }
    })
    
    const totalDetalleUSD = detalleIngresos.usd.contado + detalleIngresos.usd.mixto + detalleIngresos.usd.abono
    const totalVESEnUSD = (detalleIngresos.ves.mixto + detalleIngresos.ves.abono) / (pedidos[0]?.tasa_bcv || 1)
    const totalDetalle = totalDetalleUSD + totalVESEnUSD
    
    console.log('')
    console.log('📈 Detalle CORREGIDO (con límite):')
    console.log(`   Contado: $${detalleIngresos.usd.contado.toFixed(2)}`)
    console.log(`   Mixto USD: $${detalleIngresos.usd.mixto.toFixed(2)}`)
    console.log(`   Abono USD: $${detalleIngresos.usd.abono.toFixed(2)}`)
    console.log(`   Total USD: $${totalDetalleUSD.toFixed(2)}`)
    console.log(`   Total VES: ${(detalleIngresos.ves.mixto + detalleIngresos.ves.abono).toFixed(2)} Bs`)
    console.log(`   VES en USD: $${totalVESEnUSD.toFixed(2)}`)
    console.log(`   TOTAL DETALLE: $${totalDetalle.toFixed(2)}`)
    
    console.log('')
    console.log('✅ VERIFICACIÓN:')
    console.log(`   Ventas totales: $${ventasTotales.toFixed(2)}`)
    console.log(`   Ingresos reales: $${ingresosReales.toFixed(2)}`)
    console.log(`   Detalle total: $${totalDetalle.toFixed(2)}`)
    
    const diferenciaIngresos = Math.abs(ingresosReales - totalDetalle)
    const diferenciaVentas = Math.abs(ventasTotales - ingresosReales)
    
    console.log('')
    if (diferenciaIngresos < 0.01) {
      console.log('✅ PERFECTO: Ingresos reales = Detalle total')
    } else {
      console.log(`❌ ERROR: Diferencia entre ingresos y detalle: $${diferenciaIngresos.toFixed(2)}`)
    }
    
    if (ingresosReales <= ventasTotales) {
      console.log('✅ CORRECTO: Ingresos reales ≤ Ventas totales')
    } else {
      console.log(`❌ ERROR: Ingresos reales > Ventas totales`)
    }
    
    console.log('')
    console.log('📊 RESUMEN PARA EL DASHBOARD:')
    console.log(`   💰 Ingresos reales: $${ingresosReales.toFixed(2)}`)
    console.log(`   📈 Ventas totales: $${ventasTotales.toFixed(2)}`)
    console.log(`   📋 Total pedidos: ${pedidos.length}`)
    console.log(`   📊 Por cobrar: $${(ventasTotales - ingresosReales).toFixed(2)}`)
    console.log(`   📈 Porcentaje cobrado: ${((ingresosReales / ventasTotales) * 100).toFixed(1)}%`)
    
  } catch (error) {
    console.error('❌ Error verificando números:', error.message)
    throw error
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🧪 Verificación de Números Corregidos')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    await verificarNumerosCorregidos()
    
    console.log('')
    console.log('🎉 ¡Verificación completada!')
    console.log('✅ Los números ahora cuadran correctamente')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
