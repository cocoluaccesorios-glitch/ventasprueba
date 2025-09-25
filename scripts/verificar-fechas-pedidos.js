// Script para verificar cómo se están guardando las fechas en pedidos
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

async function verificarFechasPedidos() {
  console.log('🔍 Verificando fechas en la tabla pedidos...')
  
  try {
    // Obtener los últimos 10 pedidos para verificar el formato de fecha
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('id, fecha_pedido')
      .order('fecha_pedido', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Error obteniendo pedidos:', error)
      return
    }
    
    console.log(`📊 Encontrados ${pedidos.length} pedidos`)
    console.log('\n📅 FORMATO DE FECHAS EN PEDIDOS:')
    console.log('=' .repeat(80))
    
    pedidos.forEach((pedido, index) => {
      console.log(`\n${index + 1}. Pedido ID: ${pedido.id}`)
      console.log(`   fecha_pedido: ${pedido.fecha_pedido}`)
      
      // Verificar si tiene hora
      if (pedido.fecha_pedido) {
        const fecha = new Date(pedido.fecha_pedido)
        console.log(`   Hora extraída: ${fecha.getHours()}:${fecha.getMinutes().toString().padStart(2, '0')}`)
        console.log(`   Fecha completa: ${fecha.toLocaleString('es-VE')}`)
      }
    })
    
    // Verificar pedidos de hoy
    const hoy = new Date()
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
    const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59)
    
    console.log('\n📅 PEDIDOS DE HOY:')
    console.log('=' .repeat(50))
    console.log(`Fecha inicio: ${inicioHoy.toISOString()}`)
    console.log(`Fecha fin: ${finHoy.toISOString()}`)
    
    const { data: pedidosHoy, error: errorHoy } = await supabase
      .from('pedidos')
      .select('id, fecha_pedido, total_usd')
      .gte('fecha_pedido', inicioHoy.toISOString())
      .lte('fecha_pedido', finHoy.toISOString())
      .order('fecha_pedido', { ascending: false })
    
    if (errorHoy) {
      console.error('❌ Error obteniendo pedidos de hoy:', errorHoy)
    } else {
      console.log(`📊 Pedidos de hoy: ${pedidosHoy.length}`)
      
      if (pedidosHoy.length > 0) {
        console.log('\n📋 DETALLE DE PEDIDOS DE HOY:')
        pedidosHoy.forEach((pedido, index) => {
          const fecha = new Date(pedido.fecha_pedido)
          console.log(`${index + 1}. ID: ${pedido.id} | Hora: ${fecha.getHours()}:${fecha.getMinutes().toString().padStart(2, '0')} | Total: $${pedido.total_usd}`)
        })
      } else {
        console.log('⚠️ No hay pedidos de hoy')
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar verificación
verificarFechasPedidos()
