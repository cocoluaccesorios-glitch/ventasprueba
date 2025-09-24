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
    const { data, error } = await supabase
      .from('ingresos')
      .select(`
        *,
        pedidos(
          id,
          cliente_nombre,
          cliente_apellido,
          total_usd,
          fecha_pedido
        )
      `)
      .order('fecha', { ascending: false })

    if (error) {
      console.error('Error al cargar ingresos:', error)
      
      // Si hay problemas de permisos o la tabla no existe, usar datos mock
      if (error.message.includes('401') || error.message.includes('42501') || error.message.includes('relation')) {
        console.warn('Problemas con tabla ingresos, usando datos mock')
        ingresos.value = mockIngresos
        return ingresos.value
      }
      
      Swal.fire({
        title: 'Error',
        text: `No se pudieron cargar los ingresos: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'Usar datos de prueba',
        showCancelButton: true,
        cancelButtonText: 'Reintentar'
      }).then((result) => {
        if (result.isConfirmed) {
          ingresos.value = mockIngresos
        }
      })
      
      return mockIngresos
    }

    // Formatear datos de Supabase
    const ingresosFormateados = (data || []).map(ingreso => ({
      id: ingreso.id,
      fecha: ingreso.fecha,
      idVenta: ingreso.pedido_id ? `VTA-${ingreso.pedido_id}` : ingreso.id_venta,
      cliente: ingreso.pedidos ? 
        `${ingreso.pedidos.cliente_nombre} ${ingreso.pedidos.cliente_apellido || ''}`.trim() : 
        ingreso.cliente_nombre || 'Cliente',
      montoUSD: parseFloat(ingreso.monto_usd) || 0,
      montoVES: parseFloat(ingreso.monto_ves) || 0,
      metodoPago: ingreso.metodo_pago || '',
      referencia: ingreso.referencia || '',
      tipoIngreso: ingreso.tipo_ingreso || 'Pago Completo de Contado',
      descripcion: ingreso.descripcion || '',
      tasa_bcv: ingreso.tasa_bcv || 36.0,
      fecha_creacion: ingreso.created_at
    }))

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
export function getEstadisticasIngresos() {
  const hoy = new Date()
  const inicioSemana = new Date(hoy)
  inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1)
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  
  const ingresosHoy = getIngresosDelDia(hoy)
  const ingresosSemana = getIngresosPorRango(inicioSemana, hoy)
  const ingresosMes = getIngresosPorRango(inicioMes, hoy)
  
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
