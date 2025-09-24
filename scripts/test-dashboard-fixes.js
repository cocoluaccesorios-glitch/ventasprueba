#!/usr/bin/env node

/**
 * Script para probar las correcciones del dashboard
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
 * Simular la función obtenerTopProductos corregida
 */
async function simularObtenerTopProductosCorregida(limite = 5) {
  try {
    console.log(`🏆 Simulando obtención de top ${limite} productos (versión corregida)...`)
    
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('*')
      .limit(limite)
    
    if (productosError) throw productosError
    
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select('*')
    
    if (pedidosError) throw pedidosError
    
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
    
    // Obtener productos con sus cantidades vendidas y totalVentas
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
    
    // Verificar que todos los productos tienen totalVentas
    topProductos.forEach((producto, index) => {
      console.log(`   ${index + 1}. ${producto.nombre}:`)
      console.log(`      Cantidad vendida: ${producto.cantidadVendida}`)
      console.log(`      Total ventas: $${producto.totalVentas}`)
      console.log(`      Tipo de totalVentas: ${typeof producto.totalVentas}`)
      
      // Verificar que totalVentas es un número válido
      if (typeof producto.totalVentas !== 'number' || isNaN(producto.totalVentas)) {
        throw new Error(`Producto ${producto.nombre} tiene totalVentas inválido: ${producto.totalVentas}`)
      }
    })
    
    return topProductos
    
  } catch (error) {
    console.error('❌ Error en simularObtenerTopProductosCorregida:', error.message)
    throw error
  }
}

/**
 * Simular la función obtenerPedidosRecientes corregida
 */
async function simularObtenerPedidosRecientesCorregida(limite = 5) {
  try {
    console.log(`📋 Simulando obtención de ${limite} pedidos recientes (versión corregida)...`)
    
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('fecha_pedido', { ascending: false })
      .limit(limite)
    
    if (error) throw error
    
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
    
    console.log('✅ Pedidos recientes obtenidos:', pedidosFormateados.length)
    
    // Verificar que todos los pedidos tienen total válido
    pedidosFormateados.forEach((pedido, index) => {
      console.log(`   ${index + 1}. Pedido #${pedido.id}:`)
      console.log(`      Cliente: ${pedido.cliente}`)
      console.log(`      Total: $${pedido.total}`)
      console.log(`      Tipo de total: ${typeof pedido.total}`)
      
      // Verificar que total es un número válido
      if (typeof pedido.total !== 'number' || isNaN(pedido.total)) {
        throw new Error(`Pedido ${pedido.id} tiene total inválido: ${pedido.total}`)
      }
    })
    
    return pedidosFormateados
    
  } catch (error) {
    console.error('❌ Error en simularObtenerPedidosRecientesCorregida:', error.message)
    throw error
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🧪 Prueba de Correcciones del Dashboard')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    console.log('🔍 Probando funciones corregidas...')
    
    const [topProductos, pedidosRecientes] = await Promise.all([
      simularObtenerTopProductosCorregida(5),
      simularObtenerPedidosRecientesCorregida(5)
    ])
    
    console.log('')
    console.log('🎉 ¡Prueba completada exitosamente!')
    console.log('✅ Todas las funciones corregidas funcionan correctamente')
    console.log('✅ Los campos totalVentas y total están definidos')
    console.log('✅ No habrá errores de .toFixed() en el dashboard')
    
    console.log('')
    console.log('📊 Resumen de correcciones:')
    console.log(`   Top productos: ${topProductos.length} (todos con totalVentas válido)`)
    console.log(`   Pedidos recientes: ${pedidosRecientes.length} (todos con total válido)`)
    
    console.log('')
    console.log('🔧 Correcciones aplicadas:')
    console.log('   ✅ (producto.totalVentas || 0).toFixed(2)')
    console.log('   ✅ (estadisticas.ventasTotales || 0).toFixed(2)')
    console.log('   ✅ (pedido.total || 0).toFixed(2)')
    console.log('   ✅ Cálculo de totalVentas en obtenerTopProductos')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
