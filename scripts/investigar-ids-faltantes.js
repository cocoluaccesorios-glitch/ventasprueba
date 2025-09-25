// Script para investigar qué pasó con los IDs faltantes
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

async function investigarIdsFaltantes() {
  console.log('🔍 INVESTIGANDO IDs FALTANTES')
  console.log('=' .repeat(80))
  
  try {
    // IDs faltantes identificados
    const idsFaltantes = [6, 7, 9, 11, 33, 34, 35, 36, 37, 39, 41, 42, 43, 45, 46, 48, 50, 51, 52, 54, 56, 58, 59, 60, 62, 64, 66]
    
    console.log(`📋 IDs faltantes a investigar: ${idsFaltantes.length}`)
    console.log(`📋 Lista: ${idsFaltantes.join(', ')}`)
    
    // 1. Verificar si existen en la tabla pedidos
    console.log('\n📊 1. VERIFICANDO SI EXISTEN EN TABLA PEDIDOS...')
    
    for (const id of idsFaltantes.slice(0, 10)) { // Solo los primeros 10 para no sobrecargar
      const { data: pedido, error } = await supabase
        .from('pedidos')
        .select('id, cliente_nombre, cliente_apellido, total_usd, estado_entrega, fecha_pedido')
        .eq('id', id)
        .single()
      
      if (error && error.code === 'PGRST116') {
        console.log(`   ID ${id}: ❌ No existe en tabla pedidos`)
      } else if (error) {
        console.log(`   ID ${id}: ⚠️ Error: ${error.message}`)
      } else {
        console.log(`   ID ${id}: ✅ EXISTE - ${pedido.cliente_nombre} ${pedido.cliente_apellido} - $${pedido.total_usd}`)
      }
    }
    
    // 2. Verificar si existen en detalles_pedido
    console.log('\n📊 2. VERIFICANDO SI EXISTEN EN DETALLES_PEDIDO...')
    
    for (const id of idsFaltantes.slice(0, 10)) {
      const { data: detalles, error } = await supabase
        .from('detalles_pedido')
        .select('pedido_id, nombre_producto, cantidad')
        .eq('pedido_id', id)
      
      if (error) {
        console.log(`   ID ${id}: ⚠️ Error: ${error.message}`)
      } else if (detalles.length > 0) {
        console.log(`   ID ${id}: ✅ EXISTE en detalles_pedido - ${detalles.length} productos`)
        detalles.forEach(detalle => {
          console.log(`      - ${detalle.nombre_producto} (cantidad: ${detalle.cantidad})`)
        })
      } else {
        console.log(`   ID ${id}: ❌ No existe en detalles_pedido`)
      }
    }
    
    // 3. Verificar si existen en abonos
    console.log('\n📊 3. VERIFICANDO SI EXISTEN EN ABONOS...')
    
    for (const id of idsFaltantes.slice(0, 10)) {
      const { data: abonos, error } = await supabase
        .from('abonos')
        .select('pedido_id, monto_abono_usd, metodo_pago_abono')
        .eq('pedido_id', id)
      
      if (error) {
        console.log(`   ID ${id}: ⚠️ Error: ${error.message}`)
      } else if (abonos.length > 0) {
        console.log(`   ID ${id}: ✅ EXISTE en abonos - ${abonos.length} abonos`)
        abonos.forEach(abono => {
          console.log(`      - $${abono.monto_abono_usd} (${abono.metodo_pago_abono})`)
        })
      } else {
        console.log(`   ID ${id}: ❌ No existe en abonos`)
      }
    }
    
    // 4. Verificar el pedido #8 que tiene total $0
    console.log('\n📊 4. INVESTIGANDO PEDIDO #8 (TOTAL $0)...')
    
    const { data: pedido8, error: pedido8Error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', 8)
      .single()
    
    if (pedido8Error) {
      console.error('❌ Error obteniendo pedido #8:', pedido8Error)
    } else {
      console.log('✅ Pedido #8 encontrado:')
      console.log(`   Cliente: ${pedido8.cliente_nombre} ${pedido8.cliente_apellido}`)
      console.log(`   Total: $${pedido8.total_usd}`)
      console.log(`   Estado: ${pedido8.estado_entrega}`)
      console.log(`   Es Abono: ${pedido8.es_abono}`)
      console.log(`   Fecha: ${pedido8.fecha_pedido}`)
      console.log(`   Subtotal: $${pedido8.subtotal_usd || 0}`)
      console.log(`   Descuento: $${pedido8.monto_descuento_usd || 0}`)
      console.log(`   IVA: $${pedido8.monto_iva_usd || 0}`)
      console.log(`   Delivery: $${pedido8.monto_delivery_usd || 0}`)
    }
    
    // Verificar detalles del pedido #8
    const { data: detalles8, error: detalles8Error } = await supabase
      .from('detalles_pedido')
      .select('*')
      .eq('pedido_id', 8)
    
    if (detalles8Error) {
      console.error('❌ Error obteniendo detalles del pedido #8:', detalles8Error)
    } else {
      console.log(`\n📋 Detalles del pedido #8: ${detalles8.length}`)
      if (detalles8.length > 0) {
        detalles8.forEach((detalle, index) => {
          console.log(`   ${index + 1}. ${detalle.nombre_producto}: ${detalle.cantidad} x $${detalle.precio_unitario_usd} = $${detalle.cantidad * detalle.precio_unitario_usd}`)
        })
      } else {
        console.log('   ❌ No tiene detalles_pedido')
      }
    }
    
    // 5. Verificar pedidos anulados
    console.log('\n📊 5. INVESTIGANDO PEDIDOS ANULADOS...')
    
    const { data: pedidosAnulados, error: anuladosError } = await supabase
      .from('pedidos')
      .select('id, cliente_nombre, cliente_apellido, total_usd, fecha_pedido')
      .eq('estado_entrega', 'anulado')
      .order('id')
    
    if (anuladosError) {
      console.error('❌ Error obteniendo pedidos anulados:', anuladosError)
    } else {
      console.log(`✅ Pedidos anulados encontrados: ${pedidosAnulados.length}`)
      pedidosAnulados.forEach(pedido => {
        console.log(`   Pedido #${pedido.id}: ${pedido.cliente_nombre} ${pedido.cliente_apellido} - $${pedido.total_usd} - ${pedido.fecha_pedido}`)
      })
    }
    
    // 6. Analizar el patrón de gaps más recientes
    console.log('\n📊 6. ANALIZANDO GAPS RECIENTES...')
    
    const gapsRecientes = [58, 59, 60, 62, 64, 66] // Los más recientes
    
    console.log(`📋 Gaps recientes: ${gapsRecientes.join(', ')}`)
    
    // Verificar si estos IDs fueron creados y luego eliminados
    for (const id of gapsRecientes) {
      // Verificar en detalles_pedido
      const { data: detalles, error: detallesError } = await supabase
        .from('detalles_pedido')
        .select('pedido_id, nombre_producto, cantidad')
        .eq('pedido_id', id)
      
      if (!detallesError && detalles.length > 0) {
        console.log(`   ID ${id}: ✅ EXISTE en detalles_pedido - ${detalles.length} productos`)
        detalles.forEach(detalle => {
          console.log(`      - ${detalle.nombre_producto} (cantidad: ${detalle.cantidad})`)
        })
      } else {
        console.log(`   ID ${id}: ❌ No existe en detalles_pedido`)
      }
    }
    
    // 7. Verificar si hay algún patrón en las fechas
    console.log('\n📊 7. ANALIZANDO PATRÓN TEMPORAL...')
    
    // Obtener todos los pedidos con sus fechas
    const { data: todosPedidos, error: todosError } = await supabase
      .from('pedidos')
      .select('id, fecha_pedido, estado_entrega')
      .order('fecha_pedido')
    
    if (todosError) {
      console.error('❌ Error obteniendo todos los pedidos:', todosError)
    } else {
      console.log(`✅ Total pedidos: ${todosPedidos.length}`)
      
      // Agrupar por día
      const pedidosPorDia = {}
      todosPedidos.forEach(pedido => {
        const fecha = pedido.fecha_pedido.split('T')[0]
        if (!pedidosPorDia[fecha]) {
          pedidosPorDia[fecha] = []
        }
        pedidosPorDia[fecha].push(pedido)
      })
      
      console.log('\n📅 Pedidos por día:')
      Object.keys(pedidosPorDia).sort().forEach(fecha => {
        const pedidosDelDia = pedidosPorDia[fecha]
        const idsDelDia = pedidosDelDia.map(p => p.id).sort((a, b) => a - b)
        const anuladosDelDia = pedidosDelDia.filter(p => p.estado_entrega === 'anulado').length
        
        console.log(`   ${fecha}: ${pedidosDelDia.length} pedidos - IDs: ${idsDelDia.join(', ')} ${anuladosDelDia > 0 ? `(${anuladosDelDia} anulados)` : ''}`)
      })
    }
    
    // 8. Recomendaciones finales
    console.log('\n📊 8. RECOMENDACIONES FINALES:')
    
    console.log('🔍 CONCLUSIONES:')
    console.log('   1. Los gaps en IDs indican pedidos que fueron eliminados o nunca creados')
    console.log('   2. Algunos IDs pueden existir en detalles_pedido pero no en pedidos')
    console.log('   3. Esto sugiere problemas en el proceso de creación/eliminación')
    console.log('   4. El pedido #8 con total $0 puede ser un error de cálculo')
    
    console.log('\n💡 ACCIONES RECOMENDADAS:')
    console.log('   1. Revisar el código de creación de pedidos')
    console.log('   2. Implementar transacciones para evitar inconsistencias')
    console.log('   3. Agregar logs para rastrear eliminaciones')
    console.log('   4. Verificar si los IDs faltantes tienen datos huérfanos')
    console.log('   5. Considerar limpiar datos huérfanos si es necesario')
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar investigación
investigarIdsFaltantes()
