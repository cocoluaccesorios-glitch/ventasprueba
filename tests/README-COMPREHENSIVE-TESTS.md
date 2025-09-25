# 🧪 Pruebas Comprehensivas de Ventas - Sistema Cocolú

Este conjunto de pruebas automatizadas cubre **TODAS las variantes posibles** de formularios de pedidos en tu aplicación de ventas, asegurando que no haya bugs en el registro de datos.

## 📋 Variantes Cubiertas

### 1. **Tipos de Pago**
- ✅ **Contado** - Pago completo al momento
- ✅ **Abono Simple** - Un solo método de pago para el abono
- ✅ **Abono Mixto** - Combinación USD + VES para el abono
- ✅ **Mixto** - Pago parcial contado + crédito

### 2. **Métodos de Pago**
- ✅ **Efectivo (USD)**
- ✅ **Zelle (USD)**
- ✅ **Punto de Venta (VES)**
- ✅ **Pago Móvil (VES)**
- ✅ **Transferencia (VES)**

### 3. **Tipos de Productos**
- ✅ **Productos del Inventario** - Con SKU, stock, precios
- ✅ **Productos Manuales** - Servicios, productos personalizados
- ✅ **Combinaciones Mixtas** - Inventario + Manuales

### 4. **Configuraciones Adicionales**
- ✅ **Con/Sin IVA** (16%)
- ✅ **Con/Sin Descuentos** (con comentarios obligatorios)
- ✅ **Con/Sin Delivery** (con comentarios)
- ✅ **Entrega Inmediata/Diferida**
- ✅ **Referencias de Pago** (cuando son requeridas)
- ✅ **Comentarios Generales**

### 5. **Escenarios de Validación**
- ✅ **Formularios Mínimos** - Solo campos obligatorios
- ✅ **Formularios Completos** - Todas las opciones
- ✅ **Validación de Errores** - Campos faltantes, datos inválidos
- ✅ **Registro Real** - Pruebas que realmente guardan en la base de datos

## 🚀 Cómo Ejecutar las Pruebas

### Opción 1: Ejecución Completa (Recomendada)
```bash
# Ejecutar todas las pruebas con reporte completo
node tests/run-comprehensive-tests.js
```

### Opción 2: Ejecución Individual
```bash
# Pruebas comprehensivas básicas
npx playwright test tests/comprehensive-sales-tests.spec.js

# Ejecutor masivo de pruebas
npx playwright test tests/comprehensive-test-runner.spec.js

# Pruebas avanzadas existentes
npx playwright test tests/advanced-sales-tests.spec.js
```

### Opción 3: Ejecución con Configuración Específica
```bash
# Solo pruebas de contado
npx playwright test tests/comprehensive-sales-tests.spec.js --grep "Contado"

# Solo pruebas de abono
npx playwright test tests/comprehensive-sales-tests.spec.js --grep "Abono"

# Solo pruebas de registro real
npx playwright test tests/comprehensive-test-runner.spec.js --grep "Registro Real"
```

## 📊 Reportes Generados

Las pruebas generan reportes detallados en:

- **JSON**: `test-results/comprehensive-test-report-[timestamp].json`
- **HTML**: `test-results/comprehensive-test-report-[timestamp].html`
- **Screenshots**: `tests/screenshots/` (en caso de errores)

## 🔧 Archivos Principales

### Generadores de Datos
- `tests/utils/comprehensiveTestDataGenerator.js` - Genera datos para todas las variantes
- `tests/utils/testDataGenerator.js` - Generador básico (existente)

### Helpers de Pruebas
- `tests/utils/comprehensiveSalesFormHelper.js` - Helper completo para formularios
- `tests/utils/salesFormHelper.js` - Helper básico (existente)
- `tests/utils/authHelper.js` - Helper de autenticación (existente)

### Archivos de Pruebas
- `tests/comprehensive-sales-tests.spec.js` - Pruebas organizadas por categorías
- `tests/comprehensive-test-runner.spec.js` - Ejecutor masivo automatizado
- `tests/run-comprehensive-tests.js` - Script de ejecución con reportes

