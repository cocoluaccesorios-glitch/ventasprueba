-- Script SQL para actualizar la tabla clientes con la columna activo
-- Ejecutar en el editor SQL de Supabase

-- Agregar columna activo a la tabla clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true;

-- Agregar columna fecha_registro si no existe
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS fecha_registro timestamp with time zone DEFAULT now();

-- Comentarios para documentar las nuevas columnas
COMMENT ON COLUMN clientes.activo IS 'Indica si el cliente está activo (true) o inactivo (false)';
COMMENT ON COLUMN clientes.fecha_registro IS 'Fecha y hora de registro del cliente';

-- Verificar que las columnas se crearon correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name IN ('activo', 'fecha_registro')
ORDER BY column_name;
