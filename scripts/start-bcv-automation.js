#!/usr/bin/env node

/**
 * Script para iniciar la automatización del BCV
 * Se puede ejecutar como servicio o con PM2
 */

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🚀 Iniciando automatización BCV...')
console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)

// Ejecutar el script de actualización automática
const bcvProcess = spawn('node', [join(__dirname, 'update-bcv-rate.js'), 'continuous'], {
  stdio: 'inherit',
  cwd: process.cwd()
})

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n👋 Deteniendo automatización BCV...')
  bcvProcess.kill('SIGINT')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n👋 Deteniendo automatización BCV...')
  bcvProcess.kill('SIGTERM')
  process.exit(0)
})

// Manejar errores
bcvProcess.on('error', (error) => {
  console.error('❌ Error en el proceso BCV:', error)
  process.exit(1)
})

bcvProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Proceso BCV terminó con código: ${code}`)
    process.exit(code)
  }
  console.log('✅ Proceso BCV terminado correctamente')
})
