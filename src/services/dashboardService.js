// Servicio para estadísticas del dashboard
import { ref } from 'vue'
import { getPedidos } from './apiService.js'
import { getClientes } from './clientesService.js'
import { getProducts } from './apiService.js'
import { getEstadisticasIngresos } from './ingresosService.js'

// Estado global de estadísticas
const estadisticasCache = ref({
  ultimaActualizacion: null,
  datos: null
})

// Función para calcular estadísticas generales
export async function calcularEstadisticasGenerales() {
  try {
    const [pedidos, clientes, productos, estadisticasIngresos] = await Promise.all([
      getPedidos(),
      getClientes(),
      getProducts(),
      getEstadisticasIngresos()
    ])
    
    // Calcular estadísticas de ventas
    const ventasTotales = pedidos.reduce((sum, p) => sum + (p.total_usd || 0), 0)
    const totalVentas = pedidos.length
    
    // Calcular productos vendidos (simulado)
    const productosVendidos = pedidos.reduce((sum, p) => {
      // Simular cantidad de productos por pedido
      return sum + Math.floor(Math.random() * 5) + 1
    }, 0)
    
    // Calcular clientes activos
    const clientesActivos = clientes.length
    const nuevosClientes = clientes.filter(c => {
      const fechaCreacion = new Date(c.fecha_creacion)
      const hace30Dias = new Date()
      hace30Dias.setDate(hace30Dias.getDate() - 30)
      return fechaCreacion >= hace30Dias
    }).length
    
    // Calcular stock bajo
    const stockBajo = productos.filter(p => (p.stock_actual || 0) <= 5).length
    
    return {
      ventasTotales,
      totalVentas,
      productosVendidos,
      totalProductos: productos.length,
      clientesActivos,
      nuevosClientes,
      stockBajo,
      ingresosHoy: estadisticasIngresos.hoy.totalGeneralUSD,
      ingresosMes: estadisticasIngresos.mes.totalGeneralUSD
    }
  } catch (error) {
    console.error('Error calculando estadísticas:', error)
    return getEstadisticasMock()
  }
}

// Función para obtener top productos
export async function obtenerTopProductos(limite = 5) {
  try {
    const productos = await getProducts()
    
    // Simular datos de ventas por producto
    return productos.slice(0, limite).map((producto, index) => ({
      id: producto.id,
      nombre: producto.nombre,
      cantidadVendida: Math.floor(Math.random() * 20) + 5,
      totalVentas: Math.floor(Math.random() * 500) + 100
    })).sort((a, b) => b.totalVentas - a.totalVentas)
  } catch (error) {
    console.error('Error obteniendo top productos:', error)
    return getTopProductosMock()
  }
}

// Función para obtener pedidos recientes
export async function obtenerPedidosRecientes(limite = 5) {
  try {
    const pedidos = await getPedidos()
    
    return pedidos
      .sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido))
      .slice(0, limite)
      .map(pedido => ({
        id: pedido.id,
        cliente: `Cliente #${pedido.cliente_id}`,
        total: pedido.total_usd || 0,
        estado: pedido.estado_entrega || 'pendiente',
        fecha: pedido.fecha_pedido
      }))
  } catch (error) {
    console.error('Error obteniendo pedidos recientes:', error)
    return getPedidosRecientesMock()
  }
}

// Función para obtener alertas de inventario
export async function obtenerAlertasInventario(limite = 5) {
  try {
    const productos = await getProducts()
    
    return productos
      .filter(p => (p.stock_actual || 0) <= 5)
      .slice(0, limite)
      .map(producto => ({
        id: producto.id,
        nombre: producto.nombre,
        stock: producto.stock_actual || 0
      }))
  } catch (error) {
    console.error('Error obteniendo alertas de inventario:', error)
    return getAlertasInventarioMock()
  }
}

