-- =====================================================
-- SCRIPT PARA CORREGIR COMPLETAMENTE LOS PEDIDOS DE ABONO
-- =====================================================
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Verificar pedidos de abono actuales
SELECT 
    id,
    metodo_pago,
    es_abono,
    tipo_pago_abono,
    tasa_bcv,
    total_usd,
    total_abono_usd,
    monto_abono_simple,
    monto_abono_usd,
    monto_abono_ves,
    (total_usd - COALESCE(total_abono_usd, 0)) as saldo_pendiente,
    (total_usd * tasa_bcv) as total_ves_actual
FROM pedidos 
WHERE (
    metodo_pago = 'Abono' 
    OR es_abono = true 
    OR tipo_pago_abono IS NOT NULL
)
ORDER BY id DESC;

-- 2. Corregir la tasa BCV de 160 a 166.58
UPDATE pedidos 
SET tasa_bcv = 166.58 
WHERE (
    metodo_pago = 'Abono' 
    OR es_abono = true 
    OR tipo_pago_abono IS NOT NULL
) 
AND tasa_bcv = 160;

-- 3. Corregir el total_abono_usd para pedidos de abono simple
UPDATE pedidos 
SET total_abono_usd = CASE 
    -- Si es pago simple en USD (efectivo, zelle)
    WHEN tipo_pago_abono = 'simple' AND (
        metodo_pago_abono ILIKE '%efectivo%' OR 
        metodo_pago_abono ILIKE '%zelle%'
    ) THEN COALESCE(monto_abono_simple, 0)
    
    -- Si es pago simple en VES (pago móvil, transferencia)
    WHEN tipo_pago_abono = 'simple' AND (
        metodo_pago_abono ILIKE '%pago%' OR 
        metodo_pago_abono ILIKE '%transferencia%'
    ) THEN COALESCE(monto_abono_simple, 0) / 166.58
    
    -- Si es pago mixto
    WHEN tipo_pago_abono = 'mixto' THEN 
        COALESCE(monto_abono_usd, 0) + (COALESCE(monto_abono_ves, 0) / 166.58)
    
    -- Si no tiene tipo_pago_abono pero es abono, usar monto_abono_simple
    WHEN tipo_pago_abono IS NULL AND (
        metodo_pago = 'Abono' OR es_abono = true
    ) THEN COALESCE(monto_abono_simple, 0)
    
    ELSE COALESCE(total_abono_usd, 0)
END
WHERE (
    metodo_pago = 'Abono' 
    OR es_abono = true 
    OR tipo_pago_abono IS NOT NULL
);

-- 4. Verificar los cambios realizados
SELECT 
    id,
    metodo_pago,
    es_abono,
    tipo_pago_abono,
    tasa_bcv,
    total_usd,
    total_abono_usd,
    monto_abono_simple,
    monto_abono_usd,
    monto_abono_ves,
    (total_usd - COALESCE(total_abono_usd, 0)) as saldo_pendiente,
    (total_usd * tasa_bcv) as total_ves_corregido,
    CASE 
        WHEN (total_usd - COALESCE(total_abono_usd, 0)) <= 0.01 THEN 'PAGADO'
        ELSE '$' || (total_usd - COALESCE(total_abono_usd, 0))::text
    END as debe_calculado
FROM pedidos 
WHERE (
    metodo_pago = 'Abono' 
    OR es_abono = true 
    OR tipo_pago_abono IS NOT NULL
)
ORDER BY id DESC;

-- 5. Resumen de correcciones
SELECT 
    COUNT(*) as total_pedidos_abono,
    COUNT(CASE WHEN tasa_bcv = 166.58 THEN 1 END) as pedidos_tasa_corregida,
    COUNT(CASE WHEN total_abono_usd > 0 THEN 1 END) as pedidos_con_abono,
    COUNT(CASE WHEN (total_usd - COALESCE(total_abono_usd, 0)) <= 0.01 THEN 1 END) as pedidos_pagados,
    COUNT(CASE WHEN (total_usd - COALESCE(total_abono_usd, 0)) > 0.01 THEN 1 END) as pedidos_con_saldo
FROM pedidos 
WHERE (
    metodo_pago = 'Abono' 
    OR es_abono = true 
    OR tipo_pago_abono IS NOT NULL
);
