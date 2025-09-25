// Script para investigar el problema de fechas y horas
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

async function investigarProblemaFechas() {
  console.log('🕐 INVESTIGANDO PROBLEMA DE FECHAS Y HORAS')
  console.log('=' .repeat(80))
  
  try {
    // 1. Verificar la hora actual del sistema
    console.log('\n📊 1. HORA ACTUAL DEL SISTEMA...')
    const ahora = new Date()
    console.log(`🕐 Hora actual: ${ahora.toLocaleString('es-VE')}`)
    console.log(`🕐 UTC: ${ahora.toISOString()}`)
    console.log(`🕐 Zona horaria: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`)
    
    // 2. Verificar pedidos del 24 de septiembre
    console.log('\n📊 2. PEDIDOS DEL 24 DE SEPTIEMBRE...')
    
    const fecha24 = '2025-09-24'
    const { data: pedidos24, error: pedidos24Error } = await supabase
      .from('pedidos')
      .select('id, cliente_nombre, cliente_apellido, fecha_pedido, total_usd')
      .gte('fecha_pedido', `${fecha24}T00:00:00`)
      .lt('fecha_pedido', `${fecha24}T23:59:59`)
      .order('fecha_pedido', { ascending: false })
    
    if (pedidos24Error) {
      console.error('❌ Error obteniendo pedidos del 24:', pedidos24Error)
    } else {
      console.log(`✅ Pedidos del 24 de septiembre: ${pedidos24.length}`)
      pedidos24.forEach((pedido, index) => {
        const fechaLocal = new Date(pedido.fecha_pedido).toLocaleString('es-VE')
        console.log(`   ${index + 1}. Pedido #${pedido.id}: ${pedido.cliente_nombre} ${pedido.cliente_apellido}`)
        console.log(`      Fecha BD: ${pedido.fecha_pedido}`)
        console.log(`      Fecha Local: ${fechaLocal}`)
        console.log(`      Total: $${pedido.total_usd}`)
      })
    }
    
    // 3. Verificar pedidos del 25 de septiembre
    console.log('\n📊 3. PEDIDOS DEL 25 DE SEPTIEMBRE...')
    
    const fecha25 = '2025-09-25'
    const { data: pedidos25, error: pedidos25Error } = await supabase
      .from('pedidos')
      .select('id, cliente_nombre, cliente_apellido, fecha_pedido, total_usd')
      .gte('fecha_pedido', `${fecha25}T00:00:00`)
      .lt('fecha_pedido', `${fecha25}T23:59:59`)
      .order('fecha_pedido', { ascending: false })
    
    if (pedidos25Error) {
      console.error('❌ Error obteniendo pedidos del 25:', pedidos25Error)
    } else {
      console.log(`✅ Pedidos del 25 de septiembre: ${pedidos25.length}`)
      pedidos25.forEach((pedido, index) => {
        const fechaLocal = new Date(pedido.fecha_pedido).toLocaleString('es-VE')
        console.log(`   ${index + 1}. Pedido #${pedido.id}: ${pedido.cliente_nombre} ${pedido.cliente_apellido}`)
        console.log(`      Fecha BD: ${pedido.fecha_pedido}`)
        console.log(`      Fecha Local: ${fechaLocal}`)
        console.log(`      Total: $${pedido.total_usd}`)
      })
    }
    
    // 4. Verificar abonos del 24 de septiembre
    console.log('\n📊 4. ABONOS DEL 24 DE SEPTIEMBRE...')
    
    const { data: abonos24, error: abonos24Error } = await supabase
      .from('abonos')
      .select('id, pedido_id, monto_abono_usd, monto_abono_ves, fecha_abono, metodo_pago_abono, referencia_pago')
      .gte('fecha_abono', `${fecha24}T00:00:00`)
      .lt('fecha_abono', `${fecha24}T23:59:59`)
      .order('fecha_abono', { ascending: false })
    
    if (abonos24Error) {
      console.error('❌ Error obteniendo abonos del 24:', abonos24Error)
    } else {
      console.log(`✅ Abonos del 24 de septiembre: ${abonos24.length}`)
      abonos24.forEach((abono, index) => {
        const fechaLocal = new Date(abono.fecha_abono).toLocaleString('es-VE')
        console.log(`   ${index + 1}. Abono #${abono.id}:`)
        console.log(`      Pedido: #${abono.pedido_id}`)
        console.log(`      Fecha BD: ${abono.fecha_abono}`)
        console.log(`      Fecha Local: ${fechaLocal}`)
        console.log(`      Monto USD: $${abono.monto_abono_usd}`)
        console.log(`      Monto VES: ${abono.monto_abono_ves} Bs`)
        console.log(`      Método: ${abono.metodo_pago_abono}`)
        console.log(`      Referencia: ${abono.referencia_pago || 'Sin referencia'}`)
      })
    }
    
    // 5. Verificar abonos del 25 de septiembre
    console.log('\n📊 5. ABONOS DEL 25 DE SEPTIEMBRE...')
    
    const { data: abonos25, error: abonos25Error } = await supabase
      .from('abonos')
      .select('id, pedido_id, monto_abono_usd, monto_abono_ves, fecha_abono, metodo_pago_abono, referencia_pago')
      .gte('fecha_abono', `${fecha25}T00:00:00`)
      .lt('fecha_abono', `${fecha25}T23:59:59`)
      .order('fecha_abono', { ascending: false })
    
    if (abonos25Error) {
      console.error('❌ Error obteniendo abonos del 25:', abonos25Error)
    } else {
      console.log(`✅ Abonos del 25 de septiembre: ${abonos25.length}`)
      abonos25.forEach((abono, index) => {
        const fechaLocal = new Date(abono.fecha_abono).toLocaleString('es-VE')
        console.log(`   ${index + 1}. Abono #${abono.id}:`)
        console.log(`      Pedido: #${abono.pedido_id}`)
        console.log(`      Fecha BD: ${abono.fecha_abono}`)
        console.log(`      Fecha Local: ${fechaLocal}`)
        console.log(`      Monto USD: $${abono.monto_abono_usd}`)
        console.log(`      Monto VES: ${abono.monto_abono_ves} Bs`)
        console.log(`      Método: ${abono.metodo_pago_abono}`)
        console.log(`      Referencia: ${abono.referencia_pago || 'Sin referencia'}`)
      })
    }
    
    // 6. Verificar el problema de zona horaria
    console.log('\n📊 6. ANÁLISIS DE ZONA HORARIA...')
    
    // Crear fechas para comparar
    const fecha24Inicio = new Date('2025-09-24T00:00:00')
    const fecha24Fin = new Date('2025-09-24T23:59:59')
    const fecha25Inicio = new Date('2025-09-25T00:00:00')
    const fecha25Fin = new Date('2025-09-25T23:59:59')
    
    console.log(`📅 24/09/2025 00:00:00 UTC: ${fecha24Inicio.toISOString()}`)
    console.log(`📅 24/09/2025 23:59:59 UTC: ${fecha24Fin.toISOString()}`)
    console.log(`📅 25/09/2025 00:00:00 UTC: ${fecha25Inicio.toISOString()}`)
    console.log(`📅 25/09/2025 23:59:59 UTC: ${fecha25Fin.toISOString()}`)
    
    // Verificar si hay datos que cruzan las fechas
    console.log('\n📊 7. VERIFICANDO DATOS QUE CRUZAN FECHAS...')
    
    const { data: datosCruzados, error: cruzadosError } = await supabase
      .from('abonos')
      .select('id, pedido_id, fecha_abono, monto_abono_usd')
      .gte('fecha_abono', '2025-09-24T20:00:00')
      .lt('fecha_abono', '2025-09-25T04:00:00')
      .order('fecha_abono')
    
    if (cruzadosError) {
      console.error('❌ Error obteniendo datos cruzados:', cruzadosError)
    } else {
      console.log(`✅ Datos en el rango 24/09 20:00 - 25/09 04:00: ${datosCruzados.length}`)
      datosCruzados.forEach((dato, index) => {
        const fechaLocal = new Date(dato.fecha_abono).toLocaleString('es-VE')
        console.log(`   ${index + 1}. Abono #${dato.id}:`)
        console.log(`      Fecha BD: ${dato.fecha_abono}`)
        console.log(`      Fecha Local: ${fechaLocal}`)
        console.log(`      Monto: $${dato.monto_abono_usd}`)
      })
    }
    
    // 8. Recomendaciones
    console.log('\n📊 8. RECOMENDACIONES:')
    
    console.log('🔍 PROBLEMA IDENTIFICADO:')
    console.log('   - Son las 12:05 AM del 25 de septiembre')
    console.log('   - Pero el sistema muestra datos del 24 de septiembre')
    console.log('   - Esto indica un problema de zona horaria')
    
    console.log('\n💡 POSIBLES CAUSAS:')
    console.log('   1. Los datos se guardan en UTC pero se muestran en hora local')
    console.log('   2. La función de filtrado de fechas no considera la zona horaria')
    console.log('   3. Los datos del 24 se crearon después de medianoche del 25')
    console.log('   4. Problema en la conversión de fechas en el frontend')
    
    console.log('\n🛠️ SOLUCIONES SUGERIDAS:')
    console.log('   1. Revisar la función getIngresosPorRango en ingresosService.js')
    console.log('   2. Ajustar el filtrado para considerar zona horaria local')
    console.log('   3. Verificar cómo se guardan las fechas en la base de datos')
    console.log('   4. Implementar conversión correcta de fechas en el frontend')
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar investigación
investigarProblemaFechas()
