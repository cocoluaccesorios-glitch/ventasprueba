import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uaeniaskxpplxasolvoc.supabase.co'
const supabaseKey = 'sb_publishable_GrOHY_ZhYOtWXDun5nt-CQ_N_5qvlT-'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFinal() {
  console.log('🔍 Probando conexión final...')
  
  try {
    // Probar productos
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre, precio_usd, stock_actual')
      .limit(3)
    
    if (productosError) {
      console.log('❌ Error productos:', productosError)
    } else {
      console.log('✅ Productos OK:', productos)
    }
    
    // Probar pedidos
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select('id, total_usd, estado_entrega')
      .limit(3)
    
    if (pedidosError) {
      console.log('❌ Error pedidos:', pedidosError)
    } else {
      console.log('✅ Pedidos OK:', pedidos)
    }
    
    // Probar clientes
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('id, nombre')
      .limit(1)
    
    if (clientesError) {
      console.log('❌ Error clientes:', clientesError)
    } else {
      console.log('✅ Clientes OK:', clientes)
    }
    
    console.log('\n🎉 Si ves todos los ✅, la aplicación debería funcionar!')
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

testFinal()
