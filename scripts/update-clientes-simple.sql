-- Script SQL simplificado para actualizar la tabla clientes
-- Ejecutar en el editor SQL de Supabase

ALTER TABLE clientes ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS fecha_registro timestamp with time zone DEFAULT now();
