/**
 * Script para investigar y corregir el problema de cantidades duplicadas
 * en los pedidos de la base de datos
 */

// Configuración directa de Supabase (usar las mismas credenciales del proyecto)
const SUPABASE_URL = 'https://your-project.supabase.co'; // Reemplazar con la URL real
const SUPABASE_ANON_KEY = 'your-anon-key'; // Reemplazar con la clave real

// Función para hacer consultas directas a Supabase
async function consultarSupabase(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

async function investigarProblemaCantidades() {
  console.log('🔍 Investigando problema de cantidades duplicadas...');
  
  try {
    // Obtener el pedido #69 específicamente
    const pedido = await consultarSupabase(`pedidos?id=eq.69&select=*,detalles_pedido(*)`);
    
    if (!pedido || pedido.length === 0) {
      console.error('Pedido #69 no encontrado');
      return;
    }
    
    const pedidoData = pedido[0];
    console.log('📋 Pedido #69 encontrado:');
    console.log('Subtotal en pedidos:', pedidoData.subtotal_usd);
    console.log('Total en pedidos:', pedidoData.total_usd);
    
    console.log('\n📦 Detalles del pedido:');
    pedidoData.detalles_pedido.forEach((detalle, index) => {
      console.log(`Producto ${index + 1}:`);
      console.log(`  - Nombre: ${detalle.nombre_producto}`);
      console.log(`  - Cantidad: ${detalle.cantidad}`);
      console.log(`  - Precio unitario: $${detalle.precio_unitario_usd}`);
      console.log(`  - Subtotal calculado: $${(detalle.cantidad * detalle.precio_unitario_usd).toFixed(2)}`);
    });
    
    // Calcular subtotal real
    const subtotalReal = pedidoData.detalles_pedido.reduce((sum, detalle) => {
      return sum + (detalle.cantidad * detalle.precio_unitario_usd);
    }, 0);
    
    console.log(`\n🧮 Cálculos:`);
    console.log(`Subtotal real: $${subtotalReal.toFixed(2)}`);
    console.log(`Subtotal en BD: $${pedidoData.subtotal_usd}`);
    console.log(`Diferencia: $${(subtotalReal - pedidoData.subtotal_usd).toFixed(2)}`);
    
    // Verificar si hay duplicación
    if (Math.abs(subtotalReal - pedidoData.subtotal_usd * 2) < 0.01) {
      console.log('⚠️ PROBLEMA DETECTADO: El subtotal está dividido por 2');
      
      // Corregir el subtotal
      const nuevoSubtotal = subtotalReal;
      const nuevoTotal = pedidoData.total_usd + (nuevoSubtotal - pedidoData.subtotal_usd);
      
      console.log(`\n🔧 Corrigiendo pedido #69:`);
      console.log(`Nuevo subtotal: $${nuevoSubtotal.toFixed(2)}`);
      console.log(`Nuevo total: $${nuevoTotal.toFixed(2)}`);
      
      await consultarSupabase(`pedidos?id=eq.69`, {
        method: 'PATCH',
        body: JSON.stringify({
          subtotal_usd: nuevoSubtotal,
          total_usd: nuevoTotal
        })
      });
      
      console.log('✅ Pedido #69 corregido exitosamente');
    }
    
  } catch (error) {
    console.error('Error en la investigación:', error);
  }
}

async function verificarTodosLosPedidos() {
  console.log('\n🔍 Verificando todos los pedidos recientes...');
  
  try {
    const pedidos = await consultarSupabase(`pedidos?select=id,subtotal_usd,total_usd,detalles_pedido(cantidad,precio_unitario_usd)&order=id.desc&limit=10`);
    
    console.log('\n📊 Análisis de pedidos recientes:');
    
    for (const pedido of pedidos) {
      const subtotalReal = pedido.detalles_pedido.reduce((sum, detalle) => {
        return sum + (detalle.cantidad * detalle.precio_unitario_usd);
      }, 0);
      
      const diferencia = Math.abs(subtotalReal - pedido.subtotal_usd);
      const esDuplicado = Math.abs(subtotalReal - pedido.subtotal_usd * 2) < 0.01;
      
      console.log(`\nPedido #${pedido.id}:`);
      console.log(`  Subtotal real: $${subtotalReal.toFixed(2)}`);
      console.log(`  Subtotal BD: $${pedido.subtotal_usd}`);
      console.log(`  Diferencia: $${diferencia.toFixed(2)}`);
      console.log(`  ¿Duplicado?: ${esDuplicado ? 'SÍ' : 'NO'}`);
      
      if (esDuplicado) {
        console.log(`  ⚠️ NECESITA CORRECCIÓN`);
      }
    }
    
  } catch (error) {
    console.error('Error en verificación:', error);
  }
}

// Función para mostrar instrucciones
function mostrarInstrucciones() {
  console.log('📋 INSTRUCCIONES PARA USAR ESTE SCRIPT:');
  console.log('');
  console.log('1. Obtén las credenciales de Supabase:');
  console.log('   - Ve a tu proyecto en Supabase');
  console.log('   - Settings > API');
  console.log('   - Copia la URL y la anon key');
  console.log('');
  console.log('2. Reemplaza las variables en este script:');
  console.log('   - SUPABASE_URL: tu URL de Supabase');
  console.log('   - SUPABASE_ANON_KEY: tu clave anónima');
  console.log('');
  console.log('3. Ejecuta el script:');
  console.log('   node scripts/investigar-cantidades-duplicadas.js');
  console.log('');
  console.log('4. El script te mostrará:');
  console.log('   - Análisis del pedido #69');
  console.log('   - Verificación de los últimos 10 pedidos');
  console.log('   - Detección automática de cantidades duplicadas');
  console.log('');
}

// Ejecutar las funciones
async function main() {
  console.log('🚀 Script de investigación de cantidades duplicadas\n');
  
  // Verificar si las credenciales están configuradas
  if (SUPABASE_URL === 'https://your-project.supabase.co' || SUPABASE_ANON_KEY === 'your-anon-key') {
    mostrarInstrucciones();
    return;
  }
  
  await investigarProblemaCantidades();
  await verificarTodosLosPedidos();
  
  console.log('\n✅ Investigación completada');
  console.log('Si se detectaron problemas, puedes corregirlos manualmente en la base de datos');
}

main().catch(console.error);