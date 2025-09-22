-- =====================================================
-- CREAR TABLA TASA_CAMBIO PARA EL SCRAPER DEL BCV
-- =====================================================

-- Crear tabla tasa_cambio si no existe
CREATE TABLE IF NOT EXISTS tasa_cambio (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    tasa_bcv DECIMAL(10,8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_tasa_cambio_fecha ON tasa_cambio(fecha DESC);

-- Crear índice para obtener la tasa más reciente
CREATE INDEX IF NOT EXISTS idx_tasa_cambio_created_at ON tasa_cambio(created_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_tasa_cambio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_tasa_cambio_updated_at ON tasa_cambio;
CREATE TRIGGER trigger_update_tasa_cambio_updated_at
    BEFORE UPDATE ON tasa_cambio
    FOR EACH ROW
    EXECUTE FUNCTION update_tasa_cambio_updated_at();

-- Insertar una tasa inicial si no existe
INSERT INTO tasa_cambio (fecha, tasa_bcv)
SELECT CURRENT_DATE, 166.58
WHERE NOT EXISTS (
    SELECT 1 FROM tasa_cambio 
    WHERE fecha = CURRENT_DATE
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE tasa_cambio ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura
CREATE POLICY "Allow read access to tasa_cambio" ON tasa_cambio
    FOR SELECT USING (true);

-- Política para permitir inserción
CREATE POLICY "Allow insert access to tasa_cambio" ON tasa_cambio
    FOR INSERT WITH CHECK (true);

-- Política para permitir actualización
CREATE POLICY "Allow update access to tasa_cambio" ON tasa_cambio
    FOR UPDATE USING (true);

-- Comentarios para documentación
COMMENT ON TABLE tasa_cambio IS 'Tabla para almacenar las tasas de cambio del BCV obtenidas por web scraping';
COMMENT ON COLUMN tasa_cambio.fecha IS 'Fecha de la tasa de cambio';
COMMENT ON COLUMN tasa_cambio.tasa_bcv IS 'Tasa de cambio BCV en Bs/USD';
COMMENT ON COLUMN tasa_cambio.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN tasa_cambio.updated_at IS 'Fecha y hora de última actualización';

-- Verificar que la tabla se creó correctamente
SELECT 
    'Tabla tasa_cambio creada exitosamente' as mensaje,
    COUNT(*) as registros_existentes
FROM tasa_cambio;
