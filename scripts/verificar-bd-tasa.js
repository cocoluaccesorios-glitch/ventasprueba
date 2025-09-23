import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan credenciales de Supabase en el archivo .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarBaseDatos() {
  console.log('🔍 Verificando base de datos Supabase...')
  console.log(`📅 Fecha de hoy: ${new Date().toISOString().split('T')[0]}`)
  
  try {
    // Verificar estructura de la tabla
    console.log('\n📋 Estructura de la tabla tasa_cambio:')
    const { data: columns, error: columnsError } = await supabase
      .from('tasa_cambio')
      .select('*')
      .limit(1)
    
    if (columnsError) {
      console.error('❌ Error al verificar estructura:', columnsError.message)
    } else {
      console.log('✅ Tabla tasa_cambio existe')
    }
    
    // Verificar tasas de hoy
    const fechaHoy = new Date().toISOString().split('T')[0]
    console.log(`\n🔍 Buscando tasas para ${fechaHoy}:`)
    
    const { data: tasasHoy, error: errorHoy } = await supabase
      .from('tasa_cambio')
      .select('*')
      .eq('fecha', fechaHoy)
      .order('id', { ascending: false })
    
    if (errorHoy) {
      console.error('❌ Error al buscar tasas de hoy:', errorHoy.message)
    } else if (tasasHoy && tasasHoy.length > 0) {
      console.log(`✅ Encontradas ${tasasHoy.length} tasas para hoy:`)
      tasasHoy.forEach((tasa, index) => {
        console.log(`   ${index + 1}. ID: ${tasa.id}, Tasa: ${tasa.tasa_bcv} Bs/USD, Fecha: ${tasa.fecha}`)
      })
    } else {
      console.log(`⚠️ No hay tasas registradas para ${fechaHoy}`)
    }
    
    // Verificar tasas recientes (últimos 7 días)
    console.log('\n📊 Tasas de los últimos 7 días:')
    const { data: tasasRecientes, error: errorRecientes } = await supabase
      .from('tasa_cambio')
      .select('*')
      .gte('fecha', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('fecha', { ascending: false })
      .order('id', { ascending: false })
    
    if (errorRecientes) {
      console.error('❌ Error al buscar tasas recientes:', errorRecientes.message)
    } else if (tasasRecientes && tasasRecientes.length > 0) {
      console.log(`✅ Encontradas ${tasasRecientes.length} tasas en los últimos 7 días:`)
      tasasRecientes.forEach((tasa, index) => {
        console.log(`   ${index + 1}. Fecha: ${tasa.fecha}, Tasa: ${tasa.tasa_bcv} Bs/USD`)
      })
    } else {
      console.log('⚠️ No hay tasas registradas en los últimos 7 días')
    }
    
    // Estadísticas generales
    console.log('\n📈 Estadísticas generales:')
    const { data: todasLasTasas, error: errorTodas } = await supabase
      .from('tasa_cambio')
      .select('tasa_bcv, fecha')
      .order('fecha', { ascending: false })
    
    if (errorTodas) {
      console.error('❌ Error al obtener estadísticas:', errorTodas.message)
    } else if (todasLasTasas && todasLasTasas.length > 0) {
      const totalTasas = todasLasTasas.length
      const tasaMaxima = Math.max(...todasLasTasas.map(t => t.tasa_bcv))
      const tasaMinima = Math.min(...todasLasTasas.map(t => t.tasa_bcv))
      const tasaPromedio = todasLasTasas.reduce((sum, t) => sum + t.tasa_bcv, 0) / totalTasas
      
      console.log(`   Total de tasas: ${totalTasas}`)
      console.log(`   Tasa máxima: ${tasaMaxima} Bs/USD`)
      console.log(`   Tasa mínima: ${tasaMinima} Bs/USD`)
      console.log(`   Tasa promedio: ${tasaPromedio.toFixed(4)} Bs/USD`)
    } else {
      console.log('⚠️ No hay tasas registradas en la base de datos')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

verificarBaseDatos()
