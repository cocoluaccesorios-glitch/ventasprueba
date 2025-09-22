-- =====================================================
-- SOLUCIÓN MANUAL PARA PERMISOS DE TABLA PEDIDOS
-- =====================================================

-- PASO 1: DESHABILITAR RLS TEMPORALMENTE
-- Esto permitirá que las inserciones funcionen sin problemas de permisos
ALTER TABLE public.pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalles_pedido DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.abonos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasa_cambio DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;

-- PASO 2: VERIFICAR QUE RLS ESTÉ DESHABILITADO
SELECT 
    'Estado después de deshabilitar RLS' as seccion,
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename IN ('pedidos', 'detalles_pedido', 'abonos', 'tasa_cambio', 'clientes')
ORDER BY tablename;

-- PASO 3: OTORGAR PERMISOS BÁSICOS (por si acaso)
GRANT ALL PRIVILEGES ON public.pedidos TO authenticated;
GRANT ALL PRIVILEGES ON public.detalles_pedido TO authenticated;
GRANT ALL PRIVILEGES ON public.abonos TO authenticated;
GRANT ALL PRIVILEGES ON public.tasa_cambio TO authenticated;
GRANT ALL PRIVILEGES ON public.clientes TO authenticated;

-- PASO 4: CONFIRMAR QUE EL SISTEMA ESTÁ LISTO
SELECT 
    'Sistema listo para procesar ventas' as seccion,
    'RLS deshabilitado temporalmente' as estado,
    'Las inserciones deberían funcionar ahora' as resultado;
