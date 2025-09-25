// Script para verificar el estado actual de deudas y abonos
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

async function verificarEstadoDeudas() {
  console.log('🔍 VERIFICANDO ESTADO DE DEUDAS Y ABONOS')
  console.log('=' .repeat(80))
  
  try {
    // 1. Verificar estructura de tablas
    console.log('\n📊 1. VERIFICANDO ESTRUCTURA DE TABLAS...')
    
    // Verificar tabla pedidos
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select('id, cliente_nombre, cliente_apellido, total_usd, estado_entrega, fecha_pedido')
      .order('fecha_pedido', { ascending: false })
      .limit(10)
    
    if (pedidosError) {
      console.error('❌ Error obteniendo pedidos:', pedidosError)
    } else {
      console.log(`✅ Tabla pedidos: ${pedidos.length} registros encontrados`)
    }
    
    // Verificar tabla abonos
    const { data: abonos, error: abonosError } = await supabase
      .from('abonos')
      .select('id, pedido_id, monto_abono_usd, monto_abono_ves, fecha_abono, estado_abono')
      .order('fecha_abono', { ascending: false })
      .limit(10)
    
    if (abonosError) {
      console.error('❌ Error obteniendo abonos:', abonosError)
    } else {
      console.log(`✅ Tabla abonos: ${abonos.length} registros encontrados`)
    }
    
    // 2. Analizar pedidos con deudas
    console.log('\n📊 2. ANALIZANDO PEDIDOS CON DEUDAS...')
    
    if (pedidos) {
      const pedidosConDeudas = []
      
      for (const pedido of pedidos) {
        // Obtener abonos para este pedido
        const { data: abonosPedido } = await supabase
          .from('abonos')
          .select('monto_abono_usd')
          .eq('pedido_id', pedido.id)
          .eq('estado_abono', 'confirmado')
        
        const totalAbonado = abonosPedido ? 
          abonosPedido.reduce((sum, abono) => sum + (abono.monto_abono_usd || 0), 0) : 0
        
        const saldoPendiente = pedido.total_usd - totalAbonado
        
        if (saldoPendiente > 0) {
          pedidosConDeudas.push({
            id: pedido.id,
            cliente: `${pedido.cliente_nombre} ${pedido.cliente_apellido}`,
            total: pedido.total_usd,
            abonado: totalAbonado,
            pendiente: saldoPendiente,
            estado: pedido.estado_entrega,
            fecha: pedido.fecha_pedido
          })
        }
      }
      
      console.log(`📊 Pedidos con deudas: ${pedidosConDeudas.length}`)
      
      if (pedidosConDeudas.length > 0) {
        console.log('\n📋 DETALLE DE DEUDAS:')
        pedidosConDeudas.forEach((deuda, index) => {
          console.log(`\n${index + 1}. PEDIDO #${deuda.id}`)
          console.log(`   Cliente: ${deuda.cliente}`)
          console.log(`   Total: $${deuda.total.toFixed(2)}`)
          console.log(`   Abonado: $${deuda.abonado.toFixed(2)}`)
          console.log(`   Pendiente: $${deuda.pendiente.toFixed(2)}`)
          console.log(`   Estado: ${deuda.estado}`)
          console.log(`   Fecha: ${deuda.fecha}`)
        })
      } else {
        console.log('✅ No hay pedidos con deudas pendientes')
      }
    }
    
    // 3. Verificar funciones de base de datos
    console.log('\n📊 3. VERIFICANDO FUNCIONES DE BASE DE DATOS...')
    
    try {
      // Probar función calcular_saldo_pendiente si existe
      const { data: funcionTest } = await supabase
        .rpc('calcular_saldo_pendiente', { pedido_id_param: 1 })
      
      if (funcionTest !== null) {
        console.log('✅ Función calcular_saldo_pendiente disponible')
      }
    } catch (error) {
      console.log('⚠️ Función calcular_saldo_pendiente no disponible:', error.message)
    }
    
    // 4. Resumen de abonos
    console.log('\n📊 4. RESUMEN DE ABONOS...')
    
    if (abonos) {
      const totalAbonosUSD = abonos.reduce((sum, abono) => sum + (abono.monto_abono_usd || 0), 0)
      const totalAbonosVES = abonos.reduce((sum, abono) => sum + (abono.monto_abono_ves || 0), 0)
      
      console.log(`📊 Total abonos USD: $${totalAbonosUSD.toFixed(2)}`)
      console.log(`📊 Total abonos VES: ${totalAbonosVES.toLocaleString()} Bs`)
      console.log(`📊 Cantidad de abonos: ${abonos.length}`)
      
      // Agrupar por estado
      const abonosPorEstado = abonos.reduce((acc, abono) => {
        const estado = abono.estado_abono || 'sin_estado'
        acc[estado] = (acc[estado] || 0) + 1
        return acc
      }, {})
      
      console.log('\n📊 Abonos por estado:')
      Object.entries(abonosPorEstado).forEach(([estado, cantidad]) => {
        console.log(`   ${estado}: ${cantidad}`)
      })
    }
    
    // 5. Recomendaciones
    console.log('\n📊 5. RECOMENDACIONES:')
    
    if (pedidos && pedidos.length > 0) {
      const pedidosPendientes = pedidos.filter(p => p.estado_entrega === 'PENDIENTE')
      console.log(`📊 Pedidos pendientes: ${pedidosPendientes.length}`)
      
      if (pedidosPendientes.length > 0) {
        console.log('💡 Recomendación: Implementar módulo de gestión de deudas')
        console.log('💡 Funcionalidades necesarias:')
        console.log('   - Lista de clientes con deudas')
        console.log('   - Registro de abonos por pedido')
        console.log('   - Actualización automática de estado')
        console.log('   - Reportes de deudas pendientes')
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar verificación
verificarEstadoDeudas()
