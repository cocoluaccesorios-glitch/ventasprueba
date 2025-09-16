-- Procedimiento simplificado para procesar ventas sin tabla clientes
CREATE OR REPLACE FUNCTION procesar_venta_simple(venta_data JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    nuevo_pedido_id INTEGER;
    item JSONB;
    producto_record RECORD;
    subtotal DECIMAL(10,2) := 0;
    total_calculado DECIMAL(10,2);
    cliente_id_temp INTEGER := 1; -- Cliente temporal fijo
BEGIN
    -- 1. Calcular subtotal
    FOR item IN SELECT * FROM jsonb_array_elements(venta_data->'productos')
    LOOP
        SELECT precio_usd INTO producto_record.precio_usd
        FROM productos WHERE id = (item->>'id')::INTEGER;
        
        subtotal := subtotal + (producto_record.precio_usd * (item->>'cantidad')::INTEGER);
    END LOOP;
    
    -- 2. Calcular total
    total_calculado := subtotal 
        - COALESCE((venta_data->>'monto_descuento_usd')::DECIMAL, 0) 
        + COALESCE((venta_data->>'monto_iva_usd')::DECIMAL, 0);
    
    IF total_calculado < 0 THEN 
        total_calculado := 0; 
    END IF;
    
    -- 3. Crear pedido con cliente temporal
    INSERT INTO pedidos (
        cliente_id, 
        subtotal_usd,
        monto_descuento_usd,
        monto_iva_usd,
        total_usd,
        estado_entrega,
        comentarios
    ) VALUES (
        cliente_id_temp,
        subtotal,
        COALESCE((venta_data->>'monto_descuento_usd')::DECIMAL, 0),
        COALESCE((venta_data->>'monto_iva_usd')::DECIMAL, 0),
        total_calculado,
        'pendiente',
        venta_data->>'comentarios'
    ) RETURNING id INTO nuevo_pedido_id;
    
    -- 4. Crear detalles y actualizar stock
    FOR item IN SELECT * FROM jsonb_array_elements(venta_data->'productos')
    LOOP
        -- Obtener precio actual del producto
        SELECT precio_usd INTO producto_record.precio_usd
        FROM productos WHERE id = (item->>'id')::INTEGER;
        
        -- Crear detalle
        INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario_usd)
        VALUES (
            nuevo_pedido_id,
            (item->>'id')::INTEGER,
            (item->>'cantidad')::INTEGER,
            producto_record.precio_usd
        );
        
        -- Actualizar stock
        UPDATE productos 
        SET stock_actual = stock_actual - (item->>'cantidad')::INTEGER
        WHERE id = (item->>'id')::INTEGER;
    END LOOP;
    
    RETURN nuevo_pedido_id;
END;
$$;

-- Procedimiento simplificado para anular pedido
CREATE OR REPLACE FUNCTION anular_pedido_simple(p_pedido_id INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    detalle RECORD;
BEGIN
    -- Revertir stock de todos los productos del pedido
    FOR detalle IN 
        SELECT producto_id, cantidad 
        FROM detalles_pedido 
        WHERE pedido_id = p_pedido_id
    LOOP
        -- Actualizar stock
        UPDATE productos 
        SET stock_actual = stock_actual + detalle.cantidad
        WHERE id = detalle.producto_id;
    END LOOP;
    
    -- Marcar pedido como anulado
    UPDATE pedidos 
    SET estado_entrega = 'anulado' 
    WHERE id = p_pedido_id;
END;
$$;
