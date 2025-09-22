// Script para probar la conexión a Supabase
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Verificando configuración...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NO CONFIGURADA')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan credenciales de Supabase')
  console.log('📝 Asegúrate de configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔄 Probando conexión a Supabase...')
    
    // Probar conexión básica
    const { data, error } = await supabase
      .from('productos')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Error de conexión:', error.message)
      
      if (error.message.includes('JWT')) {
        console.log('💡 Solución: Verifica que tu VITE_SUPABASE_ANON_KEY sea correcta')
      } else if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('💡 Solución: La tabla "productos" no existe. Ejecuta el script SQL de creación de tablas')
      } else if (error.message.includes('permission')) {
        console.log('💡 Solución: Verifica las políticas RLS en Supabase')
      }
      
      return false
    }
    
    console.log('✅ Conexión exitosa a Supabase!')
    
    // Probar otras tablas importantes
    const tables = ['pedidos', 'clientes', 'tasa_cambio']
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (tableError) {
          console.log(`⚠️  Tabla "${table}": ${tableError.message}`)
        } else {
          console.log(`✅ Tabla "${table}": OK`)
        }
      } catch (err) {
        console.log(`❌ Tabla "${table}": Error - ${err.message}`)
      }
    }
    
    return true
    
  } catch (err) {
    console.error('❌ Error inesperado:', err.message)
    return false
  }
}

// Ejecutar prueba
testConnection().then(success => {
  if (success) {
    console.log('\n🎉 ¡Tu aplicación está lista para conectarse a Supabase!')
    console.log('📝 Recuerda reiniciar tu servidor de desarrollo (npm run dev)')
  } else {
    console.log('\n🔧 Configura las credenciales y vuelve a probar')
  }
})
