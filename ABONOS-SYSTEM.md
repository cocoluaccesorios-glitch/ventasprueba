# 💰 Sistema de Gestión de Abonos y Deudas

## 🎯 **Problema Identificado:**

El sistema actual no tiene una **base de datos de abonos** adecuada, lo que causa:
- ❌ **Información incorrecta** de saldos pendientes
- ❌ **Imposibilidad de rastrear** pagos parciales
- ❌ **Cálculos erróneos** de deudas
- ❌ **Falta de historial** de abonos

## ✅ **Solución Implementada:**

### **1. Nueva Tabla de Abonos**
```sql
CREATE TABLE abonos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
    cliente_id INTEGER REFERENCES clientes(id),
    
    -- Información del abono
    monto_abono_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
    monto_abono_ves DECIMAL(12,2) NOT NULL DEFAULT 0,
    tasa_bcv DECIMAL(10,8) NOT NULL,
    
    -- Método de pago
    metodo_pago_abono VARCHAR(50) NOT NULL,
    referencia_pago VARCHAR(100),
    
    -- Tipo de abono
    tipo_abono VARCHAR(20) NOT NULL DEFAULT 'simple', -- 'simple', 'mixto'
    
    -- Fechas
    fecha_abono TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_vencimiento DATE,
    
    -- Estado
    estado_abono VARCHAR(20) NOT NULL DEFAULT 'confirmado',
    
    -- Información adicional
    comentarios TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **2. Funciones de Cálculo**
```sql
-- Calcular saldo pendiente de un pedido
CREATE FUNCTION calcular_saldo_pendiente(pedido_id_param INTEGER)
RETURNS DECIMAL(10,2);

-- Obtener resumen de deudas por cliente
CREATE FUNCTION obtener_resumen_deudas_cliente(cliente_id_param INTEGER)
RETURNS TABLE (...);
```

### **3. Vista de Resumen de Deudas**
```sql
CREATE VIEW vista_resumen_deudas AS
SELECT 
    p.id as pedido_id,
    p.cliente_cedula,
    p.cliente_nombre || ' ' || p.cliente_apellido as cliente_completo,
    p.total_usd,
    p.tasa_bcv,
    p.total_usd * p.tasa_bcv as total_ves,
    COALESCE(SUM(a.monto_abono_usd), 0) as total_abonado_usd,
    calcular_saldo_pendiente(p.id) as saldo_pendiente_usd,
    calcular_saldo_pendiente(p.id) * p.tasa_bcv as saldo_pendiente_ves,
    COUNT(a.id) as cantidad_abonos
FROM pedidos p
LEFT JOIN abonos a ON a.pedido_id = p.id AND a.estado_abono = 'confirmado'
WHERE p.estado_entrega != 'anulado'
GROUP BY p.id, p.cliente_cedula, p.cliente_nombre, p.cliente_apellido, 
         p.total_usd, p.tasa_bcv, p.fecha_pedido, p.estado_entrega;
```

## 🚀 **Scripts Creados:**

### **1. Crear Tabla de Abonos**
```bash
npm run abonos:create-table
```
- **Archivo**: `scripts/create-abonos-table.sql`
- **Función**: Crea la tabla, índices, funciones y vistas
- **Ejecutar**: En el SQL Editor de Supabase

### **2. Migrar Abonos Existentes**
```bash
npm run abonos:migrate
```
- **Archivo**: `scripts/migrate-existing-abonos.js`
- **Función**: Migra abonos existentes de la tabla `pedidos` a la nueva tabla `abonos`
- **Resultado**: Crea registros de abonos basados en datos existentes

### **3. Servicio de Abonos**
```bash
npm run abonos:service
```
- **Archivo**: `scripts/abonos-service.js`
- **Función**: Servicio completo para gestionar abonos
- **Incluye**: Crear, consultar, calcular saldos, generar reportes

## 📊 **Funcionalidades del Sistema:**

### **1. Gestión de Abonos**
- ✅ **Crear abonos** individuales por pedido
- ✅ **Registrar múltiples abonos** por pedido
- ✅ **Soporte para abonos simples y mixtos**
- ✅ **Historial completo** de pagos

### **2. Cálculo de Deudas**
- ✅ **Saldo pendiente** automático
- ✅ **Total abonado** por pedido
- ✅ **Deudas por cliente** agregadas
- ✅ **Conversión automática** USD/VES

### **3. Reportes y Consultas**
- ✅ **Resumen de deudas** por cliente
- ✅ **Lista de clientes** con deudas
- ✅ **Historial de abonos** por pedido
- ✅ **Métricas de cobranza**

## 🔧 **Implementación:**

### **Paso 1: Crear la Tabla**
```sql
-- Ejecutar en Supabase SQL Editor
-- Archivo: scripts/create-abonos-table.sql
```

### **Paso 2: Migrar Datos Existentes**
```bash
npm run abonos:migrate
```

### **Paso 3: Verificar Migración**
```bash
npm run abonos:service
```

### **Paso 4: Actualizar Frontend**
- Modificar `ListaPedidos.vue` para usar la nueva lógica
- Actualizar `CrearVenta.vue` para crear abonos
- Implementar interfaz de gestión de abonos

## 📈 **Beneficios del Nuevo Sistema:**

### **1. Precisión de Datos**
- ✅ **Saldos exactos** calculados automáticamente
- ✅ **Historial completo** de todos los pagos
- ✅ **Trazabilidad** de cada transacción

### **2. Gestión de Deudas**
- ✅ **Identificación precisa** de clientes con deudas
- ✅ **Seguimiento de pagos** parciales
- ✅ **Reportes automáticos** de cobranza

### **3. Escalabilidad**
- ✅ **Soporte para múltiples abonos** por pedido
- ✅ **Flexibilidad** en tipos de pago
- ✅ **Extensibilidad** para nuevas funcionalidades

## 🎯 **Próximos Pasos:**

### **1. Implementación Inmediata**
- [ ] Ejecutar script SQL para crear tabla
- [ ] Migrar abonos existentes
- [ ] Verificar funcionamiento

### **2. Actualización del Frontend**
- [ ] Modificar lógica de cálculo de deudas
- [ ] Crear interfaz de gestión de abonos
- [ ] Implementar reportes de deudas

### **3. Mejoras Futuras**
- [ ] Notificaciones automáticas de vencimientos
- [ ] Integración con sistema de cobranza
- [ ] Reportes avanzados de análisis

## 🚀 **Resultado Esperado:**

Después de implementar el sistema:
- ✅ **Pedido #29** mostrará el saldo pendiente correcto
- ✅ **Historial completo** de abonos por pedido
- ✅ **Cálculos precisos** de deudas por cliente
- ✅ **Sistema robusto** para gestión de cuentas por cobrar

**¡El sistema de abonos resolverá completamente el problema de información incorrecta de deudas!** 🎉
