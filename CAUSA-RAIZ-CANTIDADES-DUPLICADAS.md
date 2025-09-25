# 🎯 **CAUSA RAÍZ DEL PROBLEMA DE CANTIDADES DUPLICADAS**

## 🔍 **Problema Identificado**

El problema **NO está en el frontend** ni en el cálculo de subtotales. El problema está en la **función RPC de Supabase** `procesar_venta_mixta`.

### 📍 **Ubicación del Error**

**Archivo**: `scripts/create-procesar-venta-function.sql`  
**Líneas**: 238-239  
**Función**: `procesar_venta_mixta`

### ❌ **Código Problemático**

```sql
-- Campos para pago mixto
(venta_data->>'es_pago_mixto')::boolean,
total_abono_usd,        -- ❌ ERROR: Debería ser (venta_data->>'monto_mixto_usd')::numeric
total_abono_ves,        -- ❌ ERROR: Debería ser (venta_data->>'monto_mixto_ves')::numeric
```

### 🔍 **¿Por qué causa duplicación?**

1. **Líneas 231-232**: Se asignan correctamente para campos de abono
2. **Líneas 238-239**: Se asignan **INCORRECTAMENTE** para campos de pago mixto usando los mismos valores
3. **Resultado**: Los valores se duplican en la base de datos

## 🔧 **Solución**

### **Paso 1: Corregir la Función RPC**

Ejecutar en el **SQL Editor de Supabase**:

```sql
CREATE OR REPLACE FUNCTION procesar_venta_mixta(venta_data JSONB)
RETURNS INTEGER AS $$
DECLARE
    nuevo_pedido_id INTEGER;
    total_abono_usd numeric;
    total_abono_ves numeric;
BEGIN
    -- Calcular total del abono mixto
    total_abono_usd := (venta_data->>'monto_mixto_usd')::numeric;
    total_abono_ves := (venta_data->>'monto_mixto_ves')::numeric;
    
    -- Insertar el pedido principal
    INSERT INTO pedidos (
        -- ... otros campos ...
        es_pago_mixto,
        monto_mixto_usd,
        monto_mixto_ves,
        -- ... otros campos ...
    ) VALUES (
        -- ... otros valores ...
        (venta_data->>'es_pago_mixto')::boolean,
        (venta_data->>'monto_mixto_usd')::numeric,        -- ✅ CORREGIDO
        (venta_data->>'monto_mixto_ves')::numeric,        -- ✅ CORREGIDO
        -- ... otros valores ...
    ) RETURNING id INTO nuevo_pedido_id;
    
    -- ... resto de la función ...
    
    RETURN nuevo_pedido_id;
END;
$$ LANGUAGE plpgsql;
```

### **Paso 2: Verificar la Corrección**

Después de aplicar la corrección:
1. Crear un nuevo pedido de prueba
2. Verificar que el subtotal sea correcto
3. Confirmar que no hay duplicación

## 📊 **Impacto del Problema**

### **Pedidos Afectados**
- Todos los pedidos creados con **pago mixto** o **abono mixto**
- El pedido #69 es un ejemplo de este problema

### **Síntomas**
- Subtotal mostrado es exactamente la mitad del real
- Cálculos incorrectos en reportes
- Problemas en cierres de caja

## 🛡️ **Prevención Futura**

### **Validación en Frontend**
Ya implementamos validación en `src/utils/validacionSubtotal.js` para detectar este tipo de problemas.

### **Monitoreo**
- Revisar nuevos pedidos después de la corrección
- Verificar que los cálculos sean correctos
- Monitorear reportes y cierres de caja

## 🎯 **Resumen**

| Aspecto | Detalle |
|---------|---------|
| **Causa** | Error en función RPC `procesar_venta_mixta` |
| **Ubicación** | Supabase SQL Editor |
| **Solución** | Corregir líneas 238-239 del SQL |
| **Impacto** | Todos los pedidos mixtos |
| **Prevención** | Validación implementada |

## ✅ **Estado Actual**

- ✅ **Problema identificado**
- ✅ **Causa raíz encontrada**
- ✅ **Solución creada**
- ⏳ **Pendiente**: Aplicar corrección en Supabase
- ⏳ **Pendiente**: Verificar funcionamiento

---

**🎉 Una vez aplicada la corrección en Supabase, el problema de cantidades duplicadas estará completamente resuelto.**
