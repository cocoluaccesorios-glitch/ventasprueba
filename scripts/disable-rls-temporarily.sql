-- =====================================================
-- DESHABILITAR RLS TEMPORALMENTE PARA SOLUCIONAR PERMISOS
-- =====================================================

-- PASO 1: VERIFICAR ESTADO ACTUAL DE RLS
SELECT 
    'Estado actual de RLS' as seccion,
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename IN ('pedidos', 'detalles_pedido', 'abonos', 'tasa_cambio', 'clientes')
ORDER BY tablename;

-- PASO 2: DESHABILITAR RLS TEMPORALMENTE EN LAS TABLAS
-- Esto permitirá que las inserciones funcionen sin problemas de permisos
ALTER TABLE public.pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalles_pedido DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.abonos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasa_cambio DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;

-- PASO 3: VERIFICAR QUE RLS ESTÉ DESHABILITADO
SELECT 
    'Estado después de deshabilitar RLS' as seccion,
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename IN ('pedidos', 'detalles_pedido', 'abonos', 'tasa_cambio', 'clientes')
ORDER BY tablename;

-- PASO 4: VERIFICAR PERMISOS BÁSICOS
SELECT 
    'Verificación de permisos básicos' as seccion,
    schemaname,
    tablename,
    tableowner,
    has_table_privilege(current_user, tablename, 'INSERT') as can_insert,
    has_table_privilege(current_user, tablename, 'SELECT') as can_select,
    has_table_privilege(current_user, tablename, 'UPDATE') as can_update,
    has_table_privilege(current_user, tablename, 'DELETE') as can_delete
FROM pg_tables 
WHERE tablename IN ('pedidos', 'detalles_pedido', 'abonos', 'tasa_cambio', 'clientes')
ORDER BY tablename;

-- PASO 5: CONFIRMAR QUE EL SISTEMA ESTÁ LISTO
SELECT 
    'Sistema listo para procesar ventas' as seccion,
    'RLS deshabilitado temporalmente' as estado,
    'Las inserciones deberían funcionar ahora' as resultado;
