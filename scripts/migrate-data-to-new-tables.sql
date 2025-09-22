-- =====================================================
-- MIGRAR DATOS EXISTENTES A LAS NUEVAS TABLAS
-- =====================================================
-- Ejecutar este script DESPUÉS de crear las tablas faltantes

-- 1. MIGRAR ABONOS EXISTENTES
-- =====================================================
-- Insertar abonos basados en datos existentes de la tabla pedidos

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
)
SELECT 
    p.id as pedido_id,
    p.cliente_id,
    CASE 
        -- Si es abono simple en USD (efectivo, zelle)
        WHEN p.tipo_pago_abono = 'simple' AND (
            p.metodo_pago_abono ILIKE '%efectivo%' OR 
            p.metodo_pago_abono ILIKE '%zelle%'
        ) THEN COALESCE(p.monto_abono_simple, 0)
        
        -- Si es abono simple en VES (pago móvil, transferencia)
        WHEN p.tipo_pago_abono = 'simple' AND (
            p.metodo_pago_abono ILIKE '%pago%' OR 
            p.metodo_pago_abono ILIKE '%transferencia%'
        ) THEN COALESCE(p.monto_abono_simple, 0) / COALESCE(p.tasa_bcv, 166.58)
        
        -- Si es abono mixto
        WHEN p.tipo_pago_abono = 'mixto' THEN 
            COALESCE(p.monto_abono_usd, 0) + (COALESCE(p.monto_abono_ves, 0) / COALESCE(p.tasa_bcv, 166.58))
        
        -- Si no tiene tipo_pago_abono pero es abono, usar monto_abono_simple
        WHEN p.tipo_pago_abono IS NULL AND (
            p.metodo_pago = 'Abono' OR p.es_abono = true
        ) THEN COALESCE(p.monto_abono_simple, 0)
        
        -- Si tiene total_abono_usd, usarlo
        WHEN p.total_abono_usd > 0 THEN p.total_abono_usd
        
        ELSE 0
    END as monto_abono_usd,
    
    CASE 
        -- Si es abono simple en USD (efectivo, zelle)
        WHEN p.tipo_pago_abono = 'simple' AND (
            p.metodo_pago_abono ILIKE '%efectivo%' OR 
            p.metodo_pago_abono ILIKE '%zelle%'
        ) THEN COALESCE(p.monto_abono_simple, 0) * COALESCE(p.tasa_bcv, 166.58)
        
        -- Si es abono simple en VES (pago móvil, transferencia)
        WHEN p.tipo_pago_abono = 'simple' AND (
            p.metodo_pago_abono ILIKE '%pago%' OR 
            p.metodo_pago_abono ILIKE '%transferencia%'
        ) THEN COALESCE(p.monto_abono_simple, 0)
        
        -- Si es abono mixto
        WHEN p.tipo_pago_abono = 'mixto' THEN 
            COALESCE(p.monto_abono_usd, 0) * COALESCE(p.tasa_bcv, 166.58) + COALESCE(p.monto_abono_ves, 0)
        
        -- Si no tiene tipo_pago_abono pero es abono, usar monto_abono_simple
        WHEN p.tipo_pago_abono IS NULL AND (
            p.metodo_pago = 'Abono' OR p.es_abono = true
        ) THEN COALESCE(p.monto_abono_simple, 0) * COALESCE(p.tasa_bcv, 166.58)
        
        -- Si tiene total_abono_usd, convertirlo a VES
        WHEN p.total_abono_usd > 0 THEN p.total_abono_usd * COALESCE(p.tasa_bcv, 166.58)
        
        ELSE 0
    END as monto_abono_ves,
    
    COALESCE(p.tasa_bcv, 166.58) as tasa_bcv,
    COALESCE(p.metodo_pago_abono, 'efectivo') as metodo_pago_abono,
    p.referencia_pago,
    COALESCE(p.tipo_pago_abono, 'simple') as tipo_abono,
    p.fecha_vencimiento,
    'confirmado' as estado_abono,
    'Migrado desde pedido #' || p.id as comentarios

