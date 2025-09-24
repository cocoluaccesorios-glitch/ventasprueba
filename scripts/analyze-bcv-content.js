#!/usr/bin/env node

/**
 * Script de análisis para entender qué está obteniendo del BCV
 * Guarda el HTML y analiza todo el contenido
 */

import fetch from 'node-fetch'
import https from 'https'
import fs from 'fs'

// Configurar agente HTTPS
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

/**
 * Analizar el contenido del BCV
 */
async function analizarBCV() {
  try {
    console.log('🔍 Analizando contenido del BCV...')
    
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
    
    // Guardar HTML completo para análisis
    fs.writeFileSync('bcv-analysis.html', html)
    console.log('💾 HTML guardado en: bcv-analysis.html')
    
    // Buscar todos los números que podrían ser tasas
    console.log('\n🔍 Buscando todos los números en el HTML...')
    const allNumbers = html.match(/(\d+[,.]?\d*)/g)
    
    if (allNumbers) {
      console.log(`📊 Encontrados ${allNumbers.length} números:`)
      
      // Filtrar números que podrían ser tasas (entre 100 y 300)
      const possibleRates = allNumbers
        .map(num => parseFloat(num.replace(',', '.')))
        .filter(num => num >= 100 && num <= 300)
        .sort((a, b) => a - b)
      
      console.log('\n💰 Números que podrían ser tasas (100-300):')
      possibleRates.forEach((num, index) => {
        console.log(`   ${index + 1}. ${num}`)
      })
      
      // Buscar números específicos que mencionaste
      const specificNumbers = [166.58, 200, 167.2815]
      console.log('\n🎯 Buscando números específicos:')
      specificNumbers.forEach(num => {
        const found = html.includes(num.toString())
        console.log(`   ${num}: ${found ? '✅ Encontrado' : '❌ No encontrado'}`)
      })
    }
    
    // Buscar texto relacionado con USD o dólar
    console.log('\n🔍 Buscando texto relacionado con USD/dólar...')
    const usdMatches = html.match(/USD|dólar|dolar|Dólar|Dolar/gi)
    if (usdMatches) {
      console.log(`📝 Encontradas ${usdMatches.length} menciones de USD/dólar`)
      // Mostrar contexto de algunas menciones
      const uniqueMatches = [...new Set(usdMatches)]
      uniqueMatches.forEach(match => {
        console.log(`   - ${match}`)
      })
    }
    
    // Buscar tablas específicamente
    console.log('\n🔍 Analizando tablas...')
    const tables = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi)
    if (tables) {
      console.log(`📊 Encontradas ${tables.length} tablas`)
      
      tables.forEach((table, index) => {
        console.log(`\n📋 Tabla ${index + 1}:`)
        const numbers = table.match(/(\d+[,.]?\d*)/g)
        if (numbers) {
          const rates = numbers
            .map(num => parseFloat(num.replace(',', '.')))
            .filter(num => num >= 100 && num <= 300)
          
          if (rates.length > 0) {
            console.log(`   Números encontrados: ${rates.join(', ')}`)
          } else {
            console.log(`   Sin números en rango de tasas`)
          }
        }
      })
    }
    
    // Buscar elementos con clases específicas
    console.log('\n🔍 Buscando elementos con clases específicas...')
    const classPatterns = [
      /class="[^"]*tasa[^"]*"/gi,
      /class="[^"]*cambio[^"]*"/gi,
      /class="[^"]*usd[^"]*"/gi,
      /class="[^"]*dolar[^"]*"/gi,
      /class="[^"]*precio[^"]*"/gi,
      /class="[^"]*valor[^"]*"/gi
    ]
    
    classPatterns.forEach(pattern => {
      const matches = html.match(pattern)
      if (matches) {
        console.log(`📝 Clases encontradas: ${matches.length}`)
        matches.slice(0, 5).forEach(match => {
          console.log(`   - ${match}`)
        })
      }
    })
    
    // Buscar en elementos span y div específicos
    console.log('\n🔍 Buscando en elementos span y div...')
    const spanDivPatterns = [
      /<span[^>]*>[\s\S]*?(\d+[,.]?\d*)[\s\S]*?<\/span>/gi,
      /<div[^>]*>[\s\S]*?(\d+[,.]?\d*)[\s\S]*?<\/div>/gi
    ]
    
    spanDivPatterns.forEach((pattern, index) => {
      const matches = html.match(pattern)
      if (matches) {
        console.log(`📝 Elementos ${index === 0 ? 'span' : 'div'} encontrados: ${matches.length}`)
        matches.slice(0, 10).forEach(match => {
          const numbers = match.match(/(\d+[,.]?\d*)/g)
          if (numbers) {
            const rates = numbers
              .map(num => parseFloat(num.replace(',', '.')))
              .filter(num => num >= 100 && num <= 300)
            if (rates.length > 0) {
              console.log(`   - ${match.substring(0, 100)}... (números: ${rates.join(', ')})`)
            }
          }
        })
      }
    })
    
    console.log('\n✅ Análisis completado')
    console.log('📁 Revisa el archivo bcv-analysis.html para ver el contenido completo')
    
  } catch (error) {
    console.error('❌ Error en el análisis:', error.message)
  }
}

// Ejecutar análisis
analizarBCV()
