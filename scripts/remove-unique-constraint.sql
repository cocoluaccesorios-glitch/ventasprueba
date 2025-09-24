-- =====================================================
-- ELIMINAR RESTRICCIÓN DE CLAVE ÚNICA EN FECHA
-- Esto permitirá múltiples tasas por día
-- =====================================================

-- Paso 1: Eliminar la restricción de clave única en fecha
ALTER TABLE tasa_cambio DROP CONSTRAINT IF EXISTS tasa_cambio_fecha_key;

-- Paso 2: Verificar que se eliminó la restricción
SELECT 
    'Restricción de clave única eliminada exitosamente' as mensaje,
    COUNT(*) as registros_existentes
FROM tasa_cambio;

-- Paso 3: Probar inserción de múltiples tasas para el mismo día
INSERT INTO tasa_cambio (fecha, fecha_hora, tasa_bcv)
VALUES (CURRENT_DATE, NOW(), 170.5000);

-- Paso 4: Verificar que se insertó correctamente
SELECT 
    'Nueva tasa insertada exitosamente' as mensaje,
    COUNT(*) as total_registros_hoy
FROM tasa_cambio
WHERE fecha = CURRENT_DATE;
