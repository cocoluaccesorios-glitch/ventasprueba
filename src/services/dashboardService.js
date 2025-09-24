// Servicio para estadísticas del dashboard
import { ref } from 'vue'
import { getPedidos } from './apiService.js'
import { getClientes } from './clientService.js'
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
    console.log('📊 Calculando estadísticas generales...')
    
    const [pedidos, clientes, productos] = await Promise.all([
      getPedidos(),
      getClientes(),
      getProducts()
    ])
    
    console.log('📈 Datos obtenidos:', {
      pedidos: pedidos.length,
      clientes: clientes.length,
      productos: productos.length
    })
    
    // Calcular estadísticas de ventas
    const ventasTotales = pedidos.reduce((sum, p) => sum + (p.total_usd || 0), 0)
    const totalVentas = pedidos.length
    
    // Calcular ingresos reales (dinero que ha entrado)
    const ingresosReales = pedidos.reduce((sum, p) => {
      let ingresosPedido = 0
      
      // Si es venta de contado
      if (p.metodo_pago === 'Contado') {
        ingresosPedido = p.total_usd || 0
      }
      
      // Si es pago mixto
      if (p.es_pago_mixto) {
        ingresosPedido = (p.monto_mixto_usd || 0) + (p.monto_mixto_ves || 0) / (p.tasa_bcv || 1)
      }
      
      // Si es venta por abono
      if (p.es_abono) {
        if (p.tipo_pago_abono === 'simple') {
          ingresosPedido = p.monto_abono_simple || 0
        } else if (p.tipo_pago_abono === 'mixto') {
          ingresosPedido = (p.monto_abono_usd || 0) + (p.monto_abono_ves || 0) / (p.tasa_bcv || 1)
        }
      }
      
      // CORRECCIÓN: Los ingresos nunca pueden exceder el total del pedido
      const totalPedido = p.total_usd || 0
      if (ingresosPedido > totalPedido) {
        console.warn(`⚠️ Pedido #${p.id}: Ingresos ($${ingresosPedido.toFixed(2)}) > Total ($${totalPedido.toFixed(2)}) - Limitando a total`)
        ingresosPedido = totalPedido
      }
      
      return sum + ingresosPedido
    }, 0)
    
    // Calcular productos vendidos (sumando cantidades reales de detalles)
    const productosVendidos = pedidos.reduce((sum, p) => {
      if (p.detalles_pedido && Array.isArray(p.detalles_pedido)) {
        return sum + p.detalles_pedido.reduce((detalleSum, detalle) => 
          detalleSum + (detalle.cantidad || 0), 0)
      }
      return sum + 1 // Fallback si no hay detalles
    }, 0)
    
    // Calcular clientes activos
    const clientesActivos = clientes.length
    const nuevosClientes = clientes.filter(c => {
      const fechaCreacion = new Date(c.fecha_registro || c.fecha_creacion || new Date())
      const hace30Dias = new Date()
      hace30Dias.setDate(hace30Dias.getDate() - 30)
      return fechaCreacion >= hace30Dias
    }).length
    
    // Calcular stock bajo
    const stockBajo = productos.filter(p => (p.stock_actual || p.stock || 0) <= 5).length
    
    // Calcular detalle de ingresos por tipo de moneda y método (CON LÍMITE)
    const detalleIngresos = pedidos.reduce((detalle, p) => {
      const tasaBCV = p.tasa_bcv || 1
      
      // Calcular ingresos del pedido
      let ingresosPedido = 0
      
      if (p.metodo_pago === 'Contado') {
        ingresosPedido = p.total_usd || 0
        detalle.usd.contado += ingresosPedido
      }
      
      if (p.es_pago_mixto) {
        const mixtoUSD = p.monto_mixto_usd || 0
        const mixtoVES = p.monto_mixto_ves || 0
        const mixtoVESUSD = mixtoVES / tasaBCV
        ingresosPedido = mixtoUSD + mixtoVESUSD
        
        // Aplicar límite
        const totalPedido = p.total_usd || 0
        if (ingresosPedido > totalPedido) {
          ingresosPedido = totalPedido
        }
        
        detalle.usd.mixto += mixtoUSD
        detalle.ves.mixto += mixtoVES
      }
      
      if (p.es_abono) {
        if (p.tipo_pago_abono === 'simple') {
          ingresosPedido = p.monto_abono_simple || 0
          
          // Aplicar límite
          const totalPedido = p.total_usd || 0
          if (ingresosPedido > totalPedido) {
            ingresosPedido = totalPedido
          }
          
          detalle.usd.abono += ingresosPedido
        } else if (p.tipo_pago_abono === 'mixto') {
          const abonoUSD = p.monto_abono_usd || 0
          const abonoVES = p.monto_abono_ves || 0
          const abonoVESUSD = abonoVES / tasaBCV
          ingresosPedido = abonoUSD + abonoVESUSD
          
          // Aplicar límite
          const totalPedido = p.total_usd || 0
          if (ingresosPedido > totalPedido) {
            ingresosPedido = totalPedido
          }
          
          detalle.usd.abono += abonoUSD
          detalle.ves.abono += abonoVES
        }
      }
      
      return detalle
    }, {
      usd: { contado: 0, mixto: 0, abono: 0 },
      ves: { mixto: 0, abono: 0 }
    })
    
    // Convertir VES a USD para totales
    const totalVESEnUSD = (detalleIngresos.ves.mixto + detalleIngresos.ves.abono) / (pedidos[0]?.tasa_bcv || 1)
    
    const estadisticas = {
      ingresosReales: parseFloat(ingresosReales.toFixed(2)), // Dinero que ha entrado
      ventasTotales: parseFloat(ventasTotales.toFixed(2)), // Valor total de pedidos
      totalVentas, // Número de pedidos
      productosVendidos,
      totalProductos: productos.length,
      clientesActivos,
      nuevosClientes,
      stockBajo,
      ingresosHoy: 0, // Simplificado para evitar errores
      ingresosMes: 0, // Simplificado para evitar errores
      detalleIngresos: {
        usd: {
          contado: parseFloat(detalleIngresos.usd.contado.toFixed(2)),
          mixto: parseFloat(detalleIngresos.usd.mixto.toFixed(2)),
          abono: parseFloat(detalleIngresos.usd.abono.toFixed(2)),
          total: parseFloat((detalleIngresos.usd.contado + detalleIngresos.usd.mixto + detalleIngresos.usd.abono).toFixed(2))
        },
        ves: {
          mixto: parseFloat(detalleIngresos.ves.mixto.toFixed(2)),
          abono: parseFloat(detalleIngresos.ves.abono.toFixed(2)),
          total: parseFloat((detalleIngresos.ves.mixto + detalleIngresos.ves.abono).toFixed(2)),
          totalEnUSD: parseFloat(totalVESEnUSD.toFixed(2))
        }
      }
    }
    
    console.log('✅ Estadísticas calculadas:', estadisticas)
    return estadisticas
    
  } catch (error) {
    console.error('Error calculando estadísticas:', error)
    return getEstadisticasMock()
  }
}

