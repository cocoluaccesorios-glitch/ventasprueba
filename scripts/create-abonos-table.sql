-- =====================================================
-- CREAR TABLA DE ABONOS PARA GESTIÓN DE DEUDAS
-- =====================================================
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Crear tabla de abonos
CREATE TABLE IF NOT EXISTS abonos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    
    -- Información del abono
    monto_abono_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
    monto_abono_ves DECIMAL(12,2) NOT NULL DEFAULT 0,
    tasa_bcv DECIMAL(10,8) NOT NULL,
    
    -- Método de pago del abono
    metodo_pago_abono VARCHAR(50) NOT NULL,
    referencia_pago VARCHAR(100),
    
    -- Tipo de abono
    tipo_abono VARCHAR(20) NOT NULL DEFAULT 'simple', -- 'simple', 'mixto'
    
    -- Fechas
    fecha_abono TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_vencimiento DATE,
    
    -- Estado del abono
    estado_abono VARCHAR(20) NOT NULL DEFAULT 'confirmado', -- 'confirmado', 'pendiente', 'anulado'
    
    -- Información adicional
    comentarios TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_abonos_pedido_id ON abonos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_abonos_cliente_id ON abonos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_abonos_fecha_abono ON abonos(fecha_abono);
CREATE INDEX IF NOT EXISTS idx_abonos_estado ON abonos(estado_abono);

-- 3. Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_abonos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_abonos_updated_at
    BEFORE UPDATE ON abonos
    FOR EACH ROW
    EXECUTE FUNCTION update_abonos_updated_at();

-- 4. Crear función para calcular saldo pendiente de un pedido
CREATE OR REPLACE FUNCTION calcular_saldo_pendiente(pedido_id_param INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_pedido DECIMAL(10,2);
    total_abonado DECIMAL(10,2);
    saldo_pendiente DECIMAL(10,2);
BEGIN
    -- Obtener total del pedido
    SELECT total_usd INTO total_pedido
    FROM pedidos
    WHERE id = pedido_id_param;
    
    -- Obtener total abonado
    SELECT COALESCE(SUM(monto_abono_usd), 0) INTO total_abonado
    FROM abonos
    WHERE pedido_id = pedido_id_param
    AND estado_abono = 'confirmado';
    
    -- Calcular saldo pendiente
    saldo_pendiente := total_pedido - total_abonado;
    
    RETURN GREATEST(saldo_pendiente, 0); -- No permitir saldos negativos
END;
$$ LANGUAGE plpgsql;

-- 5. Crear función para obtener resumen de deudas por cliente
CREATE OR REPLACE FUNCTION obtener_resumen_deudas_cliente(cliente_id_param INTEGER)
RETURNS TABLE (
    cliente_nombre VARCHAR,
    cliente_cedula VARCHAR,
    total_deuda_usd DECIMAL(10,2),
    total_deuda_ves DECIMAL(12,2),
    cantidad_pedidos INTEGER,
    ultimo_abono DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.nombre || ' ' || c.apellido as cliente_nombre,
        c.cedula as cliente_cedula,
        COALESCE(SUM(calcular_saldo_pendiente(p.id)), 0) as total_deuda_usd,
        COALESCE(SUM(calcular_saldo_pendiente(p.id) * p.tasa_bcv), 0) as total_deuda_ves,
        COUNT(p.id) as cantidad_pedidos,
        MAX(a.fecha_abono::DATE) as ultimo_abono
    FROM clientes c
    LEFT JOIN pedidos p ON p.cliente_cedula = c.cedula
    LEFT JOIN abonos a ON a.pedido_id = p.id
    WHERE c.id = cliente_id_param
    AND p.estado_entrega != 'anulado'
    AND calcular_saldo_pendiente(p.id) > 0
    GROUP BY c.id, c.nombre, c.apellido, c.cedula;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear vista para resumen de deudas
CREATE OR REPLACE VIEW vista_resumen_deudas AS
SELECT 
    p.id as pedido_id,
    p.cliente_cedula,
    p.cliente_nombre || ' ' || p.cliente_apellido as cliente_completo,
    p.total_usd,
    p.tasa_bcv,
    p.total_usd * p.tasa_bcv as total_ves,
    COALESCE(SUM(a.monto_abono_usd), 0) as total_abonado_usd,
    COALESCE(SUM(a.monto_abono_usd), 0) * p.tasa_bcv as total_abonado_ves,
    calcular_saldo_pendiente(p.id) as saldo_pendiente_usd,
    calcular_saldo_pendiente(p.id) * p.tasa_bcv as saldo_pendiente_ves,
    p.fecha_pedido,
    p.estado_entrega,
    COUNT(a.id) as cantidad_abonos
FROM pedidos p
LEFT JOIN abonos a ON a.pedido_id = p.id AND a.estado_abono = 'confirmado'
WHERE p.estado_entrega != 'anulado'
GROUP BY p.id, p.cliente_cedula, p.cliente_nombre, p.cliente_apellido, 
         p.total_usd, p.tasa_bcv, p.fecha_pedido, p.estado_entrega;

-- 7. Crear RLS (Row Level Security) policies
ALTER TABLE abonos ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos los usuarios autenticados
CREATE POLICY "Permitir lectura de abonos" ON abonos
    FOR SELECT USING (true);

-- Política para permitir inserción a usuarios autenticados
CREATE POLICY "Permitir inserción de abonos" ON abonos
    FOR INSERT WITH CHECK (true);

-- Política para permitir actualización a usuarios autenticados
CREATE POLICY "Permitir actualización de abonos" ON abonos
    FOR UPDATE USING (true);

-- Política para permitir eliminación a usuarios autenticados
CREATE POLICY "Permitir eliminación de abonos" ON abonos
    FOR DELETE USING (true);

-- 8. Insertar datos de ejemplo (opcional)
-- INSERT INTO abonos (pedido_id, monto_abono_usd, monto_abono_ves, tasa_bcv, metodo_pago_abono, tipo_abono)
-- VALUES 
--     (29, 15.00, 2498.70, 166.58, 'efectivo', 'simple'),
--     (29, 10.00, 1665.80, 166.58, 'zelle', 'simple');

-- 9. Verificar la creación de la tabla
SELECT 
    'Tabla abonos creada exitosamente' as mensaje,
    COUNT(*) as total_abonos
FROM abonos;

-- 10. Mostrar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'abonos'
ORDER BY ordinal_position;
