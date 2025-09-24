// =====================================================
// SCRIPT SIMPLE PARA VERIFICAR DATOS DEL DASHBOARD
// =====================================================
// Ejecutar con: node scripts/verificar-datos-simple.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son requeridas')
  console.log('Asegúrate de tener un archivo .env con estas variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarDatosBasicos() {
  console.log('\n📊 VERIFICANDO DATOS BÁSICOS...')
  
  try {
    // Contar registros totales
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select('id', { count: 'exact' })
    
    if (pedidosError) throw pedidosError
    
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('id', { count: 'exact' })
    
    if (clientesError) throw clientesError
    
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id', { count: 'exact' })
    
    if (productosError) throw productosError
    
    console.log(`📋 Total Pedidos: ${pedidos.length}`)
    console.log(`👥 Total Clientes: ${clientes.length}`)
    console.log(`📦 Total Productos: ${productos.length}`)
    
    return {
      totalPedidos: pedidos.length,
      totalClientes: clientes.length,
      totalProductos: productos.length
    }
    
  } catch (error) {
    console.error('❌ Error verificando datos básicos:', error.message)
    return null
  }
}

async function verificarLogicaIngresos() {
  console.log('\n💰 VERIFICANDO LÓGICA DE INGRESOS...')
  
  try {
    // Obtener todos los pedidos con sus datos completos
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('id')
    
    if (error) throw error
    
    console.log(`📋 Analizando ${pedidos.length} pedidos...`)
    
    let ventasTotales = 0
    let ingresosReales = 0
    let productosVendidos = 0
    
    const detalleIngresos = {
      usd: { contado: 0, mixto: 0, abono: 0 },
      ves: { mixto: 0, abono: 0 }
    }
    
    pedidos.forEach((p, index) => {
      console.log(`\n🔍 Pedido #${p.id}:`)
      console.log(`  - Método pago: ${p.metodo_pago}`)
      console.log(`  - Es pago mixto: ${p.es_pago_mixto}`)
      console.log(`  - Es abono: ${p.es_abono}`)
      console.log(`  - Total USD: $${p.total_usd || 0}`)
      console.log(`  - Tasa BCV: ${p.tasa_bcv || 1}`)
      
      // Calcular ventas totales
      const totalPedido = p.total_usd || 0
      ventasTotales += totalPedido
      
      // Calcular ingresos reales (misma lógica que el dashboard)
      let ingresosPedido = 0
      
      // Si es venta de contado
      if (p.metodo_pago === 'Contado') {
        ingresosPedido = totalPedido
        detalleIngresos.usd.contado += ingresosPedido
        console.log(`  💰 Contado: $${ingresosPedido}`)
      }
      
      // Si es pago mixto
      if (p.es_pago_mixto) {
        const mixtoUSD = p.monto_mixto_usd || 0
        const mixtoVES = p.monto_mixto_ves || 0
        const mixtoVESUSD = mixtoVES / (p.tasa_bcv || 1)
        ingresosPedido = mixtoUSD + mixtoVESUSD
        
        // Aplicar límite (nunca exceder el total del pedido)
        if (ingresosPedido > totalPedido) {
          console.log(`  ⚠️ Ingresos ($${ingresosPedido.toFixed(2)}) > Total ($${totalPedido.toFixed(2)}) - Limitando a total`)
          ingresosPedido = totalPedido
        }
        
        detalleIngresos.usd.mixto += mixtoUSD
        detalleIngresos.ves.mixto += mixtoVES
        console.log(`  💰 Mixto USD: $${mixtoUSD}, VES: ${mixtoVES}`)
      }
      
      // Si es venta por abono
      if (p.es_abono) {
        if (p.tipo_pago_abono === 'simple') {
          ingresosPedido = p.monto_abono_simple || 0
          
          // Aplicar límite
          if (ingresosPedido > totalPedido) {
            console.log(`  ⚠️ Ingresos ($${ingresosPedido.toFixed(2)}) > Total ($${totalPedido.toFixed(2)}) - Limitando a total`)
            ingresosPedido = totalPedido
          }
          
          detalleIngresos.usd.abono += ingresosPedido
          console.log(`  💰 Abono simple: $${ingresosPedido}`)
        } else if (p.tipo_pago_abono === 'mixto') {
          const abonoUSD = p.monto_abono_usd || 0
          const abonoVES = p.monto_abono_ves || 0
          const abonoVESUSD = abonoVES / (p.tasa_bcv || 1)
          ingresosPedido = abonoUSD + abonoVESUSD
          
          // Aplicar límite
          if (ingresosPedido > totalPedido) {
            console.log(`  ⚠️ Ingresos ($${ingresosPedido.toFixed(2)}) > Total ($${totalPedido.toFixed(2)}) - Limitando a total`)
            ingresosPedido = totalPedido
          }
          
          detalleIngresos.usd.abono += abonoUSD
          detalleIngresos.ves.abono += abonoVES
          console.log(`  💰 Abono mixto USD: $${abonoUSD}, VES: ${abonoVES}`)
        }
      }
      
      ingresosReales += ingresosPedido
      
      // Calcular productos vendidos
      if (p.detalles_pedido && Array.isArray(p.detalles_pedido)) {
        const cantidadDetalle = p.detalles_pedido.reduce((sum, detalle) => 
          sum + (detalle.cantidad || 0), 0)
        productosVendidos += cantidadDetalle
        console.log(`  📦 Productos vendidos: ${cantidadDetalle}`)
      } else {
        productosVendidos += 1 // Fallback
        console.log(`  📦 Productos vendidos: 1 (fallback - detalles_pedido es null)`)
      }
    })
    
    console.log('\n📊 RESUMEN DE INGRESOS:')
    console.log(`💰 Ventas Totales: $${ventasTotales.toFixed(2)}`)
    console.log(`💵 Ingresos Reales: $${ingresosReales.toFixed(2)}`)
    console.log(`📦 Productos Vendidos: ${productosVendidos}`)
    
    console.log('\n💱 DETALLE POR MONEDA:')
    console.log('USD:')
    console.log(`  - Contado: $${detalleIngresos.usd.contado.toFixed(2)}`)
    console.log(`  - Mixto: $${detalleIngresos.usd.mixto.toFixed(2)}`)
    console.log(`  - Abono: $${detalleIngresos.usd.abono.toFixed(2)}`)
    console.log(`  - Total USD: $${(detalleIngresos.usd.contado + detalleIngresos.usd.mixto + detalleIngresos.usd.abono).toFixed(2)}`)
    
    console.log('VES:')
    console.log(`  - Mixto: ${detalleIngresos.ves.mixto.toFixed(2)} VES`)
    console.log(`  - Abono: ${detalleIngresos.ves.abono.toFixed(2)} VES`)
    console.log(`  - Total VES: ${(detalleIngresos.ves.mixto + detalleIngresos.ves.abono).toFixed(2)} VES`)
    
    const tasaPromedio = pedidos.length > 0 ? pedidos.reduce((sum, p) => sum + (p.tasa_bcv || 1), 0) / pedidos.length : 1
    const totalVESEnUSD = (detalleIngresos.ves.mixto + detalleIngresos.ves.abono) / tasaPromedio
    console.log(`  - Total VES en USD: $${totalVESEnUSD.toFixed(2)} (tasa promedio: ${tasaPromedio.toFixed(2)})`)
    
    return {
      ventasTotales: parseFloat(ventasTotales.toFixed(2)),
      ingresosReales: parseFloat(ingresosReales.toFixed(2)),
      productosVendidos,
      detalleIngresos
    }
    
  } catch (error) {
    console.error('❌ Error verificando lógica de ingresos:', error.message)
    return null
  }
}

