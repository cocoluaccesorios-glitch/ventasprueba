-- =====================================================
-- ACTUALIZAR TABLA TASA_CAMBIO PARA SOPORTAR MÚLTIPLES TASAS POR DÍA
-- =====================================================

-- Agregar columna fecha_hora para diferenciar tasas del mismo día
ALTER TABLE tasa_cambio 
ADD COLUMN IF NOT EXISTS fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear índice para búsquedas por fecha_hora
CREATE INDEX IF NOT EXISTS idx_tasa_cambio_fecha_hora ON tasa_cambio(fecha_hora DESC);

-- Crear índice compuesto para obtener la tasa más reciente por fecha
CREATE INDEX IF NOT EXISTS idx_tasa_cambio_fecha_hora_desc ON tasa_cambio(fecha DESC, fecha_hora DESC);

-- Función para obtener la tasa más reciente del día
CREATE OR REPLACE FUNCTION get_latest_tasa_bcv_today()
RETURNS DECIMAL(10,8) AS $$
DECLARE
    latest_tasa DECIMAL(10,8);
BEGIN
    SELECT tasa_bcv INTO latest_tasa
    FROM tasa_cambio
    WHERE fecha = CURRENT_DATE
    ORDER BY fecha_hora DESC
    LIMIT 1;
    
    RETURN COALESCE(latest_tasa, 0);
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si existe una tasa diferente hoy
CREATE OR REPLACE FUNCTION check_tasa_different_today(new_tasa DECIMAL(10,8))
RETURNS BOOLEAN AS $$
DECLARE
    latest_tasa DECIMAL(10,8);
BEGIN
    SELECT tasa_bcv INTO latest_tasa
    FROM tasa_cambio
    WHERE fecha = CURRENT_DATE
    ORDER BY fecha_hora DESC
    LIMIT 1;
    
    -- Si no hay tasa hoy, es diferente
    IF latest_tasa IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Si la tasa es diferente (con tolerancia de 0.01), es diferente
    RETURN ABS(latest_tasa - new_tasa) > 0.01;
END;
$$ LANGUAGE plpgsql;

-- Función para insertar nueva tasa con verificación
CREATE OR REPLACE FUNCTION insert_tasa_bcv_if_different(new_tasa DECIMAL(10,8))
RETURNS INTEGER AS $$
DECLARE
    inserted_id INTEGER;
BEGIN
    -- Solo insertar si la tasa es diferente
    IF check_tasa_different_today(new_tasa) THEN
        INSERT INTO tasa_cambio (fecha, fecha_hora, tasa_bcv)
        VALUES (CURRENT_DATE, NOW(), new_tasa)
        RETURNING id INTO inserted_id;
        
        RETURN inserted_id;
    ELSE
        -- Retornar el ID de la tasa existente
        SELECT id INTO inserted_id
        FROM tasa_cambio
        WHERE fecha = CURRENT_DATE
        ORDER BY fecha_hora DESC
        LIMIT 1;
        
        RETURN inserted_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Actualizar registros existentes que no tengan fecha_hora
UPDATE tasa_cambio 
SET fecha_hora = created_at 
WHERE fecha_hora IS NULL;

-- Comentarios actualizados
COMMENT ON COLUMN tasa_cambio.fecha_hora IS 'Fecha y hora exacta de la tasa de cambio (permite múltiples tasas por día)';
COMMENT ON FUNCTION get_latest_tasa_bcv_today() IS 'Obtiene la tasa BCV más reciente del día actual';
COMMENT ON FUNCTION check_tasa_different_today(DECIMAL) IS 'Verifica si una tasa es diferente a la más reciente del día';
COMMENT ON FUNCTION insert_tasa_bcv_if_different(DECIMAL) IS 'Inserta una nueva tasa solo si es diferente a la actual';

-- Verificar la estructura actualizada
SELECT 
    'Tabla tasa_cambio actualizada exitosamente' as mensaje,
    COUNT(*) as registros_existentes,
    COUNT(DISTINCT fecha) as dias_diferentes,
    COUNT(CASE WHEN fecha = CURRENT_DATE THEN 1 END) as tasas_hoy
FROM tasa_cambio;
