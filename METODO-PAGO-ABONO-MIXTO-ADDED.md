# 💳 Método de Pago para Abono Mixto - Agregado

## 📋 **Problema Identificado:**
El formulario de abono mixto no tenía campos para especificar los métodos de pago para USD y VES, lo que resultaba en "Método del Abono: No especificado" en el detalle del pedido.

## ✅ **Solución Implementada:**

### **1. Campos de Método de Pago Agregados:**
```html
<!-- Método de Pago USD -->
<div class="form-group payment-method-group">
  <label class="modern-label">
    <i class="bi bi-wallet2"></i>
    Método de Pago USD
  </label>
  <div class="select-container">
    <select class="modern-select" v-model="metodoPagoAbonoUSD">
      <option value="">-- Seleccione --</option>
      <option value="Efectivo (USD)">Efectivo (USD)</option>
      <option value="Zelle (USD)">Zelle (USD)</option>
    </select>
  </div>
</div>

<!-- Método de Pago VES -->
<div class="form-group payment-method-group">
  <label class="modern-label">
    <i class="bi bi-wallet2"></i>
    Método de Pago VES
  </label>
  <div class="select-container">
    <select class="modern-select" v-model="metodoPagoAbonoVES">
      <option value="">-- Seleccione --</option>
      <option value="Punto de Venta (VES)">Punto de Venta (VES)</option>
      <option value="Pago Móvil (VES)">Pago Móvil (VES)</option>
      <option value="Transferencia (VES)">Transferencia (VES)</option>
    </select>
  </div>
</div>
```

### **2. Variables Reactivas Agregadas:**
```javascript
// Variables para pago mixto
const montoAbonoUSD = ref(0);
const montoAbonoVES = ref(0);
const metodoPagoAbonoUSD = ref(''); // ✅ NUEVO
const metodoPagoAbonoVES = ref(''); // ✅ NUEVO
```

### **3. Payload Actualizado:**
```javascript
// Datos para pago mixto
monto_abono_usd: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
  montoAbonoUSD.value : 0,
monto_abono_ves: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
  montoAbonoVES.value : 0,
metodo_pago_abono_usd: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
  metodoPagoAbonoUSD.value : null, // ✅ NUEVO
metodo_pago_abono_ves: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
  metodoPagoAbonoVES.value : null, // ✅ NUEVO
```

### **4. Validación Mejorada:**
```javascript
// Validar que si hay monto USD, tenga método de pago USD
const metodoUSDValido = montoAbonoUSD.value <= 0 || metodoPagoAbonoUSD.value !== '';

// Validar que si hay monto VES, tenga método de pago VES
const metodoVESValido = montoAbonoVES.value <= 0 || metodoPagoAbonoVES.value !== '';

return montoValido && metodoUSDValido && metodoVESValido;
```

### **5. Limpieza de Formulario:**
```javascript
// Limpiar campos de abono mejorado
tipoPagoAbono.value = 'simple';
metodoPagoAbono.value = '';
montoAbonoSimple.value = 0;
montoAbonoUSD.value = 0;
montoAbonoVES.value = 0;
metodoPagoAbonoUSD.value = ''; // ✅ NUEVO
metodoPagoAbonoVES.value = ''; // ✅ NUEVO
```

### **6. API Service Actualizado:**
```javascript
// Campos para abono
es_abono: ventaData.es_abono || false,
tipo_pago_abono: ventaData.tipo_pago_abono || null,
metodo_pago_abono: ventaData.metodo_pago_abono || null,
monto_abono_simple: ventaData.monto_abono_simple || 0,
monto_abono_usd: ventaData.monto_abono_usd || 0,
monto_abono_ves: ventaData.monto_abono_ves || 0,
metodo_pago_abono_usd: ventaData.metodo_pago_abono_usd || null, // ✅ NUEVO
metodo_pago_abono_ves: ventaData.metodo_pago_abono_ves || null, // ✅ NUEVO
total_abono_usd: ventaData.total_abono_usd || 0,
fecha_vencimiento: ventaData.fecha_vencimiento || null,
```

## 🎯 **Resultado:**
- ✅ **Formulario**: Ahora incluye campos para especificar métodos de pago USD y VES en abono mixto
- ✅ **Validación**: Se valida que si hay monto en una moneda, tenga método de pago correspondiente
- ✅ **Base de Datos**: Los métodos de pago se guardan correctamente
- ✅ **Detalle**: El detalle del pedido mostrará los métodos de pago específicos en lugar de "No especificado"

## 🧪 **Pruebas Recomendadas:**
1. Crear una venta con abono mixto
2. Ingresar montos USD y VES
3. Seleccionar métodos de pago para cada moneda
4. Verificar que se guarde correctamente en la base de datos
5. Verificar que se muestre correctamente en el detalle del pedido
