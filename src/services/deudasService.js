// Servicio para gestión de abonos y deudas
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

// Estado reactivo global
const deudas = ref([])
const abonos = ref([])
const resumenDeudas = ref({
  totalDeudasUSD: 0,
  totalDeudasVES: 0,
  clientesConDeudas: 0,
  pedidosPendientes: 0,
  totalAbonosUSD: 0,
  totalAbonosVES: 0
})

// =====================================================
// FUNCIONES PRINCIPALES
// =====================================================

/**
 * Obtener todas las deudas pendientes
 */
export async function obtenerDeudasPendientes() {
  try {
    console.log('📊 Obteniendo deudas pendientes...')
    
    const { data, error } = await supabase
      .from('vista_resumen_deudas')
      .select('*')
      .gt('saldo_pendiente_usd', 0)
      .order('fecha_pedido', { ascending: false })
    
    if (error) {
      console.error('Error obteniendo deudas:', error)
      throw error
    }
    
    deudas.value = data || []
    console.log(`✅ Deudas cargadas: ${deudas.value.length}`)
    
    return deudas.value
    
  } catch (error) {
    console.error('Error en obtenerDeudasPendientes:', error)
    throw error
  }
}

/**
 * Obtener abonos de un pedido específico
 */
export async function obtenerAbonosPedido(pedidoId) {
  try {
    console.log(`📊 Obteniendo abonos del pedido #${pedidoId}...`)
    
    const { data, error } = await supabase
      .from('abonos')
      .select('*')
      .eq('pedido_id', pedidoId)
      .order('fecha_abono', { ascending: false })
    
    if (error) {
      console.error('Error obteniendo abonos:', error)
      throw error
    }
    
    console.log(`✅ Abonos cargados: ${data?.length || 0}`)
    return data || []
    
  } catch (error) {
    console.error('Error en obtenerAbonosPedido:', error)
    throw error
  }
}

/**
 * Registrar un nuevo abono
 */
export async function registrarAbono(abonoData) {
  try {
    console.log('💰 Registrando nuevo abono...', abonoData)
    
    // Validar datos requeridos
    if (!abonoData.pedido_id || !abonoData.monto_usd || !abonoData.metodo_pago) {
      throw new Error('Faltan datos requeridos para el abono')
    }
    
    // Calcular monto en VES si no se proporciona
    const montoVES = abonoData.monto_ves || (abonoData.monto_usd * abonoData.tasa_bcv)
    
    const abonoCompleto = {
      pedido_id: abonoData.pedido_id,
      cliente_id: abonoData.cliente_id || null,
      monto_abono_usd: parseFloat(abonoData.monto_usd),
      monto_abono_ves: parseFloat(montoVES),
      tasa_bcv: parseFloat(abonoData.tasa_bcv),
      metodo_pago_abono: abonoData.metodo_pago,
      referencia_pago: abonoData.referencia_pago || '',
      tipo_abono: abonoData.tipo_abono || 'simple',
      fecha_abono: abonoData.fecha_abono || new Date().toISOString(),
      estado_abono: abonoData.estado_abono || 'confirmado',
      comentarios: abonoData.comentarios || ''
    }
    
    const { data, error } = await supabase
      .from('abonos')
      .insert(abonoCompleto)
      .select()
    
    if (error) {
      console.error('Error registrando abono:', error)
      throw error
    }
    
    console.log('✅ Abono registrado exitosamente:', data[0])
    
    // Verificar si el pedido está completamente pagado
    await verificarEstadoPedido(abonoData.pedido_id)
    
    return data[0]
    
  } catch (error) {
    console.error('Error en registrarAbono:', error)
    throw error
  }
}

/**
 * Calcular saldo pendiente de un pedido
 */
export async function calcularSaldoPendiente(pedidoId) {
  try {
    console.log(`📊 Calculando saldo pendiente del pedido #${pedidoId}...`)
    
    const { data, error } = await supabase
      .rpc('calcular_saldo_pendiente', { pedido_id_param: pedidoId })
    
    if (error) {
      console.error('Error calculando saldo pendiente:', error)
      throw error
    }
    
    console.log(`✅ Saldo pendiente: $${data}`)
    return data || 0
    
  } catch (error) {
    console.error('Error en calcularSaldoPendiente:', error)
    throw error
  }
}

/**
 * Verificar y actualizar estado del pedido
 */
export async function verificarEstadoPedido(pedidoId) {
  try {
    console.log(`🔍 Verificando estado del pedido #${pedidoId}...`)
    
    const saldoPendiente = await calcularSaldoPendiente(pedidoId)
    
    if (saldoPendiente <= 0) {
      // Marcar como pagado
      const { error } = await supabase
        .from('pedidos')
        .update({ estado_entrega: 'pagado' })
        .eq('id', pedidoId)
      
      if (error) {
        console.error('Error actualizando estado del pedido:', error)
        throw error
      }
      
      console.log(`✅ Pedido #${pedidoId} marcado como pagado`)
      return 'pagado'
    }
    
    return 'pendiente'
    
  } catch (error) {
    console.error('Error en verificarEstadoPedido:', error)
    throw error
  }
}

