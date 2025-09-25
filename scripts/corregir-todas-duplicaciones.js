// Script para corregir todas las duplicaciones en detalles_pedido
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

async function corregirTodasLasDuplicaciones() {
  console.log('🔧 CORRIGIENDO TODAS LAS DUPLICACIONES')
  console.log('=' .repeat(80))
  
  try {
    // 1. Obtener todos los detalles_pedido
    console.log('\n📊 1. OBTENIENDO TODOS LOS DETALLES...')
    
    const { data: todosDetalles, error: todosError } = await supabase
      .from('detalles_pedido')
      .select('*')
      .order('pedido_id, producto_id, id')
    
    if (todosError) {
      console.error('❌ Error obteniendo detalles:', todosError)
      return
    }
    
    console.log(`✅ Total detalles obtenidos: ${todosDetalles.length}`)
    
    // 2. Agrupar por pedido_id
    const detallesPorPedido = {}
    todosDetalles.forEach(detalle => {
      if (!detallesPorPedido[detalle.pedido_id]) {
        detallesPorPedido[detalle.pedido_id] = []
      }
      detallesPorPedido[detalle.pedido_id].push(detalle)
    })
    
    console.log(`✅ Pedidos únicos: ${Object.keys(detallesPorPedido).length}`)
    
    // 3. Identificar duplicaciones
    const pedidosConDuplicacion = []
    
    Object.keys(detallesPorPedido).forEach(pedidoId => {
      const detallesPedido = detallesPorPedido[pedidoId]
      
      // Agrupar por producto_id
      const productosPorId = {}
      detallesPedido.forEach(detalle => {
        if (!productosPorId[detalle.producto_id]) {
          productosPorId[detalle.producto_id] = []
        }
        productosPorId[detalle.producto_id].push(detalle)
      })
      
      // Verificar duplicaciones
      Object.keys(productosPorId).forEach(productoId => {
        if (productosPorId[productoId].length > 1) {
          pedidosConDuplicacion.push({
            pedidoId: parseInt(pedidoId),
            productoId: parseInt(productoId),
            cantidad: productosPorId[productoId].length,
            detalles: productosPorId[productoId]
          })
        }
      })
    })
    
    console.log(`\n🔍 DUPLICACIONES ENCONTRADAS: ${pedidosConDuplicacion.length}`)
    
    if (pedidosConDuplicacion.length === 0) {
      console.log('✅ No hay duplicaciones que corregir')
      return
    }
    
    // 4. Mostrar duplicaciones encontradas
    pedidosConDuplicacion.forEach((duplicacion, index) => {
      console.log(`\n   ${index + 1}. Pedido #${duplicacion.pedidoId}:`)
      console.log(`      Producto ID: ${duplicacion.productoId}`)
      console.log(`      Cantidad de registros: ${duplicacion.cantidad}`)
      duplicacion.detalles.forEach((detalle, i) => {
        console.log(`         ${i + 1}. ID: ${detalle.id}, Cantidad: ${detalle.cantidad}, Precio: $${detalle.precio_unitario_usd}`)
      })
    })
    
    // 5. Corregir cada duplicación
    console.log('\n🔧 CORRIGIENDO DUPLICACIONES...')
    
    for (const duplicacion of pedidosConDuplicacion) {
      console.log(`\n📝 Corrigiendo Pedido #${duplicacion.pedidoId}...`)
      
      // Ordenar por ID para mantener el primero
      const detallesOrdenados = duplicacion.detalles.sort((a, b) => a.id - b.id)
      const primerDetalle = detallesOrdenados[0]
      const duplicados = detallesOrdenados.slice(1)
      
      console.log(`   Manteniendo: ID ${primerDetalle.id} (Cantidad: ${primerDetalle.cantidad})`)
      
      // Eliminar duplicados
      for (const duplicado of duplicados) {
        const { error: deleteError } = await supabase
          .from('detalles_pedido')
          .delete()
          .eq('id', duplicado.id)
        
        if (deleteError) {
          console.error(`   ❌ Error eliminando ID ${duplicado.id}:`, deleteError)
        } else {
          console.log(`   ✅ Eliminado: ID ${duplicado.id}`)
        }
      }
      
      // Recalcular total del pedido
      const { data: detallesRestantes, error: detallesError } = await supabase
        .from('detalles_pedido')
        .select('cantidad, precio_unitario_usd')
        .eq('pedido_id', duplicacion.pedidoId)
      
      if (detallesError) {
        console.error(`   ❌ Error obteniendo detalles restantes:`, detallesError)
        continue
      }
      
      const nuevoTotal = detallesRestantes.reduce((sum, detalle) => {
        return sum + (detalle.cantidad * detalle.precio_unitario_usd)
      }, 0)
      
      // Actualizar total del pedido
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({ total_usd: nuevoTotal })
        .eq('id', duplicacion.pedidoId)
      
      if (updateError) {
        console.error(`   ❌ Error actualizando total del pedido:`, updateError)
      } else {
        console.log(`   ✅ Total actualizado: $${nuevoTotal.toFixed(2)}`)
      }
    }
    
    // 6. Verificación final
    console.log('\n📊 VERIFICACIÓN FINAL...')
    
    const { data: detallesFinales, error: finalError } = await supabase
      .from('detalles_pedido')
      .select('pedido_id, producto_id, cantidad, nombre_producto')
      .order('pedido_id')
    
    if (finalError) {
      console.error('❌ Error en verificación final:', finalError)
      return
    }
    
    // Verificar si quedan duplicaciones
    const detallesPorPedidoFinal = {}
    detallesFinales.forEach(detalle => {
      if (!detallesPorPedidoFinal[detalle.pedido_id]) {
        detallesPorPedidoFinal[detalle.pedido_id] = []
      }
      detallesPorPedidoFinal[detalle.pedido_id].push(detalle)
    })
    
    let duplicacionesRestantes = 0
    Object.keys(detallesPorPedidoFinal).forEach(pedidoId => {
      const detallesPedido = detallesPorPedidoFinal[pedidoId]
      const productosPorId = {}
      
      detallesPedido.forEach(detalle => {
        if (!productosPorId[detalle.producto_id]) {
          productosPorId[detalle.producto_id] = []
        }
        productosPorId[detalle.producto_id].push(detalle)
      })
      
      Object.keys(productosPorId).forEach(productoId => {
        if (productosPorId[productoId].length > 1) {
          duplicacionesRestantes++
        }
      })
    })
    
    if (duplicacionesRestantes === 0) {
      console.log('✅ Todas las duplicaciones han sido corregidas')
    } else {
      console.log(`⚠️ Quedan ${duplicacionesRestantes} duplicaciones por corregir`)
    }
    
    // 7. Resumen de pedidos corregidos
    console.log('\n📊 RESUMEN DE CORRECCIONES:')
    console.log(`   - Pedidos con duplicación: ${pedidosConDuplicacion.length}`)
    console.log(`   - Duplicaciones restantes: ${duplicacionesRestantes}`)
    console.log(`   - Estado: ${duplicacionesRestantes === 0 ? '✅ COMPLETADO' : '⚠️ PARCIAL'}`)
    
    // 8. Mostrar algunos pedidos corregidos
    console.log('\n📋 PEDIDOS CORREGIDOS:')
    pedidosConDuplicacion.forEach((duplicacion, index) => {
      console.log(`   ${index + 1}. Pedido #${duplicacion.pedidoId} - Producto ID: ${duplicacion.productoId}`)
    })
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar corrección
corregirTodasLasDuplicaciones()
