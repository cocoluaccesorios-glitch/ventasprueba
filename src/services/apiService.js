import { supabase } from '../lib/supabaseClient.js';
import { mockProducts, mockPedidos, mockCategorias } from './mockData.js';
import Swal from 'sweetalert2';

// Modo de desarrollo - usar datos de prueba si no hay conexión
const USE_MOCK_DATA = true; // Cambiar a true para usar datos de prueba - Problema con variables de Supabase

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
      
      // Si es cualquier error de conexión, usar datos mock
      if (error.message.includes('401') || error.message.includes('JWT') || 
          error.message.includes('fetch failed') || error.message.includes('Load failed')) {
        console.warn('Error de conexión, usando datos mock');
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
  if (USE_MOCK_DATA) {
    console.log('🔧 Usando datos de prueba para crear venta');
    
    // Simular creación de venta con datos mock
    const nuevoPedido = {
      id: Date.now(),
      cliente_cedula: ventaData.cliente_cedula || '12345678',
      cliente_nombre: ventaData.cliente_nombre || 'Cliente',
      cliente_apellido: ventaData.cliente_apellido || 'Prueba',
      cliente_telefono: ventaData.cliente_telefono || 'No disponible',
      cliente_email: ventaData.cliente_email || 'cliente@email.com',
      cliente_direccion: ventaData.cliente_direccion || 'Dirección de prueba',
      subtotal_usd: ventaData.subtotal_usd || 0,
      monto_descuento_usd: ventaData.monto_descuento_usd || 0,
      monto_iva_usd: ventaData.monto_iva_usd || 0,
      monto_delivery_usd: ventaData.monto_delivery_usd || 0,
      total_usd: ventaData.total_usd || 0,
      aplica_iva: ventaData.aplica_iva || false,
      metodo_pago: ventaData.metodo_pago || 'efectivo',
      referencia_pago: ventaData.referencia_pago || null,
      es_abono: ventaData.es_abono || false,
      tipo_pago_abono: ventaData.tipo_pago_abono || null,
      metodo_pago_abono: ventaData.metodo_pago_abono || null,
      monto_abono_simple: ventaData.monto_abono_simple || 0,
      monto_abono_usd: ventaData.monto_abono_usd || 0,
      monto_abono_ves: ventaData.monto_abono_ves || 0,
      total_abono_usd: ventaData.total_abono_usd || 0,
      fecha_vencimiento: ventaData.fecha_vencimiento || null,
      es_pago_mixto: ventaData.es_pago_mixto || false,
      monto_mixto_usd: ventaData.monto_mixto_usd || 0,
      monto_mixto_ves: ventaData.monto_mixto_ves || 0,
      metodo_pago_mixto_usd: ventaData.metodo_pago_mixto_usd || null,
      metodo_pago_mixto_ves: ventaData.metodo_pago_mixto_ves || null,
      referencia_mixto_usd: ventaData.referencia_mixto_usd || null,
      referencia_mixto_ves: ventaData.referencia_mixto_ves || null,
      tasa_bcv: ventaData.tasa_bcv || 160,
      estado_entrega: ventaData.estado_entrega || 'pendiente',
      comentarios_generales: ventaData.comentarios_generales || null,
      comentarios_descuento: ventaData.comentarios_descuento || null,
      fecha_pedido: new Date().toISOString(),
      detalles_pedido: ventaData.productos ? ventaData.productos.map(p => ({
        id: Date.now() + Math.random(),
        cantidad: p.cantidad,
        precio_unitario_usd: p.precio_unitario,
        nombre_producto: p.nombre,
        sku_producto: p.sku || null
      })) : []
    };
    
    // Agregar a mockPedidos
    mockPedidos.unshift(nuevoPedido);
    
    Swal.fire({
      title: '¡Éxito!',
      text: `Pedido #${nuevoPedido.id} creado correctamente (Modo Prueba).`,
      icon: 'success',
      confirmButtonText: 'Continuar'
    });
    
    return nuevoPedido.id;
  }
  
  try {
    console.log('🔄 Creando venta con datos:', ventaData);
    
    // Primero intentar con la función RPC
    try {
      const { data, error } = await supabase.rpc('procesar_venta_simple', { 
        venta_data: ventaData 
      });
      
      if (error) {
        console.warn('Error en procesar_venta_simple, intentando inserción directa:', error);
        throw new Error('RPC failed');
      }
      
      if (data) {
        Swal.fire({
          title: '¡Éxito!',
          text: `Pedido #${data} creado correctamente.`,
          icon: 'success',
          confirmButtonText: 'Continuar'
        });
        return data;
      }
    } catch (rpcError) {
      console.log('⚠️ RPC falló, usando inserción directa...');
    }
    
    // Si RPC falla, insertar directamente
    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        cliente_cedula: ventaData.cliente_cedula,
        cliente_nombre: ventaData.cliente_nombre,
        cliente_apellido: ventaData.cliente_apellido,
        cliente_telefono: ventaData.cliente_telefono,
        cliente_email: ventaData.cliente_email,
        cliente_direccion: ventaData.cliente_direccion,
        subtotal_usd: ventaData.subtotal_usd || 0,
        monto_descuento_usd: ventaData.monto_descuento_usd || 0,
        monto_iva_usd: ventaData.monto_iva_usd || 0,
        monto_delivery_usd: ventaData.monto_delivery_usd || 0,
        total_usd: ventaData.total_usd || 0,
        aplica_iva: ventaData.aplica_iva || false,
        metodo_pago: ventaData.metodo_pago || 'efectivo',
        referencia_pago: ventaData.referencia_pago || null,
        
        // Campos para abono
        es_abono: ventaData.es_abono || false,
        tipo_pago_abono: ventaData.tipo_pago_abono || null,
        metodo_pago_abono: ventaData.metodo_pago_abono || null,
        monto_abono_simple: ventaData.monto_abono_simple || 0,
        monto_abono_usd: ventaData.monto_abono_usd || 0,
        monto_abono_ves: ventaData.monto_abono_ves || 0,
        total_abono_usd: ventaData.total_abono_usd || 0,
        fecha_vencimiento: ventaData.fecha_vencimiento || null,
        
        // Campos para pago mixto
        es_pago_mixto: ventaData.es_pago_mixto || false,
        monto_mixto_usd: ventaData.monto_mixto_usd || 0,
        monto_mixto_ves: ventaData.monto_mixto_ves || 0,
        metodo_pago_mixto_usd: ventaData.metodo_pago_mixto_usd || null,
        metodo_pago_mixto_ves: ventaData.metodo_pago_mixto_ves || null,
        referencia_mixto_usd: ventaData.referencia_mixto_usd || null,
        referencia_mixto_ves: ventaData.referencia_mixto_ves || null,
        tasa_bcv: ventaData.tasa_bcv || 160,
        estado_entrega: ventaData.estado_entrega || 'pendiente',
        comentarios_generales: ventaData.comentarios_generales || null,
        comentarios_descuento: ventaData.comentarios_descuento || null,
        fecha_pedido: new Date().toISOString()
      })
      .select()
      .single();
    
    if (pedidoError) {
      console.error('Error al crear pedido:', pedidoError);
      throw new Error(pedidoError.message);
    }
    
    const pedidoId = pedidoData.id;
    
    // Insertar detalles de productos
    if (ventaData.productos && ventaData.productos.length > 0) {
      const detallesParaInsertar = ventaData.productos.map(producto => ({
        pedido_id: pedidoId,
        producto_id: producto.id,
        cantidad: producto.cantidad,
        precio_unitario_usd: producto.precio_unitario,
        nombre_producto: producto.nombre,
        sku_producto: producto.sku || null
      }));
      
      const { error: detallesError } = await supabase
        .from('detalles_pedido')
        .insert(detallesParaInsertar);
      
      if (detallesError) {
        console.error('Error al insertar detalles:', detallesError);
        // Intentar eliminar el pedido creado
        await supabase.from('pedidos').delete().eq('id', pedidoId);
        throw new Error(detallesError.message);
      }
    }
    
    Swal.fire({
      title: '¡Éxito!',
      text: `Pedido #${pedidoId} creado correctamente.`,
      icon: 'success',
      confirmButtonText: 'Continuar'
    });
    
    return pedidoId;
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
  console.log('🔍 Iniciando carga de pedidos...');
  
  if (USE_MOCK_DATA) {
    console.log('🔧 Usando datos de prueba para pedidos');
    console.log('📊 Datos mock:', mockPedidos);
    return mockPedidos;
  }
  
  try {
    console.log('🌐 Intentando conectar con Supabase...');
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        detalles_pedido(
          id,
          cantidad,
          precio_unitario_usd,
          nombre_producto,
          sku_producto
        )
      `)
      .order('fecha_pedido', { ascending: false });
    
    console.log('📊 Datos recibidos de Supabase:', data);
    console.log('❌ Error de Supabase:', error);
    
    if (error) { 
      console.error('Error al cargar pedidos:', error);
      
      // Si hay problemas de permisos, usar datos mock
      if (error.message.includes('401') || error.message.includes('42501') || error.message.includes('relation')) {
        console.warn('Problemas con tabla pedidos, usando datos mock');
        return mockPedidos;
      }
      
      console.error('Error al cargar pedidos:', error.message);
      // No mostrar alerta para evitar bucles, solo usar datos mock
      return mockPedidos; 
    }
    
    // Usar información real del cliente si está disponible
    const pedidosFormateados = (data || []).map(pedido => ({
      ...pedido,
      clientes: {
        nombre: pedido.cliente_nombre || `Cliente #${pedido.cliente_id}`,
        apellido: pedido.cliente_apellido || '',
        telefono: pedido.cliente_telefono || '',
        email: pedido.cliente_email || '',
        cedula: pedido.cliente_cedula || '',
        direccion: pedido.cliente_direccion || ''
      },
      // Agregar campos adicionales que necesitamos
      tipo_pago: pedido.metodo_pago || 'No especificado',
      referencia: pedido.referencia || 'No aplica',
      tasa_bcv: pedido.tasa_bcv || null
      // detalles_pedido ya viene de la consulta, no lo sobrescribimos
    }));
    
    console.log('✅ Pedidos formateados:', pedidosFormateados);
    return pedidosFormateados;
  } catch (err) {
    console.error('Error de conexión:', err);
    console.warn('Usando datos mock debido a error de conexión');
    return mockPedidos;
  }
}

