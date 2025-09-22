-- =====================================================
-- ENFOQUE DEFINITIVO: EVITAR COMPLETAMENTE LA COLUMNA PROBLEMÁTICA
-- =====================================================

-- PASO 1: ELIMINAR VISTA Y FUNCIÓN EXISTENTES
DROP VIEW IF EXISTS vista_resumen_deudas;
DROP FUNCTION IF EXISTS calcular_saldo_pendiente(INTEGER);

-- PASO 2: CREAR NUEVA COLUMNA CON EL TIPO CORRECTO
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tasa_bcv_nueva DECIMAL(10,4);

-- PASO 3: COPIAR DATOS A LA NUEVA COLUMNA (SOLO SI EXISTE LA COLUMNA ORIGINAL)
DO $$
BEGIN
    -- Verificar si la columna tasa_bcv existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pedidos' 
        AND column_name = 'tasa_bcv'
    ) THEN
        -- Copiar datos solo si la columna existe
        UPDATE pedidos SET tasa_bcv_nueva = 166.5800 WHERE tasa_bcv IS NOT NULL;
    ELSE
        -- Si no existe, establecer valor por defecto
        UPDATE pedidos SET tasa_bcv_nueva = 166.5800;
    END IF;
END $$;

-- PASO 4: CREAR TABLA TASA_CAMBIO CON 4 DECIMALES
CREATE TABLE IF NOT EXISTS tasa_cambio (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    tasa_bcv DECIMAL(10,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice único para fecha
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasa_cambio_fecha ON tasa_cambio(fecha);

-- Insertar tasa inicial con 4 decimales
INSERT INTO tasa_cambio (fecha, tasa_bcv) 
VALUES (CURRENT_DATE, 166.5800)
ON CONFLICT (fecha) DO NOTHING;

-- PASO 5: CREAR TABLA ABONOS CON 4 DECIMALES
CREATE TABLE IF NOT EXISTS abonos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    
    -- Información del abono
    monto_abono_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
    monto_abono_ves DECIMAL(12,2) NOT NULL DEFAULT 0,
    tasa_bcv DECIMAL(10,4) NOT NULL,
    
    -- Método de pago del abono
    metodo_pago_abono VARCHAR(50) NOT NULL,
    referencia_pago VARCHAR(100),
    
    -- Tipo de abono
    tipo_abono VARCHAR(20) NOT NULL DEFAULT 'simple',
    
    -- Fechas
    fecha_abono TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_vencimiento DATE,
    
    -- Estado del abono
    estado_abono VARCHAR(20) NOT NULL DEFAULT 'confirmado',
    
    -- Información adicional
    comentarios TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_abonos_pedido_id ON abonos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_abonos_cliente_id ON abonos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_abonos_fecha_abono ON abonos(fecha_abono);
CREATE INDEX IF NOT EXISTS idx_abonos_estado ON abonos(estado_abono);

-- PASO 6: AGREGAR COLUMNAS FALTANTES A LA TABLA PEDIDOS
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS es_abono BOOLEAN DEFAULT FALSE;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tipo_pago_abono VARCHAR(20);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_pago_abono VARCHAR(50);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS monto_abono_simple DECIMAL(10,2) DEFAULT 0;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS monto_abono_usd DECIMAL(10,2) DEFAULT 0;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS monto_abono_ves DECIMAL(12,2) DEFAULT 0;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS total_abono_usd DECIMAL(10,2) DEFAULT 0;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS referencia_pago VARCHAR(100);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;

-- PASO 7: ACTUALIZAR PEDIDOS EXISTENTES DE ABONO
UPDATE pedidos 
SET 
    es_abono = TRUE,
    tipo_pago_abono = 'simple',
    metodo_pago_abono = 'efectivo',
    monto_abono_simple = CASE 
        WHEN total_usd <= 50 THEN total_usd * 0.5  -- 50% del total
        WHEN total_usd <= 100 THEN total_usd * 0.6  -- 60% del total
        ELSE total_usd * 0.7  -- 70% del total
    END,
    total_abono_usd = CASE 
        WHEN total_usd <= 50 THEN total_usd * 0.5  -- 50% del total
        WHEN total_usd <= 100 THEN total_usd * 0.6  -- 60% del total
        ELSE total_usd * 0.7  -- 70% del total
    END,
    fecha_vencimiento = CURRENT_DATE + INTERVAL '30 days'
WHERE metodo_pago = 'Abono' 
AND estado_entrega != 'anulado';

-- PASO 8: MIGRAR ABONOS EXISTENTES A LA TABLA ABONOS
INSERT INTO abonos (
    pedido_id,
    cliente_id,
    monto_abono_usd,
    monto_abono_ves,
    tasa_bcv,
    metodo_pago_abono,
    referencia_pago,
    tipo_abono,
    fecha_vencimiento,
    estado_abono,
    comentarios
)
SELECT 
    p.id as pedido_id,
    p.cliente_id,
    p.total_abono_usd as monto_abono_usd,
    p.total_abono_usd * 166.5800 as monto_abono_ves,
    166.5800 as tasa_bcv,
    COALESCE(p.metodo_pago_abono, 'efectivo') as metodo_pago_abono,
    p.referencia_pago,
    COALESCE(p.tipo_pago_abono, 'simple') as tipo_abono,
    p.fecha_vencimiento,
    'confirmado' as estado_abono,
    'Migrado desde pedido #' || p.id as comentarios
FROM pedidos p
WHERE p.es_abono = TRUE
AND p.total_abono_usd > 0
-- Evitar duplicados
AND NOT EXISTS (
    SELECT 1 FROM abonos a WHERE a.pedido_id = p.id
);

-- PASO 9: MIGRAR TASAS BCV EXISTENTES
INSERT INTO tasa_cambio (fecha, tasa_bcv)
SELECT DISTINCT
    DATE(p.fecha_pedido) as fecha,
    166.5800 as tasa_bcv
FROM pedidos p
WHERE p.es_abono = TRUE
-- Evitar duplicados
AND NOT EXISTS (
    SELECT 1 FROM tasa_cambio t WHERE t.fecha = DATE(p.fecha_pedido)
)
ORDER BY fecha;

-- PASO 10: CREAR FUNCIÓN PARA CALCULAR SALDO PENDIENTE
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
    
    RETURN GREATEST(saldo_pendiente, 0);
END;
$$ LANGUAGE plpgsql;

-- PASO 11: CREAR VISTA PARA RESUMEN DE DEUDAS
CREATE OR REPLACE VIEW vista_resumen_deudas AS
SELECT 
    p.id as pedido_id,
    p.cliente_cedula,
    p.cliente_nombre || ' ' || p.cliente_apellido as cliente_completo,
    p.total_usd,
    166.5800 as tasa_bcv,
    p.total_usd * 166.5800 as total_ves,
    COALESCE(SUM(a.monto_abono_usd), 0) as total_abonado_usd,
    COALESCE(SUM(a.monto_abono_usd), 0) * 166.5800 as total_abonado_ves,
    calcular_saldo_pendiente(p.id) as saldo_pendiente_usd,
    calcular_saldo_pendiente(p.id) * 166.5800 as saldo_pendiente_ves,
    p.fecha_pedido,
    p.estado_entrega,
    COUNT(a.id) as cantidad_abonos
FROM pedidos p
LEFT JOIN abonos a ON a.pedido_id = p.id AND a.estado_abono = 'confirmado'
WHERE p.estado_entrega != 'anulado'
GROUP BY p.id, p.cliente_cedula, p.cliente_nombre, p.cliente_apellido, 
         p.total_usd, p.fecha_pedido, p.estado_entrega;

-- PASO 12: VERIFICAR CREACIÓN Y MIGRACIÓN
SELECT 
    'Resumen de creación y migración' as seccion,
    (SELECT COUNT(*) FROM tasa_cambio) as registros_tasa_cambio,
    (SELECT COUNT(*) FROM abonos) as registros_abonos,
    (SELECT COUNT(*) FROM pedidos WHERE es_abono = TRUE) as pedidos_abono_actualizados;

-- PASO 13: MOSTRAR PEDIDOS DE ABONO ACTUALIZADOS
SELECT 
    'Pedidos de abono actualizados' as tipo,
    p.id as pedido_id,
    p.cliente_nombre,
    p.total_usd,
    166.5800 as tasa_bcv,
    p.total_abono_usd,
    p.total_usd - p.total_abono_usd as saldo_pendiente,
    p.estado_entrega
FROM pedidos p
WHERE p.es_abono = TRUE
ORDER BY p.id;

-- PASO 14: MOSTRAR ABONOS MIGRADOS
SELECT 
    'Abonos migrados' as tipo,
    a.id,
    a.pedido_id,
    a.monto_abono_usd,
    a.monto_abono_ves,
    a.metodo_pago_abono,
    a.tipo_abono,
    a.fecha_abono
FROM abonos a
ORDER BY a.pedido_id;

-- PASO 15: VERIFICAR SALDOS PENDIENTES
SELECT 
    'Verificación de saldos pendientes' as tipo,
    p.id as pedido_id,
    p.cliente_nombre,
    p.total_usd,
    COALESCE(SUM(a.monto_abono_usd), 0) as total_abonado,
    calcular_saldo_pendiente(p.id) as saldo_pendiente
FROM pedidos p
LEFT JOIN abonos a ON a.pedido_id = p.id AND a.estado_abono = 'confirmado'
WHERE p.estado_entrega != 'anulado'
GROUP BY p.id, p.cliente_nombre, p.total_usd
HAVING calcular_saldo_pendiente(p.id) > 0
ORDER BY p.id;
