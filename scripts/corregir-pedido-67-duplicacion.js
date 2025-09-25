// Script para corregir los datos duplicados del pedido #67
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

async function corregirPedido67() {
  console.log('🔧 CORRIGIENDO DATOS DUPLICADOS DEL PEDIDO #67')
  console.log('=' .repeat(80))
  
  try {
    // 1. Verificar estado actual
    console.log('\n📊 1. ESTADO ACTUAL DEL PEDIDO #67...')
    
    const { data: pedido67, error: pedido67Error } = await supabase
      .from('pedidos')
      .select(`
        id,
        cliente_nombre,
        cliente_apellido,
        total_usd,
        es_abono,
        monto_abono_usd,
        monto_abono_ves
      `)
      .eq('id', 67)
      .single()
    
    if (pedido67Error) {
      console.error('❌ Error obteniendo pedido #67:', pedido67Error)
      return
    }
    
    console.log(`✅ Pedido #67 actual:`)
    console.log(`   Cliente: ${pedido67.cliente_nombre} ${pedido67.cliente_apellido}`)
    console.log(`   Total USD: $${pedido67.total_usd}`)
    console.log(`   Es Abono: ${pedido67.es_abono}`)
    console.log(`   Monto Abono USD: $${pedido67.monto_abono_usd}`)
    console.log(`   Monto Abono VES: ${pedido67.monto_abono_ves} Bs`)
    
    // 2. Verificar abonos asociados
    console.log('\n📊 2. ABONOS ASOCIADOS AL PEDIDO #67...')
    
    const { data: abonos67, error: abonos67Error } = await supabase
      .from('abonos')
      .select(`
        id,
        monto_abono_usd,
        monto_abono_ves,
        metodo_pago_abono,
        referencia_pago
      `)
      .eq('pedido_id', 67)
      .order('fecha_abono', { ascending: false })
    
    if (abonos67Error) {
      console.error('❌ Error obteniendo abonos del pedido #67:', abonos67Error)
      return
    }
    
    console.log(`✅ Abonos encontrados: ${abonos67.length}`)
    abonos67.forEach((abono, index) => {
      console.log(`   ${index + 1}. Abono #${abono.id}:`)
      console.log(`      Monto USD: $${abono.monto_abono_usd}`)
      console.log(`      Monto VES: ${abono.monto_abono_ves} Bs`)
      console.log(`      Método: ${abono.metodo_pago_abono}`)
      console.log(`      Referencia: ${abono.referencia_pago}`)
    })
    
    // 3. Calcular totales de abonos
    const totalAbonosUSD = abonos67.reduce((sum, abono) => sum + (parseFloat(abono.monto_abono_usd) || 0), 0)
    const totalAbonosVES = abonos67.reduce((sum, abono) => sum + (parseFloat(abono.monto_abono_ves) || 0), 0)
    
    console.log(`\n📊 3. TOTALES DE ABONOS:`)
    console.log(`   Total Abonos USD: $${totalAbonosUSD}`)
    console.log(`   Total Abonos VES: ${totalAbonosVES} Bs`)
    
    // 4. Determinar la corrección
    console.log('\n📊 4. ANÁLISIS DE LA CORRECCIÓN...')
    
    console.log(`🔍 PROBLEMA IDENTIFICADO:`)
    console.log(`   - El pedido #67 tiene montos de abono: $${pedido67.monto_abono_usd} USD, ${pedido67.monto_abono_ves} Bs`)
    console.log(`   - Pero también tiene abonos separados con los mismos montos`)
    console.log(`   - Esto causa duplicación en el Cierre de Caja`)
    
    console.log(`\n💡 SOLUCIÓN:`)
    console.log(`   - El pedido #67 debería tener es_abono=false (es un pedido completo)`)
    console.log(`   - Los montos de abono en el pedido deberían ser 0`)
    console.log(`   - Los abonos separados son los correctos`)
    
    // 5. Aplicar corrección
    console.log('\n📊 5. APLICANDO CORRECCIÓN...')
    
    const { error: updateError } = await supabase
      .from('pedidos')
      .update({
        es_abono: false,
        monto_abono_usd: 0,
        monto_abono_ves: 0
      })
      .eq('id', 67)
    
    if (updateError) {
      console.error('❌ Error actualizando pedido #67:', updateError)
      return
    }
    
    console.log(`✅ Pedido #67 corregido:`)
    console.log(`   - es_abono: false`)
    console.log(`   - monto_abono_usd: 0`)
    console.log(`   - monto_abono_ves: 0`)
    
    // 6. Verificar corrección
    console.log('\n📊 6. VERIFICANDO CORRECCIÓN...')
    
    const { data: pedido67Corregido, error: pedido67CorregidoError } = await supabase
      .from('pedidos')
      .select(`
        id,
        cliente_nombre,
        cliente_apellido,
        total_usd,
        es_abono,
        monto_abono_usd,
        monto_abono_ves
      `)
      .eq('id', 67)
      .single()
    
    if (pedido67CorregidoError) {
      console.error('❌ Error verificando pedido #67:', pedido67CorregidoError)
      return
    }
    
    console.log(`✅ Pedido #67 después de la corrección:`)
    console.log(`   Cliente: ${pedido67Corregido.cliente_nombre} ${pedido67Corregido.cliente_apellido}`)
    console.log(`   Total USD: $${pedido67Corregido.total_usd}`)
    console.log(`   Es Abono: ${pedido67Corregido.es_abono}`)
    console.log(`   Monto Abono USD: $${pedido67Corregido.monto_abono_usd}`)
    console.log(`   Monto Abono VES: ${pedido67Corregido.monto_abono_ves} Bs`)
    
    console.log(`\n🎉 CORRECCIÓN COMPLETADA:`)
    console.log(`   - El pedido #67 ya no aparecerá como "ABONO INICIAL"`)
    console.log(`   - Solo aparecerán los abonos separados como "ABONO A DEUDA"`)
    console.log(`   - Se elimina la duplicación en el Cierre de Caja`)
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar corrección
corregirPedido67()
