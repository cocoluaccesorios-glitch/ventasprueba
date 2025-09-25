-- =====================================================
-- CORRECCIÓN CRÍTICA: Error en función procesar_venta_mixta
-- =====================================================

-- PROBLEMA IDENTIFICADO:
-- En las líneas 238-239 del archivo create-procesar-venta-function.sql
-- Se están usando total_abono_usd y total_abono_ves para campos de pago mixto
-- cuando deberían usar monto_mixto_usd y monto_mixto_ves

-- CORRECCIÓN:
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
        cliente_cedula,
        cliente_nombre,
        cliente_apellido,
        cliente_telefono,
        cliente_email,
        cliente_direccion,
        subtotal_usd,
        monto_descuento_usd,
        monto_iva_usd,
        monto_delivery_usd,
        total_usd,
        aplica_iva,
        metodo_pago,
        referencia_pago,
        tasa_bcv,
        estado_entrega,
        comentarios_generales,
        comentarios_descuento,
        fecha_pedido,
        
        -- Campos para abono
        es_abono,
        tipo_pago_abono,
        metodo_pago_abono,
        monto_abono_simple,
        monto_abono_usd,
        monto_abono_ves,
        total_abono_usd,
        fecha_vencimiento,
        
        -- Campos para pago mixto
        es_pago_mixto,
        monto_mixto_usd,
        monto_mixto_ves,
        metodo_pago_mixto_usd,
        metodo_pago_mixto_ves,
        referencia_mixto_usd,
        referencia_mixto_ves
    ) VALUES (
        (venta_data->>'cliente_cedula')::VARCHAR,
        (venta_data->>'cliente_nombre')::VARCHAR,
        (venta_data->>'cliente_apellido')::VARCHAR,
        (venta_data->>'cliente_telefono')::VARCHAR,
        (venta_data->>'cliente_email')::VARCHAR,
        (venta_data->>'cliente_direccion')::VARCHAR,
        (venta_data->>'subtotal_usd')::numeric,
        (venta_data->>'monto_descuento_usd')::numeric,
        (venta_data->>'monto_iva_usd')::numeric,
        (venta_data->>'monto_delivery_usd')::numeric,
        (venta_data->>'total_usd')::numeric,
        (venta_data->>'aplica_iva')::boolean,
        (venta_data->>'metodo_pago')::VARCHAR,
        (venta_data->>'referencia_pago')::VARCHAR,
        (venta_data->>'tasa_bcv')::numeric,
        (venta_data->>'estado_entrega')::VARCHAR,
        (venta_data->>'comentarios_generales')::TEXT,
        (venta_data->>'comentarios_descuento')::TEXT,
        NOW(),
        
        -- Campos para abono
        (venta_data->>'es_abono')::boolean,
        (venta_data->>'tipo_pago_abono')::VARCHAR,
        (venta_data->>'metodo_pago_abono')::VARCHAR,
        (venta_data->>'monto_abono_simple')::numeric,
        total_abono_usd,
        total_abono_ves,
        total_abono_usd + (total_abono_ves / (venta_data->>'tasa_bcv')::numeric),
        (venta_data->>'fecha_vencimiento')::DATE,
        
        -- Campos para pago mixto - CORREGIDO
        (venta_data->>'es_pago_mixto')::boolean,
        (venta_data->>'monto_mixto_usd')::numeric,        -- ✅ CORREGIDO: Usar monto_mixto_usd
        (venta_data->>'monto_mixto_ves')::numeric,        -- ✅ CORREGIDO: Usar monto_mixto_ves
        (venta_data->>'metodo_pago_mixto_usd')::VARCHAR,
        (venta_data->>'metodo_pago_mixto_ves')::VARCHAR,
        (venta_data->>'referencia_mixto_usd')::VARCHAR,
        (venta_data->>'referencia_mixto_ves')::VARCHAR
    ) RETURNING id INTO nuevo_pedido_id;
    
    -- Insertar detalles del pedido
    IF venta_data->'productos' IS NOT NULL THEN
        INSERT INTO detalles_pedido (
            pedido_id,
            producto_id,
            cantidad,
            precio_unitario_usd,
            nombre_producto,
            sku_producto,
            es_manual
        )
        SELECT 
            nuevo_pedido_id,
            (producto->>'id')::INTEGER,
            (producto->>'cantidad')::INTEGER,
            (producto->>'precio_unitario')::numeric,
            (producto->>'nombre')::VARCHAR,
            (producto->>'sku')::VARCHAR,
            (producto->>'es_manual')::boolean
        FROM jsonb_array_elements(venta_data->'productos') AS producto;
    END IF;
    
    -- Si es un abono mixto, crear registro en la tabla abonos
    IF (venta_data->>'es_abono')::boolean = true AND (total_abono_usd > 0 OR total_abono_ves > 0) THEN
        INSERT INTO abonos (
            pedido_id,
            cliente_id,
            monto_abono_usd,
            monto_abono_ves,
            tasa_bcv,
            metodo_pago_abono,
            referencia_pago,
            tipo_abono,
            fecha_vencimiento,
            estado_abono,
            comentarios
        ) VALUES (
            nuevo_pedido_id,
            (SELECT id FROM clientes WHERE cedula_rif = (venta_data->>'cliente_cedula')::VARCHAR LIMIT 1),
            total_abono_usd,
            total_abono_ves,
            (venta_data->>'tasa_bcv')::numeric,
            (venta_data->>'metodo_pago_mixto_usd')::VARCHAR,
            (venta_data->>'referencia_mixto_usd')::VARCHAR,
            (venta_data->>'tipo_pago_abono')::VARCHAR,
            (venta_data->>'fecha_vencimiento')::DATE,
            'confirmado',
            'Abono mixto inicial del pedido #' || nuevo_pedido_id
        );
    END IF;
    
    -- Insertar tasa BCV si no existe para la fecha actual
    INSERT INTO tasa_cambio (fecha, tasa_bcv)
    VALUES (CURRENT_DATE, (venta_data->>'tasa_bcv')::numeric)
    ON CONFLICT (fecha) DO NOTHING;
    
    RETURN nuevo_pedido_id;
END;
$$ LANGUAGE plpgsql;

-- Verificar que la corrección se aplicó
SELECT 
    'Corrección aplicada exitosamente' as resultado,
    'Función procesar_venta_mixta corregida' as detalle;
