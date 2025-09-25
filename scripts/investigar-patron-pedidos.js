// Script para investigar el patrón de IDs y pedidos en cero
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

async function investigarPatronPedidos() {
  console.log('🔍 INVESTIGANDO PATRÓN DE PEDIDOS')
  console.log('=' .repeat(80))
  
  try {
    // 1. Obtener todos los pedidos ordenados por ID
    console.log('\n📊 1. OBTENIENDO TODOS LOS PEDIDOS...')
    
    const { data: todosPedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select('id, cliente_nombre, cliente_apellido, total_usd, estado_entrega, fecha_pedido, es_abono')
      .order('id', { ascending: true })
    
    if (pedidosError) {
      console.error('❌ Error obteniendo pedidos:', pedidosError)
      return
    }
    
    console.log(`✅ Total pedidos encontrados: ${todosPedidos.length}`)
    
    // 2. Analizar el patrón de IDs
    console.log('\n📊 2. ANALIZANDO PATRÓN DE IDs...')
    
    const ids = todosPedidos.map(p => p.id).sort((a, b) => a - b)
    console.log(`📋 IDs encontrados: ${ids.join(', ')}`)
    
    // Encontrar gaps en la secuencia
    const gaps = []
    for (let i = 0; i < ids.length - 1; i++) {
      const current = ids[i]
      const next = ids[i + 1]
      if (next - current > 1) {
        gaps.push({ from: current, to: next, missing: next - current - 1 })
      }
    }
    
    console.log(`\n🔍 GAPS ENCONTRADOS: ${gaps.length}`)
    gaps.forEach(gap => {
      console.log(`   Gap entre ${gap.from} y ${gap.to}: faltan ${gap.missing} IDs`)
      const missingIds = []
      for (let i = gap.from + 1; i < gap.to; i++) {
        missingIds.push(i)
      }
      console.log(`   IDs faltantes: ${missingIds.join(', ')}`)
    })
    
    // 3. Analizar pedidos recientes (últimos 20)
    console.log('\n📊 3. ANALIZANDO PEDIDOS RECIENTES...')
    
    const pedidosRecientes = todosPedidos.slice(-20)
    console.log(`📋 Últimos ${pedidosRecientes.length} pedidos:`)
    
    pedidosRecientes.forEach((pedido, index) => {
      const numero = pedidosRecientes.length - index
      console.log(`\n   ${numero}. Pedido #${pedido.id}:`)
      console.log(`      Cliente: ${pedido.cliente_nombre} ${pedido.cliente_apellido}`)
      console.log(`      Total: $${pedido.total_usd}`)
      console.log(`      Estado: ${pedido.estado_entrega}`)
      console.log(`      Es Abono: ${pedido.es_abono}`)
      console.log(`      Fecha: ${pedido.fecha_pedido}`)
    })
    
    // 4. Verificar pedidos con total cero o muy bajo
    console.log('\n📊 4. VERIFICANDO PEDIDOS CON TOTAL CERO O BAJO...')
    
    const pedidosCero = todosPedidos.filter(p => p.total_usd === 0 || p.total_usd < 1)
    console.log(`⚠️ Pedidos con total cero o muy bajo: ${pedidosCero.length}`)
    
    if (pedidosCero.length > 0) {
      pedidosCero.forEach(pedido => {
        console.log(`\n   Pedido #${pedido.id}:`)
        console.log(`      Cliente: ${pedido.cliente_nombre} ${pedido.cliente_apellido}`)
        console.log(`      Total: $${pedido.total_usd}`)
        console.log(`      Estado: ${pedido.estado_entrega}`)
        console.log(`      Es Abono: ${pedido.es_abono}`)
        console.log(`      Fecha: ${pedido.fecha_pedido}`)
      })
    }
    
    // 5. Verificar pedidos marcados como PAGADO
    console.log('\n📊 5. VERIFICANDO PEDIDOS MARCADOS COMO PAGADO...')
    
    const pedidosPagados = todosPedidos.filter(p => p.estado_entrega === 'pagado')
    console.log(`✅ Pedidos marcados como PAGADO: ${pedidosPagados.length}`)
    
    if (pedidosPagados.length > 0) {
      console.log('\n📋 PEDIDOS PAGADOS:')
      pedidosPagados.forEach(pedido => {
        console.log(`\n   Pedido #${pedido.id}:`)
        console.log(`      Cliente: ${pedido.cliente_nombre} ${pedido.cliente_apellido}`)
        console.log(`      Total: $${pedido.total_usd}`)
        console.log(`      Es Abono: ${pedido.es_abono}`)
        console.log(`      Fecha: ${pedido.fecha_pedido}`)
      })
    }
    
    // 6. Verificar abonos relacionados con pedidos pagados
    console.log('\n📊 6. VERIFICANDO ABONOS DE PEDIDOS PAGADOS...')
    
    for (const pedido of pedidosPagados.slice(0, 5)) { // Solo los primeros 5
      const { data: abonos, error: abonosError } = await supabase
        .from('abonos')
        .select('*')
        .eq('pedido_id', pedido.id)
        .order('fecha_abono', { ascending: false })
      
      if (abonosError) {
        console.error(`❌ Error obteniendo abonos del pedido #${pedido.id}:`, abonosError)
        continue
      }
      
      console.log(`\n   Pedido #${pedido.id} (${pedido.cliente_nombre} ${pedido.cliente_apellido}):`)
      console.log(`      Total Pedido: $${pedido.total_usd}`)
      console.log(`      Abonos encontrados: ${abonos.length}`)
      
      if (abonos.length > 0) {
        const totalAbonado = abonos.reduce((sum, abono) => sum + abono.monto_abono_usd, 0)
        const saldoPendiente = pedido.total_usd - totalAbonado
        
        console.log(`      Total Abonado: $${totalAbonado.toFixed(2)}`)
        console.log(`      Saldo Pendiente: $${saldoPendiente.toFixed(2)}`)
        
        if (saldoPendiente > 0.01) {
          console.log(`      ⚠️ INCONSISTENCIA: Debería tener saldo pendiente`)
        } else {
          console.log(`      ✅ Correcto: Completamente pagado`)
        }
        
        abonos.forEach((abono, index) => {
          console.log(`         Abono ${index + 1}: $${abono.monto_abono_usd} (${abono.metodo_pago_abono})`)
        })
      } else {
        console.log(`      ⚠️ SIN ABONOS: ¿Por qué está marcado como pagado?`)
      }
    }
    
    // 7. Verificar si hay pedidos eliminados o anulados
    console.log('\n📊 7. VERIFICANDO PEDIDOS ANULADOS...')
    
    const pedidosAnulados = todosPedidos.filter(p => p.estado_entrega === 'anulado')
    console.log(`🗑️ Pedidos anulados: ${pedidosAnulados.length}`)
    
    if (pedidosAnulados.length > 0) {
      pedidosAnulados.forEach(pedido => {
        console.log(`   Pedido #${pedido.id}: ${pedido.cliente_nombre} ${pedido.cliente_apellido} - $${pedido.total_usd}`)
      })
    }
    
    // 8. Analizar el patrón de creación
    console.log('\n📊 8. ANALIZANDO PATRÓN DE CREACIÓN...')
    
    // Agrupar por fecha
    const pedidosPorFecha = {}
    todosPedidos.forEach(pedido => {
      const fecha = pedido.fecha_pedido.split('T')[0]
      if (!pedidosPorFecha[fecha]) {
        pedidosPorFecha[fecha] = []
      }
      pedidosPorFecha[fecha].push(pedido)
    })
    
    console.log(`📅 Pedidos por fecha:`)
    Object.keys(pedidosPorFecha).sort().slice(-10).forEach(fecha => {
      const pedidosDelDia = pedidosPorFecha[fecha]
      const idsDelDia = pedidosDelDia.map(p => p.id).sort((a, b) => a - b)
      console.log(`   ${fecha}: ${pedidosDelDia.length} pedidos - IDs: ${idsDelDia.join(', ')}`)
    })
    
    // 9. Recomendaciones
    console.log('\n📊 9. RECOMENDACIONES:')
    
    if (gaps.length > 0) {
      console.log('🔍 PROBLEMAS IDENTIFICADOS:')
      console.log('   1. Hay gaps en la secuencia de IDs')
      console.log('   2. Esto puede indicar pedidos eliminados o errores en la creación')
      console.log('   3. Los IDs faltantes pueden haber sido eliminados o nunca creados')
    }
    
    if (pedidosCero.length > 0) {
      console.log('   4. Hay pedidos con total cero o muy bajo')
      console.log('   5. Esto puede indicar errores en el cálculo o pedidos de prueba')
    }
    
    if (pedidosPagados.length > 0) {
      console.log('   6. Hay pedidos marcados como PAGADO')
      console.log('   7. Verificar si realmente están completamente pagados')
    }
    
    console.log('\n💡 POSIBLES CAUSAS:')
    console.log('   - Pedidos de prueba que se eliminaron')
    console.log('   - Errores durante la creación de pedidos')
    console.log('   - Pedidos anulados que no se marcaron correctamente')
    console.log('   - Problemas en el proceso de guardado')
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar investigación
investigarPatronPedidos()
