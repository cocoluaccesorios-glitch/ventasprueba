// Servicio de reportes avanzados
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient.js'
import { getPedidos } from './apiService.js'
import { getClientes } from './clientService.js'
import { obtenerProductos } from './productosService.js'
import { getIngresos } from './ingresosService.js'
import Swal from 'sweetalert2'

// Estado global de reportes
const reportes = ref([])
const cargando = ref(false)

// Función para generar reporte de ventas por período
export async function generarReporteVentas(fechaInicio, fechaFin) {
  cargando.value = true
  
  try {
    console.log('📊 Generando reporte de ventas...')
    
    const pedidos = await getPedidos()
    const ingresos = await getIngresos()
    
    // Filtrar pedidos por período
    const pedidosPeriodo = pedidos.filter(pedido => {
      const fechaPedido = new Date(pedido.fecha_pedido || pedido.created_at)
      return fechaPedido >= new Date(fechaInicio) && fechaPedido <= new Date(fechaFin)
    })
    
    // Calcular estadísticas
    const totalVentas = pedidosPeriodo.length
    const totalIngresosUSD = pedidosPeriodo.reduce((sum, p) => sum + (p.total_usd || 0), 0)
    const totalIngresosVES = pedidosPeriodo.reduce((sum, p) => sum + (p.total_ves || 0), 0)
    
    // Ventas por día
    const ventasPorDia = {}
    pedidosPeriodo.forEach(pedido => {
      const fecha = new Date(pedido.fecha_pedido || pedido.created_at).toISOString().split('T')[0]
      if (!ventasPorDia[fecha]) {
        ventasPorDia[fecha] = { cantidad: 0, totalUSD: 0, totalVES: 0 }
      }
      ventasPorDia[fecha].cantidad++
      ventasPorDia[fecha].totalUSD += pedido.total_usd || 0
      ventasPorDia[fecha].totalVES += pedido.total_ves || 0
    })
    
    // Ventas por método de pago
    const ventasPorMetodo = {}
    pedidosPeriodo.forEach(pedido => {
      const metodo = pedido.metodo_pago || 'No especificado'
      if (!ventasPorMetodo[metodo]) {
        ventasPorMetodo[metodo] = { cantidad: 0, totalUSD: 0 }
      }
      ventasPorMetodo[metodo].cantidad++
      ventasPorMetodo[metodo].totalUSD += pedido.total_usd || 0
    })
    
    // Top clientes
    const clientesMap = {}
    pedidosPeriodo.forEach(pedido => {
      const clienteId = pedido.cliente_id
      const clienteNombre = `${pedido.cliente_nombre || ''} ${pedido.cliente_apellido || ''}`.trim()
      
      if (!clientesMap[clienteId]) {
        clientesMap[clienteId] = {
          nombre: clienteNombre,
          cantidadPedidos: 0,
          totalUSD: 0
        }
      }
      clientesMap[clienteId].cantidadPedidos++
      clientesMap[clienteId].totalUSD += pedido.total_usd || 0
    })
    
    const topClientes = Object.values(clientesMap)
      .sort((a, b) => b.totalUSD - a.totalUSD)
      .slice(0, 10)
    
    const reporte = {
      periodo: {
        fechaInicio,
        fechaFin
      },
      resumen: {
        totalVentas,
        totalIngresosUSD: parseFloat(totalIngresosUSD.toFixed(2)),
        totalIngresosVES: parseFloat(totalIngresosVES.toFixed(2)),
        promedioVentaUSD: totalVentas > 0 ? parseFloat((totalIngresosUSD / totalVentas).toFixed(2)) : 0
      },
      ventasPorDia: Object.entries(ventasPorDia).map(([fecha, datos]) => ({
        fecha,
        cantidad: datos.cantidad,
        totalUSD: parseFloat(datos.totalUSD.toFixed(2)),
        totalVES: parseFloat(datos.totalVES.toFixed(2))
      })),
      ventasPorMetodo: Object.entries(ventasPorMetodo).map(([metodo, datos]) => ({
        metodo,
        cantidad: datos.cantidad,
        totalUSD: parseFloat(datos.totalUSD.toFixed(2)),
        porcentaje: totalIngresosUSD > 0 ? parseFloat(((datos.totalUSD / totalIngresosUSD) * 100).toFixed(2)) : 0
      })),
      topClientes: topClientes.map(cliente => ({
        ...cliente,
        totalUSD: parseFloat(cliente.totalUSD.toFixed(2))
      }))
    }
    
    console.log('✅ Reporte de ventas generado')
    return reporte
    
  } catch (error) {
    console.error('Error al generar reporte de ventas:', error)
    throw error
  } finally {
    cargando.value = false
  }
}

