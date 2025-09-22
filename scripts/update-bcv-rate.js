#!/usr/bin/env node

/**
 * Script para actualizar automáticamente la tasa del BCV
 * Se puede ejecutar manualmente o programar con cron
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import cron from 'node-cron'

const execAsync = promisify(exec)

/**
 * Ejecuta el script de actualización de tasa
 */
async function actualizarTasa() {
  try {
    console.log('🔄 Ejecutando actualización de tasa BCV...')
    
    const { stdout, stderr } = await execAsync('node scripts/bcv-simple.js')
    
    if (stdout) {
      console.log(stdout)
    }
    
    if (stderr) {
      console.error('⚠️  Advertencias:', stderr)
    }
    
    console.log('✅ Actualización completada')
    
  } catch (error) {
    console.error('❌ Error al ejecutar actualización:', error.message)
  }
}

/**
 * Configurar actualización automática
 */
function configurarAutomatizacion() {
  console.log('⏰ Configurando actualización automática...')
  
  // Actualizar diariamente a las 8:00 AM (una vez al día)
  cron.schedule('0 8 * * *', () => {
    console.log('\n🌅 Actualización diaria (8:00 AM)')
    actualizarTasa()
  })
  
  // Actualizar diariamente a las 2:00 PM (como respaldo)
  cron.schedule('0 14 * * *', () => {
    console.log('\n☀️  Actualización de respaldo (2:00 PM)')
    actualizarTasa()
  })
  
  console.log('✅ Automatización configurada:')
  console.log('   - Diariamente a las 8:00 AM (principal)')
  console.log('   - Diariamente a las 2:00 PM (respaldo)')
  console.log('   - Solo actualiza si no existe tasa para el día')
  console.log('\n⏳ Presiona Ctrl+C para detener...')
}

// Verificar argumentos
const args = process.argv.slice(2)
const modo = args[0] || 'once'

if (modo === 'continuous' || modo === 'cont') {
  // Ejecutar una vez al inicio
  actualizarTasa()
  
  // Configurar automatización
  configurarAutomatizacion()
  
  // Mantener el proceso corriendo
  process.on('SIGINT', () => {
    console.log('\n👋 Deteniendo actualizador automático...')
    process.exit(0)
  })
} else {
  // Ejecutar una sola vez
  actualizarTasa()
}
