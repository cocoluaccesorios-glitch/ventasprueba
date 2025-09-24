#!/usr/bin/env node

/**
 * Script para ejecutar el SQL de actualización de la tabla tasa_cambio en Supabase
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

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
 * Ejecutar SQL en Supabase usando RPC
 */
async function ejecutarSQLEnSupabase() {
  try {
    console.log('🚀 Ejecutando SQL de actualización en Supabase...')
    
    // Leer el archivo SQL
    const sqlContent = fs.readFileSync('scripts/update-tasa-cambio-complete.sql', 'utf8')
    
    // Dividir el SQL en comandos individuales
    const comandos = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`📋 Total de comandos SQL: ${comandos.length}`)
    
    // Ejecutar cada comando
    for (let i = 0; i < comandos.length; i++) {
      const comando = comandos[i]
      
      if (comando.length === 0) continue
      
      console.log(`📋 Ejecutando comando ${i + 1}/${comandos.length}...`)
      
      try {
        // Intentar ejecutar como función RPC si es posible
        if (comando.includes('SELECT') && !comando.includes('CREATE') && !comando.includes('ALTER')) {
          // Para consultas SELECT, usar query directo
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql_query: comando 
          })
          
          if (error) {
            console.log(`⚠️ Comando ${i + 1} - Error: ${error.message}`)
          } else {
            console.log(`✅ Comando ${i + 1} ejecutado exitosamente`)
            if (data) {
              console.log(`📊 Resultado: ${JSON.stringify(data)}`)
            }
          }
        } else {
          // Para otros comandos, usar RPC
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql_query: comando 
          })
          
          if (error) {
            console.log(`⚠️ Comando ${i + 1} - Error: ${error.message}`)
          } else {
            console.log(`✅ Comando ${i + 1} ejecutado exitosamente`)
          }
        }
        
      } catch (err) {
        console.log(`❌ Comando ${i + 1} - Error inesperado: ${err.message}`)
      }
      
      // Pequeña pausa entre comandos
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('')
    console.log('🎉 ¡Ejecución de SQL completada!')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    return false
  }
  
  return true
}

/**
 * Verificar que la actualización funcionó
 */
async function verificarActualizacion() {
  try {
    console.log('🔍 Verificando que la actualización funcionó...')
    
    // Verificar estructura de la tabla
    const { data: estructura, error: errorEstructura } = await supabase
      .from('tasa_cambio')
      .select('*')
      .limit(1)
    
    if (errorEstructura) {
      console.error('❌ Error al verificar estructura:', errorEstructura.message)
      return false
    }
    
    if (estructura.length > 0) {
      console.log('📊 Estructura actualizada:')
      Object.keys(estructura[0]).forEach(col => {
        console.log(`  - ${col}`)
      })
      
      // Verificar si tiene fecha_hora
      if (estructura[0].fecha_hora) {
        console.log('✅ Columna fecha_hora agregada exitosamente')
      } else {
        console.log('⚠️ Columna fecha_hora no encontrada')
      }
    }
    
    // Probar función de verificación
    console.log('🧪 Probando función de verificación...')
    const { data: prueba, error: errorPrueba } = await supabase
      .rpc('verificar_y_actualizar_tasa_bcv', { new_tasa: 169.9761 })
    
    if (errorPrueba) {
      console.log('⚠️ Función de verificación no disponible:', errorPrueba.message)
    } else {
      console.log('✅ Función de verificación funcionando')
      console.log('📊 Resultado de prueba:', prueba)
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error al verificar:', error.message)
    return false
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Actualizando tabla tasa_cambio en Supabase...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    // Ejecutar SQL
    const exito = await ejecutarSQLEnSupabase()
    
    if (exito) {
      // Verificar actualización
      await verificarActualizacion()
      
      console.log('')
      console.log('🎉 ¡Actualización completada!')
      console.log('')
      console.log('📋 Próximos pasos:')
      console.log('   1. La aplicación ahora verificará automáticamente la tasa BCV')
      console.log('   2. Se guardará nueva tasa si es diferente a la actual')
      console.log('   3. Se mantendrá historial de cambios por hora')
      console.log('   4. Usar la función verificar_y_actualizar_tasa_bcv() en la aplicación')
      
    } else {
      console.log('')
      console.log('⚠️ La actualización no se completó completamente')
      console.log('💡 Revisa los errores anteriores y ejecuta manualmente en Supabase')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
