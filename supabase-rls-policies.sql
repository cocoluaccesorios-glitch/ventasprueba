-- =====================================================
-- POLÍTICAS RLS PARA VENTAS COCOLÚ
-- =====================================================

-- Habilitar RLS en todas las tablas principales
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalles_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasa_cambio ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA PEDIDOS
-- =====================================================

-- Permitir lectura de todos los pedidos (para la aplicación)
CREATE POLICY "Allow read access to pedidos" ON pedidos
    FOR SELECT USING (true);

-- Permitir inserción de pedidos (para crear ventas)
CREATE POLICY "Allow insert access to pedidos" ON pedidos
    FOR INSERT WITH CHECK (true);

-- Permitir actualización de pedidos (para editar/actualizar)
CREATE POLICY "Allow update access to pedidos" ON pedidos
    FOR UPDATE USING (true);

-- Permitir eliminación de pedidos (para anular)
CREATE POLICY "Allow delete access to pedidos" ON pedidos
    FOR DELETE USING (true);

-- =====================================================
-- POLÍTICAS PARA DETALLES_PEDIDO
-- =====================================================

-- Permitir lectura de todos los detalles
CREATE POLICY "Allow read access to detalles_pedido" ON detalles_pedido
    FOR SELECT USING (true);

-- Permitir inserción de detalles
CREATE POLICY "Allow insert access to detalles_pedido" ON detalles_pedido
    FOR INSERT WITH CHECK (true);

-- Permitir actualización de detalles
CREATE POLICY "Allow update access to detalles_pedido" ON detalles_pedido
    FOR UPDATE USING (true);

-- Permitir eliminación de detalles
CREATE POLICY "Allow delete access to detalles_pedido" ON detalles_pedido
    FOR DELETE USING (true);

-- =====================================================
-- POLÍTICAS PARA PRODUCTOS
-- =====================================================

-- Permitir lectura de todos los productos
CREATE POLICY "Allow read access to productos" ON productos
    FOR SELECT USING (true);

-- Permitir inserción de productos (para administradores)
CREATE POLICY "Allow insert access to productos" ON productos
    FOR INSERT WITH CHECK (true);

-- Permitir actualización de productos
CREATE POLICY "Allow update access to productos" ON productos
    FOR UPDATE USING (true);

-- Permitir eliminación de productos
CREATE POLICY "Allow delete access to productos" ON productos
    FOR DELETE USING (true);

-- =====================================================
-- POLÍTICAS PARA CLIENTES
-- =====================================================

-- Permitir lectura de todos los clientes
CREATE POLICY "Allow read access to clientes" ON clientes
    FOR SELECT USING (true);

-- Permitir inserción de clientes
CREATE POLICY "Allow insert access to clientes" ON clientes
    FOR INSERT WITH CHECK (true);

-- Permitir actualización de clientes
CREATE POLICY "Allow update access to clientes" ON clientes
    FOR UPDATE USING (true);

-- Permitir eliminación de clientes
CREATE POLICY "Allow delete access to clientes" ON clientes
    FOR DELETE USING (true);

-- =====================================================
-- POLÍTICAS PARA TASA_CAMBIO
-- =====================================================

-- Permitir lectura de tasa de cambio
CREATE POLICY "Allow read access to tasa_cambio" ON tasa_cambio
    FOR SELECT USING (true);

-- Permitir inserción de tasa de cambio
CREATE POLICY "Allow insert access to tasa_cambio" ON tasa_cambio
    FOR INSERT WITH CHECK (true);

-- Permitir actualización de tasa de cambio
CREATE POLICY "Allow update access to tasa_cambio" ON tasa_cambio
    FOR UPDATE USING (true);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('pedidos', 'detalles_pedido', 'productos', 'clientes', 'tasa_cambio')
ORDER BY tablename, policyname;