// Función para generar reporte de inventario
export async function generarReporteInventario() {
  cargando.value = true
  
  try {
    console.log('📦 Generando reporte de inventario...')
    
    const productos = await obtenerProductos()
    
    // Estadísticas generales
    const totalProductos = productos.length
    const productosActivos = productos.filter(p => p.activo).length
    const productosStockBajo = productos.filter(p => p.stock_actual <= p.stock_minimo).length
    const productosSinStock = productos.filter(p => p.stock_actual === 0).length
    
    // Valor del inventario
    const valorInventarioUSD = productos.reduce((sum, p) => 
      sum + ((p.stock_actual || 0) * (p.precio_usd || 0)), 0)
    
    const valorInventarioVES = productos.reduce((sum, p) => 
      sum + ((p.stock_actual || 0) * (p.precio_ves || 0)), 0)
    
    // Productos por categoría
    const productosPorCategoria = {}
    productos.forEach(producto => {
      const categoria = producto.categoria || 'Sin categoría'
      if (!productosPorCategoria[categoria]) {
        productosPorCategoria[categoria] = {
          cantidad: 0,
          valorUSD: 0,
          valorVES: 0
        }
      }
      productosPorCategoria[categoria].cantidad++
      productosPorCategoria[categoria].valorUSD += (producto.stock_actual || 0) * (producto.precio_usd || 0)
      productosPorCategoria[categoria].valorVES += (producto.stock_actual || 0) * (producto.precio_ves || 0)
    })
    
    // Top productos por valor
    const productosPorValor = productos
      .map(p => ({
        id: p.id,
        nombre: p.nombre || p.nombre_producto,
        sku: p.sku,
        stock: p.stock_actual || 0,
        precioUSD: p.precio_usd || 0,
        precioVES: p.precio_ves || 0,
        valorUSD: (p.stock_actual || 0) * (p.precio_usd || 0),
        valorVES: (p.stock_actual || 0) * (p.precio_ves || 0),
        categoria: p.categoria || 'Sin categoría'
      }))
      .sort((a, b) => b.valorUSD - a.valorUSD)
      .slice(0, 20)
    
    // Productos con stock bajo
    const productosStockBajoDetalle = productos
      .filter(p => p.stock_actual <= p.stock_minimo)
      .map(p => ({
        id: p.id,
        nombre: p.nombre || p.nombre_producto,
        sku: p.sku,
        stockActual: p.stock_actual || 0,
        stockMinimo: p.stock_minimo || 0,
        diferencia: (p.stock_actual || 0) - (p.stock_minimo || 0),
        categoria: p.categoria || 'Sin categoría'
      }))
      .sort((a, b) => a.diferencia - b.diferencia)
    
    const reporte = {
      fechaGeneracion: new Date().toISOString(),
      resumen: {
        totalProductos,
        productosActivos,
        productosStockBajo,
        productosSinStock,
        valorInventarioUSD: parseFloat(valorInventarioUSD.toFixed(2)),
        valorInventarioVES: parseFloat(valorInventarioVES.toFixed(2))
      },
      productosPorCategoria: Object.entries(productosPorCategoria).map(([categoria, datos]) => ({
        categoria,
        cantidad: datos.cantidad,
        valorUSD: parseFloat(datos.valorUSD.toFixed(2)),
        valorVES: parseFloat(datos.valorVES.toFixed(2)),
        porcentaje: valorInventarioUSD > 0 ? parseFloat(((datos.valorUSD / valorInventarioUSD) * 100).toFixed(2)) : 0
      })),
      topProductosPorValor: productosPorValor.map(p => ({
        ...p,
        valorUSD: parseFloat(p.valorUSD.toFixed(2)),
        valorVES: parseFloat(p.valorVES.toFixed(2))
      })),
      productosStockBajo: productosStockBajoDetalle
    }
    
    console.log('✅ Reporte de inventario generado')
    return reporte
    
  } catch (error) {
    console.error('Error al generar reporte de inventario:', error)
    throw error
  } finally {
    cargando.value = false
  }
}

