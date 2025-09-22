-- =====================================================
-- CREAR TABLAS FALTANTES EN SUPABASE
-- =====================================================
-- Ejecutar este script completo en el SQL Editor de Supabase

-- 1. CREAR TABLA TASA_CAMBIO (Para sistema BCV)
-- =====================================================
CREATE TABLE IF NOT EXISTS tasa_cambio (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    tasa_bcv DECIMAL(10,8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice único para fecha
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasa_cambio_fecha ON tasa_cambio(fecha);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_tasa_cambio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tasa_cambio_updated_at
    BEFORE UPDATE ON tasa_cambio
    FOR EACH ROW
    EXECUTE FUNCTION update_tasa_cambio_updated_at();

-- Insertar tasa inicial
INSERT INTO tasa_cambio (fecha, tasa_bcv) 
VALUES (CURRENT_DATE, 166.58)
ON CONFLICT (fecha) DO NOTHING;

-- Habilitar RLS
ALTER TABLE tasa_cambio ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir lectura de tasa_cambio" ON tasa_cambio
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de tasa_cambio" ON tasa_cambio
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización de tasa_cambio" ON tasa_cambio
    FOR UPDATE USING (true);

-- 2. CREAR TABLA ABONOS (Para sistema de deudas)
-- =====================================================
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

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_abonos_pedido_id ON abonos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_abonos_cliente_id ON abonos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_abonos_fecha_abono ON abonos(fecha_abono);
CREATE INDEX IF NOT EXISTS idx_abonos_estado ON abonos(estado_abono);

-- Crear trigger para actualizar updated_at
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

-- Habilitar RLS
ALTER TABLE abonos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir lectura de abonos" ON abonos
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de abonos" ON abonos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización de abonos" ON abonos
    FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminación de abonos" ON abonos
    FOR DELETE USING (true);

-- 3. CREAR TABLA CATEGORIAS (Para organización de productos)
-- =====================================================
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_categorias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_categorias_updated_at
    BEFORE UPDATE ON categorias
    FOR EACH ROW
    EXECUTE FUNCTION update_categorias_updated_at();

-- Insertar categorías básicas
INSERT INTO categorias (nombre, descripcion) VALUES
    ('Bebidas', 'Bebidas y refrescos'),
    ('Alimentos', 'Productos alimenticios'),
    ('Limpieza', 'Productos de limpieza'),
    ('Otros', 'Otros productos')
ON CONFLICT (nombre) DO NOTHING;

-- Habilitar RLS
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir lectura de categorias" ON categorias
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de categorias" ON categorias
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización de categorias" ON categorias
    FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminación de categorias" ON categorias
    FOR DELETE USING (true);

-- 4. CREAR FUNCIONES ÚTILES
-- =====================================================

-- Función para calcular saldo pendiente de un pedido
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

-- Función para obtener la tasa BCV del día
CREATE OR REPLACE FUNCTION obtener_tasa_bcv_dia(fecha_param DATE DEFAULT CURRENT_DATE)
RETURNS DECIMAL(10,8) AS $$
DECLARE
    tasa_resultado DECIMAL(10,8);
BEGIN
    -- Buscar tasa para la fecha específica
    SELECT tasa_bcv INTO tasa_resultado
    FROM tasa_cambio
    WHERE fecha = fecha_param
    ORDER BY id DESC
    LIMIT 1;
    
    -- Si no encuentra, buscar la más reciente
    IF tasa_resultado IS NULL THEN
        SELECT tasa_bcv INTO tasa_resultado
        FROM tasa_cambio
        ORDER BY fecha DESC, id DESC
        LIMIT 1;
    END IF;
    
    -- Si aún no encuentra, usar tasa por defecto
    IF tasa_resultado IS NULL THEN
        tasa_resultado := 166.58;
    END IF;
    
    RETURN tasa_resultado;
END;
$$ LANGUAGE plpgsql;

-- 5. CREAR VISTAS ÚTILES
-- =====================================================

-- Vista para resumen de deudas
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

-- Vista para productos con categorías
CREATE OR REPLACE VIEW vista_productos_categorias AS
SELECT 
    p.id,
    p.sku,
    p.nombre,
    p.descripcion,
    p.precio_usd,
    p.stock_actual,
    p.stock_sugerido,
    c.nombre as categoria_nombre,
    c.descripcion as categoria_descripcion
FROM productos p
LEFT JOIN categorias c ON c.id = p.categoria_id;

-- 6. VERIFICAR CREACIÓN DE TABLAS
-- =====================================================
SELECT 
    'Tablas creadas exitosamente' as mensaje,
    (SELECT COUNT(*) FROM tasa_cambio) as registros_tasa_cambio,
    (SELECT COUNT(*) FROM abonos) as registros_abonos,
    (SELECT COUNT(*) FROM categorias) as registros_categorias;

-- 7. MOSTRAR ESTRUCTURA DE TABLAS CREADAS
-- =====================================================
SELECT 
    'Estructura de tabla tasa_cambio' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tasa_cambio'
ORDER BY ordinal_position;

SELECT 
    'Estructura de tabla abonos' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'abonos'
ORDER BY ordinal_position;

SELECT 
    'Estructura de tabla categorias' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'categorias'
ORDER BY ordinal_position;

-- 8. MENSAJE FINAL
-- =====================================================
SELECT 
    '🎉 ¡TABLAS CREADAS EXITOSAMENTE!' as resultado,
    'Ahora puedes ejecutar los scripts de migración de datos' as siguiente_paso;
