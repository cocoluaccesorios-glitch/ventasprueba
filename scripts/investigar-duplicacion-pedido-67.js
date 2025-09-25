// Script para investigar por qué el pedido #67 sigue apareciendo duplicado
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

async function investigarDuplicacionPedido67() {
  console.log('🔍 INVESTIGANDO POR QUÉ EL PEDIDO #67 SIGUE DUPLICADO')
  console.log('=' .repeat(80))
  
  try {
    // 1. Verificar estado actual del pedido #67
    console.log('\n📊 1. ESTADO ACTUAL DEL PEDIDO #67...')
    
    const { data: pedido67, error: pedido67Error } = await supabase
      .from('pedidos')
      .select(`
        id,
        cliente_nombre,
        cliente_apellido,
        fecha_pedido,
        total_usd,
        metodo_pago,
        referencia_pago,
        es_abono,
        monto_abono_usd,
        monto_abono_ves,
        es_pago_mixto,
        monto_mixto_usd,
        monto_mixto_ves
      `)
      .eq('id', 67)
      .single()
    
    if (pedido67Error) {
      console.error('❌ Error obteniendo pedido #67:', pedido67Error)
      return
    }
    
    console.log(`✅ Pedido #67 actual:`)
    console.log(`   Cliente: ${pedido67.cliente_nombre} ${pedido67.cliente_apellido}`)
    console.log(`   Fecha: ${new Date(pedido67.fecha_pedido).toLocaleString('es-VE')}`)
    console.log(`   Total USD: $${pedido67.total_usd}`)
    console.log(`   Método: ${pedido67.metodo_pago}`)
    console.log(`   Referencia: ${pedido67.referencia_pago || 'Sin referencia'}`)
    console.log(`   Es Abono: ${pedido67.es_abono}`)
    console.log(`   Monto Abono USD: $${pedido67.monto_abono_usd}`)
    console.log(`   Monto Abono VES: ${pedido67.monto_abono_ves} Bs`)
    console.log(`   Es Pago Mixto: ${pedido67.es_pago_mixto}`)
    console.log(`   Monto Mixto USD: $${pedido67.monto_mixto_usd}`)
    console.log(`   Monto Mixto VES: ${pedido67.monto_mixto_ves} Bs`)
    
    // 2. Simular cómo se procesa en getIngresos()
    console.log('\n📊 2. SIMULANDO PROCESAMIENTO EN getIngresos()...')
    
    console.log(`🔍 Procesando pedido #67:`)
    console.log(`   metodo_pago: "${pedido67.metodo_pago}"`)
    console.log(`   es_pago_mixto: ${pedido67.es_pago_mixto}`)
    console.log(`   es_abono: ${pedido67.es_abono}`)
    
    let montoUSD = 0
    let montoVES = 0
    let tipoIngreso = 'Pago Completo de Contado'
    
    if (pedido67.metodo_pago === 'Contado') {
      montoUSD = parseFloat(pedido67.total_usd) || 0
      tipoIngreso = 'Pago Completo de Contado'
      console.log(`   ✅ Caso: Contado -> USD: $${montoUSD}`)
    } else if (pedido67.es_pago_mixto) {
      montoUSD = parseFloat(pedido67.monto_mixto_usd) || 0
      montoVES = parseFloat(pedido67.monto_mixto_ves) || 0
      tipoIngreso = 'Pago Mixto'
      console.log(`   ✅ Caso: Pago Mixto -> USD: $${montoUSD}, VES: ${montoVES} Bs`)
    } else if (pedido67.es_abono) {
      montoUSD = parseFloat(pedido67.monto_abono_usd) || 0
      montoVES = parseFloat(pedido67.monto_abono_ves) || 0
      tipoIngreso = 'Abono Inicial'
      console.log(`   ✅ Caso: Abono Inicial -> USD: $${montoUSD}, VES: ${montoVES} Bs`)
    } else {
      montoUSD = parseFloat(pedido67.total_usd) || 0
      tipoIngreso = 'Pago Completo de Contado'
      console.log(`   ✅ Caso: Otros -> USD: $${montoUSD}`)
    }
    
    console.log(`\n📋 RESULTADO DEL PROCESAMIENTO:`)
    console.log(`   Tipo: ${tipoIngreso}`)
    console.log(`   Monto USD: $${montoUSD}`)
    console.log(`   Monto VES: ${montoVES} Bs`)
    
    // 3. Verificar abonos asociados
    console.log('\n📊 3. ABONOS ASOCIADOS AL PEDIDO #67...')
    
    const { data: abonos67, error: abonos67Error } = await supabase
      .from('abonos')
      .select(`
        id,
        monto_abono_usd,
        monto_abono_ves,
        metodo_pago_abono,
        referencia_pago
      `)
      .eq('pedido_id', 67)
      .order('fecha_abono', { ascending: false })
    
    if (abonos67Error) {
      console.error('❌ Error obteniendo abonos del pedido #67:', abonos67Error)
      return
    }
    
    console.log(`✅ Abonos encontrados: ${abonos67.length}`)
    abonos67.forEach((abono, index) => {
      console.log(`   ${index + 1}. Abono #${abono.id}:`)
      console.log(`      Monto USD: $${abono.monto_abono_usd}`)
      console.log(`      Monto VES: ${abono.monto_abono_ves} Bs`)
      console.log(`      Método: ${abono.metodo_pago_abono}`)
      console.log(`      Referencia: ${abono.referencia_pago}`)
    })
    
    // 4. Análisis del problema
    console.log('\n📊 4. ANÁLISIS DEL PROBLEMA...')
    
    console.log(`🔍 PROBLEMA IDENTIFICADO:`)
    console.log(`   - El pedido #67 tiene metodo_pago = "${pedido67.metodo_pago}"`)
    console.log(`   - Como no es 'Contado', 'es_pago_mixto' ni 'es_abono', va al caso 'else'`)
    console.log(`   - El caso 'else' toma el total_usd ($${pedido67.total_usd}) como ingreso`)
    console.log(`   - PERO también procesa los abonos separados`)
    console.log(`   - RESULTADO: Duplicación`)
    
    console.log(`\n💡 SOLUCIÓN:`)
    console.log(`   - El pedido #67 NO debería aparecer como ingreso`)
    console.log(`   - Solo deberían aparecer los abonos separados`)
    console.log(`   - Necesitamos excluir pedidos que tienen abonos asociados`)
    
    // 5. Verificar si hay otros pedidos con el mismo problema
    console.log('\n📊 5. VERIFICANDO OTROS PEDIDOS CON ABONOS...')
    
    const { data: pedidosConAbonos, error: pedidosConAbonosError } = await supabase
      .from('pedidos')
      .select(`
        id,
        cliente_nombre,
        cliente_apellido,
        total_usd,
        metodo_pago,
        es_abono
      `)
      .eq('es_abono', false)
      .order('id', { ascending: false })
      .limit(10)
    
    if (pedidosConAbonosError) {
      console.error('❌ Error obteniendo pedidos:', pedidosConAbonosError)
      return
    }
    
    console.log(`✅ Últimos 10 pedidos (es_abono=false):`)
    for (const pedido of pedidosConAbonos) {
      // Verificar si tiene abonos
      const { data: abonosPedido, error: abonosPedidoError } = await supabase
        .from('abonos')
        .select('id')
        .eq('pedido_id', pedido.id)
        .limit(1)
      
      const tieneAbonos = abonosPedido && abonosPedido.length > 0
      
      console.log(`   Pedido #${pedido.id}: ${pedido.cliente_nombre} ${pedido.cliente_apellido}`)
      console.log(`      Total: $${pedido.total_usd}`)
      console.log(`      Método: ${pedido.metodo_pago}`)
      console.log(`      Tiene abonos: ${tieneAbonos}`)
      
      if (tieneAbonos) {
        console.log(`      ⚠️  POSIBLE DUPLICACIÓN`)
      }
    }
    
    console.log(`\n🛠️ RECOMENDACIÓN:`)
    console.log(`   - Modificar la lógica de getIngresos()`)
    console.log(`   - Excluir pedidos que tienen abonos asociados`)
    console.log(`   - Solo procesar abonos separados para esos casos`)
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar investigación
investigarDuplicacionPedido67()
