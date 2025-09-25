/**
 * Script para corregir cantidades duplicadas
 * Ejecutar en la consola del navegador en la página de la aplicación
 */

// Función para corregir el pedido #69
async function corregirPedido69() {
  console.log('🔧 Corrigiendo pedido #69...');
  
  try {
    // Obtener el pedido actual
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select('*, detalles_pedido(*)')
      .eq('id', 69)
      .single();
    
    if (pedidoError) {
      console.error('Error al obtener pedido:', pedidoError);
      return;
    }
    
    console.log('📋 Pedido #69 encontrado');
    console.log('Subtotal actual:', pedido.subtotal_usd);
    
    // Calcular el subtotal correcto
    const subtotalCorrecto = pedido.detalles_pedido.reduce((sum, detalle) => {
      return sum + (detalle.cantidad * detalle.precio_unitario_usd);
    }, 0);
    
    console.log('Subtotal correcto:', subtotalCorrecto);
    
    // Mostrar detalles
    pedido.detalles_pedido.forEach((detalle, index) => {
      const subtotalItem = detalle.cantidad * detalle.precio_unitario_usd;
      console.log(`${index + 1}. ${detalle.nombre_producto}: ${detalle.cantidad} × $${detalle.precio_unitario_usd} = $${subtotalItem.toFixed(2)}`);
    });
    
    // Corregir el subtotal
    const { error: updateError } = await supabase
      .from('pedidos')
      .update({ 
        subtotal_usd: subtotalCorrecto,
        total_usd: pedido.total_usd + (subtotalCorrecto - pedido.subtotal_usd)
      })
      .eq('id', 69);
    
    if (updateError) {
      console.error('Error al actualizar pedido:', updateError);
    } else {
      console.log('✅ Pedido #69 corregido exitosamente');
      console.log('Nuevo subtotal:', subtotalCorrecto);
    }
    
  } catch (error) {
    console.error('Error en la corrección:', error);
  }
}

// Función para verificar todos los pedidos recientes
async function verificarTodosLosPedidos() {
  console.log('🔍 Verificando todos los pedidos recientes...');
  
  try {
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('id, subtotal_usd, total_usd, detalles_pedido(cantidad, precio_unitario_usd)')
      .order('id', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error al obtener pedidos:', error);
      return;
    }
    
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
      console.log(`  ¿Duplicado?: ${esDuplicado ? 'SÍ ⚠️' : 'NO ✅'}`);
    }
    
  } catch (error) {
    console.error('Error en verificación:', error);
  }
}

// Función para corregir todos los pedidos con problemas
async function corregirTodosLosPedidosDuplicados() {
  console.log('🔧 Corrigiendo todos los pedidos con cantidades duplicadas...');
  
  try {
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('id, subtotal_usd, total_usd, detalles_pedido(cantidad, precio_unitario_usd)')
      .order('id', { ascending: false });
    
    if (error) {
      console.error('Error al obtener pedidos:', error);
      return;
    }
    
    let pedidosCorregidos = 0;
    
    for (const pedido of pedidos) {
      const subtotalReal = pedido.detalles_pedido.reduce((sum, detalle) => {
        return sum + (detalle.cantidad * detalle.precio_unitario_usd);
      }, 0);
      
      const esDuplicado = Math.abs(subtotalReal - pedido.subtotal_usd * 2) < 0.01;
      
      if (esDuplicado) {
        const nuevoSubtotal = subtotalReal;
        const nuevoTotal = pedido.total_usd + (nuevoSubtotal - pedido.subtotal_usd);
        
        const { error: updateError } = await supabase
          .from('pedidos')
          .update({
            subtotal_usd: nuevoSubtotal,
            total_usd: nuevoTotal
          })
          .eq('id', pedido.id);
        
        if (updateError) {
          console.error(`Error al corregir pedido #${pedido.id}:`, updateError);
        } else {
          console.log(`✅ Pedido #${pedido.id} corregido`);
          pedidosCorregidos++;
        }
      }
    }
    
    console.log(`\n🎉 Corrección completada: ${pedidosCorregidos} pedidos corregidos`);
    
  } catch (error) {
    console.error('Error en corrección masiva:', error);
  }
}

// Función principal
async function main() {
  console.log('🚀 Script de Corrección de Cantidades Duplicadas');
  console.log('='.repeat(50));
  
  // Primero corregir el pedido #69 específicamente
  await corregirPedido69();
  
  // Luego verificar todos los pedidos
  await verificarTodosLosPedidos();
  
  console.log('\n📋 INSTRUCCIONES:');
  console.log('1. ✅ Pedido #69 corregido');
  console.log('2. 🔍 Revisa los resultados de la verificación');
  console.log('3. 🔧 Si hay más pedidos con problemas, ejecuta:');
  console.log('   corregirTodosLosPedidosDuplicados()');
  console.log('');
  console.log('🎯 PRÓXIMOS PASOS:');
  console.log('1. Recarga la página para ver los cambios');
  console.log('2. Verifica que el pedido #69 muestre el subtotal correcto');
  console.log('3. Revisa otros pedidos si es necesario');
  console.log('4. Prueba crear un nuevo pedido para confirmar que funciona');
}

// Ejecutar automáticamente
main();

// Exportar funciones para uso manual
window.corregirPedido69 = corregirPedido69;
window.verificarTodosLosPedidos = verificarTodosLosPedidos;
window.corregirTodosLosPedidosDuplicados = corregirTodosLosPedidosDuplicados;
