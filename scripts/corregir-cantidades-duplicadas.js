/**
 * Script para corregir el problema de cantidades duplicadas
 * Basado en el análisis del pedido #69 que muestra:
 * - Producto de Prueba 1: 4 × $25.99 = $103.96
 * - lo que sea: 6 × $12.00 = $72.00
 * - Total real: $175.96
 * - Pero muestra: $87.98 (exactamente la mitad)
 */

// Función para corregir un pedido específico
function corregirPedido(pedidoId, detallesCorrectos) {
  console.log(`🔧 Corrigiendo pedido #${pedidoId}...`);
  
  // Calcular el subtotal correcto
  const subtotalCorrecto = detallesCorrectos.reduce((sum, detalle) => {
    return sum + (detalle.cantidad * detalle.precio_unitario);
  }, 0);
  
  console.log(`Subtotal correcto: $${subtotalCorrecto.toFixed(2)}`);
  
  // Mostrar los cálculos
  detallesCorrectos.forEach((detalle, index) => {
    const subtotalItem = detalle.cantidad * detalle.precio_unitario;
    console.log(`  ${detalle.nombre}: ${detalle.cantidad} × $${detalle.precio_unitario} = $${subtotalItem.toFixed(2)}`);
  });
  
  return {
    pedido_id: pedidoId,
    subtotal_correcto: subtotalCorrecto,
    detalles: detallesCorrectos
  };
}

// Función para generar el SQL de corrección
function generarSQLCorreccion(correcciones) {
  console.log('\n📝 SQL para corregir los pedidos:');
  console.log('');
  
  correcciones.forEach(correccion => {
    console.log(`-- Corregir pedido #${correccion.pedido_id}`);
    console.log(`UPDATE pedidos SET subtotal_usd = ${correccion.subtotal_correcto} WHERE id = ${correccion.pedido_id};`);
    console.log('');
  });
}

// Función para generar el script de corrección en JavaScript
function generarScriptCorreccion(correcciones) {
  console.log('\n🔧 Script de corrección en JavaScript:');
  console.log('');
  console.log('// Script para corregir cantidades duplicadas');
  console.log('async function corregirCantidadesDuplicadas() {');
  console.log('  const correcciones = [');
  
  correcciones.forEach((correccion, index) => {
    console.log(`    {`);
    console.log(`      id: ${correccion.pedido_id},`);
    console.log(`      subtotal_correcto: ${correccion.subtotal_correcto}`);
    console.log(`    }${index < correcciones.length - 1 ? ',' : ''}`);
  });
  
  console.log('  ];');
  console.log('');
  console.log('  for (const correccion of correcciones) {');
  console.log('    const { error } = await supabase');
  console.log('      .from("pedidos")');
  console.log('      .update({ subtotal_usd: correccion.subtotal_correcto })');
  console.log('      .eq("id", correccion.pedido_id);');
  console.log('');
  console.log('    if (error) {');
  console.log('      console.error(`Error al corregir pedido #${correccion.id}:`, error);');
  console.log('    } else {');
  console.log('      console.log(`✅ Pedido #${correccion.id} corregido`);');
  console.log('    }');
  console.log('  }');
  console.log('}');
  console.log('');
}

// Análisis del pedido #69 basado en la imagen
function analizarPedido69() {
  console.log('🔍 Análisis del Pedido #69 (basado en la imagen):');
  console.log('');
  
  const detallesPedido69 = [
    {
      nombre: 'Producto de Prueba 1',
      cantidad: 4,
      precio_unitario: 25.99
    },
    {
      nombre: 'lo que sea',
      cantidad: 6,
      precio_unitario: 12.00
    }
  ];
  
  console.log('Detalles del pedido:');
  detallesPedido69.forEach((detalle, index) => {
    const subtotal = detalle.cantidad * detalle.precio_unitario;
    console.log(`  ${index + 1}. ${detalle.nombre}: ${detalle.cantidad} × $${detalle.precio_unitario} = $${subtotal.toFixed(2)}`);
  });
  
  const subtotalReal = detallesPedido69.reduce((sum, detalle) => {
    return sum + (detalle.cantidad * detalle.precio_unitario);
  }, 0);
  
  console.log(`\nSubtotal real: $${subtotalReal.toFixed(2)}`);
  console.log(`Subtotal mostrado: $87.98`);
  console.log(`Diferencia: $${(subtotalReal - 87.98).toFixed(2)}`);
  console.log(`¿Es exactamente la mitad?: ${Math.abs(subtotalReal - 87.98 * 2) < 0.01 ? 'SÍ' : 'NO'}`);
  
  return {
    pedido_id: 69,
    subtotal_real: subtotalReal,
    subtotal_mostrado: 87.98,
    es_duplicado: Math.abs(subtotalReal - 87.98 * 2) < 0.01
  };
}

// Función principal
function main() {
  console.log('🚀 Análisis y Corrección de Cantidades Duplicadas');
  console.log('='.repeat(50));
  
  // Analizar el pedido #69
  const analisis69 = analizarPedido69();
  
  if (analisis69.es_duplicado) {
    console.log('\n⚠️ PROBLEMA CONFIRMADO: El subtotal está dividido por 2');
    
    // Crear corrección
    const correccion69 = corregirPedido(69, [
      { nombre: 'Producto de Prueba 1', cantidad: 4, precio_unitario: 25.99 },
      { nombre: 'lo que sea', cantidad: 6, precio_unitario: 12.00 }
    ]);
    
    // Generar scripts de corrección
    generarSQLCorreccion([correccion69]);
    generarScriptCorreccion([correccion69]);
    
    console.log('\n📋 INSTRUCCIONES:');
    console.log('1. Ejecuta el SQL en tu base de datos de Supabase');
    console.log('2. O usa el script JavaScript en la consola del navegador');
    console.log('3. Verifica que el pedido #69 muestre el subtotal correcto');
    console.log('');
    console.log('🔍 Para verificar otros pedidos:');
    console.log('- Revisa si tienen el mismo problema de división por 2');
    console.log('- Aplica la misma corrección si es necesario');
    
  } else {
    console.log('\n✅ No se detectó problema de duplicación en el pedido #69');
  }
  
  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('1. Corregir el pedido #69 con el SQL proporcionado');
  console.log('2. Revisar otros pedidos recientes para el mismo problema');
  console.log('3. Verificar que el formulario de ventas no esté duplicando cantidades');
  console.log('4. Probar crear un nuevo pedido para confirmar que funciona correctamente');
}

// Ejecutar el análisis
main();
