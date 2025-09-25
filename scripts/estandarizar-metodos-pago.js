// Script para estandarizar métodos de pago en la base de datos
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function estandarizarMetodosPago() {
  console.log('🔧 ESTANDARIZANDO MÉTODOS DE PAGO')
  console.log('=' .repeat(80))
  
  try {
    // 1. Estandarizar métodos en pedidos
    console.log('\n📊 1. ESTANDARIZANDO MÉTODOS EN PEDIDOS...')
    
    const correccionesPedidos = [
      { desde: 'pago_movil', hacia: 'Pago Móvil (VES)' },
      { desde: 'zelle', hacia: 'Zelle (USD)' },
      { desde: 'efectivo', hacia: 'Efectivo (USD)' },
      { desde: 'transferencia', hacia: 'Transferencia (VES)' },
      { desde: 'punto_venta', hacia: 'Punto de Venta (VES)' }
    ]
    
    for (const correccion of correccionesPedidos) {
      const { data, error } = await supabase
        .from('pedidos')
        .update({ metodo_pago: correccion.hacia })
        .eq('metodo_pago', correccion.desde)
        .select('id')
      
      if (error) {
        console.error(`❌ Error corrigiendo "${correccion.desde}" en pedidos:`, error)
      } else {
        console.log(`✅ Corregidos ${data.length} pedidos: "${correccion.desde}" → "${correccion.hacia}"`)
      }
    }
    
    // 2. Estandarizar métodos en abonos
    console.log('\n📊 2. ESTANDARIZANDO MÉTODOS EN ABONOS...')
    
    const correccionesAbonos = [
      { desde: 'pago_movil', hacia: 'Pago Móvil (VES)' },
      { desde: 'zelle', hacia: 'Zelle (USD)' },
      { desde: 'efectivo', hacia: 'Efectivo (USD)' },
      { desde: 'transferencia', hacia: 'Transferencia (VES)' },
      { desde: 'punto_venta', hacia: 'Punto de Venta (VES)' }
    ]
    
    for (const correccion of correccionesAbonos) {
      const { data, error } = await supabase
        .from('abonos')
        .update({ metodo_pago_abono: correccion.hacia })
        .eq('metodo_pago_abono', correccion.desde)
        .select('id')
      
      if (error) {
        console.error(`❌ Error corrigiendo "${correccion.desde}" en abonos:`, error)
      } else {
        console.log(`✅ Corregidos ${data.length} abonos: "${correccion.desde}" → "${correccion.hacia}"`)
      }
    }
    
    // 3. Verificar resultado
    console.log('\n📊 3. VERIFICANDO RESULTADO...')
    
    // Verificar métodos únicos en pedidos
    const { data: metodosPedidos, error: errorPedidos } = await supabase
      .from('pedidos')
      .select('metodo_pago')
    
    if (errorPedidos) {
      console.error('❌ Error verificando pedidos:', errorPedidos)
    } else {
      const metodosUnicosPedidos = [...new Set(metodosPedidos.map(p => p.metodo_pago))].sort()
      console.log(`✅ Métodos únicos en pedidos: ${metodosUnicosPedidos.length}`)
      metodosUnicosPedidos.forEach(metodo => {
        console.log(`   "${metodo}"`)
      })
    }
    
    // Verificar métodos únicos en abonos
    const { data: metodosAbonos, error: errorAbonos } = await supabase
      .from('abonos')
      .select('metodo_pago_abono')
    
    if (errorAbonos) {
      console.error('❌ Error verificando abonos:', errorAbonos)
    } else {
      const metodosUnicosAbonos = [...new Set(metodosAbonos.map(a => a.metodo_pago_abono))].sort()
      console.log(`✅ Métodos únicos en abonos: ${metodosUnicosAbonos.length}`)
      metodosUnicosAbonos.forEach(metodo => {
        console.log(`   "${metodo}"`)
      })
    }
    
    // 4. Verificar si hay inconsistencias restantes
    console.log('\n📊 4. VERIFICANDO INCONSISTENCIAS RESTANTES...')
    
    const todosMetodos = new Set([
      ...metodosPedidos.map(p => p.metodo_pago),
      ...metodosAbonos.map(a => a.metodo_pago_abono)
    ])
    
    const metodosConVariaciones = []
    
    // Buscar variaciones de Pago Móvil
    const pagosMovil = Array.from(todosMetodos).filter(metodo => 
      metodo.toLowerCase().includes('pago') && metodo.toLowerCase().includes('movil')
    )
    
    if (pagosMovil.length > 1) {
      metodosConVariaciones.push({
        tipo: 'Pago Móvil',
        variaciones: pagosMovil
      })
    }
    
    // Buscar variaciones de Efectivo
    const efectivos = Array.from(todosMetodos).filter(metodo => 
      metodo.toLowerCase().includes('efectivo')
    )
    
    if (efectivos.length > 1) {
      metodosConVariaciones.push({
        tipo: 'Efectivo',
        variaciones: efectivos
      })
    }
    
    if (metodosConVariaciones.length > 0) {
      console.log(`⚠️  INCONSISTENCIAS RESTANTES:`)
      metodosConVariaciones.forEach(inconsistencia => {
        console.log(`   ${inconsistencia.tipo}:`)
        inconsistencia.variaciones.forEach(variacion => {
          console.log(`     - "${variacion}"`)
        })
      })
    } else {
      console.log(`✅ No hay inconsistencias restantes`)
    }
    
    console.log(`\n🎉 ESTANDARIZACIÓN COMPLETADA`)
    console.log(`   - Los métodos de pago ahora están estandarizados`)
    console.log(`   - El desglose por método debería mostrar nombres consistentes`)
    console.log(`   - Se eliminaron las duplicaciones en el dashboard`)
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar estandarización
estandarizarMetodosPago()
