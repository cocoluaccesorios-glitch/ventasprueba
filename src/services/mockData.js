// Datos de prueba para desarrollo sin base de datos
export const mockProducts = [
  {
    id: 1,
    sku: 'PROD001',
    nombre: 'Producto de Prueba 1',
    precio_usd: 25.99,
    stock_actual: 50,
    stock: 50,
    activo: true,
    categoria_id: 1,
    categorias_producto: { nombre: 'Electrónicos' },
    categoria_nombre: 'Electrónicos'
  },
  {
    id: 2,
    sku: 'PROD002',
    nombre: 'Producto de Prueba 2',
    precio_usd: 15.50,
    stock_actual: 30,
    stock: 30,
    activo: true,
    categoria_id: 2,
    categorias_producto: { nombre: 'Hogar' },
    categoria_nombre: 'Hogar'
  },
  {
    id: 3,
    sku: 'PROD003',
    nombre: 'Producto de Prueba 3',
    precio_usd: 45.00,
    stock_actual: 20,
    stock: 20,
    activo: true,
    categoria_id: 3,
    categorias_producto: { nombre: 'Deportes' },
    categoria_nombre: 'Deportes'
  },
  {
    id: 4,
    sku: 'PROD004',
    nombre: 'Producto Agotado',
    precio_usd: 12.00,
    stock_actual: 0,
    stock: 0,
    activo: true,
    categoria_id: 1,
    categorias_producto: { nombre: 'Electrónicos' },
    categoria_nombre: 'Electrónicos'
  },
  {
    id: 5,
    sku: 'PROD005',
    nombre: 'Producto Inactivo',
    precio_usd: 8.50,
    stock_actual: 15,
    stock: 15,
    activo: false,
    categoria_id: 2,
    categorias_producto: { nombre: 'Hogar' },
    categoria_nombre: 'Hogar'
  },
  {
    id: 6,
    sku: 'COCA001',
    nombre: 'Coca-Cola 2L',
    precio_usd: 2.50,
    stock_actual: 105,
    stock: 105,
    activo: true,
    categoria_id: 4,
    categorias_producto: { nombre: 'Bebidas' },
    categoria_nombre: 'Bebidas'
  },
  {
    id: 7,
    sku: 'PEPSI001',
    nombre: 'Pepsi 2L',
    precio_usd: 2.30,
    stock_actual: 80,
    stock: 80,
    activo: true,
    categoria_id: 4,
    categorias_producto: { nombre: 'Bebidas' },
    categoria_nombre: 'Bebidas'
  },
  {
    id: 8,
    sku: 'AGUA001',
    nombre: 'Agua Mineral 500ml',
    precio_usd: 1.00,
    stock_actual: 200,
    stock: 200,
    activo: true,
    categoria_id: 4,
    categorias_producto: { nombre: 'Bebidas' },
    categoria_nombre: 'Bebidas'
  }
]

export const mockCategorias = [
  { id: 1, nombre: 'Electrónicos' },
  { id: 2, nombre: 'Hogar' },
  { id: 3, nombre: 'Deportes' },
  { id: 4, nombre: 'Bebidas' },
  { id: 5, nombre: 'Ropa' }
]

