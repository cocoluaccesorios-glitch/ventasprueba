-- Funciones esenciales para Ventas Cocolú
-- Solo las funciones necesarias sin crear tablas nuevas

-- Procedimiento simplificado para procesar ventas
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
BEGIN
    -- 1. Calcular subtotal
    FOR item IN SELECT * FROM jsonb_array_elements(venta_data->'productos')
    LOOP
        -- Inicializar precio
        producto_precio := 0;
        
        -- Si es producto manual, usar el precio del item directamente
        IF (item->>'id')::TEXT = 'MANUAL' THEN
            producto_precio := (item->>'precio_unitario')::DECIMAL;
        ELSE
            -- Obtener precio del producto de la base de datos
            SELECT precio_usd INTO producto_precio
            FROM productos WHERE id = (item->>'id')::INTEGER;
            
            -- Si no se encuentra el producto, usar el precio del item como fallback
            IF producto_precio IS NULL THEN
                producto_precio := (item->>'precio_unitario')::DECIMAL;
            END IF;
        END IF;
        
        -- Sumar al subtotal
        subtotal := subtotal + (producto_precio * (item->>'cantidad')::INTEGER);
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
            producto_precio := (item->>'precio_unitario')::DECIMAL;
        ELSE
            -- Obtener precio del producto de la base de datos
            SELECT precio_usd INTO producto_precio
            FROM productos WHERE id = (item->>'id')::INTEGER;
            
            -- Si no se encuentra el producto, usar el precio del item como fallback
            IF producto_precio IS NULL THEN
                producto_precio := (item->>'precio_unitario')::DECIMAL;
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
            (item->>'cantidad')::INTEGER,
            producto_precio,
            producto_precio * (item->>'cantidad')::INTEGER,
            item->>'nombre',
            item->>'sku'
        );
        
        -- 5. Actualizar stock si no es producto manual
        IF (item->>'id')::TEXT != 'MANUAL' THEN
            UPDATE productos 
            SET stock_actual = stock_actual - (item->>'cantidad')::INTEGER
            WHERE id = (item->>'id')::INTEGER;
        END IF;
    END LOOP;
    
    RETURN nuevo_pedido_id;
END;
$$;

-- Función para anular pedido
CREATE OR REPLACE FUNCTION anular_pedido_simple(p_pedido_id INTEGER)
RETURNS BOOLEAN
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
        WHERE pedido_id = p_pedido_id AND producto_id IS NOT NULL
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
    
    RETURN TRUE;
END;
$$;

-- Función para actualizar pedido
CREATE OR REPLACE FUNCTION actualizar_pedido(
    p_pedido_id INTEGER,
    p_motivo TEXT,
    p_productos JSONB,
    p_nuevo_total DECIMAL(10,2)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    detalle RECORD;
    item JSONB;
BEGIN
    -- Revertir stock actual
    FOR detalle IN 
        SELECT producto_id, cantidad 
        FROM detalles_pedido 
        WHERE pedido_id = p_pedido_id AND producto_id IS NOT NULL
    LOOP
        UPDATE productos 
        SET stock_actual = stock_actual + detalle.cantidad
        WHERE id = detalle.producto_id;
    END LOOP;
    
    -- Eliminar detalles actuales
    DELETE FROM detalles_pedido WHERE pedido_id = p_pedido_id;
    
    -- Crear nuevos detalles
    FOR item IN SELECT * FROM jsonb_array_elements(p_productos)
    LOOP
        INSERT INTO detalles_pedido (
            pedido_id, 
            producto_id, 
            cantidad, 
            precio_unitario_usd, 
            subtotal_usd, 
            nombre_producto, 
            sku_producto
        ) VALUES (
            p_pedido_id,
            CASE 
                WHEN (item->>'id')::TEXT = 'MANUAL' THEN NULL 
                ELSE (item->>'id')::INTEGER 
            END,
            (item->>'cantidad')::INTEGER,
            (item->>'precio_unitario')::DECIMAL,
            (item->>'precio_unitario')::DECIMAL * (item->>'cantidad')::INTEGER,
            item->>'nombre',
            item->>'sku'
        );
        
        -- Actualizar stock si no es producto manual
        IF (item->>'id')::TEXT != 'MANUAL' THEN
            UPDATE productos 
            SET stock_actual = stock_actual - (item->>'cantidad')::INTEGER
            WHERE id = (item->>'id')::INTEGER;
        END IF;
    END LOOP;
    
    -- Actualizar total del pedido
    UPDATE pedidos 
    SET total_usd = p_nuevo_total,
        comentarios_generales = COALESCE(comentarios_generales, '') || ' | Actualizado: ' || p_motivo
    WHERE id = p_pedido_id;
    
    RETURN TRUE;
END;
$$;

-- Función para anular pedido con motivo
CREATE OR REPLACE FUNCTION anular_pedido_con_motivo(
    p_pedido_id INTEGER,
    p_motivo TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    detalle RECORD;
BEGIN
    -- Revertir stock de productos
    FOR detalle IN 
        SELECT producto_id, cantidad 
        FROM detalles_pedido 
        WHERE pedido_id = p_pedido_id AND producto_id IS NOT NULL
    LOOP
        UPDATE productos 
        SET stock_actual = stock_actual + detalle.cantidad
        WHERE id = detalle.producto_id;
    END LOOP;
    
    -- Marcar pedido como anulado con motivo
    UPDATE pedidos 
    SET estado_entrega = 'anulado',
        comentarios_generales = COALESCE(comentarios_generales, '') || ' | Anulado: ' || p_motivo
    WHERE id = p_pedido_id;
    
    RETURN TRUE;
END;
$$;

-- Función para cambiar estado de pedido
CREATE OR REPLACE FUNCTION cambiar_estado_pedido(
    p_pedido_id INTEGER,
    p_nuevo_estado TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Actualizar estado del pedido
    UPDATE pedidos 
    SET estado_entrega = p_nuevo_estado
    WHERE id = p_pedido_id;
    
    RETURN TRUE;
END;
$$;
