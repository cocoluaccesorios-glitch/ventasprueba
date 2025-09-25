// Script para investigar por qué Luis Silva tiene USD y VES en el mismo registro
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

async function investigarLuisSilvaAbonoInicial() {
  console.log('🔍 INVESTIGANDO POR QUÉ LUIS SILVA TIENE USD Y VES')
  console.log('=' .repeat(80))
  
  try {
    // 1. Buscar el pedido #67 de Luis Silva
    console.log('\n📊 1. BUSCANDO PEDIDO #67 DE LUIS SILVA...')
    
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
    } else {
      console.log(`✅ Pedido #67 encontrado:`)
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
    }
    
    // 2. Buscar abonos asociados al pedido #67
    console.log('\n📊 2. BUSCANDO ABONOS PARA PEDIDO #67...')
    
    const { data: abonos67, error: abonos67Error } = await supabase
      .from('abonos')
      .select(`
        id,
        pedido_id,
        monto_abono_usd,
        monto_abono_ves,
        fecha_abono,
        metodo_pago_abono,
        referencia_pago,
        comentarios
      `)
      .eq('pedido_id', 67)
      .order('fecha_abono', { ascending: false })
    
    if (abonos67Error) {
      console.error('❌ Error obteniendo abonos del pedido #67:', abonos67Error)
    } else {
      console.log(`✅ Abonos encontrados para pedido #67: ${abonos67.length}`)
      abonos67.forEach((abono, index) => {
        console.log(`   ${index + 1}. Abono #${abono.id}:`)
        console.log(`      Fecha: ${new Date(abono.fecha_abono).toLocaleString('es-VE')}`)
        console.log(`      Monto USD: $${abono.monto_abono_usd}`)
        console.log(`      Monto VES: ${abono.monto_abono_ves} Bs`)
        console.log(`      Método: ${abono.metodo_pago_abono}`)
        console.log(`      Referencia: ${abono.referencia_pago || 'Sin referencia'}`)
        console.log(`      Comentarios: ${abono.comentarios || 'Sin comentarios'}`)
      })
    }
    
    // 3. Simular cómo se procesa en getIngresos()
    console.log('\n📊 3. SIMULANDO PROCESAMIENTO EN getIngresos()...')
    
    if (pedido67) {
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
    }
    
    // 4. Verificar si hay duplicación de datos
    console.log('\n📊 4. VERIFICANDO POSIBLE DUPLICACIÓN...')
    
    // Buscar si hay otros pedidos de Luis Silva el mismo día
    const { data: otrosPedidosLuis, error: otrosPedidosLuisError } = await supabase
      .from('pedidos')
      .select(`
        id,
        cliente_nombre,
        cliente_apellido,
        fecha_pedido,
        total_usd,
        es_abono,
        monto_abono_usd,
        monto_abono_ves
      `)
      .eq('cliente_nombre', 'Luis')
      .eq('cliente_apellido', 'Silva')
      .gte('fecha_pedido', '2025-09-24T00:00:00')
      .lt('fecha_pedido', '2025-09-25T00:00:00')
      .order('fecha_pedido', { ascending: false })
    
    if (otrosPedidosLuisError) {
      console.error('❌ Error obteniendo otros pedidos de Luis Silva:', otrosPedidosLuisError)
    } else {
      console.log(`✅ Pedidos de Luis Silva del 24/09: ${otrosPedidosLuis.length}`)
      otrosPedidosLuis.forEach((pedido, index) => {
        console.log(`   ${index + 1}. Pedido #${pedido.id}:`)
        console.log(`      Fecha: ${new Date(pedido.fecha_pedido).toLocaleString('es-VE')}`)
        console.log(`      Total: $${pedido.total_usd}`)
        console.log(`      Es Abono: ${pedido.es_abono}`)
        console.log(`      Monto Abono USD: $${pedido.monto_abono_usd}`)
        console.log(`      Monto Abono VES: ${pedido.monto_abono_ves} Bs`)
      })
    }
    
    // 5. Análisis del problema
    console.log('\n📊 5. ANÁLISIS DEL PROBLEMA...')
    
    if (pedido67) {
      console.log(`🔍 PROBLEMA IDENTIFICADO:`)
      console.log(`   - El pedido #67 tiene es_abono=true`)
      console.log(`   - Monto Abono USD: $${pedido67.monto_abono_usd}`)
      console.log(`   - Monto Abono VES: ${pedido67.monto_abono_ves} Bs`)
      
      if (pedido67.monto_abono_usd > 0 && pedido67.monto_abono_ves > 0) {
        console.log(`\n💡 CAUSA:`)
        console.log(`   El pedido #67 tiene AMBOS montos de abono (USD y VES)`)
        console.log(`   Esto indica que fue un pago mixto o hay datos incorrectos`)
        console.log(`   La lógica de getIngresos() toma ambos valores`)
        
        console.log(`\n🛠️ SOLUCIONES POSIBLES:`)
        console.log(`   1. Verificar si el pago fue realmente mixto`)
        console.log(`   2. Corregir los datos en la base de datos`)
        console.log(`   3. Ajustar la lógica para manejar pagos mixtos`)
        console.log(`   4. Separar en dos registros (uno USD, uno VES)`)
      } else if (pedido67.monto_abono_usd > 0 && pedido67.monto_abono_ves === 0) {
        console.log(`\n✅ CORRECTO:`)
        console.log(`   Solo tiene monto USD, no debería mostrar VES`)
        console.log(`   Posible problema en la lógica de procesamiento`)
      } else if (pedido67.monto_abono_usd === 0 && pedido67.monto_abono_ves > 0) {
        console.log(`\n✅ CORRECTO:`)
        console.log(`   Solo tiene monto VES, no debería mostrar USD`)
        console.log(`   Posible problema en la lógica de procesamiento`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar investigación
investigarLuisSilvaAbonoInicial()
