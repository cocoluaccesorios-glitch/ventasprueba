#!/usr/bin/env node

/**
 * Script de prueba para verificar la integración del sistema BCV
 */

import { getTasaBCV, actualizarTasaBCV, convertirUSDaVES, convertirVESaUSD } from './src/services/bcvService.js'

async function testBCVIntegration() {
  console.log('🧪 Probando integración del sistema BCV...')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  
  try {
    // Test 1: Obtener tasa BCV
    console.log('\n📊 Test 1: Obtener tasa BCV')
    const tasa = await getTasaBCV()
    console.log(`✅ Tasa obtenida: ${tasa} Bs/USD`)
    
    // Test 2: Actualizar tasa BCV
    console.log('\n🔄 Test 2: Actualizar tasa BCV')
    const nuevaTasa = await actualizarTasaBCV()
    console.log(`✅ Nueva tasa: ${nuevaTasa} Bs/USD`)
    
    // Test 3: Conversión USD a VES
    console.log('\n💱 Test 3: Conversión USD a VES')
    const usdAmount = 100
    const vesAmount = await convertirUSDaVES(usdAmount)
    console.log(`✅ $${usdAmount} USD = Bs. ${vesAmount.toFixed(2)} VES`)
    
    // Test 4: Conversión VES a USD
    console.log('\n💱 Test 4: Conversión VES a USD')
    const vesAmount2 = 16658.34
    const usdAmount2 = await convertirVESaUSD(vesAmount2)
    console.log(`✅ Bs. ${vesAmount2} VES = $${usdAmount2.toFixed(2)} USD`)
    
    console.log('\n🎉 ¡Todos los tests pasaron exitosamente!')
    console.log('\n📋 Resumen:')
    console.log(`   - Tasa BCV actual: ${tasa} Bs/USD`)
    console.log(`   - Conversión USD→VES: $100 = Bs. ${vesAmount.toFixed(2)}`)
    console.log(`   - Conversión VES→USD: Bs. ${vesAmount2} = $${usdAmount2.toFixed(2)}`)
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
    console.log('\n🔧 Posibles soluciones:')
    console.log('   1. Verifica que la tabla tasa_cambio existe en Supabase')
    console.log('   2. Ejecuta el SQL de creación manualmente')
    console.log('   3. Verifica las credenciales de Supabase en .env')
  }
}

// Ejecutar prueba
testBCVIntegration()
