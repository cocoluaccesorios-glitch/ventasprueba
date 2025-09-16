// Servicio para gestión de ingresos
import { ref } from 'vue'

// Estado global de ingresos
const ingresos = ref([
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
])

// Función para obtener todos los ingresos
export function getIngresos() {
  return ingresos.value
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
export function agregarIngreso(ingresoData) {
  const nuevoIngreso = {
    id: `ING-${String(ingresos.value.length + 1).padStart(3, '0')}`,
    fecha: new Date().toISOString(),
    ...ingresoData
  }
  
  ingresos.value.push(nuevoIngreso)
  return nuevoIngreso
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
