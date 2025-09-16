import { supabase } from '../lib/supabaseClient.js';
import { mockProducts, mockPedidos } from './mockData.js';
import Swal from 'sweetalert2';

// Modo de desarrollo - usar datos de prueba si no hay conexión
const USE_MOCK_DATA = false; // Cambiar a true para usar datos de prueba

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
      Swal.fire('Error', `No se pudieron cargar los productos: ${error.message}`, 'error'); 
      return []; 
    }
    
    // Agregar categoría temporal si no existe
    return (data || []).map(producto => ({
      ...producto,
      categorias_producto: { nombre: 'Sin categoría' }
    }));
  } catch (err) {
    console.error('Error de conexión:', err);
    Swal.fire('Error de Conexión', 'No se pudo conectar con la base de datos. Verifica tu conexión a internet.', 'error');
    return [];
  }
}

// Obtener categorías
export async function getCategorias() {
  const { data, error } = await supabase
    .from('categorias_producto')
    .select('*')
    .order('nombre', { ascending: true });
  
  if (error) { 
    Swal.fire('Error', 'No se pudieron cargar las categorías.', 'error'); 
    return []; 
  }
  return data;
}

// Crear venta con el esquema simplificado
export async function createSale(ventaData) {
  const { data, error } = await supabase.rpc('procesar_venta_simple', { 
    venta_data: ventaData 
  });
  
  if (error) { 
    Swal.fire('Error en la Venta', error.message, 'error'); 
    throw new Error(error.message); 
  }
  
  Swal.fire('¡Éxito!', `Pedido #${data} creado correctamente.`, 'success');
  return data;
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
        cliente_id
      `)
      .order('fecha_pedido', { ascending: false });
    
    if (error) { 
      console.error('Error al cargar pedidos:', error);
      Swal.fire('Error', `No se pudieron cargar los pedidos: ${error.message}`, 'error'); 
      return []; 
    }
    
    // Agregar información de cliente temporal
    return (data || []).map(pedido => ({
      ...pedido,
      clientes: {
        nombre: `Cliente #${pedido.cliente_id}`,
        apellido: '',
        telefono: ''
      }
    }));
  } catch (err) {
    console.error('Error de conexión:', err);
    Swal.fire('Error de Conexión', 'No se pudo conectar con la base de datos. Verifica tu conexión a internet.', 'error');
    return [];
  }
}

// Obtener pedido por ID con todos los detalles
export async function getPedidoPorId(id) {
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
  const { data, error } = await supabase
    .from('tasa_cambio')
    .select('tasa_bcv')
    .order('fecha', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.warn('No se pudo obtener la tasa de cambio:', error.message);
    return 36.0; // Tasa por defecto
  }
  
  return data?.tasa_bcv || 36.0;
}