async function verificarStockBajo() {
  console.log('\n⚠️ VERIFICANDO STOCK BAJO...')
  
  try {
    const { data: productos, error } = await supabase
      .from('productos')
      .select('id, nombre, stock_actual, stock_sugerido')
      .order('stock_actual')
    
    if (error) throw error
    
    const productosStockBajo = productos.filter(p => (p.stock_actual || 0) <= 5)
    
    console.log(`📦 Total productos: ${productos.length}`)
    console.log(`⚠️ Productos con stock bajo (≤5): ${productosStockBajo.length}`)
    
    if (productosStockBajo.length > 0) {
      console.log('\n🔍 Productos con stock bajo:')
      productosStockBajo.forEach(p => {
        console.log(`  - ${p.nombre}: ${p.stock_actual || 0} unidades`)
      })
    }
    
    return {
      totalProductos: productos.length,
      stockBajo: productosStockBajo.length,
      productosStockBajo
    }
    
  } catch (error) {
    console.error('❌ Error verificando stock bajo:', error.message)
    return null
  }
}

async function verificarProblemaDetalles() {
  console.log('\n🔍 VERIFICANDO PROBLEMA DE DETALLES_PEDIDO...')
  
  try {
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('id, detalles_pedido')
      .not('detalles_pedido', 'is', null)
    
    if (error) throw error
    
    console.log(`📋 Pedidos con detalles_pedido no nulos: ${pedidos.length}`)
    
    if (pedidos.length === 0) {
      console.log('❌ PROBLEMA IDENTIFICADO:')
      console.log('   - Todos los detalles_pedido están como NULL')
      console.log('   - Esto significa que el sistema no está guardando los detalles de productos')
      console.log('   - El conteo de productos vendidos es incorrecto (usando fallback)')
      console.log('   - Necesitas revisar el código que guarda los pedidos')
      
      console.log('\n💡 SOLUCIÓN RECOMENDADA:')
      console.log('   1. Revisar el formulario de ventas')
      console.log('   2. Verificar que se esté guardando detalles_pedido al crear pedidos')
      console.log('   3. Asegurar que el campo sea JSONB con estructura correcta')
    } else {
      console.log('✅ Hay pedidos con detalles válidos')
      pedidos.forEach(p => {
        console.log(`   - Pedido #${p.id}: ${JSON.stringify(p.detalles_pedido)}`)
      })
    }
    
    return {
      pedidosConDetalles: pedidos.length,
      problemaDetalles: pedidos.length === 0
    }
    
  } catch (error) {
    console.error('❌ Error verificando detalles:', error.message)
    return null
  }
}

