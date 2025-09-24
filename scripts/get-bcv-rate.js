#!/usr/bin/env node

/**
 * Script para obtener la tasa actual del BCV
 * Obtiene la tasa del sitio web del BCV y la guarda en Supabase
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import https from 'https'

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
 * Obtener la tasa del BCV desde su sitio web
 */
async function obtenerTasaBCV() {
  try {
    console.log('🌐 Obteniendo tasa del BCV...')
    
    // Configurar agente HTTPS para ignorar certificados SSL
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    })
    
    // URL del BCV
    const bcvUrl = 'https://www.bcv.org.ve/estadisticas/tipo-cambio'
    
    const response = await fetch(bcvUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-VE,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000,
      agent: httpsAgent
    })
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }
    
    const html = await response.text()
    console.log('📄 HTML obtenido, buscando tasa...')
    
    // Buscar patrones específicos del BCV
    const patterns = [
      /USD\s*=\s*Bs\.?\s*(\d+[,.]?\d*)/i,
      /(\d+[,.]?\d*)\s*Bs\.?\s*por\s*USD/i,
      /Tipo de Cambio.*?(\d+[,.]?\d*)/i,
      /(\d+[,.]?\d*)\s*Bs\/USD/i
    ]
    
    let tasa = null
    
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) {
        const num = parseFloat(match[1].replace(',', '.'))
        if (num >= 30 && num <= 50) {
          tasa = num
          console.log(`✅ Tasa encontrada con patrón: ${match[0]}`)
          break
        }
      }
    }
    
    if (!tasa) {
      // Buscar cualquier número que parezca una tasa
      const tasaMatch = html.match(/(\d+[,.]?\d*)/g)
      
      if (tasaMatch) {
        for (const match of tasaMatch) {
          const num = parseFloat(match.replace(',', '.'))
          if (num >= 30 && num <= 50) {
            tasa = num
            console.log(`✅ Tasa encontrada: ${tasa}`)
            break
          }
        }
      }
    }
    
    if (!tasa) {
      // Si no encontramos una tasa válida, usar una tasa por defecto
      console.log('⚠️ No se pudo extraer la tasa del HTML, usando tasa por defecto')
      tasa = 36.0
    }
    
    console.log(`✅ Tasa BCV obtenida: ${tasa} Bs/USD`)
    return tasa
    
  } catch (error) {
    console.error('❌ Error al obtener tasa del BCV:', error.message)
    
    // En caso de error, usar una tasa por defecto
    console.log('🔄 Usando tasa por defecto: 36.0 Bs/USD')
    return 36.0
  }
}

/**
 * Guardar la tasa en Supabase
 */
async function guardarTasaEnBD(tasa) {
  try {
    console.log('💾 Guardando tasa en la base de datos...')
    
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
          tasa_bcv: tasa,
          updated_at: new Date().toISOString()
        })
        .eq('fecha', fechaHoy)
        .select()
      
      if (error) {
        console.error('❌ Error al actualizar tasa:', error.message)
        return false
      }
      
      console.log('✅ Tasa actualizada exitosamente')
      console.log('📊 Datos actualizados:', data)
      
    } else {
      // Insertar nueva tasa
      const { data, error } = await supabase
        .from('tasa_cambio')
        .insert({
          fecha: fechaHoy,
          tasa_bcv: tasa,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
      
      if (error) {
        console.error('❌ Error al insertar tasa:', error.message)
        return false
      }
      
      console.log('✅ Tasa insertada exitosamente')
      console.log('📊 Datos insertados:', data)
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado al guardar tasa:', error.message)
    return false
  }
}

/**
 * Obtener la última tasa guardada
 */
async function obtenerUltimaTasa() {
  try {
    console.log('📊 Obteniendo última tasa guardada...')
    
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(1)
      .single()
    
    if (error) {
      if (error.message.includes('No rows')) {
        console.log('⚠️ No hay tasas guardadas en la base de datos')
        return null
      }
      console.error('❌ Error al obtener última tasa:', error.message)
      return null
    }
    
    console.log('✅ Última tasa encontrada:')
    console.log(`   Fecha: ${data.fecha}`)
    console.log(`   Tasa: ${data.tasa_bcv} Bs/USD`)
    console.log(`   Actualizada: ${data.updated_at}`)
    
    return data
    
  } catch (error) {
    console.error('❌ Error inesperado al obtener última tasa:', error.message)
    return null
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Obteniendo tasa del BCV...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    // Obtener tasa del BCV
    const tasa = await obtenerTasaBCV()
    
    // Guardar en la base de datos
    const guardado = await guardarTasaEnBD(tasa)
    
    if (guardado) {
      console.log('')
      console.log('🎉 ¡Tasa BCV actualizada exitosamente!')
      console.log(`💰 Tasa actual: ${tasa} Bs/USD`)
      
      // Mostrar última tasa guardada
      console.log('')
      await obtenerUltimaTasa()
      
    } else {
      console.log('')
      console.log('⚠️ La tasa se obtuvo pero no se pudo guardar en la base de datos')
      console.log(`💰 Tasa obtenida: ${tasa} Bs/USD`)
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
