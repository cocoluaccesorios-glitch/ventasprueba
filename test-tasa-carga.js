#!/usr/bin/env node

/**
 * Script para probar la carga de tasa BCV
 */

import { getTasaCambio } from './src/services/apiService.js'

async function testTasaCarga() {
  console.log('🧪 Probando carga de tasa BCV...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  
  try {
    console.log('\n📊 Test 1: Obtener tasa con getTasaCambio()')
    const tasa = await getTasaCambio()
    console.log(`✅ Tasa obtenida: ${tasa} Bs/USD`)
    console.log(`🔍 Tipo de dato: ${typeof tasa}`)
    console.log(`🔍 Es 160?: ${tasa === 160}`)
    console.log(`🔍 Es 166.58?: ${tasa === 166.58}`)
    
    if (tasa === 160) {
      console.log('❌ PROBLEMA: La tasa es 160, debería ser 166.58 o la actual del BCV')
    } else if (tasa === 166.58) {
      console.log('⚠️  ADVERTENCIA: Usando tasa por defecto 166.58')
    } else {
      console.log('✅ Tasa obtenida correctamente del BCV')
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
  }
}

// Ejecutar prueba
testTasaCarga()
