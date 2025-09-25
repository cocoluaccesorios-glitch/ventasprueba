// Script para verificar la tabla detalles_pedido y el pedido #67
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

async function verificarDetallesPedido() {
  console.log('🔍 VERIFICANDO TABLA DETALLES_PEDIDO')
  console.log('=' .repeat(80))
  
  try {
    // 1. Verificar si existe la tabla detalles_pedido
    console.log('\n📊 1. VERIFICANDO TABLA DETALLES_PEDIDO...')
    
    const { data: detalles, error: detallesError } = await supabase
      .from('detalles_pedido')
      .select('*')
      .eq('pedido_id', 67)
    
    if (detallesError) {
      console.error('❌ Error obteniendo detalles_pedido:', detallesError)
      console.log('💡 Esto sugiere que la tabla detalles_pedido no existe o no es accesible')
      return
    }
    
    console.log(`✅ Detalles encontrados para pedido #67: ${detalles.length}`)
    
    if (detalles.length > 0) {
      console.log('\n📋 DETALLES DEL PEDIDO #67:')
      detalles.forEach((detalle, index) => {
        console.log(`\n   Detalle ${index + 1}:`)
        console.log(`     ID: ${detalle.id}`)
        console.log(`     Pedido ID: ${detalle.pedido_id}`)
        console.log(`     Producto ID: ${detalle.producto_id}`)
        console.log(`     Nombre Producto: ${detalle.nombre_producto}`)
        console.log(`     SKU: ${detalle.sku_producto || 'Sin SKU'}`)
        console.log(`     Cantidad: ${detalle.cantidad}`)
        console.log(`     Precio Unitario: $${detalle.precio_unitario_usd}`)
        console.log(`     Subtotal: $${detalle.cantidad * detalle.precio_unitario_usd}`)
      })
      
      // Calcular total
      const totalCalculado = detalles.reduce((sum, detalle) => {
        return sum + (detalle.cantidad * detalle.precio_unitario_usd)
      }, 0)
      
      console.log(`\n💰 TOTAL CALCULADO: $${totalCalculado.toFixed(2)}`)
    } else {
      console.log('❌ No se encontraron detalles para el pedido #67')
    }
    
    // 2. Verificar todos los detalles_pedido para entender el patrón
    console.log('\n📊 2. VERIFICANDO TODOS LOS DETALLES_PEDIDO...')
    
    const { data: todosDetalles, error: todosError } = await supabase
      .from('detalles_pedido')
      .select('*')
      .order('pedido_id', { ascending: false })
      .limit(20)
    
    if (todosError) {
      console.error('❌ Error obteniendo todos los detalles:', todosError)
    } else {
      console.log(`✅ Total detalles encontrados: ${todosDetalles.length}`)
      
      if (todosDetalles.length > 0) {
        console.log('\n📋 ÚLTIMOS 10 DETALLES:')
        todosDetalles.slice(0, 10).forEach((detalle, index) => {
          console.log(`\n   ${index + 1}. Pedido #${detalle.pedido_id}:`)
          console.log(`      Producto: ${detalle.nombre_producto}`)
          console.log(`      Cantidad: ${detalle.cantidad}`)
          console.log(`      Precio: $${detalle.precio_unitario_usd}`)
          console.log(`      Subtotal: $${detalle.cantidad * detalle.precio_unitario_usd}`)
        })
        
        // Agrupar por pedido_id
        const detallesPorPedido = {}
        todosDetalles.forEach(detalle => {
          if (!detallesPorPedido[detalle.pedido_id]) {
            detallesPorPedido[detalle.pedido_id] = []
          }
          detallesPorPedido[detalle.pedido_id].push(detalle)
        })
        
        console.log(`\n📊 RESUMEN POR PEDIDO:`)
        Object.keys(detallesPorPedido).slice(0, 10).forEach(pedidoId => {
          const detallesPedido = detallesPorPedido[pedidoId]
          const totalPedido = detallesPedido.reduce((sum, detalle) => {
            return sum + (detalle.cantidad * detalle.precio_unitario_usd)
          }, 0)
          
          console.log(`   Pedido #${pedidoId}: ${detallesPedido.length} productos, Total: $${totalPedido.toFixed(2)}`)
        })
      }
    }
    
    // 3. Verificar si el pedido #67 tiene algún problema específico
    console.log('\n📊 3. VERIFICANDO PEDIDOS RECIENTES...')
    
    const { data: pedidosRecientes, error: pedidosError } = await supabase
      .from('pedidos')
      .select('id, cliente_nombre, cliente_apellido, total_usd, fecha_pedido, es_abono')
      .order('fecha_pedido', { ascending: false })
      .limit(10)
    
    if (pedidosError) {
      console.error('❌ Error obteniendo pedidos recientes:', pedidosError)
    } else {
      console.log(`✅ Pedidos recientes encontrados: ${pedidosRecientes.length}`)
      
      console.log('\n📋 PEDIDOS RECIENTES:')
      pedidosRecientes.forEach((pedido, index) => {
        console.log(`\n   ${index + 1}. Pedido #${pedido.id}:`)
        console.log(`      Cliente: ${pedido.cliente_nombre} ${pedido.cliente_apellido}`)
        console.log(`      Total: $${pedido.total_usd}`)
        console.log(`      Fecha: ${pedido.fecha_pedido}`)
        console.log(`      Es Abono: ${pedido.es_abono}`)
      })
    }
    
    // 4. Verificar si hay pedidos con detalles_pedido pero sin total correcto
    console.log('\n📊 4. VERIFICANDO INCONSISTENCIAS...')
    
    if (todosDetalles && todosDetalles.length > 0) {
      const pedidosConDetalles = [...new Set(todosDetalles.map(d => d.pedido_id))]
      
      for (const pedidoId of pedidosConDetalles.slice(0, 5)) {
        // Obtener pedido
        const { data: pedido, error: pedidoError } = await supabase
          .from('pedidos')
          .select('total_usd')
          .eq('id', pedidoId)
          .single()
        
        if (!pedidoError && pedido) {
          // Calcular total de detalles
          const detallesPedido = todosDetalles.filter(d => d.pedido_id === pedidoId)
          const totalCalculado = detallesPedido.reduce((sum, detalle) => {
            return sum + (detalle.cantidad * detalle.precio_unitario_usd)
          }, 0)
          
          const diferencia = Math.abs(totalCalculado - pedido.total_usd)
          
          if (diferencia > 0.01) { // Tolerancia de 1 centavo
            console.log(`⚠️ INCONSISTENCIA en Pedido #${pedidoId}:`)
            console.log(`   Total en BD: $${pedido.total_usd}`)
            console.log(`   Total calculado: $${totalCalculado.toFixed(2)}`)
            console.log(`   Diferencia: $${diferencia.toFixed(2)}`)
          }
        }
      }
    }
    
    // 5. Recomendaciones
    console.log('\n📊 5. RECOMENDACIONES:')
    
    if (detalles && detalles.length === 0) {
      console.log('🔍 PROBLEMA IDENTIFICADO:')
      console.log('   - El pedido #67 no tiene detalles_pedido')
      console.log('   - Esto explica por qué la interfaz muestra información incorrecta')
      console.log('   - El pedido se creó como "es_abono: true" pero sin productos')
      console.log('\n💡 POSIBLES CAUSAS:')
      console.log('   1. El pedido se creó solo como abono, sin productos')
      console.log('   2. Error en el proceso de creación de venta')
      console.log('   3. Los detalles se perdieron durante la creación')
      console.log('   4. El pedido se creó manualmente sin productos')
      console.log('\n🛠️ SOLUCIONES:')
      console.log('   1. Verificar cómo se creó el pedido #67')
      console.log('   2. Revisar si debería tener productos')
      console.log('   3. Corregir manualmente si es necesario')
      console.log('   4. Implementar validaciones para evitar esto')
    } else {
      console.log('✅ El pedido #67 tiene detalles correctos')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar verificación
verificarDetallesPedido()
