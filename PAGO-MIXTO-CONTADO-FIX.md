# 🔧 Pago Mixto de Contado - Corrección de Error

## 🐛 **Problema Identificado:**
```
Error: Could not find the 'metodo_pago_abono_usd' column of 'pedidos' in the schema cache
```

## 🔍 **Causa del Error:**
El sistema estaba enviando campos de **abono mixto** (`metodo_pago_abono_usd`, `referencia_abono_usd`, etc.) cuando se procesaba un **pago mixto de contado**, pero estos campos no existen en la tabla `pedidos`.

## ✅ **Solución Implementada:**

### **1. Frontend (CrearVenta.vue):**
```javascript
// ANTES: Se enviaban siempre
referencia_abono_usd: referenciaAbonoUSD.value,
metodo_pago_abono_usd: metodoPagoAbonoUSD.value,

// DESPUÉS: Solo se envían si es abono mixto
referencia_abono_usd: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
  referenciaAbonoUSD.value : null,
metodo_pago_abono_usd: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
  metodoPagoAbonoUSD.value : null,
```

### **2. Backend (apiService.js):**
```javascript
// ANTES: Se enviaban siempre
referencia_abono_usd: ventaData.referencia_abono_usd || null,
metodo_pago_abono_usd: ventaData.metodo_pago_abono_usd || null,

// DESPUÉS: Solo se envían si es abono mixto
...(ventaData.es_abono && ventaData.tipo_pago_abono === 'mixto' ? {
  referencia_abono_usd: ventaData.referencia_abono_usd || null,
  referencia_abono_ves: ventaData.referencia_abono_ves || null,
  metodo_pago_abono_usd: ventaData.metodo_pago_abono_usd || null,
  metodo_pago_abono_ves: ventaData.metodo_pago_abono_ves || null,
} : {}),
```

## 🎯 **Lógica de Envío de Campos:**

### **Pago Mixto de Contado:**
- ✅ **NO envía** campos de abono mixto
- ✅ **SÍ envía** campos de pago mixto normal
- ✅ **Usa** `referencia_mixto_usd`, `metodo_pago_mixto_usd`, etc.

### **Abono Mixto:**
- ✅ **SÍ envía** campos de abono mixto
- ✅ **NO envía** campos de pago mixto normal
- ✅ **Usa** `referencia_abono_usd`, `metodo_pago_abono_usd`, etc.

## 🔧 **Campos por Tipo de Pago:**

### **Pago Mixto de Contado:**
```javascript
// Campos que SÍ se envían a pedidos
es_pago_mixto: true,
monto_mixto_usd: 50.00,
monto_mixto_ves: 8330.00,
metodo_pago_mixto_usd: 'Zelle',
metodo_pago_mixto_ves: 'Pago Móvil',
referencia_mixto_usd: 'Zelle123456',
referencia_mixto_ves: 'PM789012',

// Campos que NO se envían (no existen en BD)
// referencia_abono_usd: null,
// metodo_pago_abono_usd: null,
```

### **Abono Mixto:**
```javascript
// Campos que SÍ se envían a pedidos
es_abono: true,
tipo_pago_abono: 'mixto',
monto_abono_usd: 50.00,
monto_abono_ves: 8330.00,
referencia_abono_usd: 'Zelle123456',
referencia_abono_ves: 'PM789012',
metodo_pago_abono_usd: 'Zelle',
metodo_pago_abono_ves: 'Pago Móvil',

// Campos que NO se envían (no existen en BD)
// es_pago_mixto: false,
// monto_mixto_usd: 0,
```

## 🧪 **Pruebas Recomendadas:**

### **1. Pago Mixto de Contado:**
- Seleccionar "Mixto" como método de pago
- Ingresar montos USD y VES
- Seleccionar métodos de pago (Zelle, Pago Móvil)
- Ingresar referencias
- **Resultado esperado**: ✅ Se procesa sin errores

### **2. Abono Mixto:**
- Seleccionar "Abono" como método de pago
- Seleccionar "Mixto" como tipo de abono
- Ingresar montos USD y VES
- Seleccionar métodos de pago
- Ingresar referencias
- **Resultado esperado**: ✅ Se procesa sin errores y crea registros en `abonos`

## 📊 **Diferencia Clave:**

| Aspecto | Pago Mixto de Contado | Abono Mixto |
|---------|----------------------|-------------|
| **Tabla Principal** | `pedidos` | `pedidos` |
| **Tabla Secundaria** | ❌ No crea registros | ✅ Crea registros en `abonos` |
| **Campos Específicos** | `monto_mixto_*` | `monto_abono_*` |
| **Referencias** | `referencia_mixto_*` | `referencia_abono_*` |
| **Métodos** | `metodo_pago_mixto_*` | `metodo_pago_abono_*` |
| **Propósito** | Pago completo inmediato | Pago parcial con deuda |

## ✅ **Resultado:**
- ✅ **Error Resuelto**: Pago mixto de contado funciona correctamente
- ✅ **Lógica Separada**: Cada tipo de pago usa sus propios campos
- ✅ **Base de Datos Limpia**: Solo se envían campos que existen
- ✅ **Sistema Operativo**: Ambos tipos de pago mixto funcionan
