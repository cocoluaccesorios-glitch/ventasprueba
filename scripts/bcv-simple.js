#!/usr/bin/env node

/**
 * Script simple para obtener la tasa de cambio del BCV
 * Versión simplificada y más robusta
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
 * Obtiene la tasa de cambio del BCV
 */
async function obtenerTasaBCV() {
  try {
    console.log('🔄 Obteniendo tasa de cambio del BCV...')
    
    const response = await axios.get('https://www.bcv.org.ve', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9',
        'Cache-Control': 'no-cache',
      },
      timeout: 15000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false // Permitir certificados SSL no verificados
      })
    })

    const $ = cheerio.load(response.data)
    
    // Buscar la tasa USD en el contenido de la página
    let tasaUSD = null
    
    // Método 1: Buscar por el patrón específico que vimos en la imagen
    const textContent = $.text()
    
    // Buscar patrones como "166,58340000" o "166.58340000"
    const patterns = [
      /USD[:\s]*(\d{1,3}[,.]\d{2,8})/i,
      /\$[:\s]*(\d{1,3}[,.]\d{2,8})/i,
      /(\d{1,3}[,.]\d{2,8})\s*USD/i,
      /(\d{1,3}[,.]\d{2,8})\s*Bs/i
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
 * Guarda la tasa en la base de datos (solo si no existe para hoy)
 */
async function guardarTasaEnBD(tasa) {
  try {
    const fechaHoy = new Date().toISOString().split('T')[0]
    console.log(`💾 Verificando tasa para ${fechaHoy}...`)
    
    // Verificar si ya existe una tasa para hoy
    const { data: tasaExistente, error: selectError } = await supabase
      .from('tasa_cambio')
      .select('id')
      .eq('fecha', fechaHoy)
      .limit(1)
    
    if (tasaExistente && tasaExistente.length > 0) {
      console.log(`✅ Ya existe una tasa para ${fechaHoy}, no se actualiza`)
      return true
    }
    
    console.log(`💾 Guardando nueva tasa para ${fechaHoy}...`)
    
    const { data, error } = await supabase
      .from('tasa_cambio')
      .insert({
        fecha: fechaHoy,
        tasa_bcv: tasa
      })
      .select()
    
    if (error) {
      console.error('❌ Error al guardar tasa:', error.message)
      return false
    }
    
    console.log(`✅ Tasa del ${fechaHoy} guardada exitosamente: ${tasa} Bs/USD`)
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
  console.log('🚀 Iniciando actualización de tasa BCV...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  
  try {
    const tasa = await obtenerTasaBCV()
    console.log(`📊 Tasa obtenida: ${tasa} Bs/USD`)
    
    const guardado = await guardarTasaEnBD(tasa)
    
    if (guardado) {
      console.log('🎉 ¡Actualización completada exitosamente!')
      console.log(`💰 Nueva tasa: ${tasa} Bs/USD`)
    } else {
      console.log('⚠️  No se pudo guardar en la base de datos')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
