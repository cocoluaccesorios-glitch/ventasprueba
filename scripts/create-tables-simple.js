#!/usr/bin/env node

/**
 * Script simple para crear las tablas faltantes en Supabase
 * Usa consultas directas sin RPC
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
 * Crear tabla tasa_cambio
 */
async function crearTablaTasaCambio() {
  try {
    console.log('📋 Creando tabla tasa_cambio...')
    
    // Verificar si la tabla ya existe
    const { data: existe, error: errorExiste } = await supabase
      .from('tasa_cambio')
      .select('id')
      .limit(1)
    
    if (!errorExiste) {
      console.log('✅ Tabla tasa_cambio ya existe')
      return true
    }
    
    if (errorExiste.message.includes('relation "tasa_cambio" does not exist')) {
      console.log('   ⚠️ Tabla no existe, creándola...')
      
      // Intentar crear la tabla usando una consulta simple
      const { data, error } = await supabase
        .from('tasa_cambio')
        .insert({
          fecha: new Date().toISOString().split('T')[0],
          tasa_bcv: 166.58
        })
        .select()
      
      if (error) {
        console.error('❌ Error creando tabla tasa_cambio:', error.message)
        return false
      } else {
        console.log('✅ Tabla tasa_cambio creada exitosamente')
        return true
      }
    } else {
      console.error('❌ Error verificando tabla tasa_cambio:', errorExiste.message)
      return false
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Crear tabla abonos
 */
async function crearTablaAbonos() {
  try {
    console.log('📋 Creando tabla abonos...')
    
    // Verificar si la tabla ya existe
    const { data: existe, error: errorExiste } = await supabase
      .from('abonos')
      .select('id')
      .limit(1)
    
    if (!errorExiste) {
      console.log('✅ Tabla abonos ya existe')
      return true
    }
    
    if (errorExiste.message.includes('relation "abonos" does not exist')) {
      console.log('   ⚠️ Tabla no existe, creándola...')
      
      // Intentar crear la tabla usando una consulta simple
      const { data, error } = await supabase
        .from('abonos')
        .insert({
          pedido_id: 1,
          monto_abono_usd: 0,
          monto_abono_ves: 0,
          tasa_bcv: 166.58,
          metodo_pago_abono: 'efectivo',
          tipo_abono: 'simple',
          estado_abono: 'confirmado',
          comentarios: 'Tabla creada'
        })
        .select()
      
      if (error) {
        console.error('❌ Error creando tabla abonos:', error.message)
        return false
      } else {
        console.log('✅ Tabla abonos creada exitosamente')
        return true
      }
    } else {
      console.error('❌ Error verificando tabla abonos:', errorExiste.message)
      return false
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Crear tabla categorias
 */
async function crearTablaCategorias() {
  try {
    console.log('📋 Creando tabla categorias...')
    
    // Verificar si la tabla ya existe
    const { data: existe, error: errorExiste } = await supabase
      .from('categorias')
      .select('id')
      .limit(1)
    
    if (!errorExiste) {
      console.log('✅ Tabla categorias ya existe')
      return true
    }
    
    if (errorExiste.message.includes('relation "categorias" does not exist')) {
      console.log('   ⚠️ Tabla no existe, creándola...')
      
      // Intentar crear la tabla usando una consulta simple
      const { data, error } = await supabase
        .from('categorias')
        .insert({
          nombre: 'Bebidas',
          descripcion: 'Bebidas y refrescos',
          activa: true
        })
        .select()
      
      if (error) {
        console.error('❌ Error creando tabla categorias:', error.message)
        return false
      } else {
        console.log('✅ Tabla categorias creada exitosamente')
        return true
      }
    } else {
      console.error('❌ Error verificando tabla categorias:', errorExiste.message)
      return false
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Verificar estado final
 */
async function verificarEstadoFinal() {
  try {
    console.log('\n🔍 Verificando estado final de las tablas...')
    
    const tablas = [
      { nombre: 'tasa_cambio', funcion: () => supabase.from('tasa_cambio').select('id').limit(1) },
      { nombre: 'abonos', funcion: () => supabase.from('abonos').select('id').limit(1) },
      { nombre: 'categorias', funcion: () => supabase.from('categorias').select('id').limit(1) }
    ]
    
    for (const tabla of tablas) {
      try {
        const { data, error } = await tabla.funcion()
        
        if (error) {
          console.log(`❌ ${tabla.nombre}: Error - ${error.message}`)
        } else {
          console.log(`✅ ${tabla.nombre}: Tabla accesible`)
        }
      } catch (err) {
        console.log(`❌ ${tabla.nombre}: Error inesperado - ${err.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error verificando estado final:', error.message)
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando creación de tablas en Supabase...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  
  try {
    // Crear las tablas
    const resultado1 = await crearTablaTasaCambio()
    const resultado2 = await crearTablaAbonos()
    const resultado3 = await crearTablaCategorias()
    
    // Verificar estado final
    await verificarEstadoFinal()
    
    if (resultado1 && resultado2 && resultado3) {
      console.log('\n🎉 ¡Todas las tablas creadas exitosamente!')
      console.log('📋 Próximos pasos:')
      console.log('   1. Verificar en el dashboard de Supabase')
      console.log('   2. Ejecutar migración de datos')
      console.log('   3. Probar el sistema')
    } else {
      console.log('\n⚠️ Algunas tablas no se pudieron crear')
      console.log('💡 Recomendación: Crear las tablas manualmente en el SQL Editor de Supabase')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar
main()
