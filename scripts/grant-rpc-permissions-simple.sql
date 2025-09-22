-- =====================================================
-- OTORGAR PERMISOS A LAS FUNCIONES RPC (VERSIÓN SIMPLE)
-- =====================================================

-- PASO 1: VERIFICAR FUNCIONES RPC EXISTENTES
SELECT 
    'Funciones RPC existentes' as seccion,
    routine_name as nombre_funcion,
    routine_type as tipo_funcion
FROM information_schema.routines 
WHERE routine_name IN ('procesar_venta_completa', 'procesar_venta_simple', 'procesar_venta_mixta')
AND routine_schema = 'public'
ORDER BY routine_name;

-- PASO 2: OTORGAR PERMISOS DE EJECUCIÓN A TODAS LAS FUNCIONES
-- Dar permisos de ejecución a todas las funciones para usuarios autenticados
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- PASO 3: OTORGAR PERMISOS DE EJECUCIÓN AL USUARIO ACTUAL
-- Dar permisos de ejecución a todas las funciones para el usuario actual
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO current_user;

-- PASO 4: VERIFICAR PERMISOS DE EJECUCIÓN
SELECT 
    'Verificación de permisos de ejecución' as seccion,
    routine_name as nombre_funcion,
    has_function_privilege('authenticated', routine_name, 'EXECUTE') as authenticated_can_execute,
    has_function_privilege(current_user, routine_name, 'EXECUTE') as current_user_can_execute
FROM information_schema.routines 
WHERE routine_name IN ('procesar_venta_completa', 'procesar_venta_simple', 'procesar_venta_mixta')
AND routine_schema = 'public'
ORDER BY routine_name;

-- PASO 5: CONFIRMAR QUE EL SISTEMA ESTÁ LISTO
SELECT 
    'Sistema listo para usar funciones RPC' as seccion,
    'Permisos de ejecución otorgados' as estado,
    'Funciones RPC disponibles' as resultado;
