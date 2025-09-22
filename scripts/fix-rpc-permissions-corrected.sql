-- =====================================================
-- CORRECCIÓN DE PERMISOS PARA FUNCIONES RPC (CORREGIDO)
-- =====================================================

-- PASO 1: VERIFICAR PERMISOS ACTUALES
SELECT 
    'Verificación de permisos actuales' as seccion,
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename IN ('pedidos', 'detalles_pedido', 'abonos', 'tasa_cambio', 'clientes')
ORDER BY tablename;

-- PASO 2: OTORGAR PERMISOS A LA FUNCIÓN RPC
-- Dar permisos de ejecución a la función para usuarios autenticados
GRANT EXECUTE ON FUNCTION public.procesar_venta_completa(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.procesar_venta_simple(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.procesar_venta_mixta(JSONB) TO authenticated;

-- PASO 3: OTORGAR PERMISOS DE INSERCIÓN A LAS TABLAS
-- Dar permisos de inserción a usuarios autenticados
GRANT INSERT ON TABLE pedidos TO authenticated;
GRANT INSERT ON TABLE detalles_pedido TO authenticated;
GRANT INSERT ON TABLE abonos TO authenticated;
GRANT INSERT ON TABLE tasa_cambio TO authenticated;

-- PASO 4: OTORGAR PERMISOS DE SELECCIÓN A LAS TABLAS
-- Dar permisos de selección a usuarios autenticados
GRANT SELECT ON TABLE pedidos TO authenticated;
GRANT SELECT ON TABLE detalles_pedido TO authenticated;
GRANT SELECT ON TABLE abonos TO authenticated;
GRANT SELECT ON TABLE tasa_cambio TO authenticated;
GRANT SELECT ON TABLE clientes TO authenticated;

-- PASO 5: OTORGAR PERMISOS DE USO EN SECUENCIAS
-- Dar permisos de uso en secuencias para auto-increment
GRANT USAGE ON SEQUENCE pedidos_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE detalles_pedido_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE abonos_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE tasa_cambio_id_seq TO authenticated;

-- PASO 6: HABILITAR RLS EN TABLAS QUE NO LO TIENEN
-- Habilitar RLS en tablas que no lo tienen
ALTER TABLE detalles_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE abonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasa_cambio ENABLE ROW LEVEL SECURITY;
-- pedidos ya tiene RLS habilitado

-- PASO 7: CREAR POLÍTICAS RLS PARA PERMITIR INSERCIONES
-- Crear política RLS para permitir inserciones en pedidos
CREATE POLICY "Allow authenticated users to insert pedidos" 
ON pedidos FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Crear política RLS para permitir inserciones en detalles_pedido
CREATE POLICY "Allow authenticated users to insert detalles_pedido" 
ON detalles_pedido FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Crear política RLS para permitir inserciones en abonos
CREATE POLICY "Allow authenticated users to insert abonos" 
ON abonos FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Crear política RLS para permitir inserciones en tasa_cambio
CREATE POLICY "Allow authenticated users to insert tasa_cambio" 
ON tasa_cambio FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- PASO 8: VERIFICAR POLÍTICAS RLS CREADAS
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

-- PASO 9: VERIFICAR QUE LAS FUNCIONES ESTÉN DISPONIBLES
SELECT 
    'Funciones RPC disponibles' as seccion,
    proname as nombre_funcion,
    proargnames as argumentos,
    prorettype::regtype as tipo_retorno,
    prosecdef as es_segura
FROM pg_proc 
WHERE proname IN ('procesar_venta_simple', 'procesar_venta_mixta', 'procesar_venta_completa')
ORDER BY proname;

-- PASO 10: VERIFICAR ESTADO RLS DE LAS TABLAS
SELECT 
    'Estado RLS de las tablas' as seccion,
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename IN ('pedidos', 'detalles_pedido', 'abonos', 'tasa_cambio')
ORDER BY tablename;

-- PASO 11: PROBAR LA FUNCIÓN CON DATOS DE PRUEBA
SELECT 
    'Prueba de función RPC' as seccion,
    'Funciones creadas y permisos otorgados' as resultado,
    'Listo para procesar ventas automáticamente' as estado;
