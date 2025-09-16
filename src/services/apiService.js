import { supabase } from '../lib/supabaseClient.js';
import { mockProducts, mockPedidos, mockCategorias } from './mockData.js';
import Swal from 'sweetalert2';

// Modo de desarrollo - usar datos de prueba si no hay conexión
const USE_MOCK_DATA = true; // Cambiar a true para usar datos de prueba

// Obtener productos (sin categorías por ahora)
export async function getProducts() {
  if (USE_MOCK_DATA) {
    console.log('🔧 Usando datos de prueba para productos');
    return mockProducts;
  }
  
  try {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        id, 
        sku, 
        nombre, 
        precio_usd, 
        stock_actual
      `)
      .order('nombre', { ascending: true });
    
    if (error) { 
      console.error('Error al cargar productos:', error);
      
      // Si es un error de autenticación, usar datos mock
      if (error.message.includes('401') || error.message.includes('JWT')) {
        console.warn('Error de autenticación, usando datos mock');
        return mockProducts;
      }
      
      Swal.fire({
        title: 'Error',
        text: `No se pudieron cargar los productos: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'Usar datos de prueba',
        showCancelButton: true,
        cancelButtonText: 'Reintentar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Cambiar a modo mock temporalmente
          window.location.reload();
        }
      });
      
      return mockProducts; // Fallback a datos mock
    }
    
    // Agregar categoría temporal si no existe
    return (data || []).map(producto => ({
      ...producto,
      categorias_producto: { nombre: 'Sin categoría' }
    }));
  } catch (err) {
    console.error('Error de conexión:', err);
    
    Swal.fire({
      title: 'Error de Conexión',
      text: 'No se pudo conectar con la base de datos. ¿Deseas usar datos de prueba?',
      icon: 'warning',
      confirmButtonText: 'Usar datos de prueba',
      showCancelButton: true,
      cancelButtonText: 'Reintentar'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.reload();
      }
    });
    
    return mockProducts; // Fallback a datos mock
  }
}

// Obtener categorías
export async function getCategorias() {
  if (USE_MOCK_DATA) {
    console.log('🔧 Usando datos de prueba para categorías');
    return { data: mockCategorias };
  }
  
  try {
    // Intentar obtener categorías de la tabla
    const { data, error } = await supabase
      .from('categorias_producto')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (error) { 
      console.error('Error al cargar categorías:', error);
      
      // Si hay problemas de permisos, columnas faltantes o la tabla no existe, usar datos mock
      if (error.message.includes('401') || error.message.includes('42501') || error.message.includes('relation') || error.message.includes('42703')) {
        console.warn('Problemas con tabla categorías, usando datos mock');
        return { data: mockCategorias };
      }
      
      return { data: [] };
    }
    
    return { data: data || [] };
  } catch (err) {
    console.error('Error de conexión:', err);
    return { data: mockCategorias };
  }
}

// Crear venta con el esquema simplificado
export async function createSale(ventaData) {
  try {
    const { data, error } = await supabase.rpc('procesar_venta_simple', { 
      venta_data: ventaData 
    });
    
    if (error) { 
      console.error('Error en procesar_venta_simple:', error);
      
      // Manejar errores específicos
      if (error.message.includes('producto_record')) {
        throw new Error('Error en el procesamiento de productos. Verifica que todos los productos existan.');
      }
      
      if (error.message.includes('stock')) {
        throw new Error('Stock insuficiente para uno o más productos.');
      }
      
      if (error.message.includes('401') || error.message.includes('JWT')) {
        throw new Error('Error de autenticación. Verifica tu conexión a la base de datos.');
      }
      
      throw new Error(error.message);
    }
    
    if (!data) {
      throw new Error('No se recibió respuesta del servidor');
    }
    
    Swal.fire({
      title: '¡Éxito!',
      text: `Pedido #${data} creado correctamente.`,
      icon: 'success',
      confirmButtonText: 'Continuar'
    });
    
    return data;
  } catch (err) {
    console.error('Error en createSale:', err);
    
    Swal.fire({
      title: 'Error en la Venta',
      text: err.message || 'Error desconocido al procesar la venta',
      icon: 'error',
      confirmButtonText: 'Entendido'
    });
    
    throw err;
  }
}

// Obtener pedidos con información del cliente
export async function getPedidos() {
  if (USE_MOCK_DATA) {
    console.log('🔧 Usando datos de prueba para pedidos');
    return mockPedidos;
  }
  
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        id, 
        fecha_pedido, 
        total_usd, 
        estado_entrega,
        cliente_id,
        cliente_nombre,
        cliente_apellido,
        cliente_telefono
      `)
      .order('fecha_pedido', { ascending: false });
    
    if (error) { 
      console.error('Error al cargar pedidos:', error);
      
      // Si hay problemas de permisos, usar datos mock
      if (error.message.includes('401') || error.message.includes('42501') || error.message.includes('relation')) {
        console.warn('Problemas con tabla pedidos, usando datos mock');
        return mockPedidos;
      }
      
      Swal.fire('Error', `No se pudieron cargar los pedidos: ${error.message}`, 'error'); 
      return []; 
    }
    
    // Usar información real del cliente si está disponible
    return (data || []).map(pedido => ({
      ...pedido,
      clientes: {
        nombre: pedido.cliente_nombre || `Cliente #${pedido.cliente_id}`,
        apellido: pedido.cliente_apellido || '',
        telefono: pedido.cliente_telefono || ''
      }
    }));
  } catch (err) {
    console.error('Error de conexión:', err);
    console.warn('Usando datos mock debido a error de conexión');
    return mockPedidos;
  }
}

