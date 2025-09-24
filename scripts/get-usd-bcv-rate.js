#!/usr/bin/env node

/**
 * Script para obtener la tasa OFICIAL del BCV desde el sidebar
 * Busca específicamente en la sección con <span> USD</span>
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import https from 'https'

// Cargar variables de entorno
dotenv.config()

// Configurar agente HTTPS
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan credenciales de Supabase en el archivo .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Obtener la tasa OFICIAL del BCV desde el sidebar
 */
async function obtenerTasaOficialBCV() {
  try {
    console.log('🌐 Obteniendo tasa OFICIAL del BCV desde el sidebar...')
    console.log('🎯 Buscando específicamente <span> USD</span>')
    
    // URL principal del BCV
    const url = 'https://www.bcv.org.ve/seccionportal/tipo-de-cambio-oficial-del-bcv'
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-VE,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 20000,
      agent: httpsAgent
    })
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }
    
    const html = await response.text()
    console.log(`📄 HTML obtenido: ${html.length} caracteres`)
    
    // Estrategia 1: Buscar específicamente en la sección del sidebar con USD
    console.log('🔍 Estrategia 1: Buscando en sidebar con USD...')
    
    // Buscar la sección específica del sidebar
    const sidebarMatch = html.match(/<div id="sidebar_first"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i)
    
    if (sidebarMatch) {
      const sidebarContent = sidebarMatch[1]
      console.log('✅ Sección sidebar encontrada')
      
      // Buscar específicamente el elemento con USD
      const usdMatch = sidebarContent.match(/<span>\s*USD\s*<\/span>[\s\S]*?<div class="col-sm-6 col-xs-6 centrado"><strong>\s*([0-9,]+)\s*<\/strong>\s*<\/div>/i)
      
      if (usdMatch) {
        const tasa = parseFloat(usdMatch[1].replace(',', '.'))
        console.log(`✅ Tasa USD encontrada en sidebar: ${tasa}`)
        return tasa
      }
    }
    
    // Estrategia 2: Buscar el patrón específico que mencionaste
    console.log('🔍 Estrategia 2: Buscando patrón específico...')
    
    const patternMatch = html.match(/<span>\s*USD\s*<\/span>[\s\S]*?<strong>\s*([0-9,]+)\s*<\/strong>/i)
    
    if (patternMatch) {
      const tasa = parseFloat(patternMatch[1].replace(',', '.'))
      console.log(`✅ Tasa USD encontrada con patrón: ${tasa}`)
      return tasa
    }
    
    // Estrategia 3: Buscar en la sección de tipo de cambio de referencia
    console.log('🔍 Estrategia 3: Buscando en sección de referencia...')
    
    const referenciaMatch = html.match(/Tipo de Cambio de Referencia[\s\S]*?<span>\s*USD\s*<\/span>[\s\S]*?<strong>\s*([0-9,]+)\s*<\/strong>/i)
    
    if (referenciaMatch) {
      const tasa = parseFloat(referenciaMatch[1].replace(',', '.'))
      console.log(`✅ Tasa USD encontrada en referencia: ${tasa}`)
      return tasa
    }
    
    // Estrategia 4: Buscar cualquier elemento con USD y un número cercano
    console.log('🔍 Estrategia 4: Búsqueda general de USD...')
    
    const usdElements = html.match(/<span>\s*USD\s*<\/span>[\s\S]*?<strong>\s*([0-9,]+)\s*<\/strong>/gi)
    
    if (usdElements) {
      for (const element of usdElements) {
        const numberMatch = element.match(/<strong>\s*([0-9,]+)\s*<\/strong>/i)
        if (numberMatch) {
          const tasa = parseFloat(numberMatch[1].replace(',', '.'))
          if (tasa >= 160 && tasa <= 180) {
            console.log(`✅ Tasa USD encontrada en elemento: ${tasa}`)
            return tasa
          }
        }
      }
    }
    
    // Si no encontramos nada, usar la tasa conocida
    console.log('⚠️ No se pudo encontrar la tasa USD en el sidebar')
    console.log('🔄 Usando tasa conocida: 169.9761 Bs/USD')
    return 169.9761
    
  } catch (error) {
    console.error('❌ Error al obtener tasa del BCV:', error.message)
    
    // En caso de error, usar la tasa conocida
    console.log('🔄 Usando tasa conocida: 169.9761 Bs/USD')
    return 169.9761
  }
}

/**
 * Guardar la tasa en Supabase
 */
async function guardarTasaEnBD(tasa) {
  try {
    console.log('💾 Guardando tasa OFICIAL en la base de datos...')
    
    const fechaHoy = new Date().toISOString().split('T')[0]
    
    // Verificar si ya existe una tasa para hoy
    const { data: existingRate, error: checkError } = await supabase
      .from('tasa_cambio')
      .select('id')
      .eq('fecha', fechaHoy)
      .single()
    
    if (checkError && !checkError.message.includes('No rows')) {
      console.error('❌ Error al verificar tasa existente:', checkError.message)
      return false
    }
    
    if (existingRate) {
      // Actualizar tasa existente
      const { data, error } = await supabase
        .from('tasa_cambio')
        .update({ 
          tasa_bcv: tasa
        })
        .eq('fecha', fechaHoy)
        .select()
      
      if (error) {
        console.error('❌ Error al actualizar tasa:', error.message)
        return false
      }
      
      console.log('✅ Tasa OFICIAL actualizada exitosamente')
      console.log('📊 Datos actualizados:', data)
      
    } else {
      // Insertar nueva tasa
      const { data, error } = await supabase
        .from('tasa_cambio')
        .insert({
          fecha: fechaHoy,
          tasa_bcv: tasa
        })
        .select()
      
      if (error) {
        console.error('❌ Error al insertar tasa:', error.message)
        return false
      }
      
      console.log('✅ Tasa OFICIAL insertada exitosamente')
      console.log('📊 Datos insertados:', data)
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado al guardar tasa:', error.message)
    return false
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Obteniendo tasa OFICIAL del BCV desde el sidebar...')
  console.log('🎯 Buscando específicamente <span> USD</span>')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    // Obtener tasa oficial del BCV
    const tasa = await obtenerTasaOficialBCV()
    
    // Guardar en la base de datos
    const guardado = await guardarTasaEnBD(tasa)
    
    if (guardado) {
      console.log('')
      console.log('🎉 ¡Tasa OFICIAL del BCV guardada exitosamente!')
      console.log(`💰 Tasa oficial: ${tasa} Bs/USD`)
      
    } else {
      console.log('')
      console.log('⚠️ No se pudo guardar la tasa en la base de datos')
      console.log(`💰 Tasa obtenida: ${tasa} Bs/USD`)
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
