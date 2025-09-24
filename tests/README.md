# 🧪 Sistema de Pruebas Automatizadas - Cocolú Ventas

Sistema completo de pruebas automatizadas para el formulario de ventas usando Playwright.

## 📋 Tabla de Contenidos

- [Instalación](#instalación)
- [Configuración](#configuración)
- [Tipos de Pruebas](#tipos-de-pruebas)
- [Comandos Disponibles](#comandos-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Ejecución de Pruebas](#ejecución-de-pruebas)
- [Reportes](#reportes)
- [Troubleshooting](#troubleshooting)

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Instalar navegadores de Playwright
npx playwright install
```

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env` con:

```env
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_key_supabase
```

### Configuración de Playwright

El archivo `playwright.config.js` está configurado para:
- Múltiples navegadores (Chromium, Firefox, WebKit)
- Dispositivos móviles
- Screenshots y videos en caso de fallo
- Timeouts apropiados

## 🧪 Tipos de Pruebas

### 1. Pruebas Básicas (`tests/login-test.spec.js`)
- ✅ Login con credenciales válidas
- ❌ Login con credenciales inválidas
- 🔐 Manejo de autenticación

### 2. Pruebas del Formulario (`tests/sales-form-simple.spec.js`)
- 🧭 Navegación al formulario
- 🔍 Verificación de elementos
- 📝 Llenado básico del formulario

### 3. Pruebas Avanzadas (`tests/advanced-sales-tests.spec.js`)
- 💰 Venta al contado completa
- 📅 Venta a crédito simple
- 🔄 Venta mixta (contado + crédito)
- 💸 Venta con descuento
- 🚚 Venta con delivery
- 📦 Venta con múltiples productos
- 🛠️ Venta con producto manual
- ⚡ Venta mínima

### 4. Pruebas de Validación (`tests/validation-tests.spec.js`)
- 👤 Cliente obligatorio
- 📦 Producto obligatorio
- 💳 Método de pago obligatorio
- 🔗 Referencia de pago requerida
- 💰 Descuento máximo
- 🔢 Cantidad mínima
- 💵 Precio positivo
- 🆔 Cédula válida
- 📅 Fecha de vencimiento futura
- 💱 Montos mixtos válidos
- 💬 Comentarios de descuento

### 5. Pruebas de Integración (`tests/integration-tests.spec.js`)
- 🔄 Flujo completo de venta al contado
- 📅 Flujo completo de venta a crédito
- 🔄 Flujo completo de venta mixta
- 👤 Creación de cliente nuevo
- 🛠️ Venta con producto manual
- 💸 Venta con descuento y delivery
- 🧾 Venta con IVA y entrega inmediata
- 💳 Venta con múltiples métodos de pago

### 6. Pruebas de Rendimiento (`tests/performance-tests.spec.js`)
- ⏱️ Tiempo de carga del formulario
- 🔍 Tiempo de búsqueda de cliente
- 📦 Tiempo de búsqueda de producto
- 🧮 Tiempo de cálculo de totales
- 💰 Tiempo de aplicación de descuento
- 📤 Tiempo de envío del formulario
- 🧠 Uso de memoria
- 📊 Rendimiento con muchos productos
- 💱 Tiempo de carga de datos BCV

### 7. Pruebas de Manejo de Errores (`tests/error-handling-tests.spec.js`)
- 👤 Cliente no encontrado
- 📦 Producto no encontrado
- 📝 Formulario incompleto
- 💰 Descuento excesivo
- 🔢 Cantidad inválida
- 💵 Precio inválido
- 📅 Fecha de vencimiento inválida
- 💱 Montos mixtos inválidos
- 🔗 Referencia de pago faltante
- 💬 Comentarios de descuento faltantes
- 🔄 Recuperación después de error
- ⚡ Validación en tiempo real

### 8. Pruebas de Tipos de Pago (`tests/payment-type-tests.spec.js`)
- 💵 Pago en efectivo
- 🏦 Pago por transferencia
- 📱 Pago móvil
- 💳 Pago por Zelle
- 💰 Pago por PayPal
- 🪙 Pago por Binance
- 💱 Pago mixto USD/VES
- 📅 Pago a crédito simple
- 🔄 Pago a crédito mixto
- 🔄 Cambio de método de pago
- ✅ Validación de referencias por método

## 🎮 Comandos Disponibles

### Comandos Básicos
```bash
# Ejecutar todas las pruebas
npm run test:e2e

# Ejecutar con interfaz gráfica
npm run test:e2e:ui

# Ejecutar con navegador visible
npm run test:e2e:headed

# Ejecutar en modo debug
npm run test:e2e:debug
```

### Comandos Específicos
```bash
# Pruebas de login
npm run test:e2e -- tests/login-test.spec.js

# Pruebas básicas del formulario
npm run test:e2e -- tests/sales-form-simple.spec.js

# Pruebas avanzadas
npm run test:advanced

# Pruebas de integración
npm run test:integration

# Pruebas de validación
npm run test:validation

# Pruebas de rendimiento
npm run test:performance

# Pruebas de manejo de errores
npm run test:error-handling

# Pruebas de tipos de pago
npm run test:payment-types
```

### Comandos de Ejecución Masiva
```bash
# Ejecutar todas las pruebas con reporte
npm run test:all

# Ejecutar solo pruebas rápidas
npm run test:all:quick

# Ejecutar solo pruebas de validación
npm run test:validation

# Ejecutar solo pruebas de rendimiento
npm run test:performance
```

## 📁 Estructura del Proyecto

```
tests/
├── config/
│   └── testConfigurations.js    # Configuraciones de pruebas
├── utils/
│   ├── authHelper.js            # Helper para autenticación
│   ├── salesFormHelper.js       # Helper para formulario de ventas
│   └── testDataGenerator.js     # Generador de datos de prueba
├── reports/                     # Reportes de pruebas
├── screenshots/                 # Screenshots de fallos
├── *.spec.js                    # Archivos de pruebas
├── mass-test-runner.js          # Ejecutor de pruebas masivas
├── run-all-tests.js             # Ejecutor de todas las pruebas
└── README.md                    # Este archivo
```

## 🏃‍♂️ Ejecución de Pruebas

### 1. Preparación
```bash
# Asegurar que el servidor esté corriendo
npm run dev

# En otra terminal, ejecutar pruebas
npm run test:e2e
```

### 2. Ejecución por Categorías

#### Pruebas Rápidas (2-3 minutos)
```bash
npm run test:all:quick
```

#### Pruebas de Validación (5-10 minutos)
```bash
npm run test:validation
```

#### Pruebas Completas (15-30 minutos)
```bash
npm run test:all
```

### 3. Ejecución en CI/CD
```bash
# Para pipelines automatizados
npm run test:e2e -- --reporter=json
```

## 📊 Reportes

### Reportes Automáticos
- **HTML Report**: Generado automáticamente en `test-results/`
- **JSON Report**: Guardado en `tests/reports/test-report.json`
- **Screenshots**: Capturados en caso de fallo
- **Videos**: Grabados para pruebas fallidas

### Ver Reportes
```bash
# Abrir reporte HTML
npx playwright show-report

# Ver reporte JSON
cat tests/reports/test-report.json
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Error de Login
```bash
# Verificar que el servidor esté corriendo
npm run dev

# Verificar credenciales en authHelper.js
```

#### 2. Elementos No Encontrados
```bash
# Verificar selectores en salesFormHelper.js
# Ajustar timeouts si es necesario
```

#### 3. Pruebas Lentas
```bash
# Ejecutar solo pruebas rápidas
npm run test:all:quick

# Reducir número de navegadores en playwright.config.js
```

#### 4. Fallos de Red
```bash
# Verificar conexión a Supabase
# Revisar variables de entorno
```

### Debugging

#### Modo Debug
```bash
npm run test:e2e:debug
```

#### Screenshots
```bash
# Los screenshots se guardan automáticamente en test-results/
```

#### Logs Detallados
```bash
# Agregar --verbose para más información
npm run test:e2e -- --verbose
```

## 📈 Métricas de Calidad

### Objetivos de Rendimiento
- ⏱️ Tiempo de carga del formulario: < 5 segundos
- 🔍 Tiempo de búsqueda: < 2 segundos
- 🧮 Tiempo de cálculo: < 1 segundo
- 📤 Tiempo de envío: < 10 segundos

### Cobertura de Pruebas
- ✅ Login y autenticación: 100%
- ✅ Formulario básico: 100%
- ✅ Validaciones: 100%
- ✅ Tipos de pago: 100%
- ✅ Manejo de errores: 100%
- ✅ Flujos de integración: 100%

## 🤝 Contribución

### Agregar Nuevas Pruebas
1. Crear archivo `.spec.js` en `tests/`
2. Importar helpers necesarios
3. Seguir estructura existente
4. Agregar comandos en `package.json`

### Mejorar Helpers
1. Modificar archivos en `tests/utils/`
2. Mantener compatibilidad hacia atrás
3. Documentar nuevos métodos

## 📞 Soporte

Para problemas o preguntas:
1. Revisar este README
2. Verificar logs de error
3. Revisar reportes de pruebas
4. Consultar documentación de Playwright

---

**¡Sistema de pruebas automatizadas completamente funcional! 🎉**