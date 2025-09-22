-- =====================================================
-- DIAGNÓSTICO DE OVERFLOW NUMÉRICO
-- =====================================================

-- PASO 1: VERIFICAR TIPOS DE DATOS ACTUALES
SELECT 
    'Tipos de datos actuales' as seccion,
    column_name,
    data_type,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_name IN ('pedidos', 'abonos', 'tasa_cambio')
AND column_name LIKE '%usd%' OR column_name LIKE '%ves%' OR column_name LIKE '%tasa%'
ORDER BY table_name, column_name;

-- PASO 2: VERIFICAR VALORES MÁXIMOS QUE PUEDEN CAUSAR OVERFLOW
SELECT
    'Valores máximos actuales' as seccion,
    (SELECT pg_typeof(total_usd)::text FROM pedidos LIMIT 1) AS pedidos_total_usd_type,
    (SELECT pg_typeof(total_abono_usd)::text FROM pedidos LIMIT 1) AS pedidos_total_abono_usd_type,
    (SELECT MAX(total_usd) FROM pedidos) AS max_total_usd,
    (SELECT MAX(total_abono_usd) FROM pedidos) AS max_total_abono_usd,
    (SELECT MAX((COALESCE(total_abono_usd,0) * 166.58)) FROM pedidos) AS max_calc_abono_ves;

-- PASO 3: VERIFICAR SI EXISTEN VALORES QUE CAUSARÍAN OVERFLOW
SELECT 
    'Valores que causarían overflow en DECIMAL(10,2)' as seccion,
    id,
    total_abono_usd,
    total_abono_usd * 166.58 AS monto_abono_ves_calc
FROM pedidos 
WHERE total_abono_usd * 166.58 > 99999999.99
ORDER BY total_abono_usd DESC;

-- PASO 4: VERIFICAR SI EXISTEN VALORES QUE CAUSARÍAN OVERFLOW EN DECIMAL(12,2)
SELECT 
    'Valores que causarían overflow en DECIMAL(12,2)' as seccion,
    id,
    total_abono_usd,
    total_abono_usd * 166.58 AS monto_abono_ves_calc
FROM pedidos 
WHERE total_abono_usd * 166.58 > 9999999999.99
ORDER BY total_abono_usd DESC;

-- PASO 5: VERIFICAR ESTRUCTURA ACTUAL DE TABLAS
SELECT 
    'Estructura actual de tablas' as seccion,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('pedidos', 'abonos', 'tasa_cambio')
ORDER BY table_name, ordinal_position;

-- PASO 6: VERIFICAR SI LAS TABLAS EXISTEN
SELECT 
    'Verificación de existencia de tablas' as seccion,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('pedidos', 'abonos', 'tasa_cambio')
ORDER BY table_name;
