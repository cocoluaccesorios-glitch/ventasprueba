/**
 * Script para corregir la función procesar_venta_mixta en Supabase
 * Este script corrige el error que causa la duplicación de cantidades
 */

// Función para aplicar la corrección en Supabase
async function corregirFuncionProcesarVentaMixta() {
  console.log('🔧 Corrigiendo función procesar_venta_mixta en Supabase...');
  
  try {
    // Leer el archivo SQL de corrección
    const fs = require('fs');
    const path = require('path');
    
    const sqlPath = path.join(__dirname, 'corregir-funcion-procesar-venta-mixta.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📝 SQL de corrección cargado');
    console.log('🔍 Contenido:', sqlContent.substring(0, 200) + '...');
    
    // Ejecutar el SQL en Supabase
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: sqlContent 
    });
    
    if (error) {
      console.error('❌ Error al ejecutar SQL:', error);
      return false;
    }
    
    console.log('✅ Función procesar_venta_mixta corregida exitosamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error en la corrección:', error);
    return false;
  }
}

// Función alternativa usando SQL directo
async function corregirFuncionDirecta() {
  console.log('🔧 Aplicando corrección directa...');
  
  const sqlCorreccion = `
    CREATE OR REPLACE FUNCTION procesar_venta_mixta(venta_data JSONB)
    RETURNS INTEGER AS $$
    DECLARE
        nuevo_pedido_id INTEGER;
        total_abono_usd numeric;
        total_abono_ves numeric;
    BEGIN
        -- Calcular total del abono mixto
        total_abono_usd := (venta_data->>'monto_mixto_usd')::numeric;
        total_abono_ves := (venta_data->>'monto_mixto_ves')::numeric;
        
        -- Insertar el pedido principal
        INSERT INTO pedidos (
            cliente_cedula, cliente_nombre, cliente_apellido, cliente_telefono, cliente_email, cliente_direccion,
            subtotal_usd, monto_descuento_usd, monto_iva_usd, monto_delivery_usd, total_usd, aplica_iva,
            metodo_pago, referencia_pago, tasa_bcv, estado_entrega, comentarios_generales, comentarios_descuento, fecha_pedido,
            es_abono, tipo_pago_abono, metodo_pago_abono, monto_abono_simple, monto_abono_usd, monto_abono_ves, total_abono_usd, fecha_vencimiento,
            es_pago_mixto, monto_mixto_usd, monto_mixto_ves, metodo_pago_mixto_usd, metodo_pago_mixto_ves, referencia_mixto_usd, referencia_mixto_ves
        ) VALUES (
            (venta_data->>'cliente_cedula')::VARCHAR, (venta_data->>'cliente_nombre')::VARCHAR, (venta_data->>'cliente_apellido')::VARCHAR,
            (venta_data->>'cliente_telefono')::VARCHAR, (venta_data->>'cliente_email')::VARCHAR, (venta_data->>'cliente_direccion')::VARCHAR,
            (venta_data->>'subtotal_usd')::numeric, (venta_data->>'monto_descuento_usd')::numeric, (venta_data->>'monto_iva_usd')::numeric,
            (venta_data->>'monto_delivery_usd')::numeric, (venta_data->>'total_usd')::numeric, (venta_data->>'aplica_iva')::boolean,
            (venta_data->>'metodo_pago')::VARCHAR, (venta_data->>'referencia_pago')::VARCHAR, (venta_data->>'tasa_bcv')::numeric,
            (venta_data->>'estado_entrega')::VARCHAR, (venta_data->>'comentarios_generales')::TEXT, (venta_data->>'comentarios_descuento')::TEXT, NOW(),
            (venta_data->>'es_abono')::boolean, (venta_data->>'tipo_pago_abono')::VARCHAR, (venta_data->>'metodo_pago_abono')::VARCHAR,
            (venta_data->>'monto_abono_simple')::numeric, total_abono_usd, total_abono_ves,
            total_abono_usd + (total_abono_ves / (venta_data->>'tasa_bcv')::numeric), (venta_data->>'fecha_vencimiento')::DATE,
            (venta_data->>'es_pago_mixto')::boolean, 
            (venta_data->>'monto_mixto_usd')::numeric,        -- ✅ CORREGIDO
            (venta_data->>'monto_mixto_ves')::numeric,        -- ✅ CORREGIDO
            (venta_data->>'metodo_pago_mixto_usd')::VARCHAR, (venta_data->>'metodo_pago_mixto_ves')::VARCHAR,
            (venta_data->>'referencia_mixto_usd')::VARCHAR, (venta_data->>'referencia_mixto_ves')::VARCHAR
        ) RETURNING id INTO nuevo_pedido_id;
        
        -- Insertar detalles del pedido
        IF venta_data->'productos' IS NOT NULL THEN
            INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario_usd, nombre_producto, sku_producto, es_manual)
            SELECT nuevo_pedido_id, (producto->>'id')::INTEGER, (producto->>'cantidad')::INTEGER, (producto->>'precio_unitario')::numeric,
                   (producto->>'nombre')::VARCHAR, (producto->>'sku')::VARCHAR, (producto->>'es_manual')::boolean
            FROM jsonb_array_elements(venta_data->'productos') AS producto;
        END IF;
        
        RETURN nuevo_pedido_id;
    END;
    $$ LANGUAGE plpgsql;
  `;
  
  try {
    // Intentar ejecutar el SQL directamente
    const { data, error } = await supabase
      .from('pedidos')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
    
    console.log('✅ Conexión a Supabase verificada');
    console.log('📝 SQL de corrección preparado');
    console.log('⚠️ NOTA: Ejecuta este SQL manualmente en el editor SQL de Supabase');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Función para mostrar instrucciones
function mostrarInstrucciones() {
  console.log('📋 INSTRUCCIONES PARA CORREGIR EL PROBLEMA:');
  console.log('');
  console.log('🎯 PROBLEMA IDENTIFICADO:');
  console.log('La función procesar_venta_mixta en Supabase tiene un error');
  console.log('en las líneas 238-239 que causa duplicación de cantidades.');
  console.log('');
  console.log('🔧 SOLUCIÓN:');
  console.log('1. Ve a tu proyecto en Supabase');
  console.log('2. Ve a SQL Editor');
  console.log('3. Ejecuta el archivo: scripts/corregir-funcion-procesar-venta-mixta.sql');
  console.log('4. O ejecuta el SQL de corrección directa');
  console.log('');
  console.log('✅ RESULTADO:');
  console.log('Después de aplicar la corrección, los nuevos pedidos');
  console.log('no tendrán cantidades duplicadas.');
  console.log('');
}

// Función principal
async function main() {
  console.log('🚀 Corrección de Función procesar_venta_mixta');
  console.log('='.repeat(50));
  
  mostrarInstrucciones();
  
  // Intentar aplicar corrección automática
  const exito = await corregirFuncionDirecta();
  
  if (exito) {
    console.log('✅ Preparación completada');
    console.log('📝 Ejecuta el SQL manualmente en Supabase');
  } else {
    console.log('❌ Error en la preparación');
    console.log('📋 Sigue las instrucciones manuales');
  }
}

// Ejecutar si se llama directamente
if (typeof window !== 'undefined') {
  // En el navegador
  window.corregirFuncionProcesarVentaMixta = corregirFuncionProcesarVentaMixta;
  window.corregirFuncionDirecta = corregirFuncionDirecta;
  window.mostrarInstrucciones = mostrarInstrucciones;
} else {
  // En Node.js
  main().catch(console.error);
}
