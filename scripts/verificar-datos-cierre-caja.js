// Script para verificar qué datos se están mostrando en el Cierre de Caja
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

async function verificarDatosCierreCaja() {
  console.log('🔍 VERIFICANDO DATOS DEL CIERRE DE CAJA')
  console.log('=' .repeat(80))
  
  try {
    // 1. Verificar la hora actual
    console.log('\n📊 1. HORA ACTUAL...')
    const ahora = new Date()
    console.log(`🕐 Hora actual: ${ahora.toLocaleString('es-VE')}`)
    console.log(`🕐 UTC: ${ahora.toISOString()}`)
    console.log(`🕐 Zona horaria: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`)
    
    // 2. Simular la función getIngresosPorRango para fecha 25/09/2025
    console.log('\n📊 2. SIMULANDO FILTRADO PARA 25/09/2025...')
    
    const fechaSeleccionada = '2025-09-25'
    
    // Convertir fechas a UTC considerando zona horaria local
    const inicio = new Date(fechaSeleccionada + 'T00:00:00')
    const fin = new Date(fechaSeleccionada + 'T23:59:59')
    
    console.log(`📅 Fecha seleccionada: ${fechaSeleccionada}`)
    console.log(`📅 Inicio local: ${inicio.toLocaleString('es-VE')}`)
    console.log(`📅 Fin local: ${fin.toLocaleString('es-VE')}`)
    
    // Ajustar a UTC para comparación con datos de BD
    const inicioUTC = new Date(inicio.getTime() - (inicio.getTimezoneOffset() * 60000))
    const finUTC = new Date(fin.getTime() - (fin.getTimezoneOffset() * 60000))
    
    console.log(`📅 Inicio UTC: ${inicioUTC.toISOString()}`)
    console.log(`📅 Fin UTC: ${finUTC.toISOString()}`)
    
    // 3. Obtener todos los ingresos (pedidos + abonos)
    console.log('\n📊 3. OBTENIENDO TODOS LOS INGRESOS...')
    
    // Obtener pedidos
    const { data: pedidosData, error: pedidosError } = await supabase
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
      .order('fecha_pedido', { ascending: false })
    
    if (pedidosError) {
      console.error('❌ Error obteniendo pedidos:', pedidosError)
      return
    }
    
    // Obtener abonos
    const { data: abonosData, error: abonosError } = await supabase
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
      .order('fecha_abono', { ascending: false })
    
    if (abonosError) {
      console.error('❌ Error obteniendo abonos:', abonosError)
      return
    }
    
    console.log(`✅ Pedidos obtenidos: ${pedidosData.length}`)
    console.log(`✅ Abonos obtenidos: ${abonosData.length}`)
    
    // 4. Procesar ingresos como lo hace el servicio
    console.log('\n📊 4. PROCESANDO INGRESOS...')
    
    const ingresosFormateados = []
    
    // Procesar pedidos
    pedidosData.forEach(pedido => {
      const fechaPedido = new Date(pedido.fecha_pedido)
      const esValido = fechaPedido >= inicioUTC && fechaPedido <= finUTC
      
      if (esValido) {
        console.log(`✅ Pedido #${pedido.id} incluido:`, {
          fecha: pedido.fecha_pedido,
          fechaLocal: fechaPedido.toLocaleString('es-VE'),
          cliente: `${pedido.cliente_nombre} ${pedido.cliente_apellido}`,
          total: pedido.total_usd,
          esAbono: pedido.es_abono
        })
        
        ingresosFormateados.push({
          id: `pedido-${pedido.id}`,
          fecha: pedido.fecha_pedido,
          cliente: `${pedido.cliente_nombre} ${pedido.cliente_apellido}`,
          montoUSD: pedido.total_usd,
          montoVES: 0,
          metodoPago: pedido.metodo_pago,
          referencia: pedido.referencia_pago || '',
          tipoIngreso: pedido.es_abono ? 'Abono Inicial' : 'Pago Completo de Contado'
        })
      } else {
        console.log(`❌ Pedido #${pedido.id} excluido:`, {
          fecha: pedido.fecha_pedido,
          fechaLocal: fechaPedido.toLocaleString('es-VE'),
          cliente: `${pedido.cliente_nombre} ${pedido.cliente_apellido}`,
          total: pedido.total_usd
        })
      }
    })
    
    // Procesar abonos
    abonosData.forEach(abono => {
      const fechaAbono = new Date(abono.fecha_abono)
      const esValido = fechaAbono >= inicioUTC && fechaAbono <= finUTC
      
      if (esValido) {
        console.log(`✅ Abono #${abono.id} incluido:`, {
          fecha: abono.fecha_abono,
          fechaLocal: fechaAbono.toLocaleString('es-VE'),
          pedido: abono.pedido_id,
          montoUSD: abono.monto_abono_usd,
          montoVES: abono.monto_abono_ves
        })
        
        // Buscar el cliente del pedido
        const pedido = pedidosData.find(p => p.id === abono.pedido_id)
        const cliente = pedido ? `${pedido.cliente_nombre} ${pedido.cliente_apellido}` : 'Cliente no encontrado'
        
        ingresosFormateados.push({
          id: `abono-${abono.id}`,
          fecha: abono.fecha_abono,
          cliente: cliente,
          montoUSD: abono.monto_abono_usd,
          montoVES: abono.monto_abono_ves,
          metodoPago: abono.metodo_pago_abono,
          referencia: abono.referencia_pago || '',
          tipoIngreso: 'Abono a Deuda'
        })
      } else {
        console.log(`❌ Abono #${abono.id} excluido:`, {
          fecha: abono.fecha_abono,
          fechaLocal: fechaAbono.toLocaleString('es-VE'),
          pedido: abono.pedido_id,
          montoUSD: abono.monto_abono_usd,
          montoVES: abono.monto_abono_ves
        })
      }
    })
    
    // 5. Resumen final
    console.log('\n📊 5. RESUMEN FINAL...')
    console.log(`✅ Ingresos del 25/09/2025: ${ingresosFormateados.length}`)
    
    if (ingresosFormateados.length > 0) {
      console.log('\n📋 DETALLE DE INGRESOS:')
      ingresosFormateados.forEach((ingreso, index) => {
        console.log(`   ${index + 1}. ${ingreso.tipoIngreso}:`)
        console.log(`      Cliente: ${ingreso.cliente}`)
        console.log(`      Fecha: ${ingreso.fecha}`)
        console.log(`      USD: $${ingreso.montoUSD}`)
        console.log(`      VES: ${ingreso.montoVES} Bs`)
        console.log(`      Método: ${ingreso.metodoPago}`)
        console.log(`      Referencia: ${ingreso.referencia}`)
      })
    } else {
      console.log('❌ NO HAY INGRESOS PARA EL 25/09/2025')
      console.log('💡 Esto es correcto porque son las 12:05 AM y no has hecho pedidos hoy')
    }
    
    // 6. Verificar qué datos se están mostrando incorrectamente
    console.log('\n📊 6. VERIFICANDO DATOS INCORRECTOS...')
    
    // Buscar datos del 24/09 que podrían estar apareciendo
    const fecha24 = '2025-09-24'
    const inicio24 = new Date(fecha24 + 'T00:00:00')
    const fin24 = new Date(fecha24 + 'T23:59:59')
    const inicio24UTC = new Date(inicio24.getTime() - (inicio24.getTimezoneOffset() * 60000))
    const fin24UTC = new Date(fin24.getTime() - (fin24.getTimezoneOffset() * 60000))
    
    console.log(`📅 Rango del 24/09:`)
    console.log(`   Inicio UTC: ${inicio24UTC.toISOString()}`)
    console.log(`   Fin UTC: ${fin24UTC.toISOString()}`)
    
    const datos24 = []
    
    // Verificar pedidos del 24
    pedidosData.forEach(pedido => {
      const fechaPedido = new Date(pedido.fecha_pedido)
      const esDel24 = fechaPedido >= inicio24UTC && fechaPedido <= fin24UTC
      
      if (esDel24) {
        datos24.push({
          tipo: 'Pedido',
          id: pedido.id,
          fecha: pedido.fecha_pedido,
          fechaLocal: fechaPedido.toLocaleString('es-VE'),
          cliente: `${pedido.cliente_nombre} ${pedido.cliente_apellido}`,
          total: pedido.total_usd
        })
      }
    })
    
    // Verificar abonos del 24
    abonosData.forEach(abono => {
      const fechaAbono = new Date(abono.fecha_abono)
      const esDel24 = fechaAbono >= inicio24UTC && fechaAbono <= fin24UTC
      
      if (esDel24) {
        datos24.push({
          tipo: 'Abono',
          id: abono.id,
          fecha: abono.fecha_abono,
          fechaLocal: fechaAbono.toLocaleString('es-VE'),
          pedido: abono.pedido_id,
          montoUSD: abono.monto_abono_usd,
          montoVES: abono.monto_abono_ves
        })
      }
    })
    
    console.log(`\n📋 DATOS DEL 24/09 QUE PODRÍAN ESTAR APARECIENDO:`)
    datos24.forEach((dato, index) => {
      console.log(`   ${index + 1}. ${dato.tipo} #${dato.id}:`)
      console.log(`      Fecha BD: ${dato.fecha}`)
      console.log(`      Fecha Local: ${dato.fechaLocal}`)
      if (dato.tipo === 'Pedido') {
        console.log(`      Cliente: ${dato.cliente}`)
        console.log(`      Total: $${dato.total}`)
      } else {
        console.log(`      Pedido: #${dato.pedido}`)
        console.log(`      Monto USD: $${dato.montoUSD}`)
        console.log(`      Monto VES: ${dato.montoVES} Bs`)
      }
    })
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar verificación
verificarDatosCierreCaja()
