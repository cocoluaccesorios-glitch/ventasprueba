#!/usr/bin/env node

/**
 * Script para configurar variables de entorno en Vercel
 * Ejecutar: node scripts/setup-vercel-env.js
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

console.log('📋 Variables a configurar en Vercel:');
Object.entries(envVars).forEach(([key, value]) => {
  const displayValue = key.includes('KEY') ? `${value.substring(0, 20)}...` : value;
  console.log(`   ${key}: ${displayValue}`);
});

console.log('\n🔧 Comandos para configurar en Vercel:');
console.log('(Ejecuta estos comandos en tu terminal o usa el dashboard de Vercel)\n');

Object.entries(envVars).forEach(([key, value]) => {
  console.log(`vercel env add ${key} production`);
  console.log(`# Valor: ${value}\n`);
});

console.log('📝 Alternativamente, puedes usar el dashboard de Vercel:');
console.log('1. Ve a https://vercel.com/dashboard');
console.log('2. Selecciona tu proyecto: ventasprueba');
console.log('3. Ve a Settings → Environment Variables');
console.log('4. Agrega cada variable con su valor correspondiente');
console.log('5. Asegúrate de que estén marcadas para "Production"');

console.log('\n🔄 Después de configurar las variables:');
console.log('1. Ve a Deployments en tu proyecto de Vercel');
console.log('2. Haz clic en "Redeploy" en el último deployment');
console.log('3. O haz un nuevo push para triggerar un nuevo deployment');

console.log('\n✅ Una vez configurado, tu aplicación estará completamente conectada a Supabase');

// Función para verificar si Vercel CLI está instalado
try {
  execSync('vercel --version', { stdio: 'ignore' });
  console.log('\n🔧 Vercel CLI detectado. Puedes ejecutar los comandos automáticamente.');
  
  console.log('\n¿Quieres que configure las variables automáticamente? (y/n)');
  // En un entorno interactivo, podrías usar readline aquí
  console.log('💡 Para configurar automáticamente, ejecuta:');
  console.log('   node scripts/setup-vercel-env-auto.js');
  
} catch (error) {
  console.log('\n💡 Para instalar Vercel CLI:');
  console.log('   npm i -g vercel');
  console.log('   vercel login');
}
