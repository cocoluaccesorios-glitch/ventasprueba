// Script para corregir la duplicación en el pedido #67
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

async function corregirPedido67() {
  console.log('🔧 CORRIGIENDO PEDIDO #67')
  console.log('=' .repeat(80))
  
  try {
    // 1. Verificar el estado actual
    console.log('\n📊 1. ESTADO ACTUAL DEL PEDIDO #67...')
    
    const { data: detalles, error: detallesError } = await supabase
      .from('detalles_pedido')
      .select('*')
      .eq('pedido_id', 67)
      .order('id')
    
    if (detallesError) {
      console.error('❌ Error obteniendo detalles:', detallesError)
      return
    }
    
    console.log(`✅ Detalles encontrados: ${detalles.length}`)
    detalles.forEach((detalle, index) => {
      console.log(`   ${index + 1}. ID: ${detalle.id}, Cantidad: ${detalle.cantidad}, Precio: $${detalle.precio_unitario_usd}`)
    })
    
    // 2. Obtener información del pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select('total_usd')
      .eq('id', 67)
      .single()
    
    if (pedidoError) {
      console.error('❌ Error obteniendo pedido:', pedidoError)
      return
    }
    
    console.log(`\n💰 Total actual en BD: $${pedido.total_usd}`)
    
    // 3. Calcular el total correcto
    const totalCalculado = detalles.reduce((sum, detalle) => {
      return sum + (detalle.cantidad * detalle.precio_unitario_usd)
    }, 0)
    
    console.log(`💰 Total calculado: $${totalCalculado.toFixed(2)}`)
    
    // 4. Identificar la duplicación
    if (detalles.length === 2 && detalles[0].producto_id === detalles[1].producto_id) {
      console.log('\n🔍 DUPLICACIÓN DETECTADA:')
      console.log('   - Mismo producto aparece 2 veces')
      console.log('   - Cantidad duplicada: 4 + 4 = 8')
      console.log('   - Debería ser solo 4 unidades')
      
      // 5. Corregir eliminando el duplicado
      console.log('\n🔧 CORRIGIENDO DUPLICACIÓN...')
      
      // Eliminar el segundo registro (ID más alto)
      const { error: deleteError } = await supabase
        .from('detalles_pedido')
        .delete()
        .eq('id', detalles[1].id)
      
      if (deleteError) {
        console.error('❌ Error eliminando duplicado:', deleteError)
        return
      }
      
      console.log(`✅ Duplicado eliminado (ID: ${detalles[1].id})`)
      
      // 6. Actualizar el total del pedido
      const nuevoTotal = detalles[0].cantidad * detalles[0].precio_unitario_usd
      console.log(`💰 Nuevo total calculado: $${nuevoTotal.toFixed(2)}`)
      
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({ total_usd: nuevoTotal })
        .eq('id', 67)
      
      if (updateError) {
        console.error('❌ Error actualizando total del pedido:', updateError)
        return
      }
      
      console.log(`✅ Total del pedido actualizado a $${nuevoTotal.toFixed(2)}`)
      
      // 7. Verificar la corrección
      console.log('\n📊 7. VERIFICANDO CORRECCIÓN...')
      
      const { data: detallesCorregidos, error: verificarError } = await supabase
        .from('detalles_pedido')
        .select('*')
        .eq('pedido_id', 67)
      
      if (verificarError) {
        console.error('❌ Error verificando corrección:', verificarError)
        return
      }
      
      console.log(`✅ Detalles después de corrección: ${detallesCorregidos.length}`)
      detallesCorregidos.forEach((detalle, index) => {
        console.log(`   ${index + 1}. Producto: ${detalle.nombre_producto}, Cantidad: ${detalle.cantidad}, Precio: $${detalle.precio_unitario_usd}`)
      })
      
      const totalFinal = detallesCorregidos.reduce((sum, detalle) => {
        return sum + (detalle.cantidad * detalle.precio_unitario_usd)
      }, 0)
      
      console.log(`💰 Total final: $${totalFinal.toFixed(2)}`)
      
      // 8. Verificar otros pedidos con el mismo problema
      console.log('\n📊 8. VERIFICANDO OTROS PEDIDOS CON DUPLICACIÓN...')
      
      const { data: todosDetalles, error: todosError } = await supabase
        .from('detalles_pedido')
        .select('pedido_id, producto_id, cantidad, nombre_producto')
        .order('pedido_id')
      
      if (todosError) {
        console.error('❌ Error obteniendo todos los detalles:', todosError)
        return
      }
      
      // Agrupar por pedido_id
      const detallesPorPedido = {}
      todosDetalles.forEach(detalle => {
        if (!detallesPorPedido[detalle.pedido_id]) {
          detallesPorPedido[detalle.pedido_id] = []
        }
        detallesPorPedido[detalle.pedido_id].push(detalle)
      })
      
      // Buscar duplicaciones
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
        
        // Verificar si hay productos duplicados
        Object.keys(productosPorId).forEach(productoId => {
          if (productosPorId[productoId].length > 1) {
            pedidosConDuplicacion.push({
              pedidoId: pedidoId,
              productoId: productoId,
              cantidad: productosPorId[productoId].length,
              detalles: productosPorId[productoId]
            })
          }
        })
      })
      
      if (pedidosConDuplicacion.length > 0) {
        console.log(`⚠️ PEDIDOS CON DUPLICACIÓN ENCONTRADOS: ${pedidosConDuplicacion.length}`)
        pedidosConDuplicacion.forEach(duplicacion => {
          console.log(`\n   Pedido #${duplicacion.pedidoId}:`)
          console.log(`     Producto ID: ${duplicacion.productoId}`)
          console.log(`     Cantidad de registros: ${duplicacion.cantidad}`)
          duplicacion.detalles.forEach((detalle, index) => {
            console.log(`       ${index + 1}. ID: ${detalle.id}, Cantidad: ${detalle.cantidad}`)
          })
        })
      } else {
        console.log('✅ No se encontraron más duplicaciones')
      }
      
      console.log('\n🎉 CORRECCIÓN COMPLETADA:')
      console.log('   - Pedido #67 corregido')
      console.log('   - Duplicado eliminado')
      console.log('   - Total actualizado')
      console.log('   - Cantidad correcta: 4 unidades')
      
    } else {
      console.log('ℹ️ No se detectó duplicación en el formato esperado')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar corrección
corregirPedido67()
