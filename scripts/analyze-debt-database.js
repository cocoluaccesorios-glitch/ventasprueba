#!/usr/bin/env node

/**
 * Script para analizar la base de datos de deudas
 * - Analiza cuentas por cobrar
 * - Identifica problemas en el cálculo de deudas
 * - Genera reportes de deudas por cliente
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
 * Analizar todas las deudas de la base de datos
 */
async function analizarDeudas() {
  try {
    console.log('🔍 Analizando base de datos de deudas...')
    
    // 1. Obtener todos los pedidos con información de deudas
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select(`
        id,
        cliente_cedula,
        cliente_nombre,
        cliente_apellido,
        cliente_telefono,
        cliente_email,
        total_usd,
        tasa_bcv,
        metodo_pago,
        es_abono,
        tipo_pago_abono,
        total_abono_usd,
        monto_abono_simple,
        monto_abono_usd,
        monto_abono_ves,
        estado_entrega,
        fecha_pedido,
        fecha_vencimiento
      `)
      .order('id', { ascending: false })
    
    if (pedidosError) {
      console.error('❌ Error al obtener pedidos:', pedidosError.message)
      return false
    }
    
    console.log(`📊 Total de pedidos encontrados: ${pedidos.length}`)
    
    // 2. Analizar por tipo de pago
    const analisisPorTipo = analizarPorTipoPago(pedidos)
    
    // 3. Analizar deudas pendientes
    const analisisDeudas = analizarDeudasPendientes(pedidos)
    
    // 4. Analizar por cliente
    const analisisPorCliente = analizarPorCliente(pedidos)
    
    // 5. Identificar problemas
    const problemas = identificarProblemas(pedidos)
    
    // 6. Generar reportes
    generarReportes(analisisPorTipo, analisisDeudas, analisisPorCliente, problemas)
    
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Analizar pedidos por tipo de pago
 */
function analizarPorTipoPago(pedidos) {
  console.log('\n📋 Análisis por Tipo de Pago:')
  
  const tipos = {}
  
  pedidos.forEach(pedido => {
    const tipo = pedido.metodo_pago || 'No especificado'
    
    if (!tipos[tipo]) {
      tipos[tipo] = {
        cantidad: 0,
        totalUSD: 0,
        totalVES: 0,
        pendientes: 0,
        pagados: 0,
        anulados: 0
      }
    }
    
    tipos[tipo].cantidad++
    tipos[tipo].totalUSD += pedido.total_usd || 0
    tipos[tipo].totalVES += (pedido.total_usd || 0) * (pedido.tasa_bcv || 166.58)
    
    // Clasificar por estado
    if (pedido.estado_entrega === 'anulado') {
      tipos[tipo].anulados++
    } else if (esPedidoPagado(pedido)) {
      tipos[tipo].pagados++
    } else {
      tipos[tipo].pendientes++
    }
  })
  
  // Mostrar resultados
  Object.entries(tipos).forEach(([tipo, datos]) => {
    console.log(`\n   💳 ${tipo}:`)
    console.log(`      - Cantidad: ${datos.cantidad} pedidos`)
    console.log(`      - Total USD: $${datos.totalUSD.toFixed(2)}`)
    console.log(`      - Total VES: ${datos.totalVES.toFixed(2)} Bs`)
    console.log(`      - Pendientes: ${datos.pendientes}`)
    console.log(`      - Pagados: ${datos.pagados}`)
    console.log(`      - Anulados: ${datos.anulados}`)
  })
  
  return tipos
}

/**
 * Analizar deudas pendientes
 */
function analizarDeudasPendientes(pedidos) {
  console.log('\n💰 Análisis de Deudas Pendientes:')
  
  const deudasPendientes = pedidos.filter(pedido => 
    pedido.estado_entrega !== 'anulado' && !esPedidoPagado(pedido)
  )
  
  const totalDeudaUSD = deudasPendientes.reduce((sum, pedido) => {
    const totalPedido = pedido.total_usd || 0
    const totalAbonado = pedido.total_abono_usd || 0
    return sum + (totalPedido - totalAbonado)
  }, 0)
  
  const totalDeudaVES = deudasPendientes.reduce((sum, pedido) => {
    const totalPedido = pedido.total_usd || 0
    const totalAbonado = pedido.total_abono_usd || 0
    const saldoPendiente = totalPedido - totalAbonado
    const tasaBCV = pedido.tasa_bcv || 166.58
    return sum + (saldoPendiente * tasaBCV)
  }, 0)
  
  console.log(`   📊 Total de pedidos con deuda: ${deudasPendientes.length}`)
  console.log(`   💵 Total deuda en USD: $${totalDeudaUSD.toFixed(2)}`)
  console.log(`   💰 Total deuda en VES: ${totalDeudaVES.toFixed(2)} Bs`)
  
  // Análisis por rango de deuda
  const rangos = {
    '0-10': 0,
    '10-50': 0,
    '50-100': 0,
    '100-500': 0,
    '500+': 0
  }
  
  deudasPendientes.forEach(pedido => {
    const totalPedido = pedido.total_usd || 0
    const totalAbonado = pedido.total_abono_usd || 0
    const saldoPendiente = totalPedido - totalAbonado
    
    if (saldoPendiente <= 10) rangos['0-10']++
    else if (saldoPendiente <= 50) rangos['10-50']++
    else if (saldoPendiente <= 100) rangos['50-100']++
    else if (saldoPendiente <= 500) rangos['100-500']++
    else rangos['500+']++
  })
  
  console.log('\n   📈 Distribución por rango de deuda:')
  Object.entries(rangos).forEach(([rango, cantidad]) => {
    console.log(`      - $${rango}: ${cantidad} pedidos`)
  })
  
  return {
    totalPedidos: deudasPendientes.length,
    totalDeudaUSD,
    totalDeudaVES,
    rangos
  }
}

/**
 * Analizar deudas por cliente
 */
function analizarPorCliente(pedidos) {
  console.log('\n👥 Análisis de Deudas por Cliente:')
  
  const clientes = {}
  
  pedidos.forEach(pedido => {
    if (pedido.estado_entrega === 'anulado') return
    
    const clienteKey = `${pedido.cliente_cedula}_${pedido.cliente_nombre}`
    
    if (!clientes[clienteKey]) {
      clientes[clienteKey] = {
        cedula: pedido.cliente_cedula,
        nombre: pedido.cliente_nombre,
        apellido: pedido.cliente_apellido,
        telefono: pedido.cliente_telefono,
        email: pedido.cliente_email,
        pedidos: [],
        totalDeudaUSD: 0,
        totalDeudaVES: 0,
        cantidadPedidos: 0
      }
    }
    
    const totalPedido = pedido.total_usd || 0
    const totalAbonado = pedido.total_abono_usd || 0
    const saldoPendiente = totalPedido - totalAbonado
    
    if (saldoPendiente > 0.01) {
      clientes[clienteKey].pedidos.push({
        id: pedido.id,
        total: totalPedido,
        abonado: totalAbonado,
        pendiente: saldoPendiente,
        fecha: pedido.fecha_pedido,
        tasaBCV: pedido.tasa_bcv
      })
      
      clientes[clienteKey].totalDeudaUSD += saldoPendiente
      clientes[clienteKey].totalDeudaVES += saldoPendiente * (pedido.tasa_bcv || 166.58)
      clientes[clienteKey].cantidadPedidos++
    }
  })
  
  // Filtrar solo clientes con deuda
  const clientesConDeuda = Object.values(clientes).filter(cliente => cliente.totalDeudaUSD > 0.01)
  
  // Ordenar por deuda total
  clientesConDeuda.sort((a, b) => b.totalDeudaUSD - a.totalDeudaUSD)
  
  console.log(`   📊 Total de clientes con deuda: ${clientesConDeuda.length}`)
  
  // Mostrar top 10 clientes con mayor deuda
  console.log('\n   🏆 Top 10 Clientes con Mayor Deuda:')
  clientesConDeuda.slice(0, 10).forEach((cliente, index) => {
    console.log(`      ${index + 1}. ${cliente.nombre} ${cliente.apellido}`)
    console.log(`         - Cédula: ${cliente.cedula}`)
    console.log(`         - Teléfono: ${cliente.telefono}`)
    console.log(`         - Deuda USD: $${cliente.totalDeudaUSD.toFixed(2)}`)
    console.log(`         - Deuda VES: ${cliente.totalDeudaVES.toFixed(2)} Bs`)
    console.log(`         - Pedidos pendientes: ${cliente.cantidadPedidos}`)
  })
  
  return clientesConDeuda
}

/**
 * Identificar problemas en la base de datos
 */
function identificarProblemas(pedidos) {
  console.log('\n⚠️  Identificando Problemas:')
  
  const problemas = {
    tasaBCVIncorrecta: [],
    totalAbonoIncorrecto: [],
    datosIncompletos: [],
    inconsistencias: []
  }
  
  pedidos.forEach(pedido => {
    // 1. Tasa BCV incorrecta
    if (pedido.tasa_bcv === 160) {
      problemas.tasaBCVIncorrecta.push(pedido.id)
    }
    
    // 2. Total abono incorrecto
    if ((pedido.es_abono || pedido.metodo_pago === 'Abono') && pedido.total_abono_usd === 0) {
      problemas.totalAbonoIncorrecto.push(pedido.id)
    }
    
    // 3. Datos incompletos
    if (!pedido.cliente_nombre || !pedido.cliente_telefono) {
      problemas.datosIncompletos.push(pedido.id)
    }
    
    // 4. Inconsistencias
    if (pedido.estado_entrega === 'entregado' && !esPedidoPagado(pedido)) {
      problemas.inconsistencias.push(pedido.id)
    }
  })
  
  // Mostrar problemas encontrados
  if (problemas.tasaBCVIncorrecta.length > 0) {
    console.log(`   ❌ Tasa BCV incorrecta (160): ${problemas.tasaBCVIncorrecta.length} pedidos`)
    console.log(`      IDs: ${problemas.tasaBCVIncorrecta.join(', ')}`)
  }
  
  if (problemas.totalAbonoIncorrecto.length > 0) {
    console.log(`   ❌ Total abono incorrecto: ${problemas.totalAbonoIncorrecto.length} pedidos`)
    console.log(`      IDs: ${problemas.totalAbonoIncorrecto.join(', ')}`)
  }
  
  if (problemas.datosIncompletos.length > 0) {
    console.log(`   ❌ Datos incompletos: ${problemas.datosIncompletos.length} pedidos`)
    console.log(`      IDs: ${problemas.datosIncompletos.join(', ')}`)
  }
  
  if (problemas.inconsistencias.length > 0) {
    console.log(`   ❌ Inconsistencias: ${problemas.inconsistencias.length} pedidos`)
    console.log(`      IDs: ${problemas.inconsistencias.join(', ')}`)
  }
  
  if (Object.values(problemas).every(arr => arr.length === 0)) {
    console.log('   ✅ No se encontraron problemas en la base de datos')
  }
  
  return problemas
}

/**
 * Verificar si un pedido está pagado
 */
function esPedidoPagado(pedido) {
  if (pedido.estado_entrega === 'anulado') return false
  
  // Si es abono, verificar si el saldo pendiente es 0
  if (pedido.es_abono || pedido.metodo_pago === 'Abono') {
    const totalPedido = pedido.total_usd || 0
    const totalAbonado = pedido.total_abono_usd || 0
    const saldoPendiente = totalPedido - totalAbonado
    return saldoPendiente <= 0.01
  }
  
  // Si no es abono, asumir que está pagado
  return true
}

/**
 * Generar reportes finales
 */
function generarReportes(analisisPorTipo, analisisDeudas, analisisPorCliente, problemas) {
  console.log('\n📊 REPORTES FINALES:')
  console.log('=' * 50)
  
  console.log('\n💰 RESUMEN DE DEUDAS:')
  console.log(`   - Total deuda pendiente: $${analisisDeudas.totalDeudaUSD.toFixed(2)} USD`)
  console.log(`   - Total deuda pendiente: ${analisisDeudas.totalDeudaVES.toFixed(2)} Bs`)
  console.log(`   - Pedidos con deuda: ${analisisDeudas.totalPedidos}`)
  console.log(`   - Clientes con deuda: ${analisisPorCliente.length}`)
  
  console.log('\n📈 DISTRIBUCIÓN DE DEUDAS:')
  Object.entries(analisisDeudas.rangos).forEach(([rango, cantidad]) => {
    console.log(`   - $${rango}: ${cantidad} pedidos`)
  })
  
  console.log('\n⚠️  PROBLEMAS IDENTIFICADOS:')
  const totalProblemas = Object.values(problemas).reduce((sum, arr) => sum + arr.length, 0)
  console.log(`   - Total de problemas: ${totalProblemas}`)
  
  if (totalProblemas > 0) {
    console.log('\n🔧 RECOMENDACIONES:')
    console.log('   1. Ejecutar scripts de corrección para tasa BCV')
    console.log('   2. Corregir total_abono_usd en pedidos de abono')
    console.log('   3. Completar datos faltantes de clientes')
    console.log('   4. Revisar inconsistencias en estados de pedidos')
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando análisis de base de datos de deudas...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  
  try {
    const resultado = await analizarDeudas()
    
    if (resultado) {
      console.log('\n🎉 ¡Análisis de deudas completado exitosamente!')
    } else {
      console.log('\n⚠️  Análisis completado con algunos errores')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar
main()
