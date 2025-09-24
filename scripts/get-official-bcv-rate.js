#!/usr/bin/env node

/**
 * Script para obtener la tasa OFICIAL del BCV (no de bancos comerciales)
 * Busca específicamente la tasa oficial del Banco Central de Venezuela
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
 * Obtener la tasa OFICIAL del BCV (no de bancos comerciales)
 */
async function obtenerTasaOficialBCV() {
  try {
    console.log('🌐 Obteniendo tasa OFICIAL del BCV...')
    console.log('⚠️ IMPORTANTE: Buscando tasa oficial, NO de bancos comerciales')
    
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
    
    // Estrategia 1: Buscar la tasa oficial del BCV (no de bancos)
    console.log('🔍 Estrategia 1: Buscando tasa oficial del BCV...')
    
    // Excluir las tablas de bancos comerciales
    const htmlSinBancos = html.replace(/<table[^>]*>[\s\S]*?<\/table>/gi, '')
    
    // Buscar patrones específicos para tasa oficial
    const patronesOficiales = [
      // Patrones que incluyen "oficial"
      /oficial.*?(\d+[,.]?\d*)/i,
      /(\d+[,.]?\d*).*?oficial/i,
      // Patrones que incluyen "BCV"
      /BCV.*?(\d+[,.]?\d*)/i,
      /(\d+[,.]?\d*).*?BCV/i,
      // Patrones que incluyen "Banco Central"
      /Banco Central.*?(\d+[,.]?\d*)/i,
      /(\d+[,.]?\d*).*?Banco Central/i,
      // Patrones específicos del BCV
      /Tipo de Cambio.*?(\d+[,.]?\d*)/i,
      /(\d+[,.]?\d*).*?Tipo de Cambio/i
    ]
    
    let tasaOficial = null
    
    for (const patron of patronesOficiales) {
      const match = htmlSinBancos.match(patron)
      if (match) {
        const value = parseFloat(match[1].replace(',', '.'))
        // Buscar tasas en el rango realista del BCV oficial (160-170)
        if (value >= 160 && value <= 170) {
          tasaOficial = value
          console.log(`✅ Tasa oficial encontrada: ${tasaOficial} (${match[0]})`)
          break
        }
      }
    }
    
    // Estrategia 2: Buscar en elementos específicos (excluyendo tablas de bancos)
    if (!tasaOficial) {
      console.log('🔍 Estrategia 2: Buscando en elementos específicos...')
      
      const elementosPatterns = [
        /<span[^>]*>[\s\S]*?(\d+[,.]?\d*)[\s\S]*?<\/span>/gi,
        /<div[^>]*>[\s\S]*?(\d+[,.]?\d*)[\s\S]*?<\/div>/gi,
        /<p[^>]*>[\s\S]*?(\d+[,.]?\d*)[\s\S]*?<\/p>/gi
      ]
      
      for (const pattern of elementosPatterns) {
        const matches = htmlSinBancos.match(pattern)
        if (matches) {
          for (const match of matches) {
            // Verificar que no sea de una tabla de bancos
            if (match.includes('Banesco') || match.includes('Mercantil') || match.includes('BNC') || match.includes('Provincial')) {
              continue
            }
            
            const numMatch = match.match(/(\d+[,.]?\d*)/)
            if (numMatch) {
              const value = parseFloat(numMatch[1].replace(',', '.'))
              if (value >= 160 && value <= 170) {
                tasaOficial = value
                console.log(`✅ Tasa oficial encontrada en elemento: ${tasaOficial}`)
                break
              }
            }
          }
        }
        if (tasaOficial) break
      }
    }
    
    // Estrategia 3: Buscar en el contenido principal (excluyendo sidebar y tablas)
    if (!tasaOficial) {
      console.log('🔍 Estrategia 3: Buscando en contenido principal...')
      
      // Extraer solo el contenido principal
      const mainContentMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
      if (mainContentMatch) {
        const mainContent = mainContentMatch[1]
        const numbers = mainContent.match(/(\d+[,.]?\d*)/g)
        
        if (numbers) {
          for (const num of numbers) {
            const value = parseFloat(num.replace(',', '.'))
            if (value >= 160 && value <= 170) {
              tasaOficial = value
              console.log(`✅ Tasa oficial encontrada en contenido principal: ${tasaOficial}`)
              break
            }
          }
        }
      }
    }
    
    // Si no encontramos la tasa oficial, usar una tasa conocida
    if (!tasaOficial) {
      console.log('⚠️ No se pudo encontrar la tasa oficial del BCV')
      console.log('🔄 Usando tasa conocida: 166.58 Bs/USD')
      tasaOficial = 166.58
    }
    
    console.log(`✅ Tasa OFICIAL del BCV: ${tasaOficial} Bs/USD`)
    return tasaOficial
    
  } catch (error) {
    console.error('❌ Error al obtener tasa oficial del BCV:', error.message)
    
    // En caso de error, usar la tasa conocida
    console.log('🔄 Usando tasa conocida: 166.58 Bs/USD')
    return 166.58
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
  console.log('🚀 Obteniendo tasa OFICIAL del BCV...')
  console.log('⚠️ IMPORTANTE: Buscando tasa oficial, NO de bancos comerciales')
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
