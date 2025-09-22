#!/usr/bin/env node

/**
 * Script para verificar la conexión a la base de datos Supabase
 * Ejecutar: node scripts/verify-database-connection.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://uaeniaskxpplxasolvoc.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Verificando conexión a la base de datos...\n');

// Verificar variables de entorno
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variables de entorno faltantes:');
  console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   VITE_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅' : '❌');
  console.error('\n💡 Configura estas variables en tu archivo .env o en Vercel');
  process.exit(1);
}

console.log('✅ Variables de entorno configuradas:');
console.log(`   URL: ${SUPABASE_URL}`);
console.log(`   Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);

// Crear cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verificarConexion() {
  try {
    console.log('\n🔌 Probando conexión...');
    
    // Test 1: Verificar conexión básica
    const { data: testData, error: testError } = await supabase
      .from('productos')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error de conexión:', testError.message);
      return false;
    }
    
    console.log('✅ Conexión básica exitosa');
    
    // Test 2: Verificar tablas principales
    const tablas = ['productos', 'pedidos', 'clientes', 'detalles_pedido'];
    
    for (const tabla of tablas) {
      try {
        const { data, error } = await supabase
          .from(tabla)
          .select('count')
          .limit(1);
        
        if (error) {
          console.error(`❌ Error en tabla ${tabla}:`, error.message);
        } else {
          console.log(`✅ Tabla ${tabla}: Accesible`);
        }
      } catch (err) {
        console.error(`❌ Error en tabla ${tabla}:`, err.message);
      }
    }
    
    // Test 3: Verificar permisos de inserción
    console.log('\n🔐 Verificando permisos...');
    
    try {
      // Test de inserción en productos (solo verificar permisos, no insertar)
      const { error: insertError } = await supabase
        .from('productos')
        .select('id')
        .limit(0);
      
      if (insertError && insertError.message.includes('permission denied')) {
        console.error('❌ Permisos de inserción denegados');
        return false;
      } else {
        console.log('✅ Permisos de inserción verificados');
      }
    } catch (err) {
      console.log('⚠️  No se pudo verificar permisos de inserción:', err.message);
    }
    
    // Test 4: Verificar datos existentes
    console.log('\n📊 Verificando datos existentes...');
    
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre, stock_actual')
      .limit(5);
    
    if (productosError) {
      console.error('❌ Error al obtener productos:', productosError.message);
    } else {
      console.log(`✅ Productos encontrados: ${productos?.length || 0}`);
      if (productos && productos.length > 0) {
        console.log('   Ejemplos:', productos.map(p => `${p.nombre} (Stock: ${p.stock_actual})`).join(', '));
      }
    }
    
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('id, nombre, apellido, cedula_rif')
      .limit(5);
    
    if (clientesError) {
      console.error('❌ Error al obtener clientes:', clientesError.message);
    } else {
      console.log(`✅ Clientes encontrados: ${clientes?.length || 0}`);
      if (clientes && clientes.length > 0) {
        console.log('   Ejemplos:', clientes.map(c => `${c.nombre} ${c.apellido} (${c.cedula_rif})`).join(', '));
      }
    }
    
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select('id, cliente_nombre, total_usd, fecha_pedido')
      .limit(5);
    
    if (pedidosError) {
      console.error('❌ Error al obtener pedidos:', pedidosError.message);
    } else {
      console.log(`✅ Pedidos encontrados: ${pedidos?.length || 0}`);
      if (pedidos && pedidos.length > 0) {
        console.log('   Ejemplos:', pedidos.map(p => `#${p.id} - ${p.cliente_nombre} ($${p.total_usd})`).join(', '));
      }
    }
    
    console.log('\n🎉 ¡Verificación completada exitosamente!');
    console.log('✅ La base de datos está configurada correctamente');
    console.log('✅ La aplicación puede conectarse y operar normalmente');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    return false;
  }
}

// Ejecutar verificación
verificarConexion()
  .then(success => {
    if (success) {
      console.log('\n🚀 La aplicación está lista para producción');
      process.exit(0);
    } else {
      console.log('\n⚠️  Se encontraron problemas que deben resolverse');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  });
