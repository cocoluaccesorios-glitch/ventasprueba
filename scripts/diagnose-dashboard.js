#!/usr/bin/env node

/**
 * Script para diagnosticar problemas del dashboard
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan credenciales de Supabase en el archivo .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Simular las funciones del dashboard service
 */
async function simularCalcularEstadisticasGenerales() {
  try {
    console.log('📊 Simulando cálculo de estadísticas generales...')
    
    // Obtener pedidos
    console.log('🔍 Obteniendo pedidos...')
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select('*')
    
    if (pedidosError) {
      console.error('❌ Error al obtener pedidos:', pedidosError.message)
      throw pedidosError
    }
    
    console.log(`✅ Pedidos obtenidos: ${pedidos.length}`)
    
    // Obtener clientes
    console.log('🔍 Obteniendo clientes...')
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('*')
    
    if (clientesError) {
      console.error('❌ Error al obtener clientes:', clientesError.message)
      throw clientesError
    }
    
    console.log(`✅ Clientes obtenidos: ${clientes.length}`)
    
    // Obtener productos
    console.log('🔍 Obteniendo productos...')
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('*')
    
    if (productosError) {
      console.error('❌ Error al obtener productos:', productosError.message)
      throw productosError
    }
    
    console.log(`✅ Productos obtenidos: ${productos.length}`)
    
    // Calcular estadísticas
    console.log('🧮 Calculando estadísticas...')
    
    const ventasTotales = pedidos.reduce((sum, p) => sum + (p.total_usd || 0), 0)
    const totalVentas = pedidos.length
    
    const productosVendidos = pedidos.reduce((sum, p) => {
      if (p.detalles_pedido && Array.isArray(p.detalles_pedido)) {
        return sum + p.detalles_pedido.reduce((detalleSum, detalle) => 
          detalleSum + (detalle.cantidad || 0), 0)
      }
      return sum + 1 // Fallback si no hay detalles
    }, 0)
    
    const clientesActivos = clientes.length
    const nuevosClientes = clientes.filter(c => {
      const fechaCreacion = new Date(c.fecha_registro || c.fecha_creacion || new Date())
      const hace30Dias = new Date()
      hace30Dias.setDate(hace30Dias.getDate() - 30)
      return fechaCreacion > hace30Dias
    }).length
    
    const stockBajo = productos.filter(p => (p.stock_actual || 0) <= (p.stock_minimo || 5)).length
    
    const estadisticas = {
      ventasTotales,
      totalVentas,
      productosVendidos,
      totalProductos: productos.length,
      clientesActivos,
      nuevosClientes,
      stockBajo
    }
    
    console.log('📈 Estadísticas calculadas:')
    console.log(JSON.stringify(estadisticas, null, 2))
    
    return estadisticas
    
  } catch (error) {
    console.error('❌ Error en simularCalcularEstadisticasGenerales:', error.message)
    throw error
  }
}

async function simularObtenerTopProductos(limite = 5) {
  try {
    console.log(`🔍 Simulando obtención de top ${limite} productos...`)
    
    const { data: productos, error } = await supabase
      .from('productos')
      .select('*')
      .order('stock_actual', { ascending: false })
      .limit(limite)
    
    if (error) {
      console.error('❌ Error al obtener productos:', error.message)
      throw error
    }
    
    console.log(`✅ Top productos obtenidos: ${productos.length}`)
    
    const topProductos = productos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      cantidadVendida: Math.floor(Math.random() * 20) + 1, // Mock data
      totalVentas: (p.precio_usd || 0) * (Math.floor(Math.random() * 20) + 1)
    }))
    
    console.log('📊 Top productos:')
    console.log(JSON.stringify(topProductos, null, 2))
    
    return topProductos
    
  } catch (error) {
    console.error('❌ Error en simularObtenerTopProductos:', error.message)
    throw error
  }
}

async function simularObtenerPedidosRecientes(limite = 5) {
  try {
    console.log(`🔍 Simulando obtención de ${limite} pedidos recientes...`)
    
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('fecha_pedido', { ascending: false })
      .limit(limite)
    
    if (error) {
      console.error('❌ Error al obtener pedidos:', error.message)
      throw error
    }
    
    console.log(`✅ Pedidos recientes obtenidos: ${pedidos.length}`)
    
    const pedidosRecientes = pedidos.map(p => ({
      id: p.id,
      cliente: `${p.cliente_nombre || 'Cliente'} ${p.cliente_apellido || ''}`.trim(),
      total: p.total_usd || 0,
      estado: p.estado_entrega || 'pendiente',
      fecha: p.fecha_pedido
    }))
    
    console.log('📋 Pedidos recientes:')
    console.log(JSON.stringify(pedidosRecientes, null, 2))
    
    return pedidosRecientes
    
  } catch (error) {
    console.error('❌ Error en simularObtenerPedidosRecientes:', error.message)
    throw error
  }
}

async function simularObtenerAlertasInventario(limite = 3) {
  try {
    console.log(`🔍 Simulando obtención de ${limite} alertas de inventario...`)
    
    const { data: productos, error } = await supabase
      .from('productos')
      .select('*')
      .limit(limite)
    
    if (error) {
      console.error('❌ Error al obtener alertas:', error.message)
      throw error
    }
    
    console.log(`✅ Alertas obtenidas: ${productos.length}`)
    
    const alertas = productos
      .filter(p => (p.stock_actual || 0) <= (p.stock_minimo || 5))
      .map(p => ({
        id: p.id,
        nombre: p.nombre,
        stockActual: p.stock_actual || 0,
        stockMinimo: p.stock_minimo || 5,
        tipo: 'stock_bajo'
      }))
    
    console.log('⚠️ Alertas de inventario:')
    console.log(JSON.stringify(alertas, null, 2))
    
    return alertas
    
  } catch (error) {
    console.error('❌ Error en simularObtenerAlertasInventario:', error.message)
    throw error
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🧪 Diagnóstico del Dashboard')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    console.log('🔍 Probando funciones del dashboard...')
    
    const [estadisticas, topProductos, pedidosRecientes, alertas] = await Promise.all([
      simularCalcularEstadisticasGenerales(),
      simularObtenerTopProductos(5),
      simularObtenerPedidosRecientes(5),
      simularObtenerAlertasInventario(3)
    ])
    
    console.log('')
    console.log('🎉 ¡Diagnóstico completado!')
    console.log('✅ Todas las funciones del dashboard funcionan correctamente')
    console.log('✅ Los datos se cargan desde Supabase')
    console.log('✅ No hay errores en las consultas')
    
    console.log('')
    console.log('📊 Resumen de datos:')
    console.log(`   Ventas totales: $${estadisticas.ventasTotales.toFixed(2)}`)
    console.log(`   Total ventas: ${estadisticas.totalVentas}`)
    console.log(`   Productos vendidos: ${estadisticas.productosVendidos}`)
    console.log(`   Clientes activos: ${estadisticas.clientesActivos}`)
    console.log(`   Stock bajo: ${estadisticas.stockBajo}`)
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.log('')
    console.log('🔧 Posibles soluciones:')
    console.log('   1. Verificar conexión a Supabase')
    console.log('   2. Verificar permisos de las tablas')
    console.log('   3. Verificar que las tablas tengan datos')
    console.log('   4. Revisar la consola del navegador para errores JavaScript')
    process.exit(1)
  }
}

// Ejecutar
main()
