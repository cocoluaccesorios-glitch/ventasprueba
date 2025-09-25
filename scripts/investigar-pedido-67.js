// Script para investigar el pedido #67 y verificar cómo se guardan las cantidades
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function investigarPedido67() {
  console.log('🔍 INVESTIGANDO PEDIDO #67')
  console.log('=' .repeat(80))
  
  try {
    // 1. Obtener información completa del pedido #67
    console.log('\n📊 1. INFORMACIÓN COMPLETA DEL PEDIDO #67...')
    
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', 67)
      .single()
    
    if (pedidoError) {
      console.error('❌ Error obteniendo pedido:', pedidoError)
      return
    }
    
    if (!pedido) {
      console.log('❌ Pedido #67 no encontrado')
      return
    }
    
    console.log('✅ Pedido encontrado:')
    console.log(`   ID: ${pedido.id}`)
    console.log(`   Cliente: ${pedido.cliente_nombre} ${pedido.cliente_apellido}`)
    console.log(`   Fecha: ${pedido.fecha_pedido}`)
    console.log(`   Total USD: $${pedido.total_usd}`)
    console.log(`   Estado: ${pedido.estado_entrega}`)
    console.log(`   Es Abono: ${pedido.es_abono}`)
    console.log(`   Monto Abono USD: $${pedido.monto_abono_usd || 0}`)
    console.log(`   Monto Abono VES: ${pedido.monto_abono_ves || 0} Bs`)
    
    // 2. Verificar detalles_pedido
    console.log('\n📊 2. VERIFICANDO DETALLES_PEDIDO...')
    
    if (pedido.detalles_pedido) {
      console.log('✅ detalles_pedido encontrado:')
      console.log('   Tipo:', typeof pedido.detalles_pedido)
      console.log('   Contenido:', JSON.stringify(pedido.detalles_pedido, null, 2))
      
      // Analizar cada producto
      if (Array.isArray(pedido.detalles_pedido)) {
        console.log('\n📋 ANÁLISIS DE PRODUCTOS:')
        pedido.detalles_pedido.forEach((producto, index) => {
          console.log(`\n   Producto ${index + 1}:`)
          console.log(`     Nombre: ${producto.nombre || 'Sin nombre'}`)
          console.log(`     Cantidad: ${producto.cantidad || 0}`)
          console.log(`     Precio Unitario: $${producto.precio_unitario || 0}`)
          console.log(`     Subtotal: $${(producto.cantidad || 0) * (producto.precio_unitario || 0)}`)
        })
        
        // Calcular total manual
        const totalCalculado = pedido.detalles_pedido.reduce((sum, producto) => {
          return sum + ((producto.cantidad || 0) * (producto.precio_unitario || 0))
        }, 0)
        
        console.log(`\n💰 TOTAL CALCULADO MANUALMENTE: $${totalCalculado.toFixed(2)}`)
        console.log(`💰 TOTAL EN BASE DE DATOS: $${pedido.total_usd}`)
        console.log(`💰 DIFERENCIA: $${(totalCalculado - pedido.total_usd).toFixed(2)}`)
        
      } else {
        console.log('⚠️ detalles_pedido no es un array')
      }
    } else {
      console.log('❌ detalles_pedido es NULL o no existe')
    }
    
    // 3. Verificar abonos relacionados
    console.log('\n📊 3. VERIFICANDO ABONOS RELACIONADOS...')
    
    const { data: abonos, error: abonosError } = await supabase
      .from('abonos')
      .select('*')
      .eq('pedido_id', 67)
      .order('fecha_abono', { ascending: false })
    
    if (abonosError) {
      console.error('❌ Error obteniendo abonos:', abonosError)
    } else {
      console.log(`✅ Abonos encontrados: ${abonos.length}`)
      
      if (abonos.length > 0) {
        abonos.forEach((abono, index) => {
          console.log(`\n   Abono ${index + 1}:`)
          console.log(`     ID: ${abono.id}`)
          console.log(`     Monto USD: $${abono.monto_abono_usd}`)
          console.log(`     Monto VES: ${abono.monto_abono_ves} Bs`)
          console.log(`     Método: ${abono.metodo_pago_abono}`)
          console.log(`     Referencia: ${abono.referencia_pago || 'Sin referencia'}`)
          console.log(`     Fecha: ${abono.fecha_abono}`)
          console.log(`     Estado: ${abono.estado_abono}`)
        })
        
        // Calcular total abonado
        const totalAbonado = abonos.reduce((sum, abono) => sum + abono.monto_abono_usd, 0)
        const saldoPendiente = pedido.total_usd - totalAbonado
        
        console.log(`\n💰 RESUMEN DE ABONOS:`)
        console.log(`   Total Pedido: $${pedido.total_usd}`)
        console.log(`   Total Abonado: $${totalAbonado.toFixed(2)}`)
        console.log(`   Saldo Pendiente: $${saldoPendiente.toFixed(2)}`)
      }
    }
    
    // 4. Verificar otros pedidos similares para comparar
    console.log('\n📊 4. VERIFICANDO OTROS PEDIDOS SIMILARES...')
    
    const { data: pedidosSimilares, error: similaresError } = await supabase
      .from('pedidos')
      .select('id, cliente_nombre, cliente_apellido, total_usd, detalles_pedido, fecha_pedido')
      .eq('cliente_cedula', pedido.cliente_cedula)
      .order('fecha_pedido', { ascending: false })
      .limit(5)
    
    if (similaresError) {
      console.error('❌ Error obteniendo pedidos similares:', similaresError)
    } else {
      console.log(`✅ Pedidos del mismo cliente encontrados: ${pedidosSimilares.length}`)
      
      pedidosSimilares.forEach((pedidoSim, index) => {
        console.log(`\n   Pedido #${pedidoSim.id}:`)
        console.log(`     Fecha: ${pedidoSim.fecha_pedido}`)
        console.log(`     Total: $${pedidoSim.total_usd}`)
        
        if (pedidoSim.detalles_pedido && Array.isArray(pedidoSim.detalles_pedido)) {
          console.log(`     Productos: ${pedidoSim.detalles_pedido.length}`)
          pedidoSim.detalles_pedido.forEach((prod, i) => {
            console.log(`       ${i + 1}. ${prod.nombre || 'Sin nombre'} - Cantidad: ${prod.cantidad || 0}`)
          })
        } else {
          console.log(`     Productos: Sin detalles`)
        }
      })
    }
    
    // 5. Recomendaciones
    console.log('\n📊 5. RECOMENDACIONES:')
    
    if (pedido.detalles_pedido && Array.isArray(pedido.detalles_pedido)) {
      const producto = pedido.detalles_pedido[0]
      if (producto && producto.cantidad === 8) {
        console.log('🔍 PROBLEMA IDENTIFICADO:')
        console.log('   - La cantidad en detalles_pedido es 8')
        console.log('   - Pero el total del pedido sugiere que debería ser 4')
        console.log('   - Esto indica un error en el proceso de guardado')
        console.log('\n💡 POSIBLES CAUSAS:')
        console.log('   1. Error en el formulario de creación de pedido')
        console.log('   2. Duplicación de datos al guardar')
        console.log('   3. Error en el cálculo del total')
        console.log('   4. Problema en la función de procesamiento de venta')
        console.log('\n🛠️ SOLUCIONES SUGERIDAS:')
        console.log('   1. Revisar el código de creación de pedidos')
        console.log('   2. Verificar la función procesarVenta')
        console.log('   3. Corregir manualmente en la base de datos si es necesario')
        console.log('   4. Implementar validaciones adicionales')
      }
    } else {
      console.log('⚠️ No se puede analizar el problema sin detalles_pedido')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar investigación
investigarPedido67()
