// Datos de prueba para desarrollo sin base de datos
export const mockProducts = [
  {
    id: 1,
    sku: 'PROD001',
    nombre: 'Producto de Prueba 1',
    precio_usd: 25.99,
    stock_actual: 50,
    categorias_producto: { nombre: 'Electrónicos' }
  },
  {
    id: 2,
    sku: 'PROD002',
    nombre: 'Producto de Prueba 2',
    precio_usd: 15.50,
    stock_actual: 30,
    categorias_producto: { nombre: 'Hogar' }
  },
  {
    id: 3,
    sku: 'PROD003',
    nombre: 'Producto de Prueba 3',
    precio_usd: 45.00,
    stock_actual: 20,
    categorias_producto: { nombre: 'Deportes' }
  }
]

export const mockPedidos = [
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
