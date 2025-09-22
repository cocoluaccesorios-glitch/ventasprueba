#!/usr/bin/env node

/**
 * Script para ejecutar SQL directamente en Supabase
 * - Crea las tablas faltantes
 * - Migra los datos existentes
 * - Verifica el funcionamiento
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

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
 * Ejecutar SQL desde archivo
 */
async function ejecutarSQLDesdeArchivo(archivoPath) {
  try {
    console.log(`📄 Leyendo archivo: ${archivoPath}`)
    
    if (!fs.existsSync(archivoPath)) {
      console.error(`❌ Archivo no encontrado: ${archivoPath}`)
      return false
    }
    
    const sqlContent = fs.readFileSync(archivoPath, 'utf8')
    console.log(`📝 Contenido del archivo leído (${sqlContent.length} caracteres)`)
    
    // Dividir el SQL en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`🔧 Ejecutando ${statements.length} statements SQL...`)
    
    let exitosos = 0
    let errores = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      if (statement.length === 0) continue
      
      try {
        console.log(`\n📋 Ejecutando statement ${i + 1}/${statements.length}...`)
        console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`)
        
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.error(`❌ Error en statement ${i + 1}:`, error.message)
          errores++
        } else {
          console.log(`✅ Statement ${i + 1} ejecutado exitosamente`)
          exitosos++
        }
        
      } catch (err) {
        console.error(`❌ Error inesperado en statement ${i + 1}:`, err.message)
        errores++
      }
    }
    
    console.log(`\n📊 Resumen de ejecución:`)
    console.log(`   ✅ Exitosos: ${exitosos}`)
    console.log(`   ❌ Errores: ${errores}`)
    
    return errores === 0
    
  } catch (error) {
    console.error('❌ Error ejecutando SQL:', error.message)
    return false
  }
}

/**
 * Ejecutar SQL usando consultas directas
 */
async function ejecutarSQLDirecto() {
  try {
    console.log('🚀 Ejecutando SQL directamente en Supabase...')
    
    // 1. Crear tabla tasa_cambio
    console.log('\n📋 1. Creando tabla tasa_cambio...')
    
    const { error: errorTasa } = await supabase
      .from('tasa_cambio')
      .select('id')
      .limit(1)
    
    if (errorTasa && errorTasa.message.includes('relation "tasa_cambio" does not exist')) {
      console.log('   ⚠️ Tabla tasa_cambio no existe, creándola...')
      
      // Crear tabla usando RPC
      const { data: createTasa, error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS tasa_cambio (
            id SERIAL PRIMARY KEY,
            fecha DATE NOT NULL,
            tasa_bcv DECIMAL(10,8) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
      
      if (createError) {
        console.error('❌ Error creando tabla tasa_cambio:', createError.message)
      } else {
        console.log('✅ Tabla tasa_cambio creada exitosamente')
      }
    } else {
      console.log('✅ Tabla tasa_cambio ya existe')
    }
    
    // 2. Crear tabla abonos
    console.log('\n📋 2. Creando tabla abonos...')
    
    const { error: errorAbonos } = await supabase
      .from('abonos')
      .select('id')
      .limit(1)
    
    if (errorAbonos && errorAbonos.message.includes('relation "abonos" does not exist')) {
      console.log('   ⚠️ Tabla abonos no existe, creándola...')
      
      const { data: createAbonos, error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS abonos (
            id SERIAL PRIMARY KEY,
            pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
            cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
            monto_abono_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
            monto_abono_ves DECIMAL(12,2) NOT NULL DEFAULT 0,
            tasa_bcv DECIMAL(10,8) NOT NULL,
            metodo_pago_abono VARCHAR(50) NOT NULL,
            referencia_pago VARCHAR(100),
            tipo_abono VARCHAR(20) NOT NULL DEFAULT 'simple',
            fecha_abono TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            fecha_vencimiento DATE,
            estado_abono VARCHAR(20) NOT NULL DEFAULT 'confirmado',
            comentarios TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
      
      if (createError) {
        console.error('❌ Error creando tabla abonos:', createError.message)
      } else {
        console.log('✅ Tabla abonos creada exitosamente')
      }
    } else {
      console.log('✅ Tabla abonos ya existe')
    }
    
    // 3. Crear tabla categorias
    console.log('\n📋 3. Creando tabla categorias...')
    
    const { error: errorCategorias } = await supabase
      .from('categorias')
      .select('id')
      .limit(1)
    
    if (errorCategorias && errorCategorias.message.includes('relation "categorias" does not exist')) {
      console.log('   ⚠️ Tabla categorias no existe, creándola...')
      
      const { data: createCategorias, error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS categorias (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL UNIQUE,
            descripcion TEXT,
            activa BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
      
      if (createError) {
        console.error('❌ Error creando tabla categorias:', createError.message)
      } else {
        console.log('✅ Tabla categorias creada exitosamente')
      }
    } else {
      console.log('✅ Tabla categorias ya existe')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error ejecutando SQL directo:', error.message)
    return false
  }
}

/**
 * Verificar que las tablas se crearon
 */
async function verificarTablasCreadas() {
  try {
    console.log('\n🔍 Verificando que las tablas se crearon...')
    
    const tablas = ['tasa_cambio', 'abonos', 'categorias']
    
    for (const tabla of tablas) {
      try {
        const { data, error } = await supabase
          .from(tabla)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${tabla}: Error - ${error.message}`)
        } else {
          console.log(`✅ ${tabla}: Tabla creada y accesible`)
        }
      } catch (err) {
        console.log(`❌ ${tabla}: Error inesperado - ${err.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error verificando tablas:', error.message)
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando ejecución de SQL en Supabase...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  
  try {
    // Intentar ejecutar SQL directo
    const resultado = await ejecutarSQLDirecto()
    
    if (resultado) {
      // Verificar que las tablas se crearon
      await verificarTablasCreadas()
      
      console.log('\n🎉 ¡Ejecución de SQL completada!')
      console.log('📋 Próximos pasos:')
      console.log('   1. Verificar en el dashboard de Supabase que las tablas aparezcan')
      console.log('   2. Ejecutar el script de migración de datos')
      console.log('   3. Probar el funcionamiento del sistema')
    } else {
      console.log('\n⚠️ Ejecución completada con algunos errores')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar
main()