async function verificarClientesActivos() {
  console.log('\n👥 VERIFICANDO CLIENTES ACTIVOS...')
  
  try {
    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('id, nombre, fecha_registro')
      .order('fecha_registro', { ascending: false })
    
    if (error) throw error
    
    const ahora = new Date()
    const hace30Dias = new Date()
    hace30Dias.setDate(hace30Dias.getDate() - 30)
    
    const nuevosClientes = clientes.filter(c => {
      const fechaCreacion = new Date(c.fecha_registro || new Date())
      return fechaCreacion >= hace30Dias
    })
    
    console.log(`👥 Total clientes: ${clientes.length}`)
    console.log(`🆕 Nuevos clientes (últimos 30 días): ${nuevosClientes.length}`)
    
    if (nuevosClientes.length > 0) {
      console.log('\n🆕 Clientes nuevos:')
      nuevosClientes.forEach(c => {
        const fecha = new Date(c.fecha_registro)
        console.log(`  - ${c.nombre}: ${fecha.toLocaleDateString('es-VE')}`)
      })
    }
    
    return {
      totalClientes: clientes.length,
      nuevosClientes: nuevosClientes.length,
      clientesActivos: clientes.length
    }
    
  } catch (error) {
    console.error('❌ Error verificando clientes activos:', error.message)
    return null
  }
}

async function main() {
  console.log('🚀 INICIANDO VERIFICACIÓN DE DATOS DEL DASHBOARD')
  console.log('=' .repeat(60))
  
  try {
    // Verificar datos básicos
    const datosBasicos = await verificarDatosBasicos()
    
    // Verificar lógica de ingresos
    const ingresos = await verificarLogicaIngresos()
    
    // Verificar problema de detalles
    const detalles = await verificarProblemaDetalles()
    
    // Verificar stock bajo
    const stock = await verificarStockBajo()
    
    // Verificar clientes activos
    const clientes = await verificarClientesActivos()
    
    // Resumen final
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN FINAL DE VERIFICACIÓN')
    console.log('='.repeat(60))
    
    if (datosBasicos) {
      console.log(`📋 Total Pedidos: ${datosBasicos.totalPedidos}`)
      console.log(`👥 Total Clientes: ${datosBasicos.totalClientes}`)
      console.log(`📦 Total Productos: ${datosBasicos.totalProductos}`)
    }
    
    if (ingresos) {
      console.log(`💰 Ventas Totales: $${ingresos.ventasTotales}`)
      console.log(`💵 Ingresos Reales: $${ingresos.ingresosReales}`)
      console.log(`📦 Productos Vendidos: ${ingresos.productosVendidos}`)
    }
    
    if (stock) {
      console.log(`⚠️ Productos con Stock Bajo: ${stock.stockBajo}`)
    }
    
    if (clientes) {
      console.log(`🆕 Nuevos Clientes (30 días): ${clientes.nuevosClientes}`)
    }
    
    if (detalles) {
      console.log(`🔍 Pedidos con Detalles: ${detalles.pedidosConDetalles}`)
      if (detalles.problemaDetalles) {
        console.log('⚠️ PROBLEMA: Todos los detalles_pedido están NULL')
      }
    }
    
    console.log('\n✅ VERIFICACIÓN COMPLETADA')
    console.log('Los datos mostrados arriba son los valores reales que debería mostrar el dashboard.')
    
    if (detalles && detalles.problemaDetalles) {
      console.log('\n🚨 ACCIÓN REQUERIDA:')
      console.log('   El sistema no está guardando detalles de productos en los pedidos.')
      console.log('   Esto afecta el conteo real de productos vendidos.')
      console.log('   Revisa el código que guarda los pedidos para corregir este problema.')
    }
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error.message)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}
