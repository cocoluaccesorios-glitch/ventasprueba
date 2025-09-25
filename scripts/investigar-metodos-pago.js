// Script para investigar inconsistencias en métodos de pago
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

async function investigarMetodosPago() {
  console.log('🔍 INVESTIGANDO INCONSISTENCIAS EN MÉTODOS DE PAGO')
  console.log('=' .repeat(80))
  
  try {
    // 1. Verificar métodos de pago en pedidos
    console.log('\n📊 1. MÉTODOS DE PAGO EN PEDIDOS...')
    
    const { data: pedidosData, error: pedidosError } = await supabase
      .from('pedidos')
      .select('id, metodo_pago')
      .order('id', { ascending: false })
      .limit(20)
    
    if (pedidosError) {
      console.error('❌ Error obteniendo pedidos:', pedidosError)
      return
    }
    
    console.log(`✅ Últimos 20 pedidos:`)
    const metodosPedidos = {}
    pedidosData.forEach(pedido => {
      const metodo = pedido.metodo_pago || 'Sin método'
      if (!metodosPedidos[metodo]) {
        metodosPedidos[metodo] = 0
      }
      metodosPedidos[metodo]++
      console.log(`   Pedido #${pedido.id}: "${metodo}"`)
    })
    
    console.log(`\n📋 RESUMEN DE MÉTODOS EN PEDIDOS:`)
    Object.keys(metodosPedidos).forEach(metodo => {
      console.log(`   "${metodo}": ${metodosPedidos[metodo]} pedidos`)
    })
    
    // 2. Verificar métodos de pago en abonos
    console.log('\n📊 2. MÉTODOS DE PAGO EN ABONOS...')
    
    const { data: abonosData, error: abonosError } = await supabase
      .from('abonos')
      .select('id, metodo_pago_abono')
      .order('id', { ascending: false })
      .limit(20)
    
    if (abonosError) {
      console.error('❌ Error obteniendo abonos:', abonosError)
      return
    }
    
    console.log(`✅ Últimos 20 abonos:`)
    const metodosAbonos = {}
    abonosData.forEach(abono => {
      const metodo = abono.metodo_pago_abono || 'Sin método'
      if (!metodosAbonos[metodo]) {
        metodosAbonos[metodo] = 0
      }
      metodosAbonos[metodo]++
      console.log(`   Abono #${abono.id}: "${metodo}"`)
    })
    
    console.log(`\n📋 RESUMEN DE MÉTODOS EN ABONOS:`)
    Object.keys(metodosAbonos).forEach(metodo => {
      console.log(`   "${metodo}": ${metodosAbonos[metodo]} abonos`)
    })
    
    // 3. Identificar inconsistencias
    console.log('\n📊 3. IDENTIFICANDO INCONSISTENCIAS...')
    
    const todosMetodos = new Set([
      ...Object.keys(metodosPedidos),
      ...Object.keys(metodosAbonos)
    ])
    
    console.log(`🔍 TODOS LOS MÉTODOS ÚNICOS ENCONTRADOS:`)
    Array.from(todosMetodos).sort().forEach(metodo => {
      console.log(`   "${metodo}"`)
    })
    
    // 4. Buscar patrones de inconsistencia
    console.log('\n📊 4. PATRONES DE INCONSISTENCIA...')
    
    const inconsistencias = []
    
    // Buscar variaciones de Pago Móvil
    const pagosMovil = Array.from(todosMetodos).filter(metodo => 
      metodo.toLowerCase().includes('pago') && metodo.toLowerCase().includes('movil')
    )
    
    if (pagosMovil.length > 1) {
      inconsistencias.push({
        tipo: 'Pago Móvil',
        variaciones: pagosMovil
      })
    }
    
    // Buscar variaciones de Zelle
    const zelles = Array.from(todosMetodos).filter(metodo => 
      metodo.toLowerCase().includes('zelle')
    )
    
    if (zelles.length > 1) {
      inconsistencias.push({
        tipo: 'Zelle',
        variaciones: zelles
      })
    }
    
    // Buscar variaciones de Efectivo
    const efectivos = Array.from(todosMetodos).filter(metodo => 
      metodo.toLowerCase().includes('efectivo')
    )
    
    if (efectivos.length > 1) {
      inconsistencias.push({
        tipo: 'Efectivo',
        variaciones: efectivos
      })
    }
    
    if (inconsistencias.length > 0) {
      console.log(`⚠️  INCONSISTENCIAS ENCONTRADAS:`)
      inconsistencias.forEach(inconsistencia => {
        console.log(`   ${inconsistencia.tipo}:`)
        inconsistencia.variaciones.forEach(variacion => {
          console.log(`     - "${variacion}"`)
        })
      })
    } else {
      console.log(`✅ No se encontraron inconsistencias obvias`)
    }
    
    // 5. Recomendaciones de estandarización
    console.log('\n📊 5. RECOMENDACIONES DE ESTANDARIZACIÓN...')
    
    const metodosEstandar = {
      'Pago Móvil (VES)': ['pago_movil', 'Pago Móvil', 'PAGO_MOVIL'],
      'Zelle (USD)': ['zelle', 'ZELLE'],
      'Efectivo (USD)': ['efectivo', 'Efectivo', 'EFECTIVO'],
      'Efectivo (VES)': ['efectivo_ves', 'Efectivo VES'],
      'Transferencia (VES)': ['transferencia', 'Transferencia', 'TRANSFERENCIA'],
      'Punto de Venta (VES)': ['punto_venta', 'Punto de Venta', 'PUNTO_VENTA']
    }
    
    console.log(`💡 MÉTODOS ESTÁNDAR RECOMENDADOS:`)
    Object.keys(metodosEstandar).forEach(estandar => {
      console.log(`   "${estandar}"`)
      const variaciones = metodosEstandar[estandar]
      const encontradas = variaciones.filter(v => todosMetodos.has(v))
      if (encontradas.length > 0) {
        console.log(`     Variaciones encontradas: ${encontradas.join(', ')}`)
      }
    })
    
    // 6. Generar script de corrección
    console.log('\n📊 6. GENERANDO SCRIPT DE CORRECCIÓN...')
    
    console.log(`🛠️  SCRIPT PARA ESTANDARIZAR MÉTODOS DE PAGO:`)
    console.log(`-- Corregir métodos en pedidos`)
    
    Object.keys(metodosEstandar).forEach(estandar => {
      const variaciones = metodosEstandar[estandar]
      variaciones.forEach(variacion => {
        if (todosMetodos.has(variacion) && variacion !== estandar) {
          console.log(`UPDATE pedidos SET metodo_pago = '${estandar}' WHERE metodo_pago = '${variacion}';`)
        }
      })
    })
    
    console.log(`-- Corregir métodos en abonos`)
    
    Object.keys(metodosEstandar).forEach(estandar => {
      const variaciones = metodosEstandar[estandar]
      variaciones.forEach(variacion => {
        if (todosMetodos.has(variacion) && variacion !== estandar) {
          console.log(`UPDATE abonos SET metodo_pago_abono = '${estandar}' WHERE metodo_pago_abono = '${variacion}';`)
        }
      })
    })
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar investigación
investigarMetodosPago()