FROM pedidos p
WHERE (
    p.metodo_pago = 'Abono' 
    OR p.es_abono = true 
    OR p.tipo_pago_abono IS NOT NULL
)
AND (
    -- Solo insertar si hay algún monto de abono
    COALESCE(p.monto_abono_simple, 0) > 0
    OR COALESCE(p.monto_abono_usd, 0) > 0
    OR COALESCE(p.monto_abono_ves, 0) > 0
    OR COALESCE(p.total_abono_usd, 0) > 0
)
-- Evitar duplicados
AND NOT EXISTS (
    SELECT 1 FROM abonos a WHERE a.pedido_id = p.id
);

-- 2. MIGRAR TASAS BCV EXISTENTES
-- =====================================================
-- Insertar tasas BCV basadas en los pedidos existentes

INSERT INTO tasa_cambio (fecha, tasa_bcv)
SELECT DISTINCT
    DATE(p.fecha_pedido) as fecha,
    p.tasa_bcv
FROM pedidos p
WHERE p.tasa_bcv IS NOT NULL
AND p.tasa_bcv > 0
-- Evitar duplicados
AND NOT EXISTS (
    SELECT 1 FROM tasa_cambio t WHERE t.fecha = DATE(p.fecha_pedido)
)
ORDER BY fecha;

-- 3. ACTUALIZAR CATEGORÍAS DE PRODUCTOS
-- =====================================================
-- Asignar categorías básicas a productos existentes

UPDATE productos 
SET categoria_id = (
    CASE 
        WHEN nombre ILIKE '%coca%' OR nombre ILIKE '%bebida%' OR nombre ILIKE '%refresco%' 
        THEN (SELECT id FROM categorias WHERE nombre = 'Bebidas' LIMIT 1)
        
        WHEN nombre ILIKE '%alimento%' OR nombre ILIKE '%comida%' OR nombre ILIKE '%pan%'
        THEN (SELECT id FROM categorias WHERE nombre = 'Alimentos' LIMIT 1)
        
        WHEN nombre ILIKE '%limpieza%' OR nombre ILIKE '%jabón%' OR nombre ILIKE '%detergente%'
        THEN (SELECT id FROM categorias WHERE nombre = 'Limpieza' LIMIT 1)
        
        ELSE (SELECT id FROM categorias WHERE nombre = 'Otros' LIMIT 1)
    END
)
WHERE categoria_id IS NULL;

-- 4. VERIFICAR MIGRACIÓN
-- =====================================================
SELECT 
    'Resumen de migración' as seccion,
    (SELECT COUNT(*) FROM abonos) as abonos_migrados,
    (SELECT COUNT(*) FROM tasa_cambio) as tasas_migradas,
    (SELECT COUNT(*) FROM productos WHERE categoria_id IS NOT NULL) as productos_con_categoria;

-- 5. MOSTRAR ABONOS MIGRADOS
-- =====================================================
SELECT 
    'Abonos migrados' as tipo,
    a.id,
    a.pedido_id,
    a.monto_abono_usd,
    a.monto_abono_ves,
    a.metodo_pago_abono,
    a.tipo_abono,
    a.fecha_abono
FROM abonos a
ORDER BY a.pedido_id;

-- 6. MOSTRAR TASAS MIGRADAS
-- =====================================================
SELECT 
    'Tasas migradas' as tipo,
    t.id,
    t.fecha,
    t.tasa_bcv,
    t.created_at
FROM tasa_cambio t
ORDER BY t.fecha DESC;

-- 7. VERIFICAR SALDOS PENDIENTES
-- =====================================================
SELECT 
    'Verificación de saldos' as tipo,
    p.id as pedido_id,
    p.cliente_nombre,
    p.total_usd,
    COALESCE(SUM(a.monto_abono_usd), 0) as total_abonado,
    calcular_saldo_pendiente(p.id) as saldo_pendiente
FROM pedidos p
LEFT JOIN abonos a ON a.pedido_id = p.id AND a.estado_abono = 'confirmado'
WHERE p.estado_entrega != 'anulado'
GROUP BY p.id, p.cliente_nombre, p.total_usd
HAVING calcular_saldo_pendiente(p.id) > 0
ORDER BY p.id;

-- 8. MENSAJE FINAL
-- =====================================================
SELECT 
    '🎉 ¡MIGRACIÓN COMPLETADA!' as resultado,
    'Los datos han sido migrados exitosamente a las nuevas tablas' as mensaje,
    'Ahora puedes usar el sistema de abonos y BCV correctamente' as siguiente_paso;
