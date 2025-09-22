-- =====================================================
-- CORRECCIÓN DEFINITIVA DE PERMISOS PARA FUNCIONES RPC
-- =====================================================

-- PASO 1: VERIFICAR USUARIO ACTUAL Y PERMISOS
SELECT 
    'Usuario actual y permisos' as seccion,
    current_user as usuario_actual,
    session_user as usuario_sesion,
    current_database() as base_datos;

-- PASO 2: REVOCAR TODOS LOS PERMISOS EXISTENTES PARA EL ROL 'authenticated' EN LAS TABLAS
-- Esto asegura una base limpia antes de re-aplicar los permisos
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;

-- PASO 3: OTORGAR PERMISOS BÁSICOS AL ROL 'authenticated'
-- Otorgar USAGE en el esquema public
GRANT USAGE ON SCHEMA public TO authenticated;

-- Otorgar ALL PRIVILEGES en las tablas a 'authenticated'
GRANT ALL PRIVILEGES ON public.pedidos TO authenticated;
GRANT ALL PRIVILEGES ON public.detalles_pedido TO authenticated;
GRANT ALL PRIVILEGES ON public.abonos TO authenticated;
GRANT ALL PRIVILEGES ON public.tasa_cambio TO authenticated;
GRANT ALL PRIVILEGES ON public.clientes TO authenticated;

-- Otorgar USAGE en las secuencias para que los SERIALs funcionen
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- PASO 4: ASEGURAR QUE RLS ESTÉ HABILITADO EN LAS TABLAS RELEVANTES
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalles_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasa_cambio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- PASO 5: ELIMINAR Y RECREAR POLÍTICAS RLS PARA EVITAR CONFLICTOS
-- Eliminar políticas existentes para evitar el error "policy already exists"
DROP POLICY IF EXISTS "Allow authenticated users to insert pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Allow authenticated users to insert detalles_pedido" ON public.detalles_pedido;
DROP POLICY IF EXISTS "Allow authenticated users to insert abonos" ON public.abonos;
DROP POLICY IF EXISTS "Allow authenticated users to insert tasa_cambio" ON public.tasa_cambio;
DROP POLICY IF EXISTS "Allow authenticated users to insert clientes" ON public.clientes;

-- Recrear políticas RLS para INSERT con WITH CHECK (true)
CREATE POLICY "Allow authenticated users to insert pedidos"
ON public.pedidos
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert detalles_pedido"
ON public.detalles_pedido
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert abonos"
ON public.abonos
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert tasa_cambio"
ON public.tasa_cambio
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert clientes"
ON public.clientes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- PASO 6: OTORGAR PERMISOS DE EJECUCIÓN A LAS FUNCIONES RPC
-- Dar permisos de ejecución a la función para usuarios autenticados
GRANT EXECUTE ON FUNCTION public.procesar_venta_completa(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.procesar_venta_simple(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.procesar_venta_mixta(JSONB) TO authenticated;

-- PASO 7: VERIFICAR PERMISOS DESPUÉS DE LA CORRECCIÓN
SELECT 
    'Verificación de permisos finales' as seccion,
    schemaname,
    tablename,
    tableowner,
    has_table_privilege(current_user, tablename, 'INSERT') as can_insert,
    has_table_privilege(current_user, tablename, 'SELECT') as can_select,
    has_table_privilege(current_user, tablename, 'UPDATE') as can_update,
    has_table_privilege(current_user, tablename, 'DELETE') as can_delete,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('pedidos', 'detalles_pedido', 'abonos', 'tasa_cambio', 'clientes')
ORDER BY tablename;

SELECT 
    'Verificación de permisos de funciones RPC' as seccion,
    proname,
    has_function_privilege(current_user, oid, 'EXECUTE') as can_execute
FROM pg_proc
WHERE proname IN ('procesar_venta_completa', 'procesar_venta_simple', 'procesar_venta_mixta');
