#!/usr/bin/env node

/**
 * Script para verificar completamente la base de datos de Supabase
 * - Verificar conexión
 * - Listar todas las tablas
 * - Analizar estructura de cada tabla
 * - Verificar datos existentes
 * - Identificar tablas faltantes
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
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ Faltante')
  console.error('   VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurado' : '❌ Faltante')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Verificar conexión con Supabase
 */
async function verificarConexion() {
  try {
    console.log('🔌 Verificando conexión con Supabase...')
    console.log(`   URL: ${supabaseUrl}`)
    console.log(`   Key: ${supabaseKey.substring(0, 20)}...`)
    
    // Intentar una consulta simple a una tabla que sabemos que existe
    const { data, error } = await supabase
      .from('pedidos')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Error de conexión:', error.message)
      return false
    }
    
    console.log('✅ Conexión exitosa con Supabase')
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Obtener todas las tablas de la base de datos
 */
async function obtenerTodasLasTablas() {
  try {
    console.log('\n📋 Obteniendo lista de todas las tablas...')
    
    // Lista de tablas que sabemos que existen o podrían existir
    const tablasConocidas = [
      'pedidos',
      'detalles_pedido', 
      'productos',
      'clientes',
      'categorias',
      'abonos',
      'tasa_cambio',
      'usuarios',
      'configuraciones'
    ]
    
    const tablasExistentes = []
    
    // Verificar cada tabla
    for (const tabla of tablasConocidas) {
      try {
        const { data, error } = await supabase
          .from(tabla)
          .select('*')
          .limit(1)
        
        if (!error) {
          tablasExistentes.push({
            table_name: tabla,
            table_type: 'BASE TABLE'
          })
        }
      } catch (err) {
        // Tabla no existe, continuar
      }
    }
    
    console.log(`   📊 Tablas encontradas: ${tablasExistentes.length}`)
    return tablasExistentes
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return []
  }
}

/**
 * Analizar estructura de una tabla específica
 */
async function analizarEstructuraTabla(nombreTabla) {
  try {
    console.log(`\n🔍 Analizando estructura de la tabla: ${nombreTabla}`)
    
    // Obtener conteo de registros
    const { count, error: countError } = await supabase
      .from(nombreTabla)
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error(`❌ Error al obtener conteo de ${nombreTabla}:`, countError.message)
      return null
    }
    
    // Obtener una muestra de datos para inferir la estructura
    const { data: muestra, error: muestraError } = await supabase
      .from(nombreTabla)
      .select('*')
      .limit(1)
    
    if (muestraError) {
      console.error(`❌ Error al obtener muestra de ${nombreTabla}:`, muestraError.message)
      return null
    }
    
    // Inferir columnas de la muestra
    const columnas = muestra && muestra.length > 0 ? Object.keys(muestra[0]) : []
    
    const estructura = {
      nombre: nombreTabla,
      columnas: columnas,
      totalRegistros: count || 0,
      muestra: muestra && muestra.length > 0 ? muestra[0] : null
    }
    
    // Mostrar información de la tabla
    console.log(`   📊 Total de registros: ${estructura.totalRegistros}`)
    console.log(`   📋 Columnas inferidas (${estructura.columnas.length}):`)
    
    estructura.columnas.forEach(col => {
      const valor = estructura.muestra ? estructura.muestra[col] : null
      const tipo = valor !== null ? typeof valor : 'unknown'
      console.log(`      - ${col}: ${tipo}`)
    })
    
    if (estructura.muestra) {
      console.log(`   📄 Muestra de datos:`)
      Object.entries(estructura.muestra).forEach(([key, value]) => {
        console.log(`      - ${key}: ${value}`)
      })
    }
    
    return estructura
    
  } catch (error) {
    console.error(`❌ Error analizando tabla ${nombreTabla}:`, error.message)
    return null
  }
}

/**
 * Verificar tablas específicas del sistema
 */