// Función para generar reporte de clientes
export async function generarReporteClientes() {
  cargando.value = true
  
  try {
    console.log('👥 Generando reporte de clientes...')
    
    const clientes = await getClientes()
    const pedidos = await getPedidos()
    
    // Estadísticas generales
    const totalClientes = clientes.length
    const clientesActivos = clientes.filter(c => c.activo !== false).length
    
    // Clientes por período de registro
    const clientesPorMes = {}
    clientes.forEach(cliente => {
      const fecha = new Date(cliente.fecha_registro || cliente.fecha_creacion || new Date())
      const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
      
      if (!clientesPorMes[mes]) {
        clientesPorMes[mes] = 0
      }
      clientesPorMes[mes]++
    })
    
    // Top clientes por compras
    const clientesCompras = {}
    pedidos.forEach(pedido => {
      const clienteId = pedido.cliente_id
      const clienteNombre = `${pedido.cliente_nombre || ''} ${pedido.cliente_apellido || ''}`.trim()
      
      if (!clientesCompras[clienteId]) {
        clientesCompras[clienteId] = {
          nombre: clienteNombre,
          cantidadPedidos: 0,
          totalUSD: 0,
          ultimaCompra: null
        }
      }
      
      clientesCompras[clienteId].cantidadPedidos++
      clientesCompras[clienteId].totalUSD += pedido.total_usd || 0
      
      const fechaPedido = new Date(pedido.fecha_pedido || pedido.created_at)
      if (!clientesCompras[clienteId].ultimaCompra || fechaPedido > clientesCompras[clienteId].ultimaCompra) {
        clientesCompras[clienteId].ultimaCompra = fechaPedido
      }
    })
    
    const topClientes = Object.values(clientesCompras)
      .sort((a, b) => b.totalUSD - a.totalUSD)
      .slice(0, 20)
    
    // Clientes nuevos (últimos 30 días)
    const hace30Dias = new Date()
    hace30Dias.setDate(hace30Dias.getDate() - 30)
    
    const clientesNuevos = clientes.filter(c => {
      const fechaCreacion = new Date(c.fecha_registro || c.fecha_creacion || new Date())
      return fechaCreacion >= hace30Dias
    })
    
    // Clientes inactivos (sin compras en 90 días)
    const hace90Dias = new Date()
    hace90Dias.setDate(hace90Dias.getDate() - 90)
    
    const clientesInactivos = Object.values(clientesCompras)
      .filter(cliente => {
        return cliente.ultimaCompra && cliente.ultimaCompra < hace90Dias
      })
      .sort((a, b) => a.ultimaCompra - b.ultimaCompra)
    
    const reporte = {
      fechaGeneracion: new Date().toISOString(),
      resumen: {
        totalClientes,
        clientesActivos,
        clientesNuevos: clientesNuevos.length,
        clientesInactivos: clientesInactivos.length
      },
      clientesPorMes: Object.entries(clientesPorMes).map(([mes, cantidad]) => ({
        mes,
        cantidad
      })),
      topClientes: topClientes.map(cliente => ({
        ...cliente,
        totalUSD: parseFloat(cliente.totalUSD.toFixed(2)),
        ultimaCompra: cliente.ultimaCompra?.toISOString()
      })),
      clientesInactivos: clientesInactivos.map(cliente => ({
        ...cliente,
        totalUSD: parseFloat(cliente.totalUSD.toFixed(2)),
        ultimaCompra: cliente.ultimaCompra?.toISOString()
      }))
    }
    
    console.log('✅ Reporte de clientes generado')
    return reporte
    
  } catch (error) {
    console.error('Error al generar reporte de clientes:', error)
    throw error
  } finally {
    cargando.value = false
  }
}

