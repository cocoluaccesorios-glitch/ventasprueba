// Servicio para gestión de ingresos
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient.js'
import Swal from 'sweetalert2'

// Modo de desarrollo - usar datos de prueba si no hay conexión
const USE_MOCK_DATA = false

// Datos mock para fallback
const mockIngresos = [
  {
    id: 'ING-001',
    fecha: new Date('2024-01-15').toISOString(),
    idVenta: 'VTA-20240115-01',
    cliente: 'Juan Pérez',
    montoUSD: 150.00,
    montoVES: 5250000.00,
    metodoPago: 'Efectivo (USD)',
    referencia: '',
    tipoIngreso: 'Pago Completo de Contado',
    descripcion: 'Venta de productos electrónicos'
  },
  {
    id: 'ING-002',
    fecha: new Date('2024-01-15').toISOString(),
    idVenta: 'VTA-20240115-02',
    cliente: 'María González',
    montoUSD: 75.50,
    montoVES: 2642500.00,
    metodoPago: 'Zelle (USD)',
    referencia: 'ZELLE-123456',
    tipoIngreso: 'Pago Completo de Contado',
    descripcion: 'Venta de productos del hogar'
  },
  {
    id: 'ING-003',
    fecha: new Date('2024-01-16').toISOString(),
    idVenta: 'VTA-20240116-01',
    cliente: 'Carlos Rodríguez',
    montoUSD: 200.00,
    montoVES: 7000000.00,
    metodoPago: 'Pago Móvil (VES)',
    referencia: 'PM-987654321',
    tipoIngreso: 'Abono Inicial',
    descripcion: 'Abono inicial de venta a crédito'
  },
  {
    id: 'ING-004',
    fecha: new Date('2024-01-16').toISOString(),
    idVenta: 'VTA-20240115-02',
    cliente: 'María González',
    montoUSD: 25.00,
    montoVES: 875000.00,
    metodoPago: 'Transferencia (VES)',
    referencia: 'TRF-456789',
    tipoIngreso: 'Abono a Deuda',
    descripcion: 'Abono adicional a deuda pendiente'
  },
  {
    id: 'ING-005',
    fecha: new Date('2024-01-17').toISOString(),
    idVenta: 'VTA-20240117-01',
    cliente: 'Ana Martínez',
    montoUSD: 100.00,
    montoVES: 3500000.00,
    metodoPago: 'Punto de Venta (VES)',
    referencia: 'POS-789123',
    tipoIngreso: 'Delivery',
    descripcion: 'Cargo por delivery'
  }
]

// Estado global de ingresos
const ingresos = ref([])

