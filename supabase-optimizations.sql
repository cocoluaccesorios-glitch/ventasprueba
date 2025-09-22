-- =====================================================
-- OPTIMIZACIONES DE BASE DE DATOS PARA COCOLÚ VENTAS
-- =====================================================

-- 1. Índices para mejorar performance
-- =====================================================

-- Índices para tabla pedidos
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_pedido ON pedidos(fecha_pedido DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_cedula ON pedidos(cliente_cedula);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_entrega ON pedidos(estado_entrega);
CREATE INDEX IF NOT EXISTS idx_pedidos_total_usd ON pedidos(total_usd);
CREATE INDEX IF NOT EXISTS idx_pedidos_metodo_pago ON pedidos(metodo_pago);

-- Índices para tabla detalles_pedido
CREATE INDEX IF NOT EXISTS idx_detalles_pedido_pedido_id ON detalles_pedido(pedido_id);
CREATE INDEX IF NOT EXISTS idx_detalles_pedido_producto_id ON detalles_pedido(producto_id);
CREATE INDEX IF NOT EXISTS idx_detalles_pedido_cantidad ON detalles_pedido(cantidad);

-- Índices para tabla productos
CREATE INDEX IF NOT EXISTS idx_productos_sku ON productos(sku);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre);
CREATE INDEX IF NOT EXISTS idx_productos_stock_actual ON productos(stock_actual);
CREATE INDEX IF NOT EXISTS idx_productos_precio_usd ON productos(precio_usd);
CREATE INDEX IF NOT EXISTS idx_productos_categoria_id ON productos(categoria_id);

-- Índices para tabla clientes
CREATE INDEX IF NOT EXISTS idx_clientes_cedula_rif ON clientes(cedula_rif);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);
CREATE INDEX IF NOT EXISTS idx_clientes_apellido ON clientes(apellido);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);

-- Índices para tabla usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

-- 2. Vistas materializadas para reportes
-- =====================================================

-- Vista para estadísticas de ventas por día
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_ventas_por_dia AS
SELECT 
    DATE(fecha_pedido) as fecha,
    COUNT(*) as total_pedidos,
    SUM(total_usd) as total_ventas,
    AVG(total_usd) as promedio_venta,
    COUNT(DISTINCT cliente_cedula) as clientes_unicos
FROM pedidos 
WHERE estado_entrega != 'anulado'
GROUP BY DATE(fecha_pedido)
ORDER BY fecha DESC;

-- Vista para top productos vendidos
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_top_productos AS
SELECT 
    p.id,
    p.nombre,
    p.sku,
    SUM(dp.cantidad) as total_vendido,
    SUM(dp.cantidad * dp.precio_unitario_usd) as total_ventas,
    COUNT(DISTINCT dp.pedido_id) as veces_vendido
FROM productos p
JOIN detalles_pedido dp ON p.id = dp.producto_id
JOIN pedidos ped ON dp.pedido_id = ped.id
WHERE ped.estado_entrega != 'anulado'
GROUP BY p.id, p.nombre, p.sku
ORDER BY total_vendido DESC;

-- Vista para clientes más activos
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_clientes_activos AS
SELECT 
    cliente_cedula,
    cliente_nombre,
    cliente_apellido,
    COUNT(*) as total_pedidos,
    SUM(total_usd) as total_gastado,
    AVG(total_usd) as promedio_pedido,
    MAX(fecha_pedido) as ultimo_pedido
FROM pedidos 
WHERE estado_entrega != 'anulado'
GROUP BY cliente_cedula, cliente_nombre, cliente_apellido
ORDER BY total_gastado DESC;

-- 3. Funciones de actualización de vistas materializadas
-- =====================================================

-- Función para refrescar todas las vistas materializadas
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW mv_ventas_por_dia;
    REFRESH MATERIALIZED VIEW mv_top_productos;
    REFRESH MATERIALIZED VIEW mv_clientes_activos;
    
    RAISE NOTICE 'Vistas materializadas actualizadas correctamente';
END;
$$ LANGUAGE plpgsql;

-- 4. Triggers para actualización automática
-- =====================================================

-- Trigger para actualizar vistas cuando se inserta un pedido
CREATE OR REPLACE FUNCTION trigger_refresh_views_on_pedido()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar vistas en background (no bloquear la inserción)
    PERFORM pg_notify('refresh_views', 'pedido_inserted');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pedido_insert
    AFTER INSERT ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_refresh_views_on_pedido();

-- Trigger para actualizar vistas cuando se actualiza un pedido
CREATE TRIGGER trigger_pedido_update
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    WHEN (OLD.estado_entrega IS DISTINCT FROM NEW.estado_entrega)
    EXECUTE FUNCTION trigger_refresh_views_on_pedido();

