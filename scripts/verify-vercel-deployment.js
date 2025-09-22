#!/usr/bin/env node

/**
 * Script para verificar el estado del deployment en Vercel
 * Ejecutar: node scripts/verify-vercel-deployment.js
 */

import fetch from 'node-fetch';

const VERCEL_URL = 'https://ventasprueba-1sri.vercel.app';

console.log('🔍 Verificando deployment en Vercel...\n');
console.log(`🌐 URL: ${VERCEL_URL}\n`);

async function verificarDeployment() {
  try {
    // Test 1: Verificar que la aplicación responde
    console.log('📡 Probando conexión a la aplicación...');
    
    const response = await fetch(VERCEL_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Cocolu-Ventas-Verifier/1.0.0'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      console.error(`❌ Error HTTP: ${response.status} ${response.statusText}`);
      return false;
    }
    
    console.log(`✅ Aplicación responde: ${response.status} ${response.statusText}`);
    
    // Test 2: Verificar que el HTML se carga correctamente
    const html = await response.text();
    
    if (!html.includes('Cocolú Ventas') && !html.includes('Ventas')) {
      console.error('❌ El HTML no contiene el título esperado');
      return false;
    }
    
    console.log('✅ HTML cargado correctamente');
    
    // Test 3: Verificar que los assets se cargan
    const hasViteAssets = html.includes('assets/') || html.includes('vite');
    if (hasViteAssets) {
      console.log('✅ Assets de Vite detectados');
    } else {
      console.log('⚠️  No se detectaron assets de Vite (puede ser normal)');
    }
    
    // Test 4: Verificar que no hay errores de JavaScript obvios
    if (html.includes('error') && html.includes('supabase')) {
      console.error('❌ Posibles errores de Supabase detectados en el HTML');
      return false;
    }
    
    console.log('✅ No se detectaron errores obvios en el HTML');
    
    // Test 5: Verificar headers de seguridad
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.log('✅ Content-Type correcto');
    } else {
      console.log('⚠️  Content-Type inesperado:', contentType);
    }
    
    const cacheControl = response.headers.get('cache-control');
    if (cacheControl) {
      console.log(`✅ Cache-Control: ${cacheControl}`);
    }
    
    console.log('\n🎉 ¡Verificación del deployment completada!');
    console.log('✅ La aplicación está desplegada y respondiendo correctamente');
    
    // Test 6: Verificar endpoints específicos (si existen)
    console.log('\n🔍 Verificando endpoints específicos...');
    
    try {
      const apiResponse = await fetch(`${VERCEL_URL}/api/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (apiResponse.ok) {
        console.log('✅ Endpoint de salud responde');
      } else {
        console.log('⚠️  Endpoint de salud no disponible (normal para SPA)');
      }
    } catch (error) {
      console.log('⚠️  Endpoint de salud no disponible (normal para SPA)');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error al verificar deployment:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('💡 Verifica que la URL sea correcta y que el deployment esté activo');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 El servidor no está respondiendo. Verifica el estado del deployment');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('💡 Timeout de conexión. El servidor puede estar sobrecargado');
    }
    
    return false;
  }
}

// Función para verificar variables de entorno (simulado)
function verificarVariablesEntorno() {
  console.log('\n🔧 Verificando configuración de variables de entorno...');
  console.log('💡 Para verificar las variables de entorno en Vercel:');
  console.log('   1. Ve a https://vercel.com/dashboard');
  console.log('   2. Selecciona tu proyecto: ventasprueba');
  console.log('   3. Ve a Settings → Environment Variables');
  console.log('   4. Verifica que estas variables estén configuradas:');
  console.log('      - VITE_SUPABASE_URL');
  console.log('      - VITE_SUPABASE_ANON_KEY');
  console.log('      - VITE_APP_NAME');
  console.log('      - VITE_APP_VERSION');
  console.log('      - VITE_APP_ENV=production');
  console.log('      - VITE_ENABLE_MOCK_DATA=false');
}

// Función para sugerir próximos pasos
function sugerirProximosPasos() {
  console.log('\n🚀 Próximos pasos recomendados:');
  console.log('1. ✅ Verificar que las variables de entorno estén configuradas en Vercel');
  console.log('2. 🔄 Hacer redeploy si es necesario');
  console.log('3. 🧪 Probar la funcionalidad completa de la aplicación');
  console.log('4. 📊 Verificar que los datos se cargan correctamente desde Supabase');
  console.log('5. 🔐 Probar crear una venta para verificar la conexión a la BD');
  
  console.log('\n🔗 Enlaces útiles:');
  console.log(`   - Aplicación: ${VERCEL_URL}`);
  console.log('   - Dashboard Vercel: https://vercel.com/dashboard');
  console.log('   - Supabase Dashboard: https://supabase.com/dashboard');
}

// Ejecutar verificación
verificarDeployment()
  .then(success => {
    if (success) {
      verificarVariablesEntorno();
      sugerirProximosPasos();
      console.log('\n✅ ¡Tu aplicación está lista para usar!');
    } else {
      console.log('\n⚠️  Se encontraron problemas con el deployment');
      console.log('💡 Revisa los errores anteriores y corrige los problemas');
    }
  })
  .catch(error => {
    console.error('❌ Error inesperado:', error);
  });