// Función para obtener todos los ingresos
export async function getIngresos() {
  if (USE_MOCK_DATA) {
    console.log('🔧 Usando datos de prueba para ingresos')
    ingresos.value = mockIngresos
    return ingresos.value
  }

  try {
    console.log('🌐 Obteniendo ingresos desde Supabase...')
    
    // Obtener ingresos desde pedidos (pagos completos y abonos)
    const { data: pedidosData, error: pedidosError } = await supabase
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
        tasa_bcv,
        referencia_pago,
        tipo_pago_abono
      `)
      .order('fecha_pedido', { ascending: false })
    
    if (pedidosError) {
      console.error('Error al cargar pedidos:', pedidosError)
      throw pedidosError
    }
    
    // Obtener abonos adicionales
    const { data: abonosData, error: abonosError } = await supabase
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
          cliente_apellido
        )
      `)
      .order('fecha_abono', { ascending: false })
    
    if (abonosError) {
      console.error('Error al cargar abonos:', abonosError)
      // Continuar sin abonos si hay error
    }

    // Procesar ingresos desde pedidos
    const ingresosFormateados = []
    
    // Procesar pedidos como ingresos
    if (pedidosData) {
      pedidosData.forEach(pedido => {
        const cliente = `${pedido.cliente_nombre || ''} ${pedido.cliente_apellido || ''}`.trim() || 'Cliente'
        
        // Calcular ingresos según el tipo de pago
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
          tipoIngreso = 'Abono Inicial'
        }
        
        // Solo agregar si hay ingresos reales
        if (montoUSD > 0 || montoVES > 0) {
          ingresosFormateados.push({
            id: `PED-${pedido.id}`,
            fecha: pedido.fecha_pedido,
            idVenta: `VTA-${pedido.id}`,
            cliente: cliente,
            montoUSD: montoUSD,
            montoVES: montoVES,
            metodoPago: metodoPago,
            referencia: pedido.referencia_pago || '',
            tipoIngreso: tipoIngreso,
            descripcion: `Venta ${pedido.id}`,
            tasa_bcv: parseFloat(pedido.tasa_bcv) || 36.0,
            fecha_creacion: pedido.fecha_pedido
          })
          
          console.log(`📝 Procesado PED-${pedido.id}: Referencia="${pedido.referencia_pago || ''}"`)
        }
      })
    }
    
    // Procesar abonos adicionales (solo los que NO están duplicados con el pedido inicial)
    if (abonosData) {
      abonosData.forEach(abono => {
        // Verificar si este abono ya fue procesado como parte del pedido inicial
        const pedidoYaProcesado = pedidosData.find(p => 
          p.id === abono.pedido_id && 
          p.es_abono && 
          p.fecha_pedido === abono.fecha_abono
        )
        
        // Solo procesar si NO es duplicado del pedido inicial
        if (!pedidoYaProcesado) {
          const cliente = abono.pedidos ? 
            `${abono.pedidos.cliente_nombre || ''} ${abono.pedidos.cliente_apellido || ''}`.trim() : 
            'Cliente'
          
          ingresosFormateados.push({
            id: `ABO-${abono.id}`,
            fecha: abono.fecha_abono,
            idVenta: `VTA-${abono.pedido_id}`,
            cliente: cliente,
            montoUSD: parseFloat(abono.monto_abono_usd) || 0,
            montoVES: parseFloat(abono.monto_abono_ves) || 0,
            metodoPago: abono.metodo_pago_abono || '',
            referencia: abono.referencia_pago || '',
            tipoIngreso: 'Abono a Deuda',
            descripcion: abono.comentarios || `Abono adicional pedido ${abono.pedido_id}`,
            tasa_bcv: parseFloat(abono.tasa_bcv) || 36.0,
            fecha_creacion: abono.fecha_abono
          })
          
          console.log(`📝 Procesado ABO-${abono.id}: Referencia="${abono.referencia_pago || ''}"`)
        } else {
          console.log(`⚠️ Abono #${abono.id} duplicado con pedido #${abono.pedido_id} - omitiendo`)
        }
      })
    }

    ingresos.value = ingresosFormateados
    console.log('✅ Ingresos cargados:', ingresosFormateados.length)
    return ingresos.value

  } catch (err) {
    console.error('Error de conexión:', err)
    
    if (err.message.includes('fetch failed') || err.message.includes('Load failed') || 
        err.message.includes('NetworkError') || err.message.includes('TypeError')) {
      console.warn('Error de conexión detectado, usando datos mock')
      ingresos.value = mockIngresos
      return ingresos.value
    }
    
    ingresos.value = mockIngresos
    return ingresos.value
  }
}

// Función para obtener ingresos por rango de fechas
export function getIngresosPorRango(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaFin)
  fin.setHours(23, 59, 59, 999)
  
  return ingresos.value.filter(ingreso => {
    const fechaIngreso = new Date(ingreso.fecha)
    return fechaIngreso >= inicio && fechaIngreso <= fin
  })
}

// Función para obtener ingresos del día
export function getIngresosDelDia(fecha) {
  const dia = new Date(fecha)
  const inicioDia = new Date(dia.setHours(0, 0, 0, 0))
  const finDia = new Date(dia.setHours(23, 59, 59, 999))
  
  return getIngresosPorRango(inicioDia, finDia)
}

// Función para calcular totales de ingresos
export function calcularTotalesIngresos(ingresosData) {
  const totales = {
    totalGeneralUSD: 0,
    totalGeneralVES: 0,
    abonosADeudasUSD: 0,
    pagos: {
      'Efectivo (USD)': 0,
      'Zelle (USD)': 0,
      'Punto de Venta (VES)': 0,
      'Pago Móvil (VES)': 0,
      'Transferencia (VES)': 0
    }
  }
  
  ingresosData.forEach(ingreso => {
    const montoUSD = parseFloat(ingreso.montoUSD) || 0
    const montoVES = parseFloat(ingreso.montoVES) || 0
    const metodo = ingreso.metodoPago || ''
    const tipoIngreso = ingreso.tipoIngreso || ''
    
    // Sumar al total general
    totales.totalGeneralUSD += montoUSD
    totales.totalGeneralVES += montoVES
    
    // Procesar por tipo de ingreso
    if (tipoIngreso === 'Abono a Deuda') {
      totales.abonosADeudasUSD += montoUSD
    } else if (metodo && totales.pagos.hasOwnProperty(metodo)) {
      if (metodo.includes('(USD)')) {
        totales.pagos[metodo] += montoUSD
      } else {
        totales.pagos[metodo] += montoVES
      }
    }
  })
  
  return totales
}

