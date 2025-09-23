#!/usr/bin/env node

/**
 * Script para verificar la estructura real de la tabla tasa_cambio
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarEstructura() {
  console.log('🔍 Verificando estructura real de la tabla tasa_cambio...')
  
  try {
    // Obtener un registro para ver las columnas disponibles
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('*')
      .limit(1)
      .single()
    
    if (error) {
      console.error('❌ Error:', error.message)
      return
    }
    
    console.log('✅ Columnas disponibles:')
    Object.keys(data).forEach((columna, index) => {
      console.log(`   ${index + 1}. ${columna}: ${typeof data[columna]} = ${data[columna]}`)
    })
    
    console.log('\n📊 Datos del registro:')
    console.log(JSON.stringify(data, null, 2))
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

verificarEstructura()
