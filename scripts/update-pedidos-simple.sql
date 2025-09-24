-- Script SQL simplificado para actualizar la tabla pedidos
-- Ejecutar en el editor SQL de Supabase

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_pago_abono_usd text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_pago_abono_ves text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS referencia_abono_usd text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS referencia_abono_ves text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS detalles_pedido jsonb;
