# Sistema de Ventas Cocolú 🛒

Sistema de gestión de ventas desarrollado con Vue 3 y Supabase para el control de inventario, pedidos y clientes.

## ✨ Características

- **Gestión de Ventas**: Crear y procesar ventas con productos
- **Control de Inventario**: Gestión automática de stock
- **Lista de Pedidos**: Visualización y gestión de pedidos
- **Interfaz Responsive**: Diseño moderno con Bootstrap 5
- **Base de Datos**: Integración con Supabase (PostgreSQL)
- **Validaciones**: Control de stock y validación de formularios

## 🚀 Tecnologías

- **Frontend**: Vue 3 + Composition API
- **Backend**: Supabase (PostgreSQL)
- **UI**: Bootstrap 5 + Bootstrap Icons
- **Build**: Vite
- **Notificaciones**: SweetAlert2

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd Ventas-Cocolu
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
```

4. **Configurar base de datos**
- Ejecutar el script `supabase-simple.sql` en tu proyecto de Supabase
- Crear las tablas necesarias: productos, pedidos, detalles_pedido, etc.

5. **Ejecutar en desarrollo**
```bash
npm run dev
# o
yarn dev
```

## 🗄️ Estructura de Base de Datos

### Tablas principales:
- `productos`: Catálogo de productos con precios y stock
- `pedidos`: Registro de ventas y pedidos
- `detalles_pedido`: Items específicos de cada pedido
- `categorias_producto`: Categorización de productos
- `tasa_cambio`: Configuración de tasas de cambio

### Funciones almacenadas:
- `procesar_venta_simple()`: Procesa ventas y actualiza stock
- `anular_pedido_simple()`: Anula pedidos y revierte stock

## 🏗️ Arquitectura

```
src/
├── components/          # Componentes reutilizables
│   └── Navbar.vue
├── config/             # Configuración de base de datos
│   └── database.js
├── lib/                # Cliente de Supabase
│   └── supabaseClient.js
├── services/           # Servicios API
│   ├── apiService.js
│   └── mockData.js
├── views/              # Vistas principales
│   ├── CrearVenta.vue
│   ├── ListaPedidos.vue
│   └── EditarPedido.vue
└── router/             # Configuración de rutas
    └── index.js
```

## 🔧 Configuración

### Variables de entorno requeridas:
- `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: Clave anónima de Supabase

### Modo de desarrollo:
- Cambiar `USE_MOCK_DATA = true` en `src/services/apiService.js` para usar datos de prueba

## 📱 Uso

1. **Nueva Venta**: Agregar productos, datos del cliente y procesar venta
2. **Ver Pedidos**: Lista de todos los pedidos con estados
3. **Editar Pedido**: Modificar detalles de pedidos existentes
4. **Anular Pedido**: Cancelar pedidos y revertir stock

## 🚀 Despliegue

```bash
# Build para producción
npm run build

# Preview del build
npm run preview
```

## 📋 Versiones

- **v1.0.0**: Versión inicial funcional con conexión a Supabase

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Luis Silva** - Sistema de Ventas Cocolú