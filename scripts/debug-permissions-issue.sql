-- =====================================================
-- DEBUG: INVESTIGAR PROBLEMA DE PERMISOS
-- =====================================================

-- PASO 1: VERIFICAR USUARIO ACTUAL Y ROLES
SELECT 
    'DEBUG: Usuario actual y roles' as seccion,
    current_user as usuario_actual,
    session_user as usuario_sesion,
    current_database() as base_datos,
    current_setting('role') as rol_actual,
    current_setting('user') as usuario_configurado;

-- PASO 2: VERIFICAR TODOS LOS ROLES DISPONIBLES
SELECT 
    'DEBUG: Roles disponibles' as seccion,
    rolname as nombre_rol,
    rolsuper as es_superusuario,
    rolinherit as hereda_privilegios,
    rolcreaterole as puede_crear_roles,
    rolcreatedb as puede_crear_bases
FROM pg_roles 
WHERE rolname IN ('postgres', 'authenticated', 'anon', 'service_role', current_user)
ORDER BY rolname;

-- PASO 3: VERIFICAR PERMISOS ESPECÍFICOS EN LA TABLA PEDIDOS
SELECT 
    'DEBUG: Permisos en tabla pedidos' as seccion,
    schemaname,
    tablename,
    tableowner,
    has_table_privilege('postgres', tablename, 'INSERT') as postgres_can_insert,
    has_table_privilege('authenticated', tablename, 'INSERT') as authenticated_can_insert,
    has_table_privilege('anon', tablename, 'INSERT') as anon_can_insert,
    has_table_privilege(current_user, tablename, 'INSERT') as current_user_can_insert,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'pedidos';

-- PASO 4: VERIFICAR POLÍTICAS RLS EN PEDIDOS
SELECT 
    'DEBUG: Políticas RLS en pedidos' as seccion,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'pedidos';

-- PASO 5: VERIFICAR CONFIGURACIÓN DE SUPABASE
SELECT 
    'DEBUG: Configuración de Supabase' as seccion,
    current_setting('app.settings.jwt_secret', true) as jwt_secret_configured,
    current_setting('app.settings.jwt_exp', true) as jwt_exp_configured;

-- PASO 6: INTENTAR INSERTAR UN REGISTRO DE PRUEBA
-- Esto nos dirá exactamente qué error obtenemos
BEGIN;
    INSERT INTO public.pedidos (
        cliente_cedula, cliente_nombre, cliente_apellido, 
        total_usd, metodo_pago, estado_entrega, fecha_pedido
    ) VALUES (
        'TEST123', 'Test', 'User', 1.00, 'efectivo', 'pendiente', NOW()
    );
    -- Si llegamos aquí, la inserción funcionó
    ROLLBACK; -- Deshacer la inserción de prueba
    SELECT 'DEBUG: Inserción de prueba EXITOSA' as resultado;
EXCEPTION WHEN OTHERS THEN
    ROLLBACK;
    SELECT 'DEBUG: Error en inserción de prueba: ' || SQLERRM as resultado;
END;

-- PASO 7: VERIFICAR SI HAY PROBLEMAS CON LA CONEXIÓN
SELECT 
    'DEBUG: Estado de la conexión' as seccion,
    inet_server_addr() as direccion_servidor,
    inet_server_port() as puerto_servidor,
    version() as version_postgres;
