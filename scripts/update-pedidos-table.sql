-- Script SQL para actualizar la tabla pedidos con las columnas faltantes
-- Ejecutar en el editor SQL de Supabase

-- Agregar columnas para abono mixto
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_pago_abono_usd text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_pago_abono_ves text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS referencia_abono_usd text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS referencia_abono_ves text;

-- Agregar columna para detalles del pedido
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS detalles_pedido jsonb;

-- Comentarios para documentar las nuevas columnas
COMMENT ON COLUMN pedidos.metodo_pago_abono_usd IS 'Método de pago para la parte USD del abono mixto (efectivo, transferencia, zelle, etc.)';
COMMENT ON COLUMN pedidos.metodo_pago_abono_ves IS 'Método de pago para la parte VES del abono mixto (efectivo, transferencia, pago_movil, etc.)';
COMMENT ON COLUMN pedidos.referencia_abono_usd IS 'Referencia de pago para la parte USD del abono mixto';
COMMENT ON COLUMN pedidos.referencia_abono_ves IS 'Referencia de pago para la parte VES del abono mixto';
COMMENT ON COLUMN pedidos.detalles_pedido IS 'Detalles de los productos del pedido en formato JSON';

-- Verificar que las columnas se crearon correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pedidos' 
AND column_name IN (
  'metodo_pago_abono_usd', 
  'metodo_pago_abono_ves', 
  'referencia_abono_usd', 
  'referencia_abono_ves', 
  'detalles_pedido'
)
ORDER BY column_name;