/**
 * Obtener resumen de deudas por cliente
 */
export async function obtenerResumenDeudasCliente(clienteCedula) {
  try {
    console.log(`📊 Obteniendo resumen de deudas para cliente: ${clienteCedula}...`)
    
    const { data, error } = await supabase
      .from('vista_resumen_deudas')
      .select('*')
      .eq('cliente_cedula', clienteCedula)
      .gt('saldo_pendiente_usd', 0)
      .order('fecha_pedido', { ascending: false })
    
    if (error) {
      console.error('Error obteniendo resumen de deudas:', error)
      throw error
    }
    
    const resumen = {
      cliente: data[0]?.cliente_completo || 'Cliente no encontrado',
      cedula: clienteCedula,
      totalDeudasUSD: data.reduce((sum, deuda) => sum + deuda.saldo_pendiente_usd, 0),
      totalDeudasVES: data.reduce((sum, deuda) => sum + (deuda.saldo_pendiente_usd * deuda.tasa_bcv), 0),
      cantidadPedidos: data.length,
      pedidos: data
    }
    
    console.log('✅ Resumen de deudas calculado:', resumen)
    return resumen
    
  } catch (error) {
    console.error('Error en obtenerResumenDeudasCliente:', error)
    throw error
  }
}

/**
 * Obtener clientes con deudas
 */
export async function obtenerClientesConDeudas() {
  try {
    console.log('📊 Obteniendo clientes con deudas...')
    
    const { data, error } = await supabase
      .from('vista_resumen_deudas')
      .select('cliente_cedula, cliente_completo')
      .gt('saldo_pendiente_usd', 0)
      .order('cliente_completo')
    
    if (error) {
      console.error('Error obteniendo clientes con deudas:', error)
      throw error
    }
    
    // Agrupar por cliente y calcular totales
    const clientesMap = new Map()
    
    data.forEach(deuda => {
      const cedula = deuda.cliente_cedula
      if (!clientesMap.has(cedula)) {
        clientesMap.set(cedula, {
          cedula: cedula,
          nombre: deuda.cliente_completo,
          cantidadPedidos: 0,
          totalDeudasUSD: 0,
          totalDeudasVES: 0
        })
      }
      
      const cliente = clientesMap.get(cedula)
      cliente.cantidadPedidos++
      cliente.totalDeudasUSD += deuda.saldo_pendiente_usd
      cliente.totalDeudasVES += deuda.saldo_pendiente_usd * deuda.tasa_bcv
    })
    
    const clientes = Array.from(clientesMap.values())
    console.log(`✅ Clientes con deudas: ${clientes.length}`)
    
    return clientes
    
  } catch (error) {
    console.error('Error en obtenerClientesConDeudas:', error)
    throw error
  }
}

/**
 * Calcular resumen general de deudas
 */
export async function calcularResumenGeneralDeudas() {
  try {
    console.log('📊 Calculando resumen general de deudas...')
    
    const deudasData = await obtenerDeudasPendientes()
    
    const resumen = {
      totalDeudasUSD: deudasData.reduce((sum, deuda) => sum + deuda.saldo_pendiente_usd, 0),
      totalDeudasVES: deudasData.reduce((sum, deuda) => sum + (deuda.saldo_pendiente_usd * deuda.tasa_bcv), 0),
      totalAbonosUSD: deudasData.reduce((sum, deuda) => sum + deuda.total_abonado_usd, 0),
      totalAbonosVES: deudasData.reduce((sum, deuda) => sum + (deuda.total_abonado_usd * deuda.tasa_bcv), 0),
      clientesConDeudas: new Set(deudasData.map(deuda => deuda.cliente_cedula)).size,
      pedidosPendientes: deudasData.filter(deuda => deuda.estado_entrega === 'pendiente').length,
      cantidadPedidos: deudasData.length
    }
    
    resumenDeudas.value = resumen
    console.log('✅ Resumen general calculado:', resumen)
    
    return resumen
    
  } catch (error) {
    console.error('Error en calcularResumenGeneralDeudas:', error)
    throw error
  }
}

/**
 * Actualizar estado de entrega de un pedido
 */
export async function actualizarEstadoEntrega(pedidoId, nuevoEstado) {
  try {
    console.log(`🔄 Actualizando estado del pedido #${pedidoId} a: ${nuevoEstado}...`)
    
    const { error } = await supabase
      .from('pedidos')
      .update({ estado_entrega: nuevoEstado })
      .eq('id', pedidoId)
    
    if (error) {
      console.error('Error actualizando estado de entrega:', error)
      throw error
    }
    
    console.log(`✅ Estado actualizado: ${nuevoEstado}`)
    return true
    
  } catch (error) {
    console.error('Error en actualizarEstadoEntrega:', error)
    throw error
  }
}

/**
 * Obtener estadísticas de abonos por período
 */
