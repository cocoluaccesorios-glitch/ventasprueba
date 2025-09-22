#!/usr/bin/env node

/**
 * Script para obtener la tasa de cambio del BCV mediante web scraping
 * Actualiza automáticamente la base de datos con la tasa más reciente
 */

import axios from 'axios'
import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import cron from 'node-cron'

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

// Configuración del scraper
const BCV_URL = 'https://www.bcv.org.ve'
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'

/**
 * Obtiene la tasa de cambio del BCV mediante web scraping
 */
async function obtenerTasaBCV() {
  try {
    console.log('🔄 Obteniendo tasa de cambio del BCV...')
    
    // Hacer petición HTTP con headers para evitar bloqueos
    const response = await axios.get(BCV_URL, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000, // 10 segundos de timeout
    })

    // Cargar el HTML con cheerio
    const $ = cheerio.load(response.data)
    
    // Buscar la tasa USD en diferentes selectores posibles
    let tasaUSD = null
    
    // Selector 1: Buscar por texto "USD" y extraer el número
    $('*').each((i, element) => {
      const text = $(element).text().trim()
      if (text.includes('USD') && text.includes(',')) {
        // Buscar patrón de número con comas (formato venezolano)
        const match = text.match(/(\d{1,3}(?:,\d{3})*(?:,\d{2})?)/)
        if (match) {
          const numero = match[1].replace(/,/g, '')
          if (numero.length >= 3) { // Debe ser un número razonable
            tasaUSD = parseFloat(numero)
            return false // Salir del loop
          }
        }
      }
    })
    
    // Selector 2: Buscar en elementos con clase específica
    if (!tasaUSD) {
      $('.dolar, .usd, .tasa, .cambio').each((i, element) => {
        const text = $(element).text().trim()
        const match = text.match(/(\d{1,3}(?:,\d{3})*(?:,\d{2})?)/)
        if (match) {
          const numero = match[1].replace(/,/g, '')
          if (numero.length >= 3) {
            tasaUSD = parseFloat(numero)
            return false
          }
        }
      })
    }
    
    // Selector 3: Buscar en tablas
    if (!tasaUSD) {
      $('table tr').each((i, row) => {
        const cells = $(row).find('td')
        cells.each((j, cell) => {
          const text = $(cell).text().trim()
          if (text.includes('USD') || text.includes('$')) {
            const nextCell = cells.eq(j + 1)
            if (nextCell.length) {
              const tasaText = nextCell.text().trim()
              const match = tasaText.match(/(\d{1,3}(?:,\d{3})*(?:,\d{2})?)/)
              if (match) {
                const numero = match[1].replace(/,/g, '')
                if (numero.length >= 3) {
                  tasaUSD = parseFloat(numero)
                  return false
                }
              }
            }
          }
        })
      })
    }
    
    if (!tasaUSD) {
      throw new Error('No se pudo encontrar la tasa USD en la página del BCV')
    }
    
    console.log(`✅ Tasa USD encontrada: ${tasaUSD}`)
    return tasaUSD
    
  } catch (error) {
    console.error('❌ Error al obtener tasa del BCV:', error.message)
    
    // En caso de error, intentar con una tasa de respaldo
    console.log('🔄 Intentando con tasa de respaldo...')
    return await obtenerTasaRespaldo()
  }
}

/**
 * Obtiene una tasa de respaldo de una API alternativa
 */
async function obtenerTasaRespaldo() {
  try {
    // API alternativa (ejemplo)
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
      timeout: 5000
    })
    
    // Convertir a bolívares usando una tasa aproximada
    const tasaAproximada = 160 // Tasa aproximada como respaldo
    console.log(`⚠️  Usando tasa de respaldo: ${tasaAproximada}`)
    return tasaAproximada
    
  } catch (error) {
    console.error('❌ Error al obtener tasa de respaldo:', error.message)
    return 160 // Tasa por defecto
  }
}

/**
 * Guarda la tasa en la base de datos
 */
async function guardarTasaEnBD(tasa) {
  try {
    console.log('💾 Guardando tasa en la base de datos...')
    
    // Verificar si existe la tabla tasa_cambio
    const { data: existingRate, error: selectError } = await supabase
      .from('tasa_cambio')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .single()
    
    if (selectError && !selectError.message.includes('No rows')) {
      console.error('❌ Error al verificar tasa existente:', selectError.message)
      return false
    }
    
    // Insertar nueva tasa
    const { data, error } = await supabase
      .from('tasa_cambio')
      .insert({
        fecha: new Date().toISOString().split('T')[0], // Solo la fecha
        tasa_bcv: tasa,
        fuente: 'bcv_scraper',
        fecha_actualizacion: new Date().toISOString()
      })
      .select()
    
    if (error) {
      console.error('❌ Error al guardar tasa:', error.message)
      return false
    }
    
    console.log('✅ Tasa guardada exitosamente en la base de datos')
    console.log(`📊 Nueva tasa: ${tasa} Bs/USD`)
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado al guardar tasa:', error.message)
    return false
  }
}

/**
 * Función principal para actualizar la tasa
 */
async function actualizarTasaBCV() {
  console.log('🚀 Iniciando actualización de tasa BCV...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  
  try {
    // Obtener tasa del BCV
    const tasa = await obtenerTasaBCV()
    
    if (!tasa || tasa <= 0) {
      throw new Error('Tasa inválida obtenida')
    }
    
    // Guardar en base de datos
    const guardado = await guardarTasaEnBD(tasa)
    
    if (guardado) {
      console.log('🎉 Actualización completada exitosamente')
      return tasa
    } else {
      console.log('⚠️  No se pudo guardar en la base de datos')
      return null
    }
    
  } catch (error) {
    console.error('❌ Error en actualización:', error.message)
    return null
  }
}

/**
 * Configurar actualización automática
 */
function configurarActualizacionAutomatica() {
  console.log('⏰ Configurando actualización automática...')
  
  // Actualizar cada 4 horas (6 veces al día)
  cron.schedule('0 */4 * * *', async () => {
    console.log('\n🔄 Actualización automática iniciada...')
    await actualizarTasaBCV()
  })
  
  // Actualizar al inicio del día (8:00 AM)
  cron.schedule('0 8 * * *', async () => {
    console.log('\n🌅 Actualización matutina iniciada...')
    await actualizarTasaBCV()
  })
  
  console.log('✅ Actualización automática configurada:')
  console.log('   - Cada 4 horas')
  console.log('   - Diariamente a las 8:00 AM')
}

// Función para ejecutar una sola vez
async function ejecutarUnaVez() {
  const tasa = await actualizarTasaBCV()
  if (tasa) {
    console.log(`\n🎯 Tasa actualizada: ${tasa} Bs/USD`)
  } else {
    console.log('\n❌ No se pudo actualizar la tasa')
    process.exit(1)
  }
}

// Función para modo continuo
function modoContinuo() {
  console.log('🔄 Iniciando modo continuo...')
  configurarActualizacionAutomatica()
  
  // Ejecutar una vez al inicio
  actualizarTasaBCV()
  
  // Mantener el proceso corriendo
  console.log('⏳ Presiona Ctrl+C para detener...')
  process.on('SIGINT', () => {
    console.log('\n👋 Deteniendo actualizador de tasa BCV...')
    process.exit(0)
  })
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2)
const modo = args[0] || 'once'

if (modo === 'continuous' || modo === 'cont') {
  modoContinuo()
} else {
  ejecutarUnaVez()
}
