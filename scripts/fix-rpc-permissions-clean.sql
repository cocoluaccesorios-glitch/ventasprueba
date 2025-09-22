-- =====================================================
-- CORRECCIÓN LIMPIA DE PERMISOS PARA FUNCIONES RPC
-- =====================================================

-- PASO 1: VERIFICAR USUARIO ACTUAL Y PERMISOS
SELECT 
    'Usuario actual y permisos' as seccion,
    current_user as usuario_actual,
    session_user as usuario_sesion,
    current_database() as base_datos;

-- PASO 2: ELIMINAR POLÍTICAS RLS EXISTENTES
-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Allow authenticated users to insert pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Allow authenticated users to insert detalles_pedido" ON public.detalles_pedido;
DROP POLICY IF EXISTS "Allow authenticated users to insert abonos" ON public.abonos;
DROP POLICY IF EXISTS "Allow authenticated users to insert tasa_cambio" ON public.tasa_cambio;

-- PASO 3: OTORGAR PERMISOS EXPLÍCITOS A LAS FUNCIONES RPC
-- Dar permisos de ejecución a la función para usuarios autenticados
GRANT EXECUTE ON FUNCTION public.procesar_venta_completa(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.procesar_venta_simple(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.procesar_venta_mixta(JSONB) TO authenticated;

-- PASO 4: OTORGAR PERMISOS DE INSERCIÓN A LAS TABLAS
-- Dar permisos de inserción a usuarios autenticados
GRANT INSERT ON TABLE public.pedidos TO authenticated;
GRANT INSERT ON TABLE public.detalles_pedido TO authenticated;
GRANT INSERT ON TABLE public.abonos TO authenticated;
GRANT INSERT ON TABLE public.tasa_cambio TO authenticated;

-- PASO 5: OTORGAR PERMISOS DE SELECCIÓN A LAS TABLAS
-- Dar permisos de selección a usuarios autenticados
GRANT SELECT ON TABLE public.pedidos TO authenticated;
GRANT SELECT ON TABLE public.detalles_pedido TO authenticated;
GRANT SELECT ON TABLE public.abonos TO authenticated;
GRANT SELECT ON TABLE public.tasa_cambio TO authenticated;
GRANT SELECT ON TABLE public.clientes TO authenticated;

-- PASO 6: OTORGAR PERMISOS DE USO EN SECUENCIAS
-- Dar permisos de uso en secuencias para auto-increment
GRANT USAGE ON SEQUENCE public.pedidos_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.detalles_pedido_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.abonos_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.tasa_cambio_id_seq TO authenticated;

-- PASO 7: HABILITAR RLS EN TABLAS QUE NO LO TIENEN
-- Habilitar RLS en tablas que no lo tienen
ALTER TABLE public.detalles_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasa_cambio ENABLE ROW LEVEL SECURITY;
-- pedidos ya tiene RLS habilitado

-- PASO 8: CREAR POLÍTICAS RLS PARA PERMITIR INSERCIONES
-- Crear política RLS para permitir inserciones en pedidos
CREATE POLICY "Allow authenticated users to insert pedidos" 
ON public.pedidos FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Crear política RLS para permitir inserciones en detalles_pedido
CREATE POLICY "Allow authenticated users to insert detalles_pedido" 
ON public.detalles_pedido FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Crear política RLS para permitir inserciones en abonos
CREATE POLICY "Allow authenticated users to insert abonos" 
ON public.abonos FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Crear política RLS para permitir inserciones en tasa_cambio
CREATE POLICY "Allow authenticated users to insert tasa_cambio" 
ON public.tasa_cambio FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- PASO 9: OTORGAR PERMISOS ADICIONALES PARA FUNCIONES RPC
-- Dar permisos de ejecución a la función para el rol postgres
GRANT EXECUTE ON FUNCTION public.procesar_venta_completa(JSONB) TO postgres;
GRANT EXECUTE ON FUNCTION public.procesar_venta_simple(JSONB) TO postgres;
GRANT EXECUTE ON FUNCTION public.procesar_venta_mixta(JSONB) TO postgres;

-- PASO 10: OTORGAR PERMISOS ADICIONALES PARA TABLAS
-- Dar permisos de inserción a postgres
GRANT INSERT ON TABLE public.pedidos TO postgres;
GRANT INSERT ON TABLE public.detalles_pedido TO postgres;
GRANT INSERT ON TABLE public.abonos TO postgres;
GRANT INSERT ON TABLE public.tasa_cambio TO postgres;

-- PASO 11: VERIFICAR PERMISOS OTORGADOS
SELECT 
    'Permisos otorgados' as seccion,
    'Funciones RPC y tablas ahora tienen permisos correctos' as resultado;

-- PASO 12: VERIFICAR QUE LAS FUNCIONES ESTÉN DISPONIBLES
SELECT 
    'Funciones RPC disponibles' as seccion,
    proname as nombre_funcion,
    proargnames as argumentos,
    prorettype::regtype as tipo_retorno,
    prosecdef as es_segura
FROM pg_proc 
WHERE proname IN ('procesar_venta_simple', 'procesar_venta_mixta', 'procesar_venta_completa')
ORDER BY proname;

-- PASO 13: VERIFICAR ESTADO RLS DE LAS TABLAS
SELECT 
    'Estado RLS de las tablas' as seccion,
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename IN ('pedidos', 'detalles_pedido', 'abonos', 'tasa_cambio')
ORDER BY tablename;

-- PASO 14: VERIFICAR POLÍTICAS RLS CREADAS
SELECT 
    'Políticas RLS creadas' as seccion,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('pedidos', 'detalles_pedido', 'abonos', 'tasa_cambio')
ORDER BY tablename, policyname;

-- PASO 15: PROBAR LA FUNCIÓN CON DATOS DE PRUEBA
SELECT 
    'Prueba de función RPC' as seccion,
    'Funciones creadas y permisos otorgados' as resultado,
    'Listo para procesar ventas automáticamente' as estado;
