-- =====================================================
-- CORRECCIÓN ESPECÍFICA PARA PEDIDO #32
-- =====================================================

-- PASO 1: VERIFICAR ESTADO ACTUAL DEL PEDIDO #32
SELECT 
    'Estado actual del pedido #32' as seccion,
    id,
    cliente_nombre,
    total_usd,
    metodo_pago,
    es_abono,
    total_abono_usd,
    tasa_bcv,
    estado_entrega
FROM pedidos 
WHERE id = 32;

-- PASO 2: ACTUALIZAR PEDIDO #32 CON INFORMACIÓN DE ABONO
UPDATE pedidos 
SET 
    es_abono = TRUE,
    tipo_pago_abono = 'simple',
    metodo_pago_abono = 'efectivo',
    monto_abono_simple = 50.00,
    monto_abono_usd = 50.00,
    monto_abono_ves = 50.00 * 166.5800,
    total_abono_usd = 50.00,
    referencia_pago = 'Abono inicial pedido #32',
    fecha_vencimiento = CURRENT_DATE + INTERVAL '30 days',
    tasa_bcv = 166.5800
WHERE id = 32;

-- PASO 3: CREAR REGISTRO EN TABLA ABONOS PARA PEDIDO #32
INSERT INTO abonos (
    pedido_id,
    cliente_id,
    monto_abono_usd,
    monto_abono_ves,
    tasa_bcv,
    metodo_pago_abono,
    referencia_pago,
    tipo_abono,
    fecha_vencimiento,
    estado_abono,
    comentarios
)
SELECT 
    32 as pedido_id,
    p.cliente_id,
    50.00 as monto_abono_usd,
    50.00 * 166.5800 as monto_abono_ves,
    166.5800 as tasa_bcv,
    'efectivo' as metodo_pago_abono,
    'Abono inicial pedido #32' as referencia_pago,
    'simple' as tipo_abono,
    CURRENT_DATE + INTERVAL '30 days' as fecha_vencimiento,
    'confirmado' as estado_abono,
    'Abono de $50.00 USD corregido manualmente' as comentarios
FROM pedidos p
WHERE p.id = 32
-- Evitar duplicados
AND NOT EXISTS (
    SELECT 1 FROM abonos a WHERE a.pedido_id = 32
);

-- PASO 4: VERIFICAR CORRECCIÓN DEL PEDIDO #32
SELECT 
    'Verificación de corrección del pedido #32' as seccion,
    p.id,
    p.cliente_nombre,
    p.total_usd,
    p.total_abono_usd,
    p.total_usd - p.total_abono_usd as saldo_pendiente,
    p.tasa_bcv,
    p.es_abono,
    p.estado_entrega
FROM pedidos p
WHERE p.id = 32;

-- PASO 5: VERIFICAR ABONO CREADO
SELECT 
    'Abono creado para pedido #32' as seccion,
    a.id,
    a.pedido_id,
    a.monto_abono_usd,
    a.monto_abono_ves,
    a.tasa_bcv,
    a.metodo_pago_abono,
    a.tipo_abono,
    a.estado_abono,
    a.comentarios
FROM abonos a
WHERE a.pedido_id = 32;

-- PASO 6: VERIFICAR SALDO PENDIENTE CALCULADO
SELECT 
    'Saldo pendiente calculado para pedido #32' as seccion,
    p.id as pedido_id,
    p.cliente_nombre,
    p.total_usd,
    COALESCE(SUM(a.monto_abono_usd), 0) as total_abonado,
    calcular_saldo_pendiente(p.id) as saldo_pendiente
FROM pedidos p
LEFT JOIN abonos a ON a.pedido_id = p.id AND a.estado_abono = 'confirmado'
WHERE p.id = 32
GROUP BY p.id, p.cliente_nombre, p.total_usd;

-- PASO 7: ACTUALIZAR TASA BCV EN PEDIDO #32
UPDATE pedidos 
SET tasa_bcv = 166.5800
WHERE id = 32;

-- PASO 8: VERIFICAR RESULTADO FINAL
SELECT 
    'Resultado final del pedido #32' as seccion,
    p.id,
    p.cliente_nombre,
    p.total_usd,
    p.total_abono_usd,
    p.total_usd - p.total_abono_usd as saldo_pendiente,
    p.tasa_bcv,
    p.es_abono,
    p.estado_entrega,
    'CORREGIDO' as estado_correccion
FROM pedidos p
WHERE p.id = 32;
