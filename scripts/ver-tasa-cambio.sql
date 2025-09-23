-- =====================================================
-- SCRIPT PARA VERIFICAR LA BASE DE DATOS DE TASA DE CAMBIO
-- =====================================================

-- 1. Verificar si existe la tabla tasa_cambio
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'tasa_cambio';

-- 2. Ver la estructura de la tabla tasa_cambio (si existe)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tasa_cambio'
ORDER BY ordinal_position;

-- 3. Ver todos los registros de tasa de cambio
SELECT 
    id,
    fecha,
    tasa_bcv,
    fuente,
    created_at,
    updated_at
FROM tasa_cambio
ORDER BY fecha DESC, id DESC;

-- 4. Ver la tasa más reciente
SELECT 
    id,
    fecha,
    tasa_bcv,
    fuente,
    created_at
FROM tasa_cambio
ORDER BY fecha DESC, id DESC
LIMIT 1;

-- 5. Ver tasas por fuente
SELECT 
    fuente,
    COUNT(*) as cantidad_registros,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente,
    AVG(tasa_bcv) as tasa_promedio
FROM tasa_cambio
GROUP BY fuente
ORDER BY cantidad_registros DESC;

-- 6. Ver tasas del último mes
SELECT 
    fecha,
    tasa_bcv,
    fuente,
    created_at
FROM tasa_cambio
WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY fecha DESC;

-- 7. Ver tasas por día (últimos 7 días)
SELECT 
    fecha,
    COUNT(*) as registros_por_dia,
    AVG(tasa_bcv) as tasa_promedio,
    MIN(tasa_bcv) as tasa_minima,
    MAX(tasa_bcv) as tasa_maxima
FROM tasa_cambio
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY fecha
ORDER BY fecha DESC;

-- 8. Verificar si hay tasas duplicadas para la misma fecha
SELECT 
    fecha,
    COUNT(*) as registros_duplicados,
    STRING_AGG(DISTINCT fuente, ', ') as fuentes
FROM tasa_cambio
GROUP BY fecha
HAVING COUNT(*) > 1
ORDER BY fecha DESC;

-- 9. Ver estadísticas generales
SELECT 
    COUNT(*) as total_registros,
    COUNT(DISTINCT fecha) as dias_con_registros,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente,
    MIN(tasa_bcv) as tasa_minima,
    MAX(tasa_bcv) as tasa_maxima,
    AVG(tasa_bcv) as tasa_promedio,
    STDDEV(tasa_bcv) as desviacion_estandar
FROM tasa_cambio;

-- 10. Ver tasas de hoy (si existen)
SELECT 
    id,
    fecha,
    tasa_bcv,
    fuente,
    created_at
FROM tasa_cambio
WHERE fecha = CURRENT_DATE
ORDER BY created_at DESC;

-- =====================================================
-- COMANDOS ADICIONALES PARA LIMPIEZA (OPCIONAL)
-- =====================================================

-- Eliminar registros duplicados (mantener el más reciente)
-- DELETE FROM tasa_cambio 
-- WHERE id NOT IN (
--     SELECT MAX(id) 
--     FROM tasa_cambio 
--     GROUP BY fecha
-- );

-- Eliminar registros muy antiguos (más de 1 año)
-- DELETE FROM tasa_cambio 
-- WHERE fecha < CURRENT_DATE - INTERVAL '1 year';

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================
/*
Para ejecutar este script:

1. Conecta a tu base de datos de Supabase
2. Ejecuta cada consulta por separado
3. Revisa los resultados para entender el estado de la tabla

Si la tabla no existe, puedes crearla con:
CREATE TABLE tasa_cambio (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    tasa_bcv DECIMAL(10,4) NOT NULL,
    fuente VARCHAR(50) DEFAULT 'bcv_web_scraper',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

Para agregar índices:
CREATE INDEX idx_tasa_cambio_fecha ON tasa_cambio(fecha);
CREATE INDEX idx_tasa_cambio_fuente ON tasa_cambio(fuente);
*/
