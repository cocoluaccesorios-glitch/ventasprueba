-- =====================================================
-- SCRIPT PARA VERIFICAR DATOS DEL DASHBOARD
-- =====================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- para verificar que los datos mostrados sean reales

-- =====================================================
-- 1. VERIFICAR ESTRUCTURA DE TABLAS
-- =====================================================

-- Verificar estructura de la tabla pedidos
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pedidos' 
ORDER BY ordinal_position;

-- Verificar estructura de la tabla clientes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;

-- Verificar estructura de la tabla productos
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'productos' 
ORDER BY ordinal_position;

-- =====================================================
-- 2. CONTAR REGISTROS TOTALES
-- =====================================================

-- Contar total de pedidos
SELECT 
    'Total Pedidos' as metrica,
    COUNT(*) as valor
FROM pedidos;

-- Contar total de clientes
SELECT 
    'Total Clientes' as metrica,
    COUNT(*) as valor
FROM clientes;

-- Contar total de productos
SELECT 
    'Total Productos' as metrica,
    COUNT(*) as valor
FROM productos;

-- =====================================================
-- 3. VERIFICAR DATOS POR PERÍODO (HOY)
-- =====================================================

-- Pedidos de hoy
SELECT 
    'Pedidos Hoy' as metrica,
    COUNT(*) as valor,
    COALESCE(SUM(total_usd), 0) as ventas_totales,
    COALESCE(SUM(
        CASE 
            WHEN metodo_pago = 'Contado' THEN total_usd
            WHEN es_pago_mixto THEN (monto_mixto_usd + monto_mixto_ves / COALESCE(tasa_bcv, 1))
            WHEN es_abono THEN COALESCE(total_abono_usd, monto_abono_usd, 0)
            ELSE 0
        END
    ), 0) as ingresos_reales
FROM pedidos 
WHERE DATE(fecha_pedido) = CURRENT_DATE;

-- Clientes registrados hoy
SELECT 
    'Clientes Hoy' as metrica,
    COUNT(*) as valor
FROM clientes 
WHERE DATE(fecha_registro) = CURRENT_DATE;

-- =====================================================
-- 4. VERIFICAR DATOS POR PERÍODO (ESTA SEMANA)
-- =====================================================

-- Pedidos de esta semana
SELECT 
    'Pedidos Esta Semana' as metrica,
    COUNT(*) as valor,
    COALESCE(SUM(total_usd), 0) as ventas_totales,
    COALESCE(SUM(
        CASE 
            WHEN metodo_pago = 'Contado' THEN total_usd
            WHEN es_pago_mixto THEN (monto_mixto_usd + monto_mixto_ves / COALESCE(tasa_bcv, 1))
            WHEN es_abono THEN COALESCE(total_abono_usd, monto_abono_usd, 0)
            ELSE 0
        END
    ), 0) as ingresos_reales
FROM pedidos 
WHERE fecha_pedido >= CURRENT_DATE - INTERVAL '7 days';

-- Clientes registrados esta semana
SELECT 
    'Clientes Esta Semana' as metrica,
    COUNT(*) as valor
FROM clientes 
WHERE fecha_registro >= CURRENT_DATE - INTERVAL '7 days';

-- =====================================================
-- 5. VERIFICAR DATOS POR PERÍODO (ESTE MES)
-- =====================================================

-- Pedidos de este mes
SELECT 
    'Pedidos Este Mes' as metrica,
    COUNT(*) as valor,
    COALESCE(SUM(total_usd), 0) as ventas_totales,
    COALESCE(SUM(
        CASE 
            WHEN metodo_pago = 'Contado' THEN total_usd
            WHEN es_pago_mixto THEN (monto_mixto_usd + monto_mixto_ves / COALESCE(tasa_bcv, 1))
            WHEN es_abono THEN COALESCE(total_abono_usd, monto_abono_usd, 0)
            ELSE 0
        END
    ), 0) as ingresos_reales
FROM pedidos 
WHERE fecha_pedido >= CURRENT_DATE - INTERVAL '30 days';

-- Clientes registrados este mes
SELECT 
    'Clientes Este Mes' as metrica,
    COUNT(*) as valor
FROM clientes 
WHERE fecha_registro >= CURRENT_DATE - INTERVAL '30 days';

-- =====================================================
-- 6. VERIFICAR DATOS POR PERÍODO (ESTE AÑO)
-- =====================================================

