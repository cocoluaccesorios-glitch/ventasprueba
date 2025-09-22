#!/usr/bin/env node

/**
 * Servicio para gestionar abonos
 * - Crear nuevos abonos
 * - Consultar abonos por pedido
 * - Calcular saldos pendientes
 * - Generar reportes de deudas
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
 * Crear un nuevo abono
 */
export async function crearAbono(abonoData) {
  try {
    console.log('🔄 Creando nuevo abono...')
    
    const { data: abono, error } = await supabase
      .from('abonos')
      .insert({
        pedido_id: abonoData.pedido_id,
        cliente_id: abonoData.cliente_id || null,
        monto_abono_usd: abonoData.monto_abono_usd || 0,
        monto_abono_ves: abonoData.monto_abono_ves || 0,
        tasa_bcv: abonoData.tasa_bcv || 166.58,
        metodo_pago_abono: abonoData.metodo_pago_abono,
        referencia_pago: abonoData.referencia_pago || null,
        tipo_abono: abonoData.tipo_abono || 'simple',
        fecha_vencimiento: abonoData.fecha_vencimiento || null,
        estado_abono: abonoData.estado_abono || 'confirmado',
        comentarios: abonoData.comentarios || null
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error al crear abono:', error.message)
      throw error
    }
    
    console.log(`✅ Abono creado exitosamente: ID ${abono.id}`)
    return abono
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    throw error
  }
}

/**
 * Obtener abonos de un pedido específico
 */
export async function obtenerAbonosPorPedido(pedidoId) {
  try {
    const { data: abonos, error } = await supabase
      .from('abonos')
      .select('*')
      .eq('pedido_id', pedidoId)
      .eq('estado_abono', 'confirmado')
      .order('fecha_abono', { ascending: true })
    
    if (error) {
      console.error('❌ Error al obtener abonos:', error.message)
      throw error
    }
    
    return abonos || []
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    throw error
  }
}

/**
 * Calcular saldo pendiente de un pedido
 */
export async function calcularSaldoPendiente(pedidoId) {
  try {
    // Obtener total del pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select('total_usd')
      .eq('id', pedidoId)
      .single()
    
    if (pedidoError) {
      console.error('❌ Error al obtener pedido:', pedidoError.message)
      throw pedidoError
    }
    
    // Obtener total abonado
    const { data: abonos, error: abonosError } = await supabase
      .from('abonos')
      .select('monto_abono_usd')
      .eq('pedido_id', pedidoId)
      .eq('estado_abono', 'confirmado')
    
    if (abonosError) {
      console.error('❌ Error al obtener abonos:', abonosError.message)
      throw abonosError
    }
    
    const totalPedido = pedido.total_usd || 0
    const totalAbonado = abonos.reduce((sum, abono) => sum + (abono.monto_abono_usd || 0), 0)
    const saldoPendiente = Math.max(totalPedido - totalAbonado, 0)
    
    return {
      totalPedido,
      totalAbonado,
      saldoPendiente,
      cantidadAbonos: abonos.length
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    throw error
  }
}

/**
 * Obtener resumen de deudas por cliente
 */
export async function obtenerResumenDeudasCliente(clienteCedula) {
  try {
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select(`
        id,
        total_usd,
        tasa_bcv,
        fecha_pedido,
        estado_entrega
      `)
      .eq('cliente_cedula', clienteCedula)
      .neq('estado_entrega', 'anulado')
      .order('fecha_pedido', { ascending: false })
    
    if (error) {
      console.error('❌ Error al obtener pedidos:', error.message)
      throw error
    }
    
    const resumen = {
      clienteCedula,
      totalDeudaUSD: 0,
      totalDeudaVES: 0,
      cantidadPedidos: 0,
      pedidos: []
    }
    
    for (const pedido of pedidos) {
      const saldo = await calcularSaldoPendiente(pedido.id)
      
      if (saldo.saldoPendiente > 0.01) {
        resumen.totalDeudaUSD += saldo.saldoPendiente
        resumen.totalDeudaVES += saldo.saldoPendiente * (pedido.tasa_bcv || 166.58)
        resumen.cantidadPedidos++
        
        resumen.pedidos.push({
          id: pedido.id,
          total: pedido.total_usd,
          abonado: saldo.totalAbonado,
          pendiente: saldo.saldoPendiente,
          tasaBCV: pedido.tasa_bcv,
          fecha: pedido.fecha_pedido,
          cantidadAbonos: saldo.cantidadAbonos
        })
      }
    }
    
    return resumen
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    throw error
  }
}

/**
 * Obtener todos los clientes con deudas
 */
export async function obtenerClientesConDeudas() {
  try {
    const { data: clientes, error } = await supabase
      .from('pedidos')
      .select(`
        cliente_cedula,
        cliente_nombre,
        cliente_apellido,
        cliente_telefono,
        cliente_email
      `)
      .neq('estado_entrega', 'anulado')
      .not('cliente_cedula', 'is', null)
      .order('cliente_cedula')
    
    if (error) {
      console.error('❌ Error al obtener clientes:', error.message)
      throw error
    }
    
    // Agrupar por cédula y obtener resumen de deudas
    const clientesUnicos = {}
    
    for (const pedido of clientes) {
      if (!clientesUnicos[pedido.cliente_cedula]) {
        clientesUnicos[pedido.cliente_cedula] = {
          cedula: pedido.cliente_cedula,
          nombre: pedido.cliente_nombre,
          apellido: pedido.cliente_apellido,
          telefono: pedido.cliente_telefono,
          email: pedido.cliente_email
        }
      }
    }
    
    const clientesConDeudas = []
    
    for (const cliente of Object.values(clientesUnicos)) {
      const resumen = await obtenerResumenDeudasCliente(cliente.cedula)
      
      if (resumen.totalDeudaUSD > 0.01) {
        clientesConDeudas.push({
          ...cliente,
          ...resumen
        })
      }
    }
    
    // Ordenar por deuda total
    clientesConDeudas.sort((a, b) => b.totalDeudaUSD - a.totalDeudaUSD)
    
    return clientesConDeudas
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    throw error
  }
}

/**
 * Generar reporte de deudas
 */
export async function generarReporteDeudas() {
  try {
    console.log('📊 Generando reporte de deudas...')
    
    const clientesConDeudas = await obtenerClientesConDeudas()
    
    const reporte = {
      fechaGeneracion: new Date().toISOString(),
      totalClientesConDeuda: clientesConDeudas.length,
      totalDeudaUSD: 0,
      totalDeudaVES: 0,
      clientes: clientesConDeudas
    }
    
    // Calcular totales
    clientesConDeudas.forEach(cliente => {
      reporte.totalDeudaUSD += cliente.totalDeudaUSD
      reporte.totalDeudaVES += cliente.totalDeudaVES
    })
    
    console.log(`📋 Reporte generado:`)
    console.log(`   - Clientes con deuda: ${reporte.totalClientesConDeuda}`)
    console.log(`   - Total deuda USD: $${reporte.totalDeudaUSD.toFixed(2)}`)
    console.log(`   - Total deuda VES: ${reporte.totalDeudaVES.toFixed(2)} Bs`)
    
    return reporte
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    throw error
  }
}

/**
 * Función principal para pruebas
 */
async function main() {
  try {
    console.log('🚀 Probando servicio de abonos...')
    
    // Generar reporte de deudas
    const reporte = await generarReporteDeudas()
    
    console.log('\n📊 Reporte de deudas:')
    reporte.clientes.forEach((cliente, index) => {
      console.log(`${index + 1}. ${cliente.nombre} ${cliente.apellido}`)
      console.log(`   - Cédula: ${cliente.cedula}`)
      console.log(`   - Deuda: $${cliente.totalDeudaUSD.toFixed(2)} USD (${cliente.totalDeudaVES.toFixed(2)} Bs)`)
      console.log(`   - Pedidos: ${cliente.cantidadPedidos}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
