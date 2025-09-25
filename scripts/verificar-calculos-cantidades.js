// Script para verificar cálculos de cantidades en pedidos
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

async function verificarCalculosCantidades() {
  console.log('🔍 VERIFICANDO CÁLCULOS DE CANTIDADES EN PEDIDOS')
  console.log('=' .repeat(80))
  
  try {
    // Obtener pedidos con detalles
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select(`
        id,
        cliente_nombre,
        cliente_apellido,
        total_usd,
        fecha_pedido,
        detalles_pedido
      `)
      .order('fecha_pedido', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Error obteniendo pedidos:', error)
      return
    }
    
    console.log(`📊 Verificando ${pedidos.length} pedidos...`)
    
    pedidos.forEach((pedido, index) => {
      console.log(`\n${index + 1}. PEDIDO #${pedido.id}`)
      console.log(`   Cliente: ${pedido.cliente_nombre} ${pedido.cliente_apellido}`)
      console.log(`   Fecha: ${pedido.fecha_pedido}`)
      console.log(`   Total en BD: $${pedido.total_usd}`)
      
      if (pedido.detalles_pedido && Array.isArray(pedido.detalles_pedido)) {
        console.log(`   Productos:`)
        
        let totalCalculado = 0
        let totalCantidades = 0
        
        pedido.detalles_pedido.forEach((detalle, i) => {
          const subtotal = detalle.cantidad * detalle.precio_unitario
          totalCalculado += subtotal
          totalCantidades += detalle.cantidad
          
          console.log(`     ${i + 1}. ${detalle.nombre_producto}`)
          console.log(`        Cantidad: ${detalle.cantidad}`)
          console.log(`        Precio: $${detalle.precio_unitario}`)
          console.log(`        Subtotal: $${subtotal.toFixed(2)}`)
        })
        
        console.log(`   📊 RESUMEN:`)
        console.log(`     Total cantidades: ${totalCantidades}`)
        console.log(`     Total calculado: $${totalCalculado.toFixed(2)}`)
        console.log(`     Total en BD: $${pedido.total_usd}`)
        console.log(`     ✅ Coincide: ${Math.abs(totalCalculado - pedido.total_usd) < 0.01}`)
        
        if (Math.abs(totalCalculado - pedido.total_usd) >= 0.01) {
          console.log(`     ⚠️ DIFERENCIA: $${(totalCalculado - pedido.total_usd).toFixed(2)}`)
        }
      } else {
        console.log(`   ⚠️ Sin detalles de productos`)
      }
    })
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar verificación
verificarCalculosCantidades()
