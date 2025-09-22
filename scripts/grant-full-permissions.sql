-- =====================================================
-- OTORGAR PERMISOS COMPLETOS PARA SOLUCIONAR DEFINITIVAMENTE
-- =====================================================

-- PASO 1: VERIFICAR USUARIO ACTUAL
SELECT 
    'Usuario actual' as seccion,
    current_user as usuario_actual,
    session_user as usuario_sesion,
    current_database() as base_datos;

-- PASO 2: REVOCAR TODOS LOS PERMISOS EXISTENTES
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;

-- PASO 3: OTORGAR PERMISOS COMPLETOS AL ROL 'authenticated'
-- Otorgar USAGE en el esquema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Otorgar ALL PRIVILEGES en todas las tablas
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;

-- Otorgar ALL PRIVILEGES en todas las secuencias
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Otorgar ALL PRIVILEGES en todas las funciones
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- PASO 4: OTORGAR PERMISOS ESPECÍFICOS EN LAS TABLAS PRINCIPALES
GRANT ALL PRIVILEGES ON public.pedidos TO authenticated;
GRANT ALL PRIVILEGES ON public.detalles_pedido TO authenticated;
GRANT ALL PRIVILEGES ON public.abonos TO authenticated;
GRANT ALL PRIVILEGES ON public.tasa_cambio TO authenticated;
GRANT ALL PRIVILEGES ON public.clientes TO authenticated;
GRANT ALL PRIVILEGES ON public.productos TO authenticated;
GRANT ALL PRIVILEGES ON public.categorias TO authenticated;

-- PASO 5: OTORGAR PERMISOS EN LAS SECUENCIAS
GRANT ALL PRIVILEGES ON public.pedidos_id_seq TO authenticated;
GRANT ALL PRIVILEGES ON public.detalles_pedido_id_seq TO authenticated;
GRANT ALL PRIVILEGES ON public.abonos_id_seq TO authenticated;
GRANT ALL PRIVILEGES ON public.tasa_cambio_id_seq TO authenticated;
GRANT ALL PRIVILEGES ON public.clientes_id_seq TO authenticated;
GRANT ALL PRIVILEGES ON public.productos_id_seq TO authenticated;
GRANT ALL PRIVILEGES ON public.categorias_id_seq TO authenticated;

-- PASO 6: ASEGURAR QUE RLS ESTÉ DESHABILITADO
ALTER TABLE public.pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalles_pedido DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.abonos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasa_cambio DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias DISABLE ROW LEVEL SECURITY;

-- PASO 7: VERIFICAR PERMISOS DESPUÉS DE LA CORRECCIÓN
SELECT 
    'Verificación de permisos finales' as seccion,
    schemaname,
    tablename,
    tableowner,
    has_table_privilege('authenticated', tablename, 'INSERT') as can_insert,
    has_table_privilege('authenticated', tablename, 'SELECT') as can_select,
    has_table_privilege('authenticated', tablename, 'UPDATE') as can_update,
    has_table_privilege('authenticated', tablename, 'DELETE') as can_delete,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('pedidos', 'detalles_pedido', 'abonos', 'tasa_cambio', 'clientes', 'productos', 'categorias')
ORDER BY tablename;

-- PASO 8: VERIFICAR PERMISOS EN SECUENCIAS
SELECT 
    'Verificación de permisos en secuencias' as seccion,
    sequencename,
    has_sequence_privilege('authenticated', sequencename, 'USAGE') as can_usage,
    has_sequence_privilege('authenticated', sequencename, 'SELECT') as can_select
FROM pg_sequences 
WHERE sequencename IN ('pedidos_id_seq', 'detalles_pedido_id_seq', 'abonos_id_seq', 'tasa_cambio_id_seq', 'clientes_id_seq', 'productos_id_seq', 'categorias_id_seq')
ORDER BY sequencename;

-- PASO 9: CONFIRMAR QUE EL SISTEMA ESTÁ LISTO
SELECT 
    'Sistema completamente configurado' as seccion,
    'Permisos completos otorgados' as estado,
    'RLS deshabilitado' as rls_status,
    'Listo para procesar ventas' as resultado;
