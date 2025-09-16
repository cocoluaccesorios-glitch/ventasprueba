-- Procedimiento simplificado para procesar ventas sin tabla clientes
CREATE OR REPLACE FUNCTION procesar_venta_simple(venta_data JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    nuevo_pedido_id INTEGER;
    item JSONB;
    producto_precio DECIMAL(10,2) := 0;
    subtotal DECIMAL(10,2) := 0;
    total_calculado DECIMAL(10,2);
    cliente_id_temp INTEGER := 1; -- Cliente temporal fijo
    producto_record RECORD;
BEGIN
    -- Validar que venta_data tenga productos
    IF NOT (venta_data ? 'productos') OR jsonb_array_length(venta_data->'productos') = 0 THEN
        RAISE EXCEPTION 'No se proporcionaron productos para la venta';
    END IF;
    
    -- 1. Calcular subtotal
    FOR item IN SELECT * FROM jsonb_array_elements(venta_data->'productos')
    LOOP
        -- Inicializar precio
        producto_precio := 0;
        
        -- Si es producto manual, usar el precio del item directamente
        IF (item->>'id')::TEXT = 'MANUAL' THEN
            producto_precio := COALESCE((item->>'precio_unitario')::DECIMAL, 0);
        ELSE
            -- Obtener precio del producto de la base de datos
            SELECT precio_usd INTO producto_record.precio_usd
            FROM productos WHERE id = (item->>'id')::INTEGER;
            
            -- Si no se encuentra el producto, usar el precio del item como fallback
            IF producto_record.precio_usd IS NULL THEN
                producto_precio := COALESCE((item->>'precio_unitario')::DECIMAL, 0);
            ELSE
                producto_precio := producto_record.precio_usd;
            END IF;
        END IF;
        
        -- Sumar al subtotal
        subtotal := subtotal + (producto_precio * COALESCE((item->>'cantidad')::INTEGER, 0));
    END LOOP;
    
    -- 2. Calcular total
    total_calculado := subtotal 
        - COALESCE((venta_data->>'monto_descuento_usd')::DECIMAL, 0) 
        + COALESCE((venta_data->>'monto_iva_usd')::DECIMAL, 0)
        + COALESCE((venta_data->>'monto_delivery_usd')::DECIMAL, 0);
    
    IF total_calculado < 0 THEN 
        total_calculado := 0; 
    END IF;
    
    -- 3. Crear pedido con cliente temporal
    INSERT INTO pedidos (
        cliente_id, 
        fecha_pedido, 
        total_usd, 
        estado_entrega, 
        metodo_pago, 
        monto_descuento_usd, 
        monto_delivery_usd, 
        monto_iva_usd, 
        aplica_iva, 
        comentarios_descuento, 
        comentarios_delivery, 
        comentarios_generales, 
        cliente_cedula, 
        cliente_nombre, 
        cliente_apellido, 
        cliente_telefono, 
        cliente_email, 
        cliente_direccion
    ) VALUES (
        cliente_id_temp,
        NOW(),
        total_calculado,
        COALESCE(venta_data->>'estado_entrega', 'pendiente'),
        COALESCE(venta_data->>'metodo_pago', 'efectivo'),
        COALESCE((venta_data->>'monto_descuento_usd')::DECIMAL, 0),
        COALESCE((venta_data->>'monto_delivery_usd')::DECIMAL, 0),
        COALESCE((venta_data->>'monto_iva_usd')::DECIMAL, 0),
        COALESCE((venta_data->>'aplica_iva')::BOOLEAN, false),
        venta_data->>'comentarios_descuento',
        venta_data->>'comentarios_delivery',
        venta_data->>'comentarios_generales',
        venta_data->>'cliente_cedula',
        venta_data->>'cliente_nombre',
        venta_data->>'cliente_apellido',
        venta_data->>'cliente_telefono',
        venta_data->>'cliente_email',
        venta_data->>'cliente_direccion'
    ) RETURNING id INTO nuevo_pedido_id;
    
    -- 4. Crear detalles del pedido
    FOR item IN SELECT * FROM jsonb_array_elements(venta_data->'productos')
    LOOP
        -- Inicializar precio
        producto_precio := 0;
        
        -- Si es producto manual, usar el precio del item directamente
        IF (item->>'id')::TEXT = 'MANUAL' THEN
            producto_precio := COALESCE((item->>'precio_unitario')::DECIMAL, 0);
        ELSE
            -- Obtener precio del producto de la base de datos
            SELECT precio_usd INTO producto_record.precio_usd
            FROM productos WHERE id = (item->>'id')::INTEGER;
            
            -- Si no se encuentra el producto, usar el precio del item como fallback
            IF producto_record.precio_usd IS NULL THEN
                producto_precio := COALESCE((item->>'precio_unitario')::DECIMAL, 0);
            ELSE
                producto_precio := producto_record.precio_usd;
            END IF;
        END IF;
        
        INSERT INTO detalles_pedido (
            pedido_id, 
            producto_id, 
            cantidad, 
            precio_unitario_usd, 
            subtotal_usd, 
            nombre_producto, 
            sku_producto
        ) VALUES (
            nuevo_pedido_id,
            CASE 
                WHEN (item->>'id')::TEXT = 'MANUAL' THEN NULL 
                ELSE (item->>'id')::INTEGER 
            END,
            COALESCE((item->>'cantidad')::INTEGER, 0),
            producto_precio,
            producto_precio * COALESCE((item->>'cantidad')::INTEGER, 0),
            COALESCE(item->>'nombre', 'Producto'),
            COALESCE(item->>'sku', 'N/A')
        );
        
        -- 5. Actualizar stock si no es producto manual
        IF (item->>'id')::TEXT != 'MANUAL' THEN
            UPDATE productos 
            SET stock_actual = stock_actual - COALESCE((item->>'cantidad')::INTEGER, 0)
            WHERE id = (item->>'id')::INTEGER;
        END IF;
    END LOOP;
    
    RETURN nuevo_pedido_id;
END;
$$;
