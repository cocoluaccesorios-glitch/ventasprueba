-- =====================================================
-- SCRIPT PARA CORREGIR TASAS BCV EN PEDIDOS EXISTENTES
-- =====================================================
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Actualizar pedidos con tasa BCV = 160 a 166.58
UPDATE pedidos 
SET tasa_bcv = 166.58 
WHERE tasa_bcv = 160;

-- 2. Actualizar pedidos con tasa BCV nula a 166.58
UPDATE pedidos 
SET tasa_bcv = 166.58 
WHERE tasa_bcv IS NULL;

-- 3. Verificar los cambios
SELECT 
    id,
    fecha_pedido,
    total_usd,
    tasa_bcv,
    (total_usd * tasa_bcv) as total_ves
FROM pedidos 
WHERE tasa_bcv = 166.58
ORDER BY id DESC
LIMIT 10;

-- 4. Contar pedidos actualizados
SELECT 
    COUNT(*) as total_pedidos_actualizados,
    'Pedidos con tasa BCV = 166.58' as descripcion
FROM pedidos 
WHERE tasa_bcv = 166.58;
