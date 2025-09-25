// Script para verificar y corregir datos de pagos mixtos en la base de datos
// Este script analiza la estructura de pagos mixtos y verifica que los datos estén correctos

import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function analizarPagosMixtos() {
  console.log('🔍 Analizando pagos mixtos en la base de datos...')
  
  try {
    // Obtener todos los pedidos con pagos mixtos
    const { data: pedidosMixtos, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('es_pago_mixto', true)
    
    if (error) {
      console.error('Error obteniendo pedidos mixtos:', error)
      return
    }
    
    console.log(`📊 Encontrados ${pedidosMixtos.length} pedidos con pago mixto`)
    
    if (pedidosMixtos.length === 0) {
      console.log('ℹ️ No hay pedidos con pago mixto en la base de datos')
      return
    }
    
    // Analizar cada pedido mixto
    pedidosMixtos.forEach((pedido, index) => {
      console.log(`\n🔍 Pedido #${pedido.id} (${index + 1}/${pedidosMixtos.length}):`)
      console.log(`   Cliente: ${pedido.cliente_nombre} ${pedido.cliente_apellido}`)
      console.log(`   Fecha: ${pedido.fecha_pedido}`)
      console.log(`   Total USD: $${pedido.total_usd}`)
      console.log(`   Tasa BCV: ${pedido.tasa_bcv}`)
      
      // Verificar datos del pago mixto
      console.log(`   📋 Datos del Pago Mixto:`)
      console.log(`      Monto USD: $${pedido.monto_mixto_usd || 0}`)
      console.log(`      Monto VES: ${pedido.monto_mixto_ves || 0} Bs`)
      console.log(`      Método USD: ${pedido.metodo_pago_mixto_usd || 'No especificado'}`)
      console.log(`      Método VES: ${pedido.metodo_pago_mixto_ves || 'No especificado'}`)
      console.log(`      Referencia USD: ${pedido.referencia_mixto_usd || 'No especificada'}`)
      console.log(`      Referencia VES: ${pedido.referencia_mixto_ves || 'No especificada'}`)
      
      // Verificar consistencia
      const totalMixtoCalculado = (pedido.monto_mixto_usd || 0) + ((pedido.monto_mixto_ves || 0) / (pedido.tasa_bcv || 1))
      const diferencia = Math.abs(totalMixtoCalculado - pedido.total_usd)
      
      console.log(`   ✅ Verificación:`)
      console.log(`      Total calculado: $${totalMixtoCalculado.toFixed(2)}`)
      console.log(`      Total pedido: $${pedido.total_usd}`)
      console.log(`      Diferencia: $${diferencia.toFixed(2)}`)
      
      if (diferencia > 0.01) {
        console.log(`      ⚠️ ADVERTENCIA: Hay una diferencia significativa`)
      } else {
        console.log(`      ✅ Los totales coinciden correctamente`)
      }
      
      // Mostrar cómo se procesará en ingresos
      console.log(`   📊 Procesamiento en Ingresos:`)
      console.log(`      Ingreso USD: $${pedido.monto_mixto_usd || 0} (${pedido.metodo_pago_mixto_usd || 'Efectivo (USD)'})`)
      console.log(`      Ingreso VES: ${pedido.monto_mixto_ves || 0} Bs (${pedido.metodo_pago_mixto_ves || 'Pago Móvil (VES)'})`)
    })
    
    console.log('\n✅ Análisis completado')
    
  } catch (error) {
    console.error('❌ Error durante el análisis:', error)
  }
}

async function verificarEstructuraTabla() {
  console.log('\n🔍 Verificando estructura de la tabla pedidos...')
  
  try {
    // Obtener información de la estructura de la tabla
    const { data, error } = await supabase
      .from('pedidos')
      .select('es_pago_mixto, monto_mixto_usd, monto_mixto_ves, metodo_pago_mixto_usd, metodo_pago_mixto_ves, referencia_mixto_usd, referencia_mixto_ves')
      .limit(1)
    
    if (error) {
      console.error('Error verificando estructura:', error)
      return
    }
    
    console.log('✅ Campos de pago mixto disponibles en la tabla:')
    console.log('   - es_pago_mixto: boolean')
    console.log('   - monto_mixto_usd: decimal')
    console.log('   - monto_mixto_ves: decimal')
    console.log('   - metodo_pago_mixto_usd: text')
    console.log('   - metodo_pago_mixto_ves: text')
    console.log('   - referencia_mixto_usd: text')
    console.log('   - referencia_mixto_ves: text')
    
  } catch (error) {
    console.error('Error verificando estructura:', error)
  }
}

async function crearEjemploPagoMixto() {
  console.log('\n🔍 Creando ejemplo de pago mixto para prueba...')
  
  try {
    // Buscar un cliente existente
    const { data: clientes, error: errorClientes } = await supabase
      .from('clientes')
      .select('id, cedula_rif, nombre, apellido')
      .limit(1)
    
    if (errorClientes || !clientes || clientes.length === 0) {
      console.log('⚠️ No se encontraron clientes para crear el ejemplo')
      return
    }
    
    const cliente = clientes[0]
    console.log(`📝 Usando cliente: ${cliente.nombre} ${cliente.apellido} (${cliente.cedula_rif})`)
    
    // Crear un pedido de ejemplo con pago mixto
    const pedidoEjemplo = {
      cliente_id: cliente.id,
      cliente_cedula: cliente.cedula_rif,
      cliente_nombre: cliente.nombre,
      cliente_apellido: cliente.apellido,
      cliente_telefono: '04141234567',
      cliente_email: 'cliente@ejemplo.com',
      cliente_direccion: 'Dirección de ejemplo',
      
      // Datos del pago mixto
      es_pago_mixto: true,
      monto_mixto_usd: 50.00,
      monto_mixto_ves: 1800.00, // 50 USD * 36 tasa BCV
      metodo_pago_mixto_usd: 'Efectivo (USD)',
      metodo_pago_mixto_ves: 'Pago Móvil (VES)',
      referencia_mixto_usd: '',
      referencia_mixto_ves: '04141234567',
      
      // Totales
      subtotal_usd: 100.00,
      total_usd: 100.00,
      tasa_bcv: 36.0,
      
      // Otros campos
      aplica_iva: false,
      estado_entrega: 'pendiente',
      fecha_pedido: new Date().toISOString()
    }
    
    console.log('📋 Datos del pedido de ejemplo:')
    console.log(`   Monto USD: $${pedidoEjemplo.monto_mixto_usd}`)
    console.log(`   Monto VES: ${pedidoEjemplo.monto_mixto_ves} Bs`)
    console.log(`   Método USD: ${pedidoEjemplo.metodo_pago_mixto_usd}`)
    console.log(`   Método VES: ${pedidoEjemplo.metodo_pago_mixto_ves}`)
    console.log(`   Referencia VES: ${pedidoEjemplo.referencia_mixto_ves}`)
    
    console.log('\n💡 Este ejemplo mostraría en la tabla de ingresos:')
    console.log('   1. Ingreso USD: $50.00 - Efectivo (USD)')
    console.log('   2. Ingreso VES: 1,800.00 Bs - Pago Móvil (VES)')
    
  } catch (error) {
    console.error('Error creando ejemplo:', error)
  }
}

// Función principal
async function main() {
  console.log('🚀 Análisis de Pagos Mixtos en la Base de Datos')
  console.log('=' .repeat(60))
  
  await verificarEstructuraTabla()
  await analizarPagosMixtos()
  await crearEjemploPagoMixto()
  
  console.log('\n' + '=' .repeat(60))
  console.log('🎉 Análisis completado')
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { analizarPagosMixtos, verificarEstructuraTabla, crearEjemploPagoMixto }