export async function obtenerEstadisticasAbonos(periodo = 'mes') {
  try {
    console.log(`📊 Obteniendo estadísticas de abonos para: ${periodo}...`)
    
    let fechaInicio, fechaFin
    const hoy = new Date()
    
    switch (periodo) {
      case 'hoy':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
        fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59)
        break
      case 'semana':
        fechaInicio = new Date(hoy)
        fechaInicio.setDate(hoy.getDate() - hoy.getDay() + 1)
        fechaInicio.setHours(0, 0, 0, 0)
        fechaFin = new Date(hoy)
        fechaFin.setHours(23, 59, 59, 999)
        break
      case 'mes':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
        fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59)
        break
      case 'año':
        fechaInicio = new Date(hoy.getFullYear(), 0, 1)
        fechaFin = new Date(hoy.getFullYear(), 11, 31, 23, 59, 59)
        break
      default:
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
        fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59)
    }
    
    const { data, error } = await supabase
      .from('abonos')
      .select('*')
      .gte('fecha_abono', fechaInicio.toISOString())
      .lte('fecha_abono', fechaFin.toISOString())
      .eq('estado_abono', 'confirmado')
    
    if (error) {
      console.error('Error obteniendo estadísticas de abonos:', error)
      throw error
    }
    
    const estadisticas = {
      periodo: periodo,
      cantidadAbonos: data.length,
      totalUSD: data.reduce((sum, abono) => sum + abono.monto_abono_usd, 0),
      totalVES: data.reduce((sum, abono) => sum + abono.monto_abono_ves, 0),
      promedioUSD: data.length > 0 ? data.reduce((sum, abono) => sum + abono.monto_abono_usd, 0) / data.length : 0,
      abonosPorMetodo: data.reduce((acc, abono) => {
        const metodo = abono.metodo_pago_abono
        acc[metodo] = (acc[metodo] || 0) + 1
        return acc
      }, {}),
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString()
    }
    
    console.log('✅ Estadísticas de abonos calculadas:', estadisticas)
    return estadisticas
    
  } catch (error) {
    console.error('Error en obtenerEstadisticasAbonos:', error)
    throw error
  }
}

/**
 * Generar reporte de deudas por rango de fechas
 */
export async function generarReporteDeudasPorRango(fechaInicio, fechaFin) {
  try {
    console.log(`📊 Generando reporte de deudas desde ${fechaInicio} hasta ${fechaFin}...`)
    
    const { data, error } = await supabase
      .from('vista_resumen_deudas')
      .select('*')
      .gte('fecha_pedido', fechaInicio)
      .lte('fecha_pedido', fechaFin)
      .gt('saldo_pendiente_usd', 0)
      .order('fecha_pedido', { ascending: false })
    
    if (error) {
      console.error('Error generando reporte de deudas:', error)
      throw error
    }
    
    const reporte = {
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      cantidadPedidos: data.length,
      totalDeudasUSD: data.reduce((sum, deuda) => sum + deuda.saldo_pendiente_usd, 0),
      totalDeudasVES: data.reduce((sum, deuda) => sum + (deuda.saldo_pendiente_usd * deuda.tasa_bcv), 0),
      totalAbonosUSD: data.reduce((sum, deuda) => sum + deuda.total_abonado_usd, 0),
      totalAbonosVES: data.reduce((sum, deuda) => sum + (deuda.total_abonado_usd * deuda.tasa_bcv), 0),
      clientesUnicos: new Set(data.map(deuda => deuda.cliente_cedula)).size,
      pedidos: data
    }
    
    console.log('✅ Reporte de deudas generado:', reporte)
    return reporte
    
  } catch (error) {
    console.error('Error en generarReporteDeudasPorRango:', error)
    throw error
  }
}

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

/**
 * Formatear fecha para mostrar
 */
export function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formatear monto en USD
 */
export function formatMontoUSD(monto) {
  return `$${parseFloat(monto).toFixed(2)}`
}

/**
 * Formatear monto en VES
 */
export function formatMontoVES(monto) {
  return `${parseFloat(monto).toLocaleString()} Bs`
}

/**
 * Obtener clase CSS para estado de deuda
 */
export function getDeudaRowClass(deuda) {
  if (deuda.saldo_pendiente_usd <= 0) return 'table-success'
  if (deuda.saldo_pendiente_usd <= deuda.total_usd * 0.5) return 'table-warning'
  return 'table-danger'
}

/**
 * Obtener clase CSS para badge de estado
 */
export function getEstadoBadgeClass(estado) {
  const clases = {
    'pendiente': 'bg-warning',
    'entregado': 'bg-info',
    'pagado': 'bg-success',
    'anulado': 'bg-danger'
  }
  return clases[estado] || 'bg-secondary'
}

/**
 * Obtener clase CSS para badge de estado de abono
 */
export function getEstadoAbonoBadgeClass(estado) {
  const clases = {
    'confirmado': 'bg-success',
    'pendiente': 'bg-warning',
    'anulado': 'bg-danger'
  }
  return clases[estado] || 'bg-secondary'
}

// =====================================================
// EXPORTAR ESTADO REACTIVO
// =====================================================

export { deudas, abonos, resumenDeudas }