-- Pedidos de este año
SELECT 
    'Pedidos Este Año' as metrica,
    COUNT(*) as valor,
    COALESCE(SUM(total_usd), 0) as ventas_totales,
    COALESCE(SUM(
        CASE 
            WHEN metodo_pago = 'Contado' THEN total_usd
            WHEN es_pago_mixto THEN (monto_mixto_usd + monto_mixto_ves / COALESCE(tasa_bcv, 1))
            WHEN es_abono THEN COALESCE(total_abono_usd, monto_abono_usd, 0)
            ELSE 0
        END
    ), 0) as ingresos_reales
FROM pedidos 
WHERE fecha_pedido >= CURRENT_DATE - INTERVAL '365 days';

-- Clientes registrados este año
SELECT 
    'Clientes Este Año' as metrica,
    COUNT(*) as valor
FROM clientes 
WHERE fecha_registro >= CURRENT_DATE - INTERVAL '365 days';

-- =====================================================
-- 7. VERIFICAR PRODUCTOS VENDIDOS
-- =====================================================

-- Productos vendidos por período (hoy)
SELECT 
    'Productos Vendidos Hoy' as metrica,
    COALESCE(SUM(
        CASE 
            WHEN detalles_pedido IS NOT NULL THEN
                (SELECT SUM((value->>'cantidad')::integer) 
                 FROM jsonb_array_elements(detalles_pedido) 
                 WHERE (value->>'cantidad') IS NOT NULL)
            ELSE 0
        END
    ), 0) as valor
FROM pedidos 
WHERE DATE(fecha_pedido) = CURRENT_DATE;

-- Productos vendidos por período (esta semana)
SELECT 
    'Productos Vendidos Esta Semana' as metrica,
    COALESCE(SUM(
        CASE 
            WHEN detalles_pedido IS NOT NULL THEN
                (SELECT SUM((value->>'cantidad')::integer) 
                 FROM jsonb_array_elements(detalles_pedido) 
                 WHERE (value->>'cantidad') IS NOT NULL)
            ELSE 0
        END
    ), 0) as valor
FROM pedidos 
WHERE fecha_pedido >= CURRENT_DATE - INTERVAL '7 days';

-- =====================================================
-- 8. VERIFICAR STOCK BAJO
-- =====================================================

-- Productos con stock bajo
SELECT 
    'Stock Bajo' as metrica,
    COUNT(*) as valor
FROM productos 
WHERE COALESCE(stock_actual, 0) <= COALESCE(stock_sugerido, 5);

-- =====================================================
-- 9. VERIFICAR TOP PRODUCTOS
-- =====================================================

-- Top productos vendidos (últimos 30 días)
WITH productos_vendidos AS (
    SELECT 
        (value->>'producto_id')::integer as producto_id,
        SUM((value->>'cantidad')::integer) as cantidad_vendida
    FROM pedidos,
         jsonb_array_elements(detalles_pedido)
    WHERE fecha_pedido >= CURRENT_DATE - INTERVAL '30 days'
      AND detalles_pedido IS NOT NULL
      AND (value->>'cantidad') IS NOT NULL
    GROUP BY (value->>'producto_id')::integer
)
SELECT 
    p.nombre as producto,
    pv.cantidad_vendida,
    p.precio_usd,
    (pv.cantidad_vendida * p.precio_usd) as total_ventas
FROM productos_vendidos pv
JOIN productos p ON p.id = pv.producto_id
ORDER BY pv.cantidad_vendida DESC
LIMIT 5;

-- =====================================================
-- 10. VERIFICAR PEDIDOS RECIENTES
-- =====================================================

-- Pedidos más recientes (últimos 5)
SELECT 
    id,
    cliente_nombre,
    total_usd,
    estado_entrega,
    fecha_pedido
FROM pedidos 
ORDER BY fecha_pedido DESC 
LIMIT 5;

-- =====================================================
-- 11. VERIFICAR MÉTODOS DE PAGO
-- =====================================================

-- Distribución de métodos de pago
SELECT 
    metodo_pago,
    COUNT(*) as cantidad,
    SUM(total_usd) as total_ventas,
    SUM(
        CASE 
            WHEN metodo_pago = 'Contado' THEN total_usd
            WHEN es_pago_mixto THEN (monto_mixto_usd + monto_mixto_ves / COALESCE(tasa_bcv, 1))
            WHEN es_abono THEN COALESCE(total_abono_usd, monto_abono_usd, 0)
            ELSE 0
        END
    ) as ingresos_reales
