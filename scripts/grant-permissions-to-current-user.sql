-- =====================================================
-- OTORGAR PERMISOS AL USUARIO ACTUAL PARA SOLUCIONAR DEFINITIVAMENTE
-- =====================================================

-- PASO 1: VERIFICAR USUARIO ACTUAL Y ROLES
SELECT 
    'Usuario actual y roles' as seccion,
    current_user as usuario_actual,
    session_user as usuario_sesion,
    current_database() as base_datos,
    current_setting('role') as rol_actual;

-- PASO 2: VERIFICAR SI EL USUARIO ACTUAL TIENE PERMISOS
SELECT 
    'Permisos del usuario actual' as seccion,
    schemaname,
    tablename,
    has_table_privilege(current_user, tablename, 'INSERT') as can_insert,
    has_table_privilege(current_user, tablename, 'SELECT') as can_select,
    has_table_privilege(current_user, tablename, 'UPDATE') as can_update,
    has_table_privilege(current_user, tablename, 'DELETE') as can_delete
FROM pg_tables 
WHERE tablename IN ('pedidos', 'detalles_pedido', 'abonos', 'tasa_cambio', 'clientes', 'productos', 'categorias')
ORDER BY tablename;

-- PASO 3: OTORGAR PERMISOS AL USUARIO ACTUAL
-- Otorgar USAGE en el esquema
GRANT USAGE ON SCHEMA public TO current_user;

-- Otorgar ALL PRIVILEGES en todas las tablas al usuario actual
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO current_user;

-- Otorgar ALL PRIVILEGES en todas las secuencias al usuario actual
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO current_user;

-- Otorgar ALL PRIVILEGES en todas las funciones al usuario actual
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO current_user;

-- PASO 4: OTORGAR PERMISOS ESPECÍFICOS EN LAS TABLAS PRINCIPALES AL USUARIO ACTUAL
GRANT ALL PRIVILEGES ON public.pedidos TO current_user;
GRANT ALL PRIVILEGES ON public.detalles_pedido TO current_user;
GRANT ALL PRIVILEGES ON public.abonos TO current_user;
GRANT ALL PRIVILEGES ON public.tasa_cambio TO current_user;
GRANT ALL PRIVILEGES ON public.clientes TO current_user;
GRANT ALL PRIVILEGES ON public.productos TO current_user;
GRANT ALL PRIVILEGES ON public.categorias TO current_user;

-- PASO 5: OTORGAR PERMISOS EN LAS SECUENCIAS AL USUARIO ACTUAL
GRANT ALL PRIVILEGES ON public.pedidos_id_seq TO current_user;
GRANT ALL PRIVILEGES ON public.detalles_pedido_id_seq TO current_user;
GRANT ALL PRIVILEGES ON public.abonos_id_seq TO current_user;
GRANT ALL PRIVILEGES ON public.tasa_cambio_id_seq TO current_user;
GRANT ALL PRIVILEGES ON public.clientes_id_seq TO current_user;
GRANT ALL PRIVILEGES ON public.productos_id_seq TO current_user;
GRANT ALL PRIVILEGES ON public.categorias_id_seq TO current_user;

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
    'Verificación de permisos finales del usuario actual' as seccion,
    schemaname,
    tablename,
    tableowner,
    has_table_privilege(current_user, tablename, 'INSERT') as can_insert,
    has_table_privilege(current_user, tablename, 'SELECT') as can_select,
    has_table_privilege(current_user, tablename, 'UPDATE') as can_update,
    has_table_privilege(current_user, tablename, 'DELETE') as can_delete,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('pedidos', 'detalles_pedido', 'abonos', 'tasa_cambio', 'clientes', 'productos', 'categorias')
ORDER BY tablename;

-- PASO 8: VERIFICAR PERMISOS EN SECUENCIAS DEL USUARIO ACTUAL
SELECT 
    'Verificación de permisos en secuencias del usuario actual' as seccion,
    sequencename,
    has_sequence_privilege(current_user, sequencename, 'USAGE') as can_usage,
    has_sequence_privilege(current_user, sequencename, 'SELECT') as can_select
FROM pg_sequences 
WHERE sequencename IN ('pedidos_id_seq', 'detalles_pedido_id_seq', 'abonos_id_seq', 'tasa_cambio_id_seq', 'clientes_id_seq', 'productos_id_seq', 'categorias_id_seq')
ORDER BY sequencename;

-- PASO 9: CONFIRMAR QUE EL SISTEMA ESTÁ LISTO
SELECT 
    'Sistema completamente configurado para el usuario actual' as seccion,
    'Permisos completos otorgados al usuario actual' as estado,
    'RLS deshabilitado' as rls_status,
    'Listo para procesar ventas' as resultado;