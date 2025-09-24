#!/usr/bin/env node

/**
 * Script para ejecutar solo los tests simplificados
 * Este script ejecuta los tests optimizados que deberían funcionar mejor
 */

import { execSync } from 'child_process';
import path from 'path';

console.log('🚀 Ejecutando tests simplificados...\n');

try {
  // Ejecutar solo los tests simplificados
  const command = 'npx playwright test tests/simplified-tests.spec.js --reporter=html';
  
  console.log(`Ejecutando: ${command}\n`);
  
  execSync(command, {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ Tests simplificados completados exitosamente');
  
} catch (error) {
  console.error('\n❌ Error ejecutando tests simplificados:', error.message);
  process.exit(1);
}
