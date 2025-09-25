// Script para diagnosticar problemas en el módulo de ingresos
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

async function diagnosticarProblemasIngresos() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DEL MÓDULO DE INGRESOS')
  console.log('=' .repeat(80))
  
  try {
    // 1. VERIFICAR DATOS DE PEDIDOS
    console.log('\n📊 1. VERIFICANDO DATOS DE PEDIDOS...')
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select(`
        id,
        cliente_nombre,
        cliente_apellido,
        total_usd,
        fecha_pedido,
        metodo_pago,
        es_pago_mixto,
        es_abono,
        monto_mixto_usd,
        monto_mixto_ves,
        monto_abono_usd,
        monto_abono_ves,
        monto_abono_simple,
        tasa_bcv,
        referencia_pago,
        tipo_pago_abono,
        detalles_pedido
      `)
      .order('fecha_pedido', { ascending: false })
      .limit(10)
    
    if (pedidosError) {
      console.error('❌ Error obteniendo pedidos:', pedidosError)
      return
    }
    
    console.log(`📊 Encontrados ${pedidos.length} pedidos`)
    
    // Analizar cada pedido
    pedidos.forEach((pedido, index) => {
      console.log(`\n${index + 1}. PEDIDO #${pedido.id}`)
      console.log(`   Cliente: ${pedido.cliente_nombre} ${pedido.cliente_apellido}`)
      console.log(`   Fecha: ${pedido.fecha_pedido}`)
      console.log(`   Total: $${pedido.total_usd}`)
      console.log(`   Método: ${pedido.metodo_pago}`)
      console.log(`   Es abono: ${pedido.es_abono}`)
      console.log(`   Es mixto: ${pedido.es_pago_mixto}`)
      console.log(`   Tipo abono: ${pedido.tipo_pago_abono}`)
      
      // Verificar detalles del pedido
      if (pedido.detalles_pedido && Array.isArray(pedido.detalles_pedido)) {
        console.log(`   Productos:`)
        pedido.detalles_pedido.forEach((detalle, i) => {
          console.log(`     ${i + 1}. ${detalle.nombre_producto} - Cantidad: ${detalle.cantidad} - Precio: $${detalle.precio_unitario}`)
        })
        
        // Calcular total esperado
        const totalCalculado = pedido.detalles_pedido.reduce((sum, d) => 
          sum + (d.cantidad * d.precio_unitario), 0)
        console.log(`   Total calculado: $${totalCalculado.toFixed(2)}`)
        console.log(`   Total en BD: $${pedido.total_usd}`)
        console.log(`   ✅ Coincide: ${Math.abs(totalCalculado - pedido.total_usd) < 0.01}`)
      }
      
      // Verificar montos de abono
      if (pedido.es_abono) {
        console.log(`   Monto abono USD: $${pedido.monto_abono_usd || 0}`)
        console.log(`   Monto abono VES: ${pedido.monto_abono_ves || 0} Bs`)
        console.log(`   Monto abono simple: $${pedido.monto_abono_simple || 0}`)
      }
    })
    
    // 2. VERIFICAR DATOS DE ABONOS ADICIONALES
    console.log('\n📊 2. VERIFICANDO ABONOS ADICIONALES...')
    const { data: abonos, error: abonosError } = await supabase
      .from('abonos')
      .select(`
        id,
        pedido_id,
        monto_abono_usd,
        monto_abono_ves,
        tasa_bcv,
        metodo_pago_abono,
        referencia_pago,
        fecha_abono,
        comentarios,
        pedidos(
          cliente_nombre,
          cliente_apellido,
          total_usd
        )
      `)
      .order('fecha_abono', { ascending: false })
      .limit(10)
    
    if (abonosError) {
      console.error('❌ Error obteniendo abonos:', abonosError)
    } else {
      console.log(`📊 Encontrados ${abonos.length} abonos adicionales`)
      
      abonos.forEach((abono, index) => {
        console.log(`\n${index + 1}. ABONO #${abono.id}`)
        console.log(`   Pedido ID: ${abono.pedido_id}`)
        console.log(`   Cliente: ${abono.pedidos?.cliente_nombre} ${abono.pedidos?.cliente_apellido}`)
        console.log(`   Fecha: ${abono.fecha_abono}`)
        console.log(`   Monto USD: $${abono.monto_abono_usd || 0}`)
        console.log(`   Monto VES: ${abono.monto_abono_ves || 0} Bs`)
        console.log(`   Método: ${abono.metodo_pago_abono}`)
        console.log(`   Referencia: ${abono.referencia_pago}`)
        console.log(`   Comentarios: ${abono.comentarios}`)
      })
    }
    
    // 3. CALCULAR ESTADÍSTICAS REALES
    console.log('\n📊 3. CALCULANDO ESTADÍSTICAS REALES...')
    
    const hoy = new Date()
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
    const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59)
    
    console.log(`📅 Fecha hoy: ${hoy.toLocaleDateString()}`)
    console.log(`📅 Inicio hoy: ${inicioHoy.toISOString()}`)
    console.log(`📅 Fin hoy: ${finHoy.toISOString()}`)
    
    // Filtrar pedidos de hoy
    const pedidosHoy = pedidos.filter(p => {
      const fechaPedido = new Date(p.fecha_pedido)
      return fechaPedido >= inicioHoy && fechaPedido <= finHoy
    })
    
    console.log(`📊 Pedidos de hoy: ${pedidosHoy.length}`)
    
    // Calcular ingresos de hoy
    let ingresosHoyUSD = 0
    let ingresosHoyVES = 0
    
    pedidosHoy.forEach(pedido => {
      console.log(`\n   Pedido #${pedido.id}:`)
      
      if (pedido.metodo_pago === 'Contado') {
        ingresosHoyUSD += pedido.total_usd || 0
        console.log(`     Contado: $${pedido.total_usd}`)
      } else if (pedido.es_pago_mixto) {
        ingresosHoyUSD += pedido.monto_mixto_usd || 0
        ingresosHoyVES += pedido.monto_mixto_ves || 0
        console.log(`     Mixto USD: $${pedido.monto_mixto_usd}, VES: ${pedido.monto_mixto_ves}`)
      } else if (pedido.es_abono) {
        if (pedido.tipo_pago_abono === 'simple') {
          ingresosHoyUSD += pedido.monto_abono_simple || 0
          console.log(`     Abono simple: $${pedido.monto_abono_simple}`)
        } else if (pedido.tipo_pago_abono === 'mixto') {
          ingresosHoyUSD += pedido.monto_abono_usd || 0
          ingresosHoyVES += pedido.monto_abono_ves || 0
          console.log(`     Abono mixto USD: $${pedido.monto_abono_usd}, VES: ${pedido.monto_abono_ves}`)
        }
      }
    })
    
    // Calcular abonos adicionales de hoy
    if (abonos) {
      const abonosHoy = abonos.filter(a => {
        const fechaAbono = new Date(a.fecha_abono)
        return fechaAbono >= inicioHoy && fechaAbono <= finHoy
      })
      
      console.log(`📊 Abonos adicionales de hoy: ${abonosHoy.length}`)
      
      abonosHoy.forEach(abono => {
        ingresosHoyUSD += abono.monto_abono_usd || 0
        ingresosHoyVES += abono.monto_abono_ves || 0
        console.log(`   Abono #${abono.id}: USD $${abono.monto_abono_usd}, VES ${abono.monto_abono_ves}`)
      })
    }
    
    console.log(`\n💰 RESUMEN DE INGRESOS DE HOY:`)
    console.log(`   Total USD: $${ingresosHoyUSD.toFixed(2)}`)
    console.log(`   Total VES: ${ingresosHoyVES.toLocaleString()} Bs`)
    
    // 4. VERIFICAR PROBLEMA DE "ABONO A DEUDA"
    console.log('\n📊 4. VERIFICANDO CLASIFICACIÓN DE ABONOS...')
    
    // Simular la lógica del servicio de ingresos
    const ingresosFormateados = []
    
    // Procesar pedidos como ingresos
    pedidos.forEach(pedido => {
      const cliente = `${pedido.cliente_nombre || ''} ${pedido.cliente_apellido || ''}`.trim() || 'Cliente'
      
      let montoUSD = 0
      let montoVES = 0
      let tipoIngreso = 'Pago Completo de Contado'
      let metodoPago = pedido.metodo_pago || ''
      
      if (pedido.metodo_pago === 'Contado') {
        montoUSD = parseFloat(pedido.total_usd) || 0
        tipoIngreso = 'Pago Completo de Contado'
      } else if (pedido.es_pago_mixto) {
        montoUSD = parseFloat(pedido.monto_mixto_usd) || 0
        montoVES = parseFloat(pedido.monto_mixto_ves) || 0
        tipoIngreso = 'Pago Mixto'
      } else if (pedido.es_abono) {
        montoUSD = parseFloat(pedido.monto_abono_usd) || 0
        montoVES = parseFloat(pedido.monto_abono_ves) || 0
        tipoIngreso = 'Abono Inicial' // ← AQUÍ ESTÁ LA LÓGICA
      }
      
      if (montoUSD > 0 || montoVES > 0) {
        ingresosFormateados.push({
          id: `PED-${pedido.id}`,
          tipoIngreso: tipoIngreso,
          cliente: cliente,
          montoUSD: montoUSD,
          montoVES: montoVES
        })
      }
    })
    
    // Procesar abonos adicionales
    if (abonos) {
      abonos.forEach(abono => {
        const cliente = abono.pedidos ? 
          `${abono.pedidos.cliente_nombre || ''} ${abono.pedidos.cliente_apellido || ''}`.trim() : 
          'Cliente'
        
        ingresosFormateados.push({
          id: `ABO-${abono.id}`,
          tipoIngreso: 'Abono a Deuda', // ← AQUÍ ESTÁ LA LÓGICA
          cliente: cliente,
          montoUSD: parseFloat(abono.monto_abono_usd) || 0,
          montoVES: parseFloat(abono.monto_abono_ves) || 0
        })
      })
    }
    
    console.log(`\n📊 CLASIFICACIÓN DE INGRESOS:`)
    ingresosFormateados.forEach(ingreso => {
      console.log(`   ${ingreso.id}: ${ingreso.tipoIngreso} - ${ingreso.cliente} - USD: $${ingreso.montoUSD}, VES: ${ingreso.montoVES}`)
    })
    
    // 5. RESUMEN FINAL
    console.log('\n📊 5. RESUMEN FINAL:')
    console.log(`   Total pedidos: ${pedidos.length}`)
    console.log(`   Total abonos adicionales: ${abonos ? abonos.length : 0}`)
    console.log(`   Total ingresos formateados: ${ingresosFormateados.length}`)
    console.log(`   Ingresos de hoy: $${ingresosHoyUSD.toFixed(2)} USD, ${ingresosHoyVES.toLocaleString()} VES`)
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar diagnóstico
diagnosticarProblemasIngresos()