// Obtener pedido por ID con todos los detalles
export async function getPedidoPorId(id) {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        detalles_pedido (
          *,
          productos (nombre, sku)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) { 
      console.error('Error al cargar pedido:', error);
      Swal.fire('Error', 'No se pudo cargar el detalle del pedido.', 'error'); 
      return null; 
    }
    
    // Agregar información de cliente temporal
    return {
      ...data,
      cliente: {
        nombre: `Cliente #${data.cliente_id}`,
        apellido: '',
        telefono: ''
      }
    };
  } catch (err) {
    console.error('Error de conexión:', err);
    return null;
  }
}

// Anular pedido
export async function anularPedido(pedidoId) {
  const { error } = await supabase.rpc('anular_pedido_simple', { 
    p_pedido_id: pedidoId 
  });
  
  if (error) { 
    Swal.fire('Error', `No se pudo anular el pedido: ${error.message}`, 'error'); 
    throw error; 
  }
  
  Swal.fire('Anulado', 'El pedido ha sido anulado y el stock revertido.', 'success');
}

// Obtener tasa de cambio actual
export async function getTasaCambio() {
  try {
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('tasa_bcv')
      .order('id', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.warn('No se pudo obtener la tasa de cambio:', error.message);
      
      // Si es un error de autenticación, columnas faltantes o la tabla no existe, usar tasa por defecto
      if (error.message.includes('401') || error.message.includes('JWT') || error.message.includes('relation') || error.message.includes('42703') || error.message.includes('42501')) {
        console.warn('Usando tasa de cambio por defecto');
        return 36.0;
      }
      
      return 36.0; // Tasa por defecto
    }
    
    return data?.tasa_bcv || 36.0;
  } catch (err) {
    console.warn('Error al obtener tasa de cambio:', err);
    return 36.0; // Tasa por defecto en caso de error
  }
}

// Actualizar pedido
export async function updatePedido(cambios) {
  try {
    const { data, error } = await supabase.rpc('actualizar_pedido', {
      p_pedido_id: cambios.id,
      p_motivo: cambios.motivo,
      p_productos: cambios.productos,
      p_nuevo_total: cambios.nuevo_total
    });
    
    if (error) {
      console.error('Error al actualizar pedido:', error);
      Swal.fire('Error', `No se pudo actualizar el pedido: ${error.message}`, 'error');
      throw new Error(error.message);
    }
    
    Swal.fire('¡Éxito!', 'Pedido actualizado correctamente', 'success');
    return data;
  } catch (err) {
    console.error('Error en updatePedido:', err);
    throw err;
  }
}

// Anular pedido con motivo
export async function anularPedidoConMotivo(pedidoId, motivo) {
  try {
    const { error } = await supabase.rpc('anular_pedido_con_motivo', {
      p_pedido_id: pedidoId,
      p_motivo: motivo
    });
    
    if (error) {
      console.error('Error al anular pedido:', error);
      Swal.fire('Error', `No se pudo anular el pedido: ${error.message}`, 'error');
      throw new Error(error.message);
    }
    
    Swal.fire('¡Anulado!', 'El pedido ha sido anulado correctamente', 'success');
    return true;
  } catch (err) {
    console.error('Error en anularPedidoConMotivo:', err);
    throw err;
  }
}

// Cambiar estado de pedido
export async function cambiarEstadoPedido(pedidoId, nuevoEstado) {
  try {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado_entrega: nuevoEstado })
      .eq('id', pedidoId);
    
    if (error) {
      console.error('Error al cambiar estado:', error);
      Swal.fire('Error', `No se pudo cambiar el estado: ${error.message}`, 'error');
      throw new Error(error.message);
    }
    
    Swal.fire('¡Éxito!', 'Estado del pedido actualizado', 'success');
    return true;
  } catch (err) {
    console.error('Error en cambiarEstadoPedido:', err);
    throw err;
  }
}

// Obtener productos para inventario (con más detalles)
export async function getProductos() {
  if (USE_MOCK_DATA) {
    console.log('🔧 Usando datos de prueba para inventario');
    return { data: mockProducts };
  }
  
  try {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        id, 
        sku, 
        nombre, 
        precio_usd, 
        stock_actual,
        categoria_id
      `)
      .order('nombre', { ascending: true });
    
    if (error) { 
      console.error('Error al cargar productos:', error);
      
      // Si es un error de autenticación, columnas faltantes o la tabla no existe, usar datos mock
      if (error.message.includes('401') || error.message.includes('JWT') || error.message.includes('42703') || error.message.includes('42501')) {
        console.warn('Problemas con tabla productos, usando datos mock');
        return { data: mockProducts };
      }
      
      return { data: [] };
    }
    
    // Agregar información de categoría por separado si es necesario
    const productosConCategoria = (data || []).map(producto => ({
      ...producto,
      stock: producto.stock_actual,
      categoria_nombre: 'Sin categoría' // Por defecto
    }));
    
    return { data: productosConCategoria };
  } catch (err) {
    console.error('Error de conexión:', err);
    return { data: mockProducts };
  }
}

// Exportar el objeto apiService para compatibilidad
export const apiService = {
  getProducts,
  getCategorias,
  createSale,
  getPedidos,
  getPedidoPorId,
  anularPedido,
  getTasaCambio,
  updatePedido,
  anularPedidoConMotivo,
  cambiarEstadoPedido,
  getProductos
};