// Obtener pedido por ID con todos los detalles
export async function getPedidoPorId(id) {
  if (USE_MOCK_DATA) {
    console.log('🔧 Usando datos de prueba para obtener pedido por ID');
    
    // Buscar el pedido en mockPedidos
    const pedido = mockPedidos.find(p => p.id === parseInt(id));
    if (pedido) {
      return pedido;
    } else {
      console.error('Pedido no encontrado:', id);
      Swal.fire('Error', 'No se encontró el pedido solicitado.', 'error');
      return null;
    }
  }
  
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
  if (USE_MOCK_DATA) {
    console.log('🔧 Usando datos de prueba para anular pedido');
    
    // Buscar el pedido en mockPedidos y cambiar su estado
    const pedidoIndex = mockPedidos.findIndex(p => p.id === pedidoId);
    if (pedidoIndex !== -1) {
      mockPedidos[pedidoIndex].estado_entrega = 'anulado';
      mockPedidos[pedidoIndex].fecha_anulacion = new Date().toISOString();
      
      Swal.fire('Anulado', 'El pedido ha sido anulado correctamente (Modo Prueba).', 'success');
      return true;
    } else {
      Swal.fire('Error', 'No se encontró el pedido', 'error');
      return false;
    }
  }
  
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

// Actualizar pedido directamente en la tabla
export async function updatePedido(cambios) {
  try {
    console.log('🔄 Actualizando pedido:', cambios);
    
    // Actualizar la tabla pedidos directamente
    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .update({
        subtotal_usd: cambios.subtotal_usd,
        monto_descuento_usd: cambios.monto_descuento_usd,
        monto_iva_usd: cambios.monto_iva_usd,
        monto_delivery_usd: cambios.monto_delivery_usd,
        total_usd: cambios.total_usd,
        aplica_iva: cambios.aplica_iva,
        comentarios_generales: cambios.comentarios_generales,
        comentarios_descuento: cambios.comentarios_descuento
      })
      .eq('id', cambios.id)
      .select();
    
    if (pedidoError) {
      console.error('Error al actualizar pedido:', pedidoError);
      throw new Error(pedidoError.message);
    }
    
    // Si hay cambios en productos, actualizar detalles_pedido
    if (cambios.productos && cambios.productos.length > 0) {
      // Eliminar detalles existentes
      const { error: deleteError } = await supabase
        .from('detalles_pedido')
        .delete()
        .eq('pedido_id', cambios.id);
      
      if (deleteError) {
        console.error('Error al eliminar detalles:', deleteError);
        throw new Error(deleteError.message);
      }
      
      // Insertar nuevos detalles
      const detallesParaInsertar = cambios.productos.map(producto => ({
        pedido_id: cambios.id,
        producto_id: producto.id,
        cantidad: producto.cantidad,
        precio_unitario_usd: producto.precio_unitario,
        nombre_producto: producto.nombre,
        sku_producto: producto.sku || null
      }));
      
      const { error: insertError } = await supabase
        .from('detalles_pedido')
        .insert(detallesParaInsertar);
      
      if (insertError) {
        console.error('Error al insertar detalles:', insertError);
        throw new Error(insertError.message);
      }
    }
    
    Swal.fire('¡Éxito!', 'Pedido actualizado correctamente', 'success');
    return pedidoData;
  } catch (err) {
    console.error('Error en updatePedido:', err);
    Swal.fire('Error', `No se pudo actualizar el pedido: ${err.message}`, 'error');
    throw err;
  }
}

// Anular pedido con motivo
export async function anularPedidoConMotivo(pedidoId, motivo) {
  if (USE_MOCK_DATA) {
    console.log('🔧 Usando datos de prueba para anular pedido con motivo');
    
    // Buscar el pedido en mockPedidos y cambiar su estado
    const pedidoIndex = mockPedidos.findIndex(p => p.id === pedidoId);
    if (pedidoIndex !== -1) {
      mockPedidos[pedidoIndex].estado_entrega = 'anulado';
      mockPedidos[pedidoIndex].fecha_anulacion = new Date().toISOString();
      mockPedidos[pedidoIndex].motivo_anulacion = motivo;
      
      Swal.fire('¡Anulado!', 'El pedido ha sido anulado correctamente (Modo Prueba).', 'success');
      return true;
    } else {
      Swal.fire('Error', 'No se encontró el pedido', 'error');
      return false;
    }
  }
  
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
  if (USE_MOCK_DATA) {
    console.log('🔧 Usando datos de prueba para cambiar estado de pedido');
    
    // Buscar el pedido en mockPedidos y cambiar su estado
    const pedidoIndex = mockPedidos.findIndex(p => p.id === pedidoId);
    if (pedidoIndex !== -1) {
      mockPedidos[pedidoIndex].estado_entrega = nuevoEstado;
      mockPedidos[pedidoIndex].fecha_actualizacion = new Date().toISOString();
      
      Swal.fire('¡Actualizado!', `El estado del pedido ha sido cambiado a ${nuevoEstado} (Modo Prueba).`, 'success');
      return true;
    } else {
      Swal.fire('Error', 'No se encontró el pedido', 'error');
      return false;
    }
  }
  
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
    
    // Si es un error de conexión, usar datos mock
    if (err.message.includes('fetch failed') || err.message.includes('Load failed') || 
        err.message.includes('NetworkError') || err.message.includes('TypeError')) {
      console.warn('Error de conexión detectado, usando datos mock');
      return mockProducts;
    }
    
    return mockProducts; // Fallback a datos mock
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