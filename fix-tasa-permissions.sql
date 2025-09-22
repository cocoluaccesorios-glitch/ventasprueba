-- =====================================================
-- SOLUCIONAR PERMISOS DE LA TABLA TASA_CAMBIO
-- =====================================================

-- Verificar el estado actual de la tabla
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename = 'tasa_cambio';

-- Verificar permisos actuales
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'tasa_cambio';

-- Deshabilitar RLS completamente
ALTER TABLE tasa_cambio DISABLE ROW LEVEL SECURITY;

-- Otorgar permisos explícitos
GRANT ALL ON TABLE tasa_cambio TO anon;
GRANT ALL ON TABLE tasa_cambio TO authenticated;
GRANT ALL ON TABLE tasa_cambio TO service_role;

-- Otorgar permisos en la secuencia
GRANT ALL ON SEQUENCE tasa_cambio_id_seq TO anon;
GRANT ALL ON SEQUENCE tasa_cambio_id_seq TO authenticated;
GRANT ALL ON SEQUENCE tasa_cambio_id_seq TO service_role;

-- Verificar que los permisos se otorgaron
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'tasa_cambio';

-- Insertar una tasa de prueba
INSERT INTO tasa_cambio (fecha, tasa_bcv) 
VALUES (CURRENT_DATE, 166.58)
ON CONFLICT (fecha) DO UPDATE SET 
    tasa_bcv = EXCLUDED.tasa_bcv,
    updated_at = NOW();

-- Verificar que se insertó correctamente
SELECT * FROM tasa_cambio ORDER BY created_at DESC LIMIT 5;

