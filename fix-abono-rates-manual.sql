-- =====================================================
-- SCRIPT PARA CORREGIR TASAS BCV EN PEDIDOS DE ABONO
-- =====================================================
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Buscar pedidos de abono con tasa BCV = 160
SELECT 
    id,
    metodo_pago,
    es_abono,
    tipo_pago_abono,
    tasa_bcv,
    total_usd,
    fecha_pedido
FROM pedidos 
WHERE (
    metodo_pago = 'Abono' 
    OR es_abono = true 
    OR tipo_pago_abono IS NOT NULL
) 
AND tasa_bcv = 160
ORDER BY id DESC;

-- 2. Actualizar pedidos de abono con tasa BCV = 160 a 166.58
UPDATE pedidos 
SET tasa_bcv = 166.58 
WHERE (
    metodo_pago = 'Abono' 
    OR es_abono = true 
    OR tipo_pago_abono IS NOT NULL
) 
AND tasa_bcv = 160;

-- 3. Actualizar pedidos de abono con tasa BCV nula a 166.58
UPDATE pedidos 
SET tasa_bcv = 166.58 
WHERE (
    metodo_pago = 'Abono' 
    OR es_abono = true 
    OR tipo_pago_abono IS NOT NULL
) 
AND tasa_bcv IS NULL;

-- 4. Verificar los cambios
SELECT 
    id,
    metodo_pago,
    es_abono,
    tipo_pago_abono,
    tasa_bcv,
    total_usd,
    (total_usd * tasa_bcv) as total_ves
FROM pedidos 
WHERE (
    metodo_pago = 'Abono' 
    OR es_abono = true 
    OR tipo_pago_abono IS NOT NULL
)
ORDER BY id DESC
LIMIT 10;

-- 5. Contar pedidos de abono actualizados
SELECT 
    COUNT(*) as total_pedidos_abono_actualizados,
    'Pedidos de abono con tasa BCV = 166.58' as descripcion
FROM pedidos 
WHERE (
    metodo_pago = 'Abono' 
    OR es_abono = true 
    OR tipo_pago_abono IS NOT NULL
) 
AND tasa_bcv = 166.58;
