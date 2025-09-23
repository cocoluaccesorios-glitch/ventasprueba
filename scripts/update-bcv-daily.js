#!/usr/bin/env node

/**
 * Script diario para actualizar la tasa BCV
 * Se ejecuta automáticamente y actualiza la base de datos
 * Solo actualiza si la tasa cambió o no existe para hoy
 */

import axios from 'axios'
import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
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
 * Obtiene la tasa actual del BCV desde su página web
 * @returns {Promise<number>} Tasa BCV actual
 */
async function obtenerTasaBCVActual() {
  try {
    console.log('🔄 Obteniendo tasa actual del BCV...')
    
    const response = await axios.get('https://www.bcv.org.ve', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9',
        'Cache-Control': 'no-cache',
      },
      timeout: 15000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })

    const $ = cheerio.load(response.data)
    
    // Buscar la tasa USD en el contenido de la página
    let tasaUSD = null
    
    // Método 1: Buscar por el patrón específico
    const textContent = $.text()
    
    // Buscar patrones como "168,41570000" o "168.41570000"
    const patterns = [
      /USD[:\s]*(\d{1,3}[,.]\d{2,8})/i,
      /\$[:\s]*(\d{1,3}[,.]\d{2,8})/i,
      /(\d{1,3}[,.]\d{2,8})\s*USD/i,
      /(\d{1,3}[,.]\d{2,8})\s*Bs/i,
      /Tasa[:\s]*(\d{1,3}[,.]\d{2,8})/i,
      /Cambio[:\s]*(\d{1,3}[,.]\d{2,8})/i
    ]
    
    for (const pattern of patterns) {
      const match = textContent.match(pattern)
      if (match) {
        let tasa = match[1].replace(',', '.')
        tasa = parseFloat(tasa)
        if (tasa > 50 && tasa < 1000) { // Rango razonable para la tasa
          tasaUSD = tasa
          console.log(`✅ Tasa encontrada con patrón: ${tasa}`)
          break
        }
      }
    }
    
    // Método 2: Buscar en elementos específicos
    if (!tasaUSD) {
      $('*').each((i, element) => {
        const text = $(element).text().trim()
        if (text.includes('USD') || text.includes('$')) {
          const match = text.match(/(\d{1,3}[,.]\d{2,8})/)
          if (match) {
            let tasa = match[1].replace(',', '.')
            tasa = parseFloat(tasa)
            if (tasa > 50 && tasa < 1000) {
              tasaUSD = tasa
              console.log(`✅ Tasa encontrada en elemento: ${tasa}`)
              return false // Salir del loop
            }
          }
        }
      })
    }
    
    if (!tasaUSD) {
      throw new Error('No se pudo encontrar la tasa USD en la página')
    }
    
    // Redondear a 4 decimales para evitar problemas de precisión
    const tasaRedondeada = Math.round(tasaUSD * 10000) / 10000
    console.log(`✅ Tasa BCV extraída: ${tasaUSD} → Redondeada a 4 decimales: ${tasaRedondeada}`)
    
    return tasaRedondeada
    
  } catch (error) {
    console.error('❌ Error al obtener tasa del BCV:', error.message)
    throw error
  }
}

/**
 * Obtiene la tasa registrada para hoy en la base de datos
 * @returns {Promise<number|null>} Tasa registrada o null si no existe
 */
async function obtenerTasaHoy() {
  try {
    const fechaHoy = new Date().toISOString().split('T')[0]
    console.log(`🔍 Buscando tasa para ${fechaHoy}...`)
    
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('tasa_bcv')
      .eq('fecha', fechaHoy)
      .order('id', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }
    
    if (data?.tasa_bcv) {
      console.log(`✅ Tasa encontrada para hoy: ${data.tasa_bcv} Bs/USD`)
      return data.tasa_bcv
    }
    
    console.log(`⚠️ No hay tasa registrada para ${fechaHoy}`)
    return null
    
  } catch (error) {
    console.error('❌ Error al buscar tasa de hoy:', error.message)
    return null
  }
}

/**
 * Guarda o actualiza la tasa en la base de datos
 * @param {number} tasaNueva - Nueva tasa a guardar
 * @param {number|null} tasaActual - Tasa actual en BD (si existe)
 */
async function guardarTasaEnBD(tasaNueva, tasaActual) {
  try {
    const fechaHoy = new Date().toISOString().split('T')[0]
    
    if (tasaActual === null) {
      // No existe tasa para hoy, insertar nueva
      console.log(`💾 Insertando nueva tasa para ${fechaHoy}: ${tasaNueva} Bs/USD`)
      
      const { data, error } = await supabase
        .from('tasa_cambio')
        .insert({
          fecha: fechaHoy,
          tasa_bcv: tasaNueva
        })
        .select()
      
      if (error) {
        throw error
      }
      
      console.log(`✅ Nueva tasa guardada: ${tasaNueva} Bs/USD`)
      
    } else if (tasaActual !== tasaNueva) {
      // La tasa cambió, actualizar
      console.log(`🔄 Tasa cambió: ${tasaActual} → ${tasaNueva} Bs/USD`)
      
      const { data, error } = await supabase
        .from('tasa_cambio')
        .update({ tasa_bcv: tasaNueva })
        .eq('fecha', fechaHoy)
        .select()
      
      if (error) {
        throw error
      }
      
      console.log(`✅ Tasa actualizada: ${tasaNueva} Bs/USD`)
      
    } else {
      // La tasa es igual, no hacer nada
      console.log(`✅ Tasa sin cambios: ${tasaActual} Bs/USD`)
    }
    
  } catch (error) {
    console.error('❌ Error al guardar tasa:', error.message)
    throw error
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando actualización diaria de tasa BCV...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  
  try {
    // 1. Obtener tasa actual del BCV
    const tasaBCVActual = await obtenerTasaBCVActual()
    console.log(`📊 Tasa BCV actual: ${tasaBCVActual} Bs/USD`)
    
    // 2. Obtener tasa registrada para hoy
    const tasaHoy = await obtenerTasaHoy()
    
    // 3. Comparar y actualizar si es necesario
    await guardarTasaEnBD(tasaBCVActual, tasaHoy)
    
    console.log('🎉 ¡Actualización diaria completada exitosamente!')
    
  } catch (error) {
    console.error('❌ Error en actualización diaria:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