async function verificarTablasSistema() {
  console.log('\n🎯 Verificando tablas específicas del sistema...')
  
  const tablasEsperadas = [
    'pedidos',
    'detalles_pedido',
    'productos',
    'clientes',
    'categorias',
    'abonos', // Nueva tabla
    'tasa_cambio' // Tabla para BCV
  ]
  
  const tablasEncontradas = []
  
  // Verificar cada tabla individualmente
  for (const tabla of tablasEsperadas) {
    try {
      const { data, error } = await supabase
        .from(tabla)
        .select('*')
        .limit(1)
      
      if (!error) {
        tablasEncontradas.push(tabla)
      }
    } catch (err) {
      // Tabla no existe
    }
  }
  
  console.log('\n📋 Estado de las tablas del sistema:')
  tablasEsperadas.forEach(tabla => {
    if (tablasEncontradas.includes(tabla)) {
      console.log(`   ✅ ${tabla}: Existe`)
    } else {
      console.log(`   ❌ ${tabla}: No existe`)
    }
  })
  
  return {
    esperadas: tablasEsperadas,
    encontradas: tablasEncontradas,
    faltantes: tablasEsperadas.filter(t => !tablasEncontradas.includes(t))
  }
}

/**
 * Analizar datos de las tablas principales
 */
async function analizarDatosPrincipales() {
  console.log('\n📊 Analizando datos de las tablas principales...')
  
  const tablasPrincipales = ['pedidos', 'productos', 'clientes', 'abonos', 'tasa_cambio']
  
  for (const tabla of tablasPrincipales) {
    try {
      const { count, error } = await supabase
        .from(tabla)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`   ❌ ${tabla}: Error - ${error.message}`)
      } else {
        console.log(`   📊 ${tabla}: ${count || 0} registros`)
      }
    } catch (err) {
      console.log(`   ❌ ${tabla}: Error inesperado - ${err.message}`)
    }
  }
}

/**
 * Verificar RLS (Row Level Security)
 */
async function verificarRLS() {
  console.log('\n🔒 Verificando Row Level Security (RLS)...')
  
  // Lista de tablas conocidas para verificar RLS
  const tablasConocidas = ['pedidos', 'detalles_pedido', 'productos', 'clientes', 'categorias', 'abonos', 'tasa_cambio']
  
  console.log('\n📋 Estado de RLS por tabla:')
  console.log('   ⚠️ Nota: RLS se verifica manualmente en el dashboard de Supabase')
  
  for (const tabla of tablasConocidas) {
    try {
      const { data, error } = await supabase
        .from(tabla)
        .select('*')
        .limit(1)
      
      if (!error) {
        console.log(`   ✅ ${tabla}: Accesible (RLS configurado o deshabilitado)`)
      }
    } catch (err) {
      console.log(`   ❌ ${tabla}: Error de acceso`)
    }
  }
}

/**
 * Generar reporte completo
 */
async function generarReporteCompleto() {
  console.log('\n📋 REPORTE COMPLETO DE LA BASE DE DATOS')
  console.log('=' * 60)
  
  // Verificar conexión
  const conexionOk = await verificarConexion()
  if (!conexionOk) {
    console.log('❌ No se puede continuar sin conexión a Supabase')
    return
  }
  
  // Obtener todas las tablas
  const tablas = await obtenerTodasLasTablas()
  console.log(`\n📊 Total de tablas encontradas: ${tablas.length}`)
  
  // Verificar tablas del sistema
  const estadoTablas = await verificarTablasSistema()
  
  // Analizar estructura de tablas principales
  const tablasPrincipales = ['pedidos', 'productos', 'clientes', 'abonos', 'tasa_cambio']
  
  for (const tabla of tablasPrincipales) {
    if (estadoTablas.encontradas.includes(tabla)) {
      await analizarEstructuraTabla(tabla)
    }
  }
  
  // Analizar datos
  await analizarDatosPrincipales()
  
  // Verificar RLS
  await verificarRLS()
  
  // Resumen final
  console.log('\n🎯 RESUMEN FINAL:')
  console.log(`   - Total de tablas: ${tablas.length}`)
  console.log(`   - Tablas del sistema: ${estadoTablas.encontradas.length}/${estadoTablas.esperadas.length}`)
  console.log(`   - Tablas faltantes: ${estadoTablas.faltantes.length}`)
  
  if (estadoTablas.faltantes.length > 0) {
    console.log('\n⚠️ TABLAS FALTANTES:')
    estadoTablas.faltantes.forEach(tabla => {
      console.log(`   - ${tabla}`)
    })
  }
  
  console.log('\n✅ Verificación completa de la base de datos finalizada')
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando verificación completa de la base de datos Supabase...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  
  try {
    await generarReporteCompleto()
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar
main()
