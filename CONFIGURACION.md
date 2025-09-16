# Configuración de desarrollo para Cocolú Ventas

## Variables de entorno requeridas

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-aqui

# App Configuration
VITE_APP_NAME=Cocolú Ventas
VITE_APP_VERSION=1.0.0

# Development Mode
VITE_USE_MOCK_DATA=false
```

## Configuración de Supabase

1. **Crear proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Obtén la URL y la clave anónima

2. **Ejecutar script SQL:**
   - Ve a la sección SQL Editor en Supabase
   - Ejecuta el contenido del archivo `supabase-simple.sql`

3. **Configurar políticas RLS (Row Level Security):**
   ```sql
   -- Habilitar RLS en las tablas principales
   ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
   ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
   ALTER TABLE detalles_pedido ENABLE ROW LEVEL SECURITY;
   
   -- Crear políticas básicas (ajustar según necesidades)
   CREATE POLICY "Allow all operations" ON productos FOR ALL USING (true);
   CREATE POLICY "Allow all operations" ON pedidos FOR ALL USING (true);
   CREATE POLICY "Allow all operations" ON detalles_pedido FOR ALL USING (true);
   ```

## Modo de desarrollo sin Supabase

Si no tienes acceso a Supabase o quieres desarrollar sin conexión:

1. **Cambiar a modo mock:**
   ```bash
   VITE_USE_MOCK_DATA=true
   ```

2. **O modificar directamente el código:**
   ```javascript
   // En src/services/apiService.js
   const USE_MOCK_DATA = true;
   ```

## Estructura de la base de datos

### Tablas principales:

- **productos**: Catálogo de productos
  - id (serial, primary key)
  - sku (text)
  - nombre (text)
  - precio_usd (decimal)
  - stock_actual (integer)
  - categorias_producto_id (integer, foreign key)

- **pedidos**: Registro de ventas
  - id (serial, primary key)
  - cliente_id (integer)
  - fecha_pedido (timestamp)
  - total_usd (decimal)
  - estado_entrega (text)
  - comentarios (text)

- **detalles_pedido**: Items de cada pedido
  - id (serial, primary key)
  - pedido_id (integer, foreign key)
  - producto_id (integer, foreign key)
  - cantidad (integer)
  - precio_unitario_usd (decimal)

- **tasa_cambio**: Configuración de tasas
  - id (serial, primary key)
  - fecha (date)
  - tasa_bcv (decimal)

## Funciones almacenadas

El archivo `supabase-simple.sql` incluye:

1. **procesar_venta_simple()**: Procesa ventas y actualiza stock
2. **anular_pedido_simple()**: Anula pedidos y revierte stock

## Desarrollo local

```bash
# Instalar dependencias
yarn install

# Ejecutar en modo desarrollo
yarn dev

# Build para producción
yarn build

# Preview del build
yarn preview
```

## Solución de problemas

### Error 401/500 con Supabase
- Verifica que las credenciales sean correctas
- Asegúrate de que las políticas RLS estén configuradas
- Revisa que las funciones almacenadas existan

### Error "producto_record is not assigned"
- Este error ya está corregido en la versión actual
- Si persiste, verifica que la función `procesar_venta_simple` esté actualizada

### Problemas de conexión
- Usa `VITE_USE_MOCK_DATA=true` para desarrollo sin conexión
- Verifica tu conexión a internet
- Revisa la consola del navegador para errores específicos

## Características implementadas

✅ **Gestión de Ventas**
- Crear ventas con productos del inventario
- Productos manuales (sin SKU)
- Cálculo automático de totales con IVA
- Múltiples métodos de pago
- Gestión de descuentos y delivery

✅ **Gestión de Clientes**
- Búsqueda inteligente de clientes
- Crear nuevos clientes
- Validación de cédulas venezolanas
- Información completa del cliente

✅ **Gestión de Pedidos**
- Lista de pedidos con estados
- Edición de pedidos existentes
- Anulación de pedidos
- Control de estados de entrega

✅ **Interfaz Moderna**
- Diseño responsive con Bootstrap 5
- Iconos emoji para mejor UX
- Validaciones en tiempo real
- Manejo de errores mejorado

✅ **Base de Datos**
- Integración con Supabase
- Funciones almacenadas para lógica de negocio
- Control de stock automático
- Fallback a datos mock para desarrollo