// Función para generar reporte financiero
export async function generarReporteFinanciero(fechaInicio, fechaFin) {
  cargando.value = true
  
  try {
    console.log('💰 Generando reporte financiero...')
    
    const ingresos = await getIngresos()
    const pedidos = await getPedidos()
    
    // Filtrar datos por período
    const ingresosPeriodo = ingresos.filter(ingreso => {
      const fecha = new Date(ingreso.fecha)
      return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin)
    })
    
    const pedidosPeriodo = pedidos.filter(pedido => {
      const fecha = new Date(pedido.fecha_pedido || pedido.created_at)
      return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin)
    })
    
    // Ingresos por método de pago
    const ingresosPorMetodo = {}
    ingresosPeriodo.forEach(ingreso => {
      const metodo = ingreso.metodoPago || 'No especificado'
      if (!ingresosPorMetodo[metodo]) {
        ingresosPorMetodo[metodo] = { totalUSD: 0, totalVES: 0, cantidad: 0 }
      }
      ingresosPorMetodo[metodo].totalUSD += ingreso.montoUSD || 0
      ingresosPorMetodo[metodo].totalVES += ingreso.montoVES || 0
      ingresosPorMetodo[metodo].cantidad++
    })
    
    // Ingresos por tipo
    const ingresosPorTipo = {}
    ingresosPeriodo.forEach(ingreso => {
      const tipo = ingreso.tipoIngreso || 'No especificado'
      if (!ingresosPorTipo[tipo]) {
        ingresosPorTipo[tipo] = { totalUSD: 0, totalVES: 0, cantidad: 0 }
      }
      ingresosPorTipo[tipo].totalUSD += ingreso.montoUSD || 0
      ingresosPorTipo[tipo].totalVES += ingreso.montoVES || 0
      ingresosPorTipo[tipo].cantidad++
    })
    
    // Ingresos por día
    const ingresosPorDia = {}
    ingresosPeriodo.forEach(ingreso => {
      const fecha = new Date(ingreso.fecha).toISOString().split('T')[0]
      if (!ingresosPorDia[fecha]) {
        ingresosPorDia[fecha] = { totalUSD: 0, totalVES: 0, cantidad: 0 }
      }
      ingresosPorDia[fecha].totalUSD += ingreso.montoUSD || 0
      ingresosPorDia[fecha].totalVES += ingreso.montoVES || 0
      ingresosPorDia[fecha].cantidad++
    })
    
    // Totales generales
    const totalIngresosUSD = ingresosPeriodo.reduce((sum, i) => sum + (i.montoUSD || 0), 0)
    const totalIngresosVES = ingresosPeriodo.reduce((sum, i) => sum + (i.montoVES || 0), 0)
    const totalTransacciones = ingresosPeriodo.length
    
    const reporte = {
      periodo: {
        fechaInicio,
        fechaFin
      },
      resumen: {
        totalIngresosUSD: parseFloat(totalIngresosUSD.toFixed(2)),
        totalIngresosVES: parseFloat(totalIngresosVES.toFixed(2)),
        totalTransacciones,
        promedioTransaccionUSD: totalTransacciones > 0 ? parseFloat((totalIngresosUSD / totalTransacciones).toFixed(2)) : 0
      },
      ingresosPorMetodo: Object.entries(ingresosPorMetodo).map(([metodo, datos]) => ({
        metodo,
        totalUSD: parseFloat(datos.totalUSD.toFixed(2)),
        totalVES: parseFloat(datos.totalVES.toFixed(2)),
        cantidad: datos.cantidad,
        porcentaje: totalIngresosUSD > 0 ? parseFloat(((datos.totalUSD / totalIngresosUSD) * 100).toFixed(2)) : 0
      })),
      ingresosPorTipo: Object.entries(ingresosPorTipo).map(([tipo, datos]) => ({
        tipo,
        totalUSD: parseFloat(datos.totalUSD.toFixed(2)),
        totalVES: parseFloat(datos.totalVES.toFixed(2)),
        cantidad: datos.cantidad,
        porcentaje: totalIngresosUSD > 0 ? parseFloat(((datos.totalUSD / totalIngresosUSD) * 100).toFixed(2)) : 0
      })),
      ingresosPorDia: Object.entries(ingresosPorDia).map(([fecha, datos]) => ({
        fecha,
        totalUSD: parseFloat(datos.totalUSD.toFixed(2)),
        totalVES: parseFloat(datos.totalVES.toFixed(2)),
        cantidad: datos.cantidad
      }))
    }
    
    console.log('✅ Reporte financiero generado')
    return reporte
    
  } catch (error) {
    console.error('Error al generar reporte financiero:', error)
    throw error
  } finally {
    cargando.value = false
  }
}

