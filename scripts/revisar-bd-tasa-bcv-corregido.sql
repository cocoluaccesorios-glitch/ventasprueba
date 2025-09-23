-- =====================================================
-- SCRIPT SQL PARA REVISAR BASE DE DATOS TASA BCV
-- =====================================================
-- Fecha: 2025-09-23
-- Estructura real: id, fecha, tasa_bcv
-- =====================================================

-- 1. Verificar existencia de la tabla
SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'tasa_cambio'
) AS tabla_existe;

-- 2. Estructura de la tabla tasa_cambio
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'tasa_cambio' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Todos los registros de tasa de cambio
SELECT 
    id,
    fecha,
    tasa_bcv
FROM tasa_cambio
ORDER BY fecha DESC, id DESC;

-- 4. Tasa más reciente
SELECT 
    id,
    tasa_bcv,
    fecha
FROM tasa_cambio
ORDER BY fecha DESC, id DESC
LIMIT 1;

-- 5. Tasa de hoy (2025-09-23)
SELECT 
    id,
    tasa_bcv,
    fecha
FROM tasa_cambio
WHERE fecha = CURRENT_DATE
ORDER BY id DESC;

-- 6. Tasas de los últimos 7 días
SELECT 
    id,
    fecha,
    tasa_bcv
FROM tasa_cambio
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY fecha DESC, id DESC;

-- 7. Tasas de los últimos 30 días
SELECT 
    id,
    fecha,
    tasa_bcv
FROM tasa_cambio
WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY fecha DESC, id DESC;

-- 8. Estadísticas generales
SELECT
    COUNT(*) AS total_registros,
    COUNT(DISTINCT fecha) AS dias_con_tasa,
    MAX(tasa_bcv) AS tasa_maxima,
    MIN(tasa_bcv) AS tasa_minima,
    ROUND(AVG(tasa_bcv), 4) AS tasa_promedio,
    MAX(fecha) AS fecha_mas_reciente,
    MIN(fecha) AS fecha_mas_antigua
FROM tasa_cambio;

-- 9. Tasas por mes (últimos 6 meses)
SELECT 
    DATE_TRUNC('month', fecha) AS mes,
    COUNT(*) AS registros_mes,
    MAX(tasa_bcv) AS tasa_maxima_mes,
    MIN(tasa_bcv) AS tasa_minima_mes,
    ROUND(AVG(tasa_bcv), 4) AS tasa_promedio_mes
FROM tasa_cambio
WHERE fecha >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', fecha)
ORDER BY mes DESC;

-- 10. Verificar duplicados por fecha
SELECT 
    fecha,
    COUNT(*) AS cantidad_registros,
    STRING_AGG(id::text, ', ') AS ids_registros
FROM tasa_cambio
GROUP BY fecha
HAVING COUNT(*) > 1
ORDER BY fecha DESC;

-- 11. Tasas que cambiaron (comparando con el día anterior)
WITH tasas_con_anterior AS (
    SELECT 
        fecha,
        tasa_bcv,
        LAG(tasa_bcv) OVER (ORDER BY fecha) AS tasa_anterior,
        LAG(fecha) OVER (ORDER BY fecha) AS fecha_anterior
    FROM tasa_cambio
    ORDER BY fecha DESC
)
SELECT 
    fecha,
    tasa_bcv,
    fecha_anterior,
    tasa_anterior,
    CASE 
        WHEN tasa_anterior IS NULL THEN 'Primera tasa'
        WHEN tasa_bcv > tasa_anterior THEN 'Aumentó'
        WHEN tasa_bcv < tasa_anterior THEN 'Disminuyó'
        ELSE 'Sin cambio'
    END AS cambio,
    CASE 
        WHEN tasa_anterior IS NOT NULL 
        THEN ROUND(((tasa_bcv - tasa_anterior) / tasa_anterior) * 100, 2)
        ELSE NULL
    END AS porcentaje_cambio
FROM tasas_con_anterior
WHERE tasa_anterior IS NOT NULL
ORDER BY fecha DESC
LIMIT 10;

-- 12. Verificar integridad de datos
SELECT 
    'Registros con fecha NULL' AS problema,
    COUNT(*) AS cantidad
FROM tasa_cambio
WHERE fecha IS NULL

UNION ALL

SELECT 
    'Registros con tasa NULL' AS problema,
    COUNT(*) AS cantidad
FROM tasa_cambio
WHERE tasa_bcv IS NULL

UNION ALL

SELECT 
    'Registros con tasa <= 0' AS problema,
    COUNT(*) AS cantidad
FROM tasa_cambio
WHERE tasa_bcv <= 0

UNION ALL

SELECT 
    'Registros con tasa > 1000' AS problema,
    COUNT(*) AS cantidad
FROM tasa_cambio
WHERE tasa_bcv > 1000;

-- 13. Resumen ejecutivo
SELECT 
    'RESUMEN EJECUTIVO' AS titulo,
    '' AS separador,
    'Total de registros: ' || COUNT(*) AS total_registros,
    'Días con tasa: ' || COUNT(DISTINCT fecha) AS dias_con_tasa,
    'Tasa actual: ' || MAX(tasa_bcv) AS tasa_actual,
    'Fecha actual: ' || MAX(fecha) AS fecha_actual
FROM tasa_cambio;