// Función para obtener datos de ventas por período
export function obtenerDatosVentasPorPeriodo(periodo = 'mes') {
  const datos = []
  const hoy = new Date()
  
  switch (periodo) {
    case 'hoy':
      // Datos por hora del día actual
      for (let i = 23; i >= 0; i--) {
        const hora = new Date(hoy)
        hora.setHours(hora.getHours() - i)
        datos.push({
          fecha: hora.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
          ventas: Math.floor(Math.random() * 200) + 50
        })
      }
      break
      
    case 'semana':
      // Datos por día de la semana
      for (let i = 6; i >= 0; i--) {
        const fecha = new Date(hoy)
        fecha.setDate(fecha.getDate() - i)
        datos.push({
          fecha: fecha.toLocaleDateString('es-VE', { weekday: 'short' }),
          ventas: Math.floor(Math.random() * 1000) + 200
        })
      }
      break
      
    case 'mes':
      // Datos por día del mes
      for (let i = 29; i >= 0; i--) {
        const fecha = new Date(hoy)
        fecha.setDate(fecha.getDate() - i)
        datos.push({
          fecha: fecha.toLocaleDateString('es-VE', { month: 'short', day: 'numeric' }),
          ventas: Math.floor(Math.random() * 800) + 100
        })
      }
      break
      
    case 'año':
      // Datos por mes del año
      for (let i = 11; i >= 0; i--) {
        const fecha = new Date(hoy)
        fecha.setMonth(fecha.getMonth() - i)
        datos.push({
          fecha: fecha.toLocaleDateString('es-VE', { month: 'short' }),
          ventas: Math.floor(Math.random() * 5000) + 1000
        })
      }
      break
  }
  
  return datos
}

// Funciones mock para fallback
function getEstadisticasMock() {
  return {
    ventasTotales: 1250.50,
    totalVentas: 15,
    productosVendidos: 45,
    totalProductos: 25,
    clientesActivos: 8,
    nuevosClientes: 2,
    stockBajo: 3
  }
}

function getTopProductosMock() {
  return [
    { id: 1, nombre: 'Producto A', cantidadVendida: 12, totalVentas: 240.00 },
    { id: 2, nombre: 'Producto B', cantidadVendida: 8, totalVentas: 180.00 },
    { id: 3, nombre: 'Producto C', cantidadVendida: 6, totalVentas: 150.00 },
    { id: 4, nombre: 'Producto D', cantidadVendida: 5, totalVentas: 120.00 },
    { id: 5, nombre: 'Producto E', cantidadVendida: 4, totalVentas: 100.00 }
  ]
}

function getPedidosRecientesMock() {
  return [
    { id: 1, cliente: 'Juan Pérez', total: 85.50, estado: 'pendiente', fecha: new Date().toISOString() },
    { id: 2, cliente: 'María González', total: 120.00, estado: 'entregado', fecha: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, cliente: 'Carlos Rodríguez', total: 95.75, estado: 'en_proceso', fecha: new Date(Date.now() - 172800000).toISOString() },
    { id: 4, cliente: 'Ana Martínez', total: 75.25, estado: 'entregado', fecha: new Date(Date.now() - 259200000).toISOString() },
    { id: 5, cliente: 'Luis García', total: 150.00, estado: 'pendiente', fecha: new Date(Date.now() - 345600000).toISOString() }
  ]
}

function getAlertasInventarioMock() {
  return [
    { id: 1, nombre: 'Producto X', stock: 2 },
    { id: 2, nombre: 'Producto Y', stock: 1 },
    { id: 3, nombre: 'Producto Z', stock: 0 }
  ]
}

// Función para limpiar cache
export function limpiarCacheEstadisticas() {
  estadisticasCache.value = {
    ultimaActualizacion: null,
    datos: null
  }
}

// Función para verificar si el cache es válido
export function esCacheValido(minutos = 5) {
  if (!estadisticasCache.value.ultimaActualizacion) return false
  
  const ahora = new Date()
  const ultimaActualizacion = new Date(estadisticasCache.value.ultimaActualizacion)
  const diferenciaMinutos = (ahora - ultimaActualizacion) / (1000 * 60)
  
  return diferenciaMinutos < minutos
}