export const mockPedidos = [
  {
    id: 25,
    fecha_pedido: new Date().toISOString(),
    total_usd: 20.44,
    estado_entrega: 'pendiente',
    cliente_id: 1,
    cliente_nombre: 'Ana',
    cliente_apellido: 'Pérez',
    cliente_telefono: 'No disponible',
    cliente_email: 'ana.perez@email.com',
    cliente_direccion: 'Dirección de prueba',
    subtotal_usd: 15.50,
    monto_descuento_usd: 0.47,
    monto_iva_usd: 2.41,
    monto_delivery_usd: 3.00,
    aplica_iva: true,
    metodo_pago: 'Abono',
    referencia_pago: 'No aplica',
    tasa_bcv: 160,
    comentarios_generales: 'Sin comentarios',
    comentarios_descuento: 'porque si !',
    
    // Campos de abono
    es_abono: true,
    tipo_pago_abono: 'simple',
    metodo_pago_abono: 'efectivo',
    monto_abono_simple: 10.00,
    monto_abono_usd: 0,
    monto_abono_ves: 0,
    total_abono_usd: 10.00,
    fecha_vencimiento: '2025-10-17',
    
    // Campos de pago mixto (no aplica)
    es_pago_mixto: false,
    monto_mixto_usd: 0,
    monto_mixto_ves: 0,
    metodo_pago_mixto_usd: null,
    metodo_pago_mixto_ves: null,
    referencia_mixto_usd: null,
    referencia_mixto_ves: null,
    
    clientes: {
      nombre: 'Ana',
      apellido: 'Pérez',
      telefono: 'No disponible',
      email: 'ana.perez@email.com',
      cedula: 'V-12345678',
      direccion: 'Dirección de prueba'
    },
    detalles_pedido: [
      {
        id: 1,
        cantidad: 1,
        precio_unitario_usd: 15.50,
        nombre_producto: 'Producto de Prueba 2',
        sku_producto: 'PROD002'
      }
    ]
  },
  {
    id: 24,
    fecha_pedido: new Date().toISOString(),
    total_usd: 38.91,
    estado_entrega: 'pendiente',
    cliente_id: 2,
    cliente_nombre: 'Luis',
    cliente_apellido: 'Silva',
    cliente_telefono: 'No disponible',
    cliente_email: 'luisxsilva56@gmail.com',
    cliente_direccion: 'Dirección de prueba',
    subtotal_usd: 33.49,
    monto_descuento_usd: 1.67,
    monto_iva_usd: 5.09,
    monto_delivery_usd: 2.00,
    aplica_iva: true,
    metodo_pago: 'Abono',
    referencia_pago: 'No aplica',
    tasa_bcv: 160,
    comentarios_generales: 'Sin comentarios',
    comentarios_descuento: 'porque si',
    
    // Campos de abono
    es_abono: true,
    tipo_pago_abono: 'simple',
    metodo_pago_abono: 'efectivo',
    monto_abono_simple: 20.00,
    monto_abono_usd: 0,
    monto_abono_ves: 0,
    total_abono_usd: 20.00,
    fecha_vencimiento: '2025-10-17',
    
    // Campos de pago mixto (no aplica)
    es_pago_mixto: false,
    monto_mixto_usd: 0,
    monto_mixto_ves: 0,
    metodo_pago_mixto_usd: null,
    metodo_pago_mixto_ves: null,
    referencia_mixto_usd: null,
    referencia_mixto_ves: null,
    
    clientes: {
      nombre: 'Luis',
      apellido: 'Silva',
      telefono: 'No disponible',
      email: 'luisxsilva56@gmail.com',
      cedula: '26899386',
      direccion: 'Dirección de prueba'
    },
    detalles_pedido: [
      {
        id: 2,
        cantidad: 1,
        precio_unitario_usd: 25.99,
        nombre_producto: 'Producto de Prueba 1',
        sku_producto: 'PROD001'
      },
      {
        id: 3,
        cantidad: 3,
        precio_unitario_usd: 2.50,
        nombre_producto: 'Coca-Cola 2L (desde DB)',
        sku_producto: 'COCA001'
      }
    ]
  },
  {
    id: 1,
    fecha_pedido: new Date().toISOString(),
    total_usd: 85.49,
    estado_entrega: 'pendiente',
    cliente_id: 1,
    clientes: {
      nombre: 'Cliente #1',
      apellido: 'Apellido',
      telefono: '1234567890'
    }
  },
  {
    id: 2,
    fecha_pedido: new Date(Date.now() - 86400000).toISOString(),
    total_usd: 120.00,
    estado_entrega: 'entregado',
    cliente_id: 2,
    clientes: {
      nombre: 'Cliente #2',
      apellido: 'Apellido',
      telefono: '0987654321'
    }
  }
]