// Función para obtener desglose por método de pago
export function getDesglosePorMetodo(ingresosData) {
  const desglose = {}
  
  ingresosData.forEach(ingreso => {
    const metodo = ingreso.metodoPago || 'Sin especificar'
    const montoUSD = parseFloat(ingreso.montoUSD) || 0
    const montoVES = parseFloat(ingreso.montoVES) || 0
    
    if (!desglose[metodo]) {
      desglose[metodo] = {
        montoUSD: 0,
        montoVES: 0,
        cantidad: 0
      }
    }
    
    if (metodo.includes('(USD)')) {
      desglose[metodo].montoUSD += montoUSD
    } else {
      desglose[metodo].montoVES += montoVES
    }
    
    desglose[metodo].cantidad += 1
  })
  
  return desglose
}

// Función para obtener desglose por tipo de ingreso
export function getDesglosePorTipo(ingresosData) {
  const desglose = {}
  
  ingresosData.forEach(ingreso => {
    const tipo = ingreso.tipoIngreso || 'Sin especificar'
    const montoUSD = parseFloat(ingreso.montoUSD) || 0
    const montoVES = parseFloat(ingreso.montoVES) || 0
    
    if (!desglose[tipo]) {
      desglose[tipo] = {
        montoUSD: 0,
        montoVES: 0,
        cantidad: 0
      }
    }
    
    desglose[tipo].montoUSD += montoUSD
    desglose[tipo].montoVES += montoVES
    desglose[tipo].cantidad += 1
  })
  
  return desglose
}

