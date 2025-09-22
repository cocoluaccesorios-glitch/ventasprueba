# 📝 Referencias de Pago para Abono Mixto - Agregadas

## 📋 **Funcionalidad Agregada:**
Se agregaron campos de referencia de pago para abono mixto, que se habilitan automáticamente cuando el método de pago lo requiere.

## ✅ **Campos Agregados:**

### **1. Referencia USD:**
```html
<div class="form-group reference-group">
  <label class="modern-label">
    <i class="bi bi-receipt"></i>
    Referencia USD
  </label>
  <input type="text" class="modern-input" 
         v-model="referenciaAbonoUSD" 
         placeholder="Ej: Zelle ref, transferencia, etc."
         :disabled="!metodoPagoAbonoUSD || metodoPagoAbonoUSD === 'Efectivo (USD)'">
</div>
```

### **2. Referencia VES:**
```html
<div class="form-group reference-group">
  <label class="modern-label">
    <i class="bi bi-receipt"></i>
    Referencia VES
  </label>
  <input type="text" class="modern-input" 
         v-model="referenciaAbonoVES" 
         placeholder="Ej: Pago móvil, transferencia, etc."
         :disabled="!metodoPagoAbonoVES || metodoPagoAbonoVES === 'Punto de Venta (VES)'">
</div>
```

## 🔧 **Lógica de Habilitación:**

### **Referencia USD se habilita cuando:**
- ✅ Método de pago USD es "Zelle (USD)"
- ❌ Se deshabilita para "Efectivo (USD)"

### **Referencia VES se habilita cuando:**
- ✅ Método de pago VES es "Pago Móvil (VES)" o "Transferencia (VES)"
- ❌ Se deshabilita para "Punto de Venta (VES)"

## 📊 **Variables Reactivas Agregadas:**
```javascript
// Variables para pago mixto
const montoAbonoUSD = ref(0);
const montoAbonoVES = ref(0);
const metodoPagoAbonoUSD = ref('');
const metodoPagoAbonoVES = ref('');
const referenciaAbonoUSD = ref(''); // ✅ NUEVO
const referenciaAbonoVES = ref(''); // ✅ NUEVO
```

## 🎯 **Payload Actualizado:**
```javascript
// Datos para pago mixto
monto_abono_usd: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
  montoAbonoUSD.value : 0,
monto_abono_ves: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
  montoAbonoVES.value : 0,
metodo_pago_abono_usd: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
  metodoPagoAbonoUSD.value : null,
metodo_pago_abono_ves: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
  metodoPagoAbonoVES.value : null,
referencia_abono_usd: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
  referenciaAbonoUSD.value : null, // ✅ NUEVO
referencia_abono_ves: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
  referenciaAbonoVES.value : null, // ✅ NUEVO
```

## ✅ **Validación Inteligente:**
```javascript
// Validar referencias cuando aplique
const requiereReferenciaUSD = metodoPagoAbonoUSD.value && 
                             metodoPagoAbonoUSD.value !== 'Efectivo (USD)' && 
                             montoAbonoUSD.value > 0;
const referenciaUSDValida = !requiereReferenciaUSD || referenciaAbonoUSD.value.trim() !== '';

const requiereReferenciaVES = metodoPagoAbonoVES.value && 
                             metodoPagoAbonoVES.value !== 'Punto de Venta (VES)' && 
                             montoAbonoVES.value > 0;
const referenciaVESValida = !requiereReferenciaVES || referenciaAbonoVES.value.trim() !== '';

return montoValido && metodoUSDValido && metodoVESValido && referenciaUSDValida && referenciaVESValida;
```

## 🧹 **Limpieza de Formulario:**
```javascript
// Limpiar campos de abono mejorado
tipoPagoAbono.value = 'simple';
metodoPagoAbono.value = '';
montoAbonoSimple.value = 0;
montoAbonoUSD.value = 0;
montoAbonoVES.value = 0;
metodoPagoAbonoUSD.value = '';
metodoPagoAbonoVES.value = '';
referenciaAbonoUSD.value = ''; // ✅ NUEVO
referenciaAbonoVES.value = ''; // ✅ NUEVO
```

## 🗄️ **Base de Datos:**
```javascript
// Campos para abono
es_abono: ventaData.es_abono || false,
tipo_pago_abono: ventaData.tipo_pago_abono || null,
metodo_pago_abono: ventaData.metodo_pago_abono || null,
monto_abono_simple: ventaData.monto_abono_simple || 0,
monto_abono_usd: ventaData.monto_abono_usd || 0,
monto_abono_ves: ventaData.monto_abono_ves || 0,
metodo_pago_abono_usd: ventaData.metodo_pago_abono_usd || null,
metodo_pago_abono_ves: ventaData.metodo_pago_abono_ves || null,
referencia_abono_usd: ventaData.referencia_abono_usd || null, // ✅ NUEVO
referencia_abono_ves: ventaData.referencia_abono_ves || null, // ✅ NUEVO
total_abono_usd: ventaData.total_abono_usd || 0,
fecha_vencimiento: ventaData.fecha_vencimiento || null,
```

## 🎯 **Resultado:**
- ✅ **Formulario**: Campos de referencia se habilitan automáticamente cuando es necesario
- ✅ **Validación**: Se valida que las referencias estén presentes cuando el método de pago lo requiere
- ✅ **Base de Datos**: Las referencias se guardan correctamente
- ✅ **UX**: Los campos se deshabilitan automáticamente para métodos que no requieren referencia

## 🧪 **Pruebas Recomendadas:**
1. Crear abono mixto con Zelle (USD) - verificar que se habilite referencia USD
2. Crear abono mixto con Pago Móvil (VES) - verificar que se habilite referencia VES
3. Crear abono mixto con Efectivo (USD) - verificar que se deshabilite referencia USD
4. Crear abono mixto con Punto de Venta (VES) - verificar que se deshabilite referencia VES
5. Verificar que las referencias se guarden en la base de datos
6. Verificar que se muestren en el detalle del pedido