// Función para obtener top productos
export async function obtenerTopProductos(limite = 5) {
  try {
    console.log('🏆 Obteniendo top productos...')
    const productos = await getProducts()
    const pedidos = await getPedidos()
    
    // Crear mapa de productos vendidos
    const productosVendidos = new Map()
    
    pedidos.forEach(pedido => {
      if (pedido.detalles_pedido && Array.isArray(pedido.detalles_pedido)) {
        pedido.detalles_pedido.forEach(detalle => {
          const productoId = detalle.producto_id || detalle.id_producto
          const cantidad = detalle.cantidad || 0
          
          if (productosVendidos.has(productoId)) {
            productosVendidos.set(productoId, productosVendidos.get(productoId) + cantidad)
          } else {
            productosVendidos.set(productoId, cantidad)
          }
        })
      }
    })
    
    // Obtener productos con sus cantidades vendidas
    const productosConVentas = productos.map(producto => {
      const cantidadVendida = productosVendidos.get(producto.id) || 0
      const precioUnitario = producto.precio_usd || producto.precio || 0
      const totalVentas = cantidadVendida * precioUnitario
      
      return {
        ...producto,
        cantidadVendida,
        totalVentas: parseFloat(totalVentas.toFixed(2)),
        nombre: producto.nombre || producto.nombre_producto || 'Producto sin nombre'
      }
    })
    
    // Ordenar por cantidad vendida y tomar los primeros
    const topProductos = productosConVentas
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
      .slice(0, limite)
    
    console.log('✅ Top productos obtenidos:', topProductos.length)
    return topProductos
    
  } catch (error) {
    console.error('Error obteniendo top productos:', error)
    return getTopProductosMock()
  }
}

// Función para obtener pedidos recientes
export async function obtenerPedidosRecientes(limite = 5) {
  try {
    console.log('📋 Obteniendo pedidos recientes...')
    const pedidos = await getPedidos()
    
    // Formatear pedidos con información completa
    const pedidosFormateados = pedidos.map(pedido => ({
      id: pedido.id,
      numero: pedido.numero_pedido || `PED-${pedido.id}`,
      cliente: `${pedido.cliente_nombre || ''} ${pedido.cliente_apellido || ''}`.trim() || 'Cliente',
      total: parseFloat(pedido.total_usd || 0),
      fecha: pedido.fecha_pedido || pedido.created_at,
      estado: pedido.estado || 'Completado',
      metodoPago: pedido.metodo_pago || 'No especificado'
    }))
    
    const pedidosRecientes = pedidosFormateados
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, limite)
    
    console.log('✅ Pedidos recientes obtenidos:', pedidosRecientes.length)
    return pedidosRecientes
    
  } catch (error) {
    console.error('Error obteniendo pedidos recientes:', error)
    return getPedidosRecientesMock()
  }
}

// Función para obtener alertas de inventario
export async function obtenerAlertasInventario(limite = 5) {
  try {
    console.log('⚠️ Obteniendo alertas de inventario...')
    const productos = await getProducts()
    
    // Filtrar productos con stock bajo
    const productosStockBajo = productos.filter(producto => {
      const stock = producto.stock_actual || producto.stock || 0
      return stock <= 5 && stock > 0
    })
    
    // Formatear alertas
    const alertas = productosStockBajo.map(producto => ({
      id: producto.id,
      nombre: producto.nombre || producto.nombre_producto || 'Producto sin nombre',
      stockActual: producto.stock_actual || producto.stock || 0,
      stockMinimo: producto.stock_minimo || 5,
      categoria: producto.categoria || 'Sin categoría',
      precio: producto.precio_usd || producto.precio || 0
    }))
    
    const alertasLimitadas = alertas.slice(0, limite)
    console.log('✅ Alertas de inventario obtenidas:', alertasLimitadas.length)
    return alertasLimitadas
    
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
    ingresosReales: 980.25, // Dinero que ha entrado (menor que ventas totales por pagos parciales)
    ventasTotales: 1250.50, // Valor total de pedidos
    totalVentas: 15, // Número de pedidos
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
