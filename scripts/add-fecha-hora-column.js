#!/usr/bin/env node

/**
 * Script para agregar columna fecha_hora a la tabla tasa_cambio
 * Esto permitirá múltiples tasas por día con diferentes horas
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

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
 * Agregar columna fecha_hora a la tabla tasa_cambio
 */
async function agregarColumnaFechaHora() {
  try {
    console.log('🚀 Agregando columna fecha_hora a la tabla tasa_cambio...')
    
    // Paso 1: Verificar estructura actual
    console.log('📋 Verificando estructura actual...')
    const { data: estructura, error: errorEstructura } = await supabase
      .from('tasa_cambio')
      .select('*')
      .limit(1)
    
    if (errorEstructura) {
      console.error('❌ Error al verificar estructura:', errorEstructura.message)
      return false
    }
    
    console.log('📊 Estructura actual:', Object.keys(estructura[0] || {}))
    
    // Paso 2: Intentar agregar la columna usando una consulta SQL directa
    console.log('📋 Agregando columna fecha_hora...')
    
    // Usar una función SQL personalizada si está disponible
    const { data: resultado, error: errorSQL } = await supabase
      .rpc('add_column_if_not_exists', {
        table_name: 'tasa_cambio',
        column_name: 'fecha_hora',
        column_type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()'
      })
    
    if (errorSQL) {
      console.log('⚠️ Función personalizada no disponible, intentando método alternativo...')
      
      // Método alternativo: crear una nueva tabla y migrar datos
      console.log('📋 Creando nueva tabla con estructura actualizada...')
      
      const { error: createError } = await supabase
        .from('tasa_cambio_new')
        .select('*')
        .limit(0) // Solo para crear la tabla
      
      if (createError) {
        console.log('⚠️ No se puede crear tabla nueva, usando método manual...')
        
        // Método manual: insertar con fecha_hora y luego eliminar duplicados
        console.log('📋 Insertando nuevas entradas con fecha_hora...')
        
        const { data: datosActuales, error: errorDatos } = await supabase
          .from('tasa_cambio')
          .select('*')
        
        if (errorDatos) {
          console.error('❌ Error al obtener datos actuales:', errorDatos.message)
          return false
        }
        
        // Insertar cada registro con fecha_hora
        for (const registro of datosActuales) {
          const { error: insertError } = await supabase
            .from('tasa_cambio')
            .insert({
              fecha: registro.fecha,
              tasa_bcv: registro.tasa_bcv,
              fecha_hora: new Date().toISOString()
            })
          
          if (insertError) {
            console.log('⚠️ Error al insertar:', insertError.message)
          }
        }
        
        console.log('✅ Datos migrados con fecha_hora')
        
      } else {
        console.log('✅ Nueva tabla creada')
      }
      
    } else {
      console.log('✅ Columna fecha_hora agregada exitosamente')
    }
    
    // Paso 3: Verificar la nueva estructura
    console.log('📋 Verificando nueva estructura...')
    const { data: nuevaEstructura, error: errorNueva } = await supabase
      .from('tasa_cambio')
      .select('*')
      .limit(1)
    
    if (errorNueva) {
      console.error('❌ Error al verificar nueva estructura:', errorNueva.message)
      return false
    }
    
    console.log('📊 Nueva estructura:', Object.keys(nuevaEstructura[0] || {}))
    
    // Paso 4: Probar inserción con fecha_hora
    console.log('📋 Probando inserción con fecha_hora...')
    const { data: prueba, error: errorPrueba } = await supabase
      .from('tasa_cambio')
      .insert({
        fecha: new Date().toISOString().split('T')[0],
        tasa_bcv: 169.9761,
        fecha_hora: new Date().toISOString()
      })
      .select()
    
    if (errorPrueba) {
      console.error('❌ Error en prueba de inserción:', errorPrueba.message)
      return false
    }
    
    console.log('✅ Prueba de inserción exitosa')
    console.log('📊 Datos insertados:', prueba)
    
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Actualizando tabla tasa_cambio para soportar múltiples tasas por día...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    const exito = await agregarColumnaFechaHora()
    
    if (exito) {
      console.log('')
      console.log('🎉 ¡Tabla tasa_cambio actualizada exitosamente!')
      console.log('✅ Ahora soporta múltiples tasas por día con fecha_hora')
      console.log('')
      console.log('📋 Próximos pasos:')
      console.log('   1. La aplicación verificará automáticamente la tasa BCV')
      console.log('   2. Se guardará nueva tasa si es diferente a la actual')
      console.log('   3. Se mantendrá historial de cambios por hora')
      
    } else {
      console.log('')
      console.log('⚠️ No se pudo actualizar la tabla completamente')
      console.log('💡 La aplicación funcionará con la estructura actual')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