FROM pedidos 
GROUP BY metodo_pago
ORDER BY cantidad DESC;

-- =====================================================
-- 12. RESUMEN COMPLETO POR PERÍODO
-- =====================================================

-- Resumen completo para verificar dashboard
WITH resumen_periodos AS (
    SELECT 
        'Hoy' as periodo,
        COUNT(p.id) as total_pedidos,
        COALESCE(SUM(p.total_usd), 0) as ventas_totales,
        COALESCE(SUM(
            CASE 
                WHEN p.metodo_pago = 'Contado' THEN p.total_usd
                WHEN p.es_pago_mixto THEN (p.monto_mixto_usd + p.monto_mixto_ves / COALESCE(p.tasa_bcv, 1))
                WHEN p.es_abono THEN COALESCE(p.total_abono_usd, p.monto_abono_usd, 0)
                ELSE 0
            END
        ), 0) as ingresos_reales,
        COUNT(DISTINCT c.id) as clientes_activos
    FROM pedidos p
    LEFT JOIN clientes c ON DATE(c.fecha_registro) = CURRENT_DATE
    WHERE DATE(p.fecha_pedido) = CURRENT_DATE
    
    UNION ALL
    
    SELECT 
        'Esta Semana' as periodo,
        COUNT(p.id) as total_pedidos,
        COALESCE(SUM(p.total_usd), 0) as ventas_totales,
        COALESCE(SUM(
            CASE 
                WHEN p.metodo_pago = 'Contado' THEN p.total_usd
                WHEN p.es_pago_mixto THEN (p.monto_mixto_usd + p.monto_mixto_ves / COALESCE(p.tasa_bcv, 1))
                WHEN p.es_abono THEN COALESCE(p.total_abono_usd, p.monto_abono_usd, 0)
                ELSE 0
            END
        ), 0) as ingresos_reales,
        COUNT(DISTINCT c.id) as clientes_activos
    FROM pedidos p
    LEFT JOIN clientes c ON c.fecha_registro >= CURRENT_DATE - INTERVAL '7 days'
    WHERE p.fecha_pedido >= CURRENT_DATE - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
        'Este Mes' as periodo,
        COUNT(p.id) as total_pedidos,
        COALESCE(SUM(p.total_usd), 0) as ventas_totales,
        COALESCE(SUM(
            CASE 
                WHEN p.metodo_pago = 'Contado' THEN p.total_usd
                WHEN p.es_pago_mixto THEN (p.monto_mixto_usd + p.monto_mixto_ves / COALESCE(p.tasa_bcv, 1))
                WHEN p.es_abono THEN COALESCE(p.total_abono_usd, p.monto_abono_usd, 0)
                ELSE 0
            END
        ), 0) as ingresos_reales,
        COUNT(DISTINCT c.id) as clientes_activos
    FROM pedidos p
    LEFT JOIN clientes c ON c.fecha_registro >= CURRENT_DATE - INTERVAL '30 days'
    WHERE p.fecha_pedido >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT 
    periodo,
    total_pedidos,
    ROUND(ventas_totales, 2) as ventas_totales,
    ROUND(ingresos_reales, 2) as ingresos_reales,
    clientes_activos
FROM resumen_periodos
ORDER BY 
    CASE periodo 
        WHEN 'Hoy' THEN 1
        WHEN 'Esta Semana' THEN 2
        WHEN 'Este Mes' THEN 3
    END;

-- =====================================================
-- 13. VERIFICAR FECHAS DE LOS DATOS
-- =====================================================

-- Rango de fechas de pedidos
SELECT 
    'Rango Fechas Pedidos' as metrica,
    MIN(fecha_pedido) as fecha_mas_antigua,
    MAX(fecha_pedido) as fecha_mas_reciente,
    COUNT(*) as total_pedidos
FROM pedidos;

-- Rango de fechas de clientes
SELECT 
    'Rango Fechas Clientes' as metrica,
    MIN(fecha_registro) as fecha_mas_antigua,
    MAX(fecha_registro) as fecha_mas_reciente,
    COUNT(*) as total_clientes
FROM clientes;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

