/**
 * Servicio para manejar la tasa de cambio del BCV
 * Incluye funciones para obtener, guardar y usar la tasa automáticamente
 */

import { supabase } from '../lib/supabaseClient.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

/**
 * Obtiene la tasa de cambio del BCV desde su página web
 * @returns {Promise<number>} Tasa de cambio en Bs/USD
 */
export async function obtenerTasaBCV() {
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
      httpsAgent: new (await import('https')).Agent({
        rejectUnauthorized: false
      })
    })

    const $ = cheerio.load(response.data)
    
    // Buscar la tasa USD en el contenido de la página
    let tasaUSD = null
    
    // Método 1: Buscar por el patrón específico
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
    
    // Tasa de respaldo basada en la que viste (redondeada a 4 decimales)
    console.log('🔄 Usando tasa de respaldo: 166.5800')
    return 166.5800
  }
}

/**
 * Guarda la tasa en la base de datos
 * @param {number} tasa - Tasa de cambio a guardar
 * @returns {Promise<boolean>} True si se guardó exitosamente
 */
export async function guardarTasaEnBD(tasa) {
  try {
    console.log('💾 Guardando tasa en la base de datos...')
    
    const { data, error } = await supabase
      .from('tasa_cambio')
      .insert({
        fecha: new Date().toISOString().split('T')[0],
        tasa_bcv: tasa
      })
      .select()
    
    if (error) {
      console.error('❌ Error al guardar tasa:', error.message)
      return false
    }
    
    console.log('✅ Tasa guardada exitosamente')
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Obtiene la tasa más reciente de la base de datos
 * @returns {Promise<number>} Tasa de cambio más reciente
 */
export async function obtenerTasaMasReciente() {
  try {
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('tasa_bcv')
      .order('id', { ascending: false })
      .limit(1)
      .single()
    
    if (error) {
      console.warn('No se pudo obtener la tasa de cambio:', error.message)
      return 166.5800 // Tasa por defecto
    }
    
    return data?.tasa_bcv || 166.5800
    
  } catch (err) {
    console.warn('Error al obtener tasa de cambio:', err)
    return 166.5800 // Tasa por defecto en caso de error
  }
}

/**
 * Actualiza la tasa BCV obteniéndola del sitio web y guardándola en la BD
 * @returns {Promise<number>} La nueva tasa obtenida
 */
export async function actualizarTasaBCV() {
  try {
    console.log('🚀 Iniciando actualización de tasa BCV...')
    
    const tasa = await obtenerTasaBCV()
    console.log(`📊 Tasa obtenida: ${tasa} Bs/USD`)
    
    const guardado = await guardarTasaEnBD(tasa)
    
    if (guardado) {
      console.log('🎉 ¡Actualización completada exitosamente!')
      console.log(`💰 Nueva tasa: ${tasa} Bs/USD`)
    } else {
      console.log('⚠️  No se pudo guardar en la base de datos')
    }
    
    return tasa
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    return 166.5800 // Tasa de respaldo
  }
}

/**
 * Obtiene la tasa BCV para usar en la aplicación
 * Obtiene la tasa del día actual, si no existe la crea
 * @returns {Promise<number>} Tasa de cambio para usar
 */
export async function getTasaBCV() {
  try {
    const fechaHoy = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    
    // Buscar tasa del día actual
    const { data: tasaHoy, error } = await supabase
      .from('tasa_cambio')
      .select('tasa_bcv')
      .eq('fecha', fechaHoy)
      .order('id', { ascending: false })
      .limit(1)
      .single()
    
    if (tasaHoy && !error) {
      console.log(`✅ Tasa BCV del día ${fechaHoy}: ${tasaHoy.tasa_bcv}`)
      return tasaHoy.tasa_bcv
    }
    
    // Si no existe tasa para hoy, obtenerla del BCV y guardarla
    console.log(`🔄 No hay tasa para ${fechaHoy}, obteniendo del BCV...`)
    const nuevaTasa = await obtenerTasaBCV()
    
    // Intentar guardar la tasa del día (puede fallar si la tabla no existe)
    try {
      const { error: insertError } = await supabase
        .from('tasa_cambio')
        .insert({
          fecha: fechaHoy,
          tasa_bcv: nuevaTasa
        })
      
      if (insertError) {
        console.warn('⚠️ No se pudo guardar la tasa del día (tabla no existe):', insertError.message)
      } else {
        console.log(`✅ Tasa del día ${fechaHoy} guardada: ${nuevaTasa}`)
      }
    } catch (insertErr) {
      console.warn('⚠️ Error al guardar tasa (tabla no existe):', insertErr.message)
    }
    
    return nuevaTasa
    
  } catch (error) {
    console.error('❌ Error al obtener tasa BCV del día:', error.message)
    // En caso de error, obtener directamente del BCV
    console.log('🔄 Obteniendo tasa directamente del BCV como fallback...')
    return await obtenerTasaBCV()
  }
}

/**
 * Obtiene la tasa BCV de una fecha específica
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Promise<number>} Tasa de cambio de esa fecha
 */
export async function getTasaBCVPorFecha(fecha) {
  try {
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('tasa_bcv')
      .eq('fecha', fecha)
      .order('id', { ascending: false })
      .limit(1)
      .single()
    
    if (data && !error) {
      console.log(`✅ Tasa BCV del ${fecha}: ${data.tasa_bcv}`)
      return data.tasa_bcv
    }
    
    // Si no existe tasa para esa fecha, obtener la tasa actual del BCV
    console.log(`⚠️ No hay tasa para ${fecha}, obteniendo tasa actual del BCV...`)
    return await obtenerTasaBCV()
    
  } catch (error) {
    console.error('❌ Error al obtener tasa por fecha:', error.message)
    return 166.5800 // Tasa de respaldo
  }
}

/**
 * Convierte USD a VES usando la tasa BCV
 * @param {number} usd - Cantidad en USD
 * @returns {Promise<number>} Cantidad en VES
 */
export async function convertirUSDaVES(usd) {
  const tasa = await getTasaBCV()
  return usd * tasa
}

/**
 * Convierte VES a USD usando la tasa BCV
 * @param {number} ves - Cantidad en VES
 * @returns {Promise<number>} Cantidad en USD
 */
export async function convertirVESaUSD(ves) {
  const tasa = await getTasaBCV()
  return ves / tasa
}
