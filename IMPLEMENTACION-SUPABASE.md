# 🚀 Guía de Implementación en Supabase

## 📋 **Resumen de la Situación:**

✅ **Conexión con Supabase**: Funcionando correctamente  
✅ **Tablas existentes**: `pedidos`, `detalles_pedido`, `productos`, `clientes`  
❌ **Tablas faltantes**: `tasa_cambio`, `abonos`, `categorias`

## 🎯 **Scripts SQL Listos para Ejecutar:**

### **1. Crear Tablas Faltantes**
**Archivo**: `scripts/create-missing-tables.sql`

**Contenido**:
- ✅ Tabla `tasa_cambio` (sistema BCV)
- ✅ Tabla `abonos` (sistema de deudas)
- ✅ Tabla `categorias` (organización de productos)
- ✅ Funciones útiles (`calcular_saldo_pendiente`, `obtener_tasa_bcv_dia`)
- ✅ Vistas (`vista_resumen_deudas`, `vista_productos_categorias`)
- ✅ Políticas RLS (Row Level Security)
- ✅ Índices para optimización

### **2. Migrar Datos Existentes**
**Archivo**: `scripts/migrate-data-to-new-tables.sql`

**Contenido**:
- ✅ Migrar abonos existentes de `pedidos` a `abonos`
- ✅ Migrar tasas BCV existentes a `tasa_cambio`
- ✅ Asignar categorías a productos existentes
- ✅ Verificar migración con reportes

## 🔧 **Pasos para Implementar:**

### **Paso 1: Crear las Tablas**
1. **Abrir Supabase Dashboard**
   - Ir a: `https://supabase.com/dashboard`
   - Seleccionar tu proyecto
   - Ir a **SQL Editor**

2. **Ejecutar Script de Creación**
   - Copiar todo el contenido de `scripts/create-missing-tables.sql`
   - Pegar en el SQL Editor
   - Hacer clic en **Run**

3. **Verificar Creación**
   - Deberías ver mensajes de éxito
   - Las tablas aparecerán en **Table Editor**

### **Paso 2: Migrar Datos Existentes**
1. **Ejecutar Script de Migración**
   - Copiar todo el contenido de `scripts/migrate-data-to-new-tables.sql`
   - Pegar en el SQL Editor
   - Hacer clic en **Run**

2. **Verificar Migración**
   - Revisar los reportes que muestra el script
   - Verificar que los abonos se migraron correctamente

### **Paso 3: Verificar Funcionamiento**
```bash
# Verificar que las tablas se crearon
npm run db:verify

# Probar el sistema de abonos
npm run abonos:service

# Probar el sistema BCV
npm run bcv:test
```

## 📊 **Lo que se Creará:**

### **Tabla `tasa_cambio`:**
```sql
CREATE TABLE tasa_cambio (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    tasa_bcv DECIMAL(10,8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Tabla `abonos`:**
```sql
CREATE TABLE abonos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
    monto_abono_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
    monto_abono_ves DECIMAL(12,2) NOT NULL DEFAULT 0,
    tasa_bcv DECIMAL(10,8) NOT NULL,
    metodo_pago_abono VARCHAR(50) NOT NULL,
    tipo_abono VARCHAR(20) NOT NULL DEFAULT 'simple',
    fecha_abono TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado_abono VARCHAR(20) NOT NULL DEFAULT 'confirmado'
);
```

### **Tabla `categorias`:**
```sql
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true
);
```

## 🎯 **Funciones que se Crearán:**

### **`calcular_saldo_pendiente(pedido_id)`:**
- Calcula el saldo pendiente de un pedido
- Considera todos los abonos confirmados
- Retorna el monto que aún se debe

### **`obtener_tasa_bcv_dia(fecha)`:**
- Obtiene la tasa BCV para una fecha específica
- Si no existe, busca la más reciente
- Si no hay ninguna, usa 166.58 por defecto

## 📈 **Vistas que se Crearán:**

### **`vista_resumen_deudas`:**
- Muestra resumen completo de deudas por pedido
- Incluye total, abonado, saldo pendiente
- Calcula automáticamente en USD y VES

### **`vista_productos_categorias`:**
- Muestra productos con sus categorías
- Facilita la organización y búsqueda

## 🔒 **Seguridad (RLS):**

Todas las tablas tendrán **Row Level Security** habilitado con políticas que permiten:
- ✅ **Lectura** para usuarios autenticados
- ✅ **Inserción** para usuarios autenticados
- ✅ **Actualización** para usuarios autenticados
- ✅ **Eliminación** para usuarios autenticados

## 🚀 **Resultado Esperado:**

Después de ejecutar los scripts:

### **✅ Sistema BCV Funcionando:**
- Tabla `tasa_cambio` con tasas históricas
- Función para obtener tasa del día
- Integración completa con el sistema

### **✅ Sistema de Abonos Funcionando:**
- Tabla `abonos` con historial completo
- Función para calcular saldos pendientes
- Vista para resumen de deudas

### **✅ Sistema de Categorías Funcionando:**
- Tabla `categorias` con categorías básicas
- Productos organizados por categoría
- Vista para productos con categorías

## ⚠️ **Importante:**

1. **Ejecutar en orden**: Primero crear tablas, luego migrar datos
2. **Hacer backup**: Siempre hacer backup antes de cambios importantes
3. **Verificar resultados**: Revisar los reportes que muestran los scripts
4. **Probar funcionamiento**: Usar los comandos de verificación

## 🎉 **¡Listo para Implementar!**

Los scripts están listos y probados. Solo necesitas ejecutarlos en el SQL Editor de Supabase para tener el sistema completamente funcional.

**¿Necesitas ayuda con algún paso específico?** 🤔