// Función para exportar reporte a CSV
export function exportarReporteCSV(reporte, nombreArchivo) {
  let csvContent = ''
  
  if (reporte.resumen) {
    // Exportar resumen
    csvContent += 'RESUMEN\n'
    csvContent += Object.entries(reporte.resumen).map(([key, value]) => 
      `${key},${value}`
    ).join('\n') + '\n\n'
  }
  
  if (reporte.ventasPorDia) {
    // Exportar ventas por día
    csvContent += 'VENTAS POR DIA\n'
    csvContent += 'Fecha,Cantidad,Total USD,Total VES\n'
    csvContent += reporte.ventasPorDia.map(item => 
      `${item.fecha},${item.cantidad},${item.totalUSD},${item.totalVES}`
    ).join('\n') + '\n\n'
  }
  
  if (reporte.ventasPorMetodo) {
    // Exportar ventas por método
    csvContent += 'VENTAS POR METODO\n'
    csvContent += 'Método,Cantidad,Total USD,Porcentaje\n'
    csvContent += reporte.ventasPorMetodo.map(item => 
      `${item.metodo},${item.cantidad},${item.totalUSD},${item.porcentaje}%`
    ).join('\n') + '\n\n'
  }
  
  if (reporte.topClientes) {
    // Exportar top clientes
    csvContent += 'TOP CLIENTES\n'
    csvContent += 'Cliente,Cantidad Pedidos,Total USD\n'
    csvContent += reporte.topClientes.map(item => 
      `${item.nombre},${item.cantidadPedidos},${item.totalUSD}`
    ).join('\n') + '\n\n'
  }
  
  // Crear y descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  console.log('✅ Reporte exportado a CSV')
}

// Función para exportar reporte a PDF (usando jsPDF)
export function exportarReportePDF(reporte, nombreArchivo) {
  // Esta función requeriría jsPDF para generar PDFs
  // Por ahora, mostraremos un mensaje informativo
  Swal.fire({
    title: 'Exportar PDF',
    text: 'La funcionalidad de exportación a PDF está en desarrollo. Por ahora, puedes usar la exportación CSV.',
    icon: 'info',
    confirmButtonText: 'Entendido'
  })
}

// Getters para el estado
export function getReportes() {
  return reportes.value
}

export function getCargando() {
  return cargando.value
}