## 📈 Estadísticas de Cobertura

Las pruebas cubren aproximadamente **200+ combinaciones diferentes**:

- **25 combinaciones** de Contado (5 métodos × 5 variantes)
- **25 combinaciones** de Abono Simple (5 métodos × 5 variantes)
- **5 combinaciones** de Abono Mixto
- **5 combinaciones** de Pago Mixto
- **10 combinaciones** de productos mixtos
- **5 escenarios** de validación de errores
- **3 pruebas** de registro real
- **Múltiples variantes** de configuración adicional

## 🎯 Objetivos de las Pruebas

### ✅ Validación de Formularios
- Todos los campos obligatorios se llenan correctamente
- Las validaciones funcionan como se espera
- Los cálculos (subtotal, total, IVA) son correctos
- Las referencias se requieren cuando es necesario

### ✅ Registro de Datos
- Los datos se guardan correctamente en la base de datos
- No hay pérdida de información durante el proceso
- Los IDs y relaciones se mantienen correctos
- Los timestamps y metadatos se registran

### ✅ Detección de Bugs
- Campos que no se guardan
- Cálculos incorrectos
- Validaciones que fallan
- Referencias que no se requieren cuando deberían
- Productos que no se registran correctamente

## 🔍 Interpretación de Resultados

### ✅ Pruebas Exitosas
- Formulario se llena correctamente
- Validaciones pasan
- Datos se registran sin errores
- Cálculos son correctos

### ❌ Pruebas Fallidas
- Revisar logs para identificar el problema específico
- Verificar si es un problema de interfaz o de lógica
- Comprobar si los datos se están guardando correctamente
- Verificar cálculos y validaciones

### ⚠️ Pruebas Omitidas
- Generalmente por dependencias no disponibles
- Verificar que la aplicación esté ejecutándose
- Comprobar conectividad a la base de datos

## 🛠️ Configuración Requerida

### Antes de Ejecutar
1. **Aplicación ejecutándose**: `npm run dev` en puerto 5174
2. **Base de datos conectada**: Supabase configurado
3. **Datos de prueba**: Clientes y productos en la base de datos
4. **Playwright instalado**: `npm install @playwright/test`

### Credenciales de Prueba
- **Usuario**: admin
- **Contraseña**: admin123
- **URL**: http://localhost:5174

## 📝 Personalización

### Agregar Nuevas Variantes
1. Editar `comprehensiveTestDataGenerator.js`
2. Agregar nuevos escenarios en los métodos `generate*Scenario()`
3. Actualizar `comprehensiveSalesFormHelper.js` si es necesario
4. Agregar pruebas específicas en los archivos `.spec.js`

### Modificar Datos de Prueba
1. Editar arrays en `comprehensiveTestDataGenerator.js`:
   - `clientes` - Datos de clientes
   - `productosInventario` - Productos del inventario
   - `productosManuales` - Productos manuales
   - `metodosPago` - Métodos de pago disponibles

### Ajustar Configuraciones
1. Modificar `playwright.config.js` para timeouts
2. Ajustar selectores en `comprehensiveSalesFormHelper.js`
3. Cambiar URLs y credenciales según tu configuración

## 🚨 Solución de Problemas

### Error: "Element not found"
- Verificar que la aplicación esté ejecutándose
- Comprobar que los selectores sean correctos
- Revisar si la interfaz ha cambiado

### Error: "Timeout"
- Aumentar timeouts en `playwright.config.js`
- Verificar conectividad a la base de datos
- Comprobar que no haya procesos bloqueando

### Error: "Login failed"
- Verificar credenciales en el código
- Comprobar que el usuario admin exista
- Revisar configuración de autenticación

## 📞 Soporte

Si encuentras problemas o necesitas agregar nuevas variantes:

1. **Revisar logs** de las pruebas fallidas
2. **Verificar configuración** de la aplicación
3. **Comprobar datos** en la base de datos
4. **Ajustar selectores** si la interfaz cambió

---

**¡Con estas pruebas tienes cobertura completa de todas las variantes posibles de tu formulario de ventas!** 🎉