// Función para agregar nuevo ingreso
export async function agregarIngreso(ingresoData) {
  if (USE_MOCK_DATA) {
    const nuevoIngreso = {
      id: `ING-${String(ingresos.value.length + 1).padStart(3, '0')}`,
      fecha: new Date().toISOString(),
      ...ingresoData
    }
    
    ingresos.value.push(nuevoIngreso)
    return nuevoIngreso
  }

  try {
    console.log('💾 Guardando nuevo ingreso en Supabase...')
    
    const { data, error } = await supabase
      .from('ingresos')
      .insert([
        {
          pedido_id: ingresoData.pedido_id,
          cliente_nombre: ingresoData.cliente_nombre,
          cliente_apellido: ingresoData.cliente_apellido,
          monto_usd: ingresoData.montoUSD,
          monto_ves: ingresoData.montoVES,
          metodo_pago: ingresoData.metodoPago,
          referencia: ingresoData.referencia,
          tipo_ingreso: ingresoData.tipoIngreso,
          descripcion: ingresoData.descripcion,
          tasa_bcv: ingresoData.tasa_bcv || 36.0,
          fecha: ingresoData.fecha || new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error al guardar ingreso:', error)
      throw new Error(`Error al guardar ingreso: ${error.message}`)
    }

    // Agregar al estado local
    const nuevoIngreso = {
      id: data.id,
      fecha: data.fecha,
      idVenta: data.pedido_id ? `VTA-${data.pedido_id}` : '',
      cliente: `${data.cliente_nombre} ${data.cliente_apellido || ''}`.trim(),
      montoUSD: parseFloat(data.monto_usd) || 0,
      montoVES: parseFloat(data.monto_ves) || 0,
      metodoPago: data.metodo_pago || '',
      referencia: data.referencia || '',
      tipoIngreso: data.tipo_ingreso || 'Pago Completo de Contado',
      descripcion: data.descripcion || '',
      tasa_bcv: data.tasa_bcv || 36.0,
      fecha_creacion: data.created_at
    }

    ingresos.value.unshift(nuevoIngreso)
    console.log('✅ Ingreso guardado:', nuevoIngreso.id)
    return nuevoIngreso

  } catch (err) {
    console.error('Error al agregar ingreso:', err)
    
    // Fallback a datos mock
    const nuevoIngreso = {
      id: `ING-${String(ingresos.value.length + 1).padStart(3, '0')}`,
      fecha: new Date().toISOString(),
      ...ingresoData
    }
    
    ingresos.value.push(nuevoIngreso)
    return nuevoIngreso
  }
}

// Función para obtener estadísticas de ingresos
export async function getEstadisticasIngresos() {
  // Asegurar que los ingresos estén cargados
  if (ingresos.value.length === 0) {
    await getIngresos()
  }
  
  const hoy = new Date()
  const inicioSemana = new Date(hoy)
  inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1)
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  
  const ingresosHoy = getIngresosDelDia(hoy)
  const ingresosSemana = getIngresosPorRango(inicioSemana, hoy)
  const ingresosMes = getIngresosPorRango(inicioMes, hoy)
  
  console.log('📊 Estadísticas calculadas:')
  console.log('   Hoy:', ingresosHoy.length, 'ingresos')
  console.log('   Semana:', ingresosSemana.length, 'ingresos')
  console.log('   Mes:', ingresosMes.length, 'ingresos')
  console.log('   Total:', ingresos.value.length, 'ingresos')
  
  return {
    hoy: calcularTotalesIngresos(ingresosHoy),
    semana: calcularTotalesIngresos(ingresosSemana),
    mes: calcularTotalesIngresos(ingresosMes),
    totalIngresos: ingresos.value.length
  }
}

// Función para filtrar ingresos por criterios
export function filtrarIngresos(criterios) {
  let resultados = [...ingresos.value]
  
  // Filtro por fecha
  if (criterios.fechaInicio && criterios.fechaFin) {
    resultados = getIngresosPorRango(criterios.fechaInicio, criterios.fechaFin)
  }
  
  // Filtro por método de pago
  if (criterios.metodoPago) {
    resultados = resultados.filter(ingreso => 
      ingreso.metodoPago === criterios.metodoPago
    )
  }
  
  // Filtro por tipo de ingreso
  if (criterios.tipoIngreso) {
    resultados = resultados.filter(ingreso => 
      ingreso.tipoIngreso === criterios.tipoIngreso
    )
  }
  
  // Filtro por cliente
  if (criterios.cliente) {
    const busqueda = criterios.cliente.toLowerCase()
    resultados = resultados.filter(ingreso => 
      ingreso.cliente.toLowerCase().includes(busqueda)
    )
  }
  
  // Filtro por referencia
  if (criterios.referencia) {
    const busqueda = criterios.referencia.toLowerCase()
    resultados = resultados.filter(ingreso => 
      ingreso.referencia.toLowerCase().includes(busqueda)
    )
  }
  
  return resultados
}

// Función para generar reporte de cierre de caja
export function generarCierreDeCaja(fecha) {
  const ingresosDelDia = getIngresosDelDia(fecha)
  const totales = calcularTotalesIngresos(ingresosDelDia)
  const desgloseMetodo = getDesglosePorMetodo(ingresosDelDia)
  
  return {
    fecha: fecha,
    ingresosDetallados: ingresosDelDia,
    totales: totales,
    desgloseMetodo: desgloseMetodo
  }
}

// Función para exportar datos a CSV
export function exportarDatosCSV(ingresosData) {
  if (!ingresosData || ingresosData.length === 0) {
    return ''
  }

  const headers = [
    'ID',
    'Fecha',
    'ID Venta',
    'Cliente',
    'Monto USD',
    'Monto VES',
    'Método de Pago',
    'Referencia',
    'Tipo de Ingreso',
    'Descripción'
  ]

  const csvContent = [
    headers.join(','),
    ...ingresosData.map(ingreso => [
      ingreso.id,
      ingreso.fecha,
      ingreso.idVenta,
      `"${ingreso.cliente}"`,
      ingreso.montoUSD,
      ingreso.montoVES,
      `"${ingreso.metodoPago}"`,
      `"${ingreso.referencia}"`,
      `"${ingreso.tipoIngreso}"`,
      `"${ingreso.descripcion}"`
    ].join(','))
  ].join('\n')

  return csvContent
}

// Función para obtener ingresos por método de pago
export function getIngresosPorMetodo(metodoPago) {
  return ingresos.value.filter(ingreso => ingreso.metodoPago === metodoPago)
}

// Función para obtener ingresos por tipo
export function getIngresosPorTipo(tipoIngreso) {
  return ingresos.value.filter(ingreso => ingreso.tipoIngreso === tipoIngreso)
}

// Función para generar reporte por rango
export function generarReportePorRango(fechaInicio, fechaFin) {
  const ingresosDelPeriodo = getIngresosPorRango(fechaInicio, fechaFin)
  const totales = calcularTotalesIngresos(ingresosDelPeriodo)
  const desgloseMetodo = getDesglosePorMetodo(ingresosDelPeriodo)
  const desgloseTipo = getDesglosePorTipo(ingresosDelPeriodo)
  
  return {
    fechaInicio: fechaInicio,
    fechaFin: fechaFin,
    ingresosDetallados: ingresosDelPeriodo,
    totales: totales,
    desgloseMetodo: desgloseMetodo,
    desgloseTipo: desgloseTipo
  }
}

// Función para obtener ingresos por cliente
export function getIngresosPorCliente(nombreCliente) {
  const busqueda = nombreCliente.toLowerCase()
  return ingresos.value.filter(ingreso => 
    ingreso.cliente.toLowerCase().includes(busqueda)
  )
}
