#!/usr/bin/env node

/**
 * Script de diagnóstico para identificar problemas en los tests
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 Ejecutando diagnóstico de tests...\n');

// Función para verificar si el servidor está corriendo
function checkServer() {
  console.log('🌐 Verificando servidor de desarrollo...');
  
  try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:5173', { encoding: 'utf8' });
    if (response.trim() === '200') {
      console.log('✅ Servidor corriendo en localhost:5173');
      return true;
    } else {
      console.log('❌ Servidor no responde correctamente');
      return false;
    }
  } catch (error) {
    console.log('❌ No se puede conectar al servidor');
    return false;
  }
}

// Función para verificar archivos de configuración
function checkConfigFiles() {
  console.log('\n📁 Verificando archivos de configuración...');
  
  const configFiles = [
    'playwright.config.js',
    'tests/config/testConfigurations.js',
    'tests/utils/improvedTestHelper.js',
    'tests/simplified-tests.spec.js'
  ];
  
  let allExist = true;
  
  configFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} existe`);
    } else {
      console.log(`❌ ${file} no existe`);
      allExist = false;
    }
  });
  
  return allExist;
}

// Función para verificar dependencias
function checkDependencies() {
  console.log('\n📦 Verificando dependencias...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['@playwright/test'];
    
    requiredDeps.forEach(dep => {
      if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
        console.log(`✅ ${dep} instalado`);
      } else if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ ${dep} instalado`);
      } else {
        console.log(`❌ ${dep} no encontrado`);
      }
    });
    
    return true;
  } catch (error) {
    console.log('❌ Error leyendo package.json');
    return false;
  }
}

// Función para ejecutar test básico
function runBasicTest() {
  console.log('\n🧪 Ejecutando test básico...');
  
  try {
    execSync('npx playwright test tests/simplified-tests.spec.js --project=chromium --reporter=line', {
      stdio: 'inherit',
      timeout: 120000 // 2 minutos
    });
    
    console.log('✅ Test básico ejecutado exitosamente');
    return true;
  } catch (error) {
    console.log('❌ Test básico falló:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🔧 DIAGNÓSTICO DE TESTS PLAYWRIGHT\n');
  
  const checks = [
    { name: 'Servidor', fn: checkServer },
    { name: 'Archivos de configuración', fn: checkConfigFiles },
    { name: 'Dependencias', fn: checkDependencies },
    { name: 'Test básico', fn: runBasicTest }
  ];
  
  const results = [];
  
  for (const check of checks) {
    try {
      const result = await check.fn();
      results.push({ name: check.name, success: result });
    } catch (error) {
      console.log(`❌ Error en ${check.name}:`, error.message);
      results.push({ name: check.name, success: false });
    }
  }
  
  // Resumen
  console.log('\n📊 RESUMEN DEL DIAGNÓSTICO:');
  console.log('========================');
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\n🎯 Resultado: ${successCount}/${totalCount} verificaciones exitosas`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 Todos los diagnósticos pasaron. Los tests deberían funcionar correctamente.');
  } else {
    console.log('\n⚠️ Algunos diagnósticos fallaron. Revisa los problemas antes de ejecutar los tests.');
  }
  
  // Recomendaciones
  console.log('\n💡 RECOMENDACIONES:');
  console.log('==================');
  
  if (!results[0].success) {
    console.log('• Inicia el servidor de desarrollo: npm run dev');
  }
  
  if (!results[1].success) {
    console.log('• Verifica que todos los archivos de configuración estén presentes');
  }
  
  if (!results[2].success) {
    console.log('• Instala las dependencias: npm install');
  }
  
  if (!results[3].success) {
    console.log('• Revisa los logs del test para identificar problemas específicos');
    console.log('• Considera ejecutar: npx playwright test --debug');
  }
}

// Ejecutar diagnóstico
main().catch(error => {
  console.error('❌ Error ejecutando diagnóstico:', error);
  process.exit(1);
});
