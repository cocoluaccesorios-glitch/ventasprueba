// Script para investigar por qué no aparece Prueba2 Apellido2 en el Cierre de Caja
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

async function investigarPrueba2Apellido2() {
  console.log('🔍 INVESTIGANDO POR QUÉ NO APARECE PRUEBA2 APELLIDO2')
  console.log('=' .repeat(80))
  
  try {
    // 1. Buscar específicamente el pedido #65 de Prueba2 Apellido2
    console.log('\n📊 1. BUSCANDO PEDIDO #65...')
    
    const { data: pedido65, error: pedido65Error } = await supabase
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
        monto_abono_ves
      `)
      .eq('id', 65)
      .single()
    
    if (pedido65Error) {
      console.error('❌ Error obteniendo pedido #65:', pedido65Error)
    } else {
      console.log(`✅ Pedido #65 encontrado:`)
      console.log(`   Cliente: ${pedido65.cliente_nombre} ${pedido65.cliente_apellido}`)
      console.log(`   Fecha BD: ${pedido65.fecha_pedido}`)
      console.log(`   Fecha Local: ${new Date(pedido65.fecha_pedido).toLocaleString('es-VE')}`)
      console.log(`   Total: $${pedido65.total_usd}`)
      console.log(`   Método: ${pedido65.metodo_pago}`)
      console.log(`   Referencia: ${pedido65.referencia_pago || 'Sin referencia'}`)
      console.log(`   Es Abono: ${pedido65.es_abono}`)
      console.log(`   Monto Abono USD: $${pedido65.monto_abono_usd}`)
      console.log(`   Monto Abono VES: ${pedido65.monto_abono_ves} Bs`)
    }
    
    // 2. Verificar si hay abonos para el pedido #65
    console.log('\n📊 2. BUSCANDO ABONOS PARA PEDIDO #65...')
    
    const { data: abonos65, error: abonos65Error } = await supabase
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
      .eq('pedido_id', 65)
      .order('fecha_abono', { ascending: false })
    
    if (abonos65Error) {
      console.error('❌ Error obteniendo abonos del pedido #65:', abonos65Error)
    } else {
      console.log(`✅ Abonos encontrados para pedido #65: ${abonos65.length}`)
      abonos65.forEach((abono, index) => {
        console.log(`   ${index + 1}. Abono #${abono.id}:`)
        console.log(`      Fecha BD: ${abono.fecha_abono}`)
        console.log(`      Fecha Local: ${new Date(abono.fecha_abono).toLocaleString('es-VE')}`)
        console.log(`      Monto USD: $${abono.monto_abono_usd}`)
        console.log(`      Monto VES: ${abono.monto_abono_ves} Bs`)
        console.log(`      Método: ${abono.metodo_pago_abono}`)
        console.log(`      Referencia: ${abono.referencia_pago || 'Sin referencia'}`)
      })
    }
    
    // 3. Simular el filtrado para el 24/09/2025
    console.log('\n📊 3. SIMULANDO FILTRADO PARA 24/09/2025...')
    
    const fecha24 = '2025-09-24'
    const inicio = new Date(fecha24 + 'T00:00:00')
    const fin = new Date(fecha24 + 'T23:59:59')
    
    console.log(`📅 Rango del 24/09:`)
    console.log(`   Inicio: ${inicio.toLocaleString('es-VE')}`)
    console.log(`   Fin: ${fin.toLocaleString('es-VE')}`)
    console.log(`   Inicio ISO: ${inicio.toISOString()}`)
    console.log(`   Fin ISO: ${fin.toISOString()}`)
    
    // Verificar si el pedido #65 debería estar incluido
    if (pedido65) {
      const fechaPedido65 = new Date(pedido65.fecha_pedido)
      const esValido = fechaPedido65 >= inicio && fechaPedido65 <= fin
      
      console.log(`\n🔍 Verificando pedido #65:`)
      console.log(`   Fecha pedido: ${fechaPedido65.toLocaleString('es-VE')}`)
      console.log(`   Fecha pedido ISO: ${fechaPedido65.toISOString()}`)
      console.log(`   ¿Está en rango?: ${esValido}`)
      console.log(`   Comparación: ${fechaPedido65.toISOString()} >= ${inicio.toISOString()} && ${fechaPedido65.toISOString()} <= ${fin.toISOString()}`)
      
      if (esValido) {
        console.log(`✅ El pedido #65 DEBERÍA aparecer en el Cierre de Caja del 24/09`)
      } else {
        console.log(`❌ El pedido #65 NO debería aparecer en el Cierre de Caja del 24/09`)
      }
    }
    
    // 4. Verificar todos los pedidos del 24/09
    console.log('\n📊 4. VERIFICANDO TODOS LOS PEDIDOS DEL 24/09...')
    
    const { data: todosPedidos24, error: todosPedidos24Error } = await supabase
      .from('pedidos')
      .select(`
        id,
        cliente_nombre,
        cliente_apellido,
        fecha_pedido,
        total_usd,
        es_abono
      `)
      .gte('fecha_pedido', '2025-09-24T00:00:00')
      .lt('fecha_pedido', '2025-09-25T00:00:00')
      .order('fecha_pedido', { ascending: false })
    
    if (todosPedidos24Error) {
      console.error('❌ Error obteniendo todos los pedidos del 24/09:', todosPedidos24Error)
    } else {
      console.log(`✅ Pedidos del 24/09 encontrados: ${todosPedidos24.length}`)
      todosPedidos24.forEach((pedido, index) => {
        const fechaLocal = new Date(pedido.fecha_pedido).toLocaleString('es-VE')
        console.log(`   ${index + 1}. Pedido #${pedido.id}:`)
        console.log(`      Cliente: ${pedido.cliente_nombre} ${pedido.cliente_apellido}`)
        console.log(`      Fecha BD: ${pedido.fecha_pedido}`)
        console.log(`      Fecha Local: ${fechaLocal}`)
        console.log(`      Total: $${pedido.total_usd}`)
        console.log(`      Es Abono: ${pedido.es_abono}`)
      })
    }
    
    // 5. Verificar todos los abonos del 24/09
    console.log('\n📊 5. VERIFICANDO TODOS LOS ABONOS DEL 24/09...')
    
    const { data: todosAbonos24, error: todosAbonos24Error } = await supabase
      .from('abonos')
      .select(`
        id,
        pedido_id,
        monto_abono_usd,
        monto_abono_ves,
        fecha_abono,
        metodo_pago_abono
      `)
      .gte('fecha_abono', '2025-09-24T00:00:00')
      .lt('fecha_abono', '2025-09-25T00:00:00')
      .order('fecha_abono', { ascending: false })
    
    if (todosAbonos24Error) {
      console.error('❌ Error obteniendo todos los abonos del 24/09:', todosAbonos24Error)
    } else {
      console.log(`✅ Abonos del 24/09 encontrados: ${todosAbonos24.length}`)
      todosAbonos24.forEach((abono, index) => {
        const fechaLocal = new Date(abono.fecha_abono).toLocaleString('es-VE')
        console.log(`   ${index + 1}. Abono #${abono.id}:`)
        console.log(`      Pedido: #${abono.pedido_id}`)
        console.log(`      Fecha BD: ${abono.fecha_abono}`)
        console.log(`      Fecha Local: ${fechaLocal}`)
        console.log(`      Monto USD: $${abono.monto_abono_usd}`)
        console.log(`      Monto VES: ${abono.monto_abono_ves} Bs`)
        console.log(`      Método: ${abono.metodo_pago_abono}`)
      })
    }
    
    // 6. Análisis del problema
    console.log('\n📊 6. ANÁLISIS DEL PROBLEMA...')
    
    if (pedido65) {
      const fechaPedido65 = new Date(pedido65.fecha_pedido)
      const esDel24 = fechaPedido65 >= inicio && fechaPedido65 <= fin
      
      console.log(`🔍 PROBLEMA IDENTIFICADO:`)
      console.log(`   - Pedido #65 existe en la base de datos`)
      console.log(`   - Cliente: ${pedido65.cliente_nombre} ${pedido65.cliente_apellido}`)
      console.log(`   - Fecha: ${fechaPedido65.toLocaleString('es-VE')}`)
      console.log(`   - ¿Es del 24/09?: ${esDel24}`)
      
      if (esDel24) {
        console.log(`\n💡 POSIBLES CAUSAS:`)
        console.log(`   1. El pedido #65 no se está procesando en getIngresos()`)
        console.log(`   2. Hay un problema en la lógica de procesamiento de pedidos`)
        console.log(`   3. El pedido #65 está marcado como es_abono=false pero debería ser true`)
        console.log(`   4. Hay un problema en la función getIngresosPorRango()`)
        
        console.log(`\n🛠️ RECOMENDACIONES:`)
        console.log(`   1. Verificar la función getIngresos() en ingresosService.js`)
        console.log(`   2. Revisar la lógica de procesamiento de pedidos`)
        console.log(`   3. Verificar si el pedido #65 tiene es_abono=true`)
        console.log(`   4. Revisar la función getIngresosPorRango()`)
      } else {
        console.log(`\n✅ CONCLUSIÓN:`)
        console.log(`   El pedido #65 NO es del 24/09, por eso no aparece en el Cierre de Caja`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar investigación
investigarPrueba2Apellido2()
