-- =====================================================
-- ACTUALIZAR TABLA TASA_CAMBIO PARA SOPORTAR MÚLTIPLES TASAS POR DÍA
-- =====================================================

-- Paso 1: Agregar columna fecha_hora para diferenciar tasas del mismo día
ALTER TABLE tasa_cambio 
ADD COLUMN IF NOT EXISTS fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Paso 2: Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_tasa_cambio_fecha_hora ON tasa_cambio(fecha_hora DESC);
CREATE INDEX IF NOT EXISTS idx_tasa_cambio_fecha_hora_desc ON tasa_cambio(fecha DESC, fecha_hora DESC);

-- Paso 3: Actualizar registros existentes que no tengan fecha_hora
UPDATE tasa_cambio 
SET fecha_hora = NOW() - INTERVAL '1 day' * (id % 7)
WHERE fecha_hora IS NULL;

-- Paso 4: Función para obtener la tasa más reciente del día
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

-- Paso 5: Función para verificar si existe una tasa diferente hoy
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

-- Paso 6: Función para insertar nueva tasa con verificación automática
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

-- Paso 7: Función para verificar y actualizar tasa automáticamente
CREATE OR REPLACE FUNCTION verificar_y_actualizar_tasa_bcv(new_tasa DECIMAL(10,8))
RETURNS JSON AS $$
DECLARE
    resultado JSON;
    tasa_existente DECIMAL(10,8);
    diferencia DECIMAL(10,8);
    tolerancia DECIMAL(10,8) := 0.01;
    nueva_tasa_id INTEGER;
BEGIN
    -- Obtener la tasa más reciente de hoy
    SELECT tasa_bcv INTO tasa_existente
    FROM tasa_cambio
    WHERE fecha = CURRENT_DATE
    ORDER BY fecha_hora DESC
    LIMIT 1;
    
    -- Si no hay tasa para hoy
    IF tasa_existente IS NULL THEN
        INSERT INTO tasa_cambio (fecha, fecha_hora, tasa_bcv)
        VALUES (CURRENT_DATE, NOW(), new_tasa)
        RETURNING id INTO nueva_tasa_id;
        
        resultado := json_build_object(
            'success', true,
            'action', 'inserted',
            'tasa', new_tasa,
            'id', nueva_tasa_id
        );
        
    ELSE
        -- Calcular diferencia
        diferencia := ABS(tasa_existente - new_tasa);
        
        -- Si la tasa es diferente
        IF diferencia > tolerancia THEN
            INSERT INTO tasa_cambio (fecha, fecha_hora, tasa_bcv)
            VALUES (CURRENT_DATE, NOW(), new_tasa)
            RETURNING id INTO nueva_tasa_id;
            
            resultado := json_build_object(
                'success', true,
                'action', 'updated',
                'tasa', new_tasa,
                'tasa_anterior', tasa_existente,
                'diferencia', diferencia,
                'id', nueva_tasa_id
            );
            
        ELSE
            -- La tasa es la misma
            SELECT id INTO nueva_tasa_id
            FROM tasa_cambio
            WHERE fecha = CURRENT_DATE
            ORDER BY fecha_hora DESC
            LIMIT 1;
            
            resultado := json_build_object(
                'success', true,
                'action', 'unchanged',
                'tasa', tasa_existente,
                'id', nueva_tasa_id
            );
        END IF;
    END IF;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- Paso 8: Comentarios para documentación
COMMENT ON COLUMN tasa_cambio.fecha_hora IS 'Fecha y hora exacta de la tasa de cambio (permite múltiples tasas por día)';
COMMENT ON FUNCTION get_latest_tasa_bcv_today() IS 'Obtiene la tasa BCV más reciente del día actual';
COMMENT ON FUNCTION check_tasa_different_today(DECIMAL) IS 'Verifica si una tasa es diferente a la más reciente del día';
COMMENT ON FUNCTION insert_tasa_bcv_if_different(DECIMAL) IS 'Inserta una nueva tasa solo si es diferente a la actual';
COMMENT ON FUNCTION verificar_y_actualizar_tasa_bcv(DECIMAL) IS 'Función principal para verificar y actualizar tasa BCV automáticamente';

-- Paso 9: Verificar que la tabla se actualizó correctamente
SELECT 
    'Tabla tasa_cambio actualizada exitosamente' as mensaje,
    COUNT(*) as registros_existentes,
    COUNT(DISTINCT fecha) as dias_diferentes,
    COUNT(CASE WHEN fecha = CURRENT_DATE THEN 1 END) as tasas_hoy,
    COUNT(CASE WHEN fecha_hora IS NOT NULL THEN 1 END) as registros_con_fecha_hora
FROM tasa_cambio;

-- Paso 10: Probar la función principal
SELECT verificar_y_actualizar_tasa_bcv(169.9761) as resultado_prueba;