-- 5. Funciones de optimización de consultas
-- =====================================================

-- Función para obtener estadísticas de ventas con filtros
CREATE OR REPLACE FUNCTION get_ventas_stats(
    fecha_inicio DATE DEFAULT NULL,
    fecha_fin DATE DEFAULT NULL,
    cliente_cedula_param TEXT DEFAULT NULL
)
RETURNS TABLE (
    total_pedidos BIGINT,
    total_ventas NUMERIC,
    promedio_venta NUMERIC,
    clientes_unicos BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_pedidos,
        COALESCE(SUM(total_usd), 0) as total_ventas,
        COALESCE(AVG(total_usd), 0) as promedio_venta,
        COUNT(DISTINCT cliente_cedula) as clientes_unicos
    FROM pedidos 
    WHERE estado_entrega != 'anulado'
        AND (fecha_inicio IS NULL OR DATE(fecha_pedido) >= fecha_inicio)
        AND (fecha_fin IS NULL OR DATE(fecha_pedido) <= fecha_fin)
        AND (cliente_cedula_param IS NULL OR cliente_cedula = cliente_cedula_param);
END;
$$ LANGUAGE plpgsql;

-- Función para obtener productos con stock bajo
CREATE OR REPLACE FUNCTION get_productos_stock_bajo(
    limite_stock INTEGER DEFAULT 5
)
RETURNS TABLE (
    id INTEGER,
    nombre TEXT,
    sku TEXT,
    stock_actual INTEGER,
    precio_usd NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nombre,
        p.sku,
        p.stock_actual,
        p.precio_usd
    FROM productos p
    WHERE p.stock_actual <= limite_stock
    ORDER BY p.stock_actual ASC, p.nombre ASC;
END;
$$ LANGUAGE plpgsql;

-- 6. Configuraciones de performance
-- =====================================================

-- Configurar work_mem para sesiones
ALTER SYSTEM SET work_mem = '256MB';
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET seq_page_cost = 1.0;

-- 7. Funciones de mantenimiento
-- =====================================================

-- Función para limpiar datos antiguos
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Limpiar sesiones expiradas (más de 30 días)
    DELETE FROM sesiones_usuario 
    WHERE fecha_expiracion < NOW() - INTERVAL '30 days';
    
    -- Limpiar logs antiguos (más de 90 días)
    DELETE FROM logs_sistema 
    WHERE fecha_creacion < NOW() - INTERVAL '90 days';
    
    -- Actualizar estadísticas de tablas
    ANALYZE pedidos;
    ANALYZE productos;
    ANALYZE clientes;
    ANALYZE detalles_pedido;
    
    RAISE NOTICE 'Limpieza de datos completada';
END;
$$ LANGUAGE plpgsql;

-- 8. Índices compuestos para consultas complejas
-- =====================================================

-- Índice compuesto para consultas de ventas por período
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_estado_total 
ON pedidos(fecha_pedido, estado_entrega, total_usd);

-- Índice compuesto para consultas de productos por categoría
CREATE INDEX IF NOT EXISTS idx_productos_categoria_stock_precio 
ON productos(categoria_id, stock_actual, precio_usd);

-- Índice compuesto para consultas de clientes
CREATE INDEX IF NOT EXISTS idx_clientes_nombre_apellido_cedula 
ON clientes(nombre, apellido, cedula_rif);

-- 9. Configuración de particionado (para tablas grandes)
-- =====================================================

-- Particionar tabla de logs por mes (ejemplo)
-- CREATE TABLE logs_sistema (
--     id SERIAL,
--     nivel VARCHAR(20),
--     mensaje TEXT,
--     fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- ) PARTITION BY RANGE (fecha_creacion);

-- 10. Comentarios para documentación
-- =====================================================

COMMENT ON MATERIALIZED VIEW mv_ventas_por_dia IS 'Estadísticas de ventas agrupadas por día';
COMMENT ON MATERIALIZED VIEW mv_top_productos IS 'Ranking de productos más vendidos';
COMMENT ON MATERIALIZED VIEW mv_clientes_activos IS 'Clientes con mayor actividad de compras';

COMMENT ON FUNCTION get_ventas_stats IS 'Obtiene estadísticas de ventas con filtros opcionales';
COMMENT ON FUNCTION get_productos_stock_bajo IS 'Obtiene productos con stock bajo';
COMMENT ON FUNCTION cleanup_old_data IS 'Limpia datos antiguos y actualiza estadísticas';
COMMENT ON FUNCTION refresh_materialized_views IS 'Actualiza todas las vistas materializadas';
