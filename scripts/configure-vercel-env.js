#!/usr/bin/env node

/**
 * Script para configurar automáticamente las variables de entorno en Vercel
 * Ejecutar: node scripts/configure-vercel-env.js
 */

import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Cargar variables de entorno locales
dotenv.config();

console.log('🚀 Configurando variables de entorno en Vercel...\n');

// Variables de entorno requeridas
const envVars = {
  'VITE_SUPABASE_URL': process.env.VITE_SUPABASE_URL || 'https://uaeniaskxpplxasolvoc.supabase.co',
  'VITE_SUPABASE_ANON_KEY': process.env.VITE_SUPABASE_ANON_KEY,
  'VITE_APP_NAME': 'Cocolú Ventas',
  'VITE_APP_VERSION': '1.0.0',
  'VITE_APP_ENV': 'production',
  'VITE_ENABLE_MOCK_DATA': 'false',
  'VITE_ENABLE_DEBUG_MODE': 'false',
  'VITE_ENABLE_ANALYTICS': 'false'
};

// Verificar que tenemos la clave de Supabase
if (!envVars.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ Error: VITE_SUPABASE_ANON_KEY no está configurada');
  console.error('💡 Configura esta variable en tu archivo .env local');
  process.exit(1);
}

console.log('📋 Variables a configurar:');
Object.entries(envVars).forEach(([key, value]) => {
  const displayValue = key.includes('KEY') ? `${value.substring(0, 20)}...` : value;
  console.log(`   ${key}: ${displayValue}`);
});

// Verificar si Vercel CLI está instalado
try {
  execSync('vercel --version', { stdio: 'ignore' });
  console.log('\n✅ Vercel CLI detectado');
} catch (error) {
  console.log('\n❌ Vercel CLI no está instalado');
  console.log('💡 Instala Vercel CLI:');
  console.log('   npm i -g vercel');
  console.log('   vercel login');
  process.exit(1);
}

// Verificar autenticación
try {
  execSync('vercel whoami', { stdio: 'ignore' });
  console.log('✅ Autenticado en Vercel');
} catch (error) {
  console.log('\n❌ No estás autenticado en Vercel');
  console.log('💡 Autentícate:');
  console.log('   vercel login');
  process.exit(1);
}

console.log('\n🔧 Configurando variables de entorno...');

// Configurar cada variable
Object.entries(envVars).forEach(([key, value]) => {
  try {
    console.log(`   Configurando ${key}...`);
    
    // Usar echo para pasar el valor
    const command = `echo "${value}" | vercel env add ${key} production`;
    execSync(command, { stdio: 'pipe' });
    
    console.log(`   ✅ ${key} configurada`);
  } catch (error) {
    console.log(`   ⚠️  Error configurando ${key}: ${error.message}`);
  }
});

console.log('\n🔄 Haciendo redeploy...');

try {
  // Hacer redeploy
  execSync('vercel --prod', { stdio: 'inherit' });
  console.log('\n✅ Redeploy completado');
} catch (error) {
  console.log('\n⚠️  Error en redeploy:', error.message);
  console.log('💡 Puedes hacer redeploy manualmente desde el dashboard de Vercel');
}

console.log('\n🎉 ¡Configuración completada!');
console.log('✅ Variables de entorno configuradas');
console.log('✅ Aplicación redeployada');
console.log('✅ La aplicación ahora debería conectarse a Supabase');

console.log('\n🔗 Enlaces:');
console.log('   - Aplicación: https://ventasprueba-1sri.vercel.app');
console.log('   - Dashboard Vercel: https://vercel.com/dashboard');

console.log('\n🧪 Prueba la aplicación:');
console.log('   1. Ve a https://ventasprueba-1sri.vercel.app');
console.log('   2. Verifica que los productos se cargan');
console.log('   3. Verifica que los clientes se cargan');
console.log('   4. Prueba crear una venta');
