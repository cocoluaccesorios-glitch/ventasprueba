import { supabase } from '../lib/supabaseClient.js';
import { mockProducts, mockPedidos, mockCategorias } from './mockData.js';
import Swal from 'sweetalert2';

// Modo de desarrollo - usar datos de prueba si no hay conexión
const USE_MOCK_DATA = false; // Cambiar a false para usar la base de datos real de Supabase

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
  console.log('🔍 Tasa BCV recibida en createSale:', ventaData.tasa_bcv);
  
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
      tasa_bcv: ventaData.tasa_bcv || 166.58,
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
    
    // Intentar con la función RPC
    try {
      const { data, error } = await supabase.rpc('procesar_venta_completa', { 
        venta_data: ventaData 
      });
      
      if (error) {
        console.warn('Error en procesar_venta_completa, intentando inserción directa:', error);
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
    
    console.log('🔍 Usando inserción directa como respaldo...');
    
    // Si RPC falla, insertar directamente
    console.log('🔍 Insertando pedido con tasa BCV:', ventaData.tasa_bcv);
    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        cliente_id: ventaData.cliente_id || 1, // Usar cliente_id o default 1
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
        
        // Referencias para abono mixto (para reportes y cierres de caja)
        // SOLO se envían si es un abono mixto, NO para pago mixto de contado
        ...(ventaData.es_abono && ventaData.tipo_pago_abono === 'mixto' ? {
          referencia_abono_usd: ventaData.referencia_abono_usd || null,
          referencia_abono_ves: ventaData.referencia_abono_ves || null,
          metodo_pago_abono_usd: ventaData.metodo_pago_abono_usd || null,
          metodo_pago_abono_ves: ventaData.metodo_pago_abono_ves || null,
        } : {}),
        
        // Campos para pago mixto
        es_pago_mixto: ventaData.es_pago_mixto || false,
        monto_mixto_usd: ventaData.monto_mixto_usd || 0,
        monto_mixto_ves: ventaData.monto_mixto_ves || 0,
        metodo_pago_mixto_usd: ventaData.metodo_pago_mixto_usd || null,
        metodo_pago_mixto_ves: ventaData.metodo_pago_mixto_ves || null,
        referencia_mixto_usd: ventaData.referencia_mixto_usd || null,
        referencia_mixto_ves: ventaData.referencia_mixto_ves || null,
        tasa_bcv: ventaData.tasa_bcv || 166.58,
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
    
    // Si es un abono, crear registro(s) en la tabla abonos
    if (ventaData.es_abono && ventaData.total_abono_usd > 0) {
      console.log('🔍 Creando abono automáticamente...');
      
      // Obtener cliente_id
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('id')
        .eq('cedula_rif', ventaData.cliente_cedula)
        .single();
      
      if (ventaData.tipo_pago_abono === 'simple') {
        // Abono simple - un solo registro
        const { error: abonoError } = await supabase
          .from('abonos')
          .insert({
            pedido_id: pedidoId,
            cliente_id: clienteData?.id || null,
            monto_abono_usd: ventaData.total_abono_usd,
            monto_abono_ves: ventaData.total_abono_usd * ventaData.tasa_bcv,
            tasa_bcv: ventaData.tasa_bcv,
            metodo_pago_abono: ventaData.metodo_pago_abono || 'efectivo',
            referencia_pago: ventaData.referencia_pago,
            tipo_abono: 'simple',
            estado_abono: 'confirmado',
            comentarios: 'Abono simple del pedido #' + pedidoId
          });
        
        if (abonoError) {
          console.error('Error al crear abono simple:', abonoError);
        } else {
          console.log('✅ Abono simple creado automáticamente');
        }
      } else if (ventaData.tipo_pago_abono === 'mixto') {
        // Abono mixto - crear registros separados para cada método de pago
        const abonosToInsert = [];

        // Registro para USD (si hay monto USD)
        if (ventaData.monto_abono_usd > 0) {
          abonosToInsert.push({
            pedido_id: pedidoId,
            cliente_id: clienteData?.id || null,
            monto_abono_usd: ventaData.monto_abono_usd,
            monto_abono_ves: 0,
            tasa_bcv: ventaData.tasa_bcv,
            metodo_pago_abono: ventaData.metodo_pago_abono_usd || 'efectivo',
            referencia_pago: ventaData.referencia_abono_usd,
            tipo_abono: 'mixto_usd',
            estado_abono: 'confirmado',
            comentarios: `Abono mixto USD del pedido #${pedidoId} - ${ventaData.metodo_pago_abono_usd}`
          });
        }

        // Registro para VES (si hay monto VES)
        if (ventaData.monto_abono_ves > 0) {
          abonosToInsert.push({
            pedido_id: pedidoId,
            cliente_id: clienteData?.id || null,
            monto_abono_usd: 0,
            monto_abono_ves: ventaData.monto_abono_ves,
            tasa_bcv: ventaData.tasa_bcv,
            metodo_pago_abono: ventaData.metodo_pago_abono_ves || 'efectivo',
            referencia_pago: ventaData.referencia_abono_ves,
            tipo_abono: 'mixto_ves',
            estado_abono: 'confirmado',
            comentarios: `Abono mixto VES del pedido #${pedidoId} - ${ventaData.metodo_pago_abono_ves}`
          });
        }

        // Insertar todos los registros de abono mixto
        if (abonosToInsert.length > 0) {
          const { error: abonosError } = await supabase
            .from('abonos')
            .insert(abonosToInsert);

          if (abonosError) {
            console.error('Error al crear abono mixto:', abonosError);
          } else {
            console.log(`✅ ${abonosToInsert.length} abono(s) mixto(s) creado(s) automáticamente`);
          }
        }
      }
    }
    
    // Guardar detalles de productos en la tabla detalles_pedido y actualizar stock
    if (ventaData.productos && ventaData.productos.length > 0) {
      console.log('📦 Guardando detalles de productos:', ventaData.productos);
      
      const detallesParaInsertar = ventaData.productos.map(producto => ({
        pedido_id: pedidoId,
        producto_id: producto.id, // null para productos manuales
        cantidad: producto.cantidad,
        precio_unitario_usd: producto.precio_unitario,
        subtotal_usd: producto.cantidad * producto.precio_unitario,
        nombre_producto: producto.nombre,
        sku_producto: producto.sku || null
      }));
      
      const { error: detallesError } = await supabase
        .from('detalles_pedido')
        .insert(detallesParaInsertar);
      
      if (detallesError) {
        console.error('❌ Error al insertar detalles de productos:', detallesError);
        // No fallar la venta por error en detalles, pero registrar el problema
        console.warn('⚠️ La venta se creó pero sin detalles de productos');
      } else {
        console.log('✅ Detalles de productos guardados correctamente');
        
        // ACTUALIZAR STOCK DE PRODUCTOS
        console.log('📊 Actualizando stock de productos...');
        for (const producto of ventaData.productos) {
          // Solo actualizar stock si es un producto del inventario (tiene ID)
          if (producto.id && producto.id !== null) {
            try {
              // Obtener el stock actual del producto
              const { data: productoActual, error: productoError } = await supabase
                .from('productos')
                .select('stock_actual')
                .eq('id', producto.id)
                .single();
              
              if (productoError) {
                console.error(`❌ Error obteniendo stock del producto ${producto.id}:`, productoError);
                continue;
              }
              
              // Calcular nuevo stock (stock actual - cantidad vendida)
              const stockActual = productoActual.stock_actual || 0;
              const nuevoStock = Math.max(0, stockActual - producto.cantidad);
              
              console.log(`📦 Producto ${producto.id} (${producto.nombre}):`);
              console.log(`   Stock anterior: ${stockActual}`);
              console.log(`   Cantidad vendida: ${producto.cantidad}`);
              console.log(`   Stock nuevo: ${nuevoStock}`);
              
              // Actualizar el stock en la base de datos
              const { error: stockError } = await supabase
                .from('productos')
                .update({
                  stock_actual: nuevoStock
                })
                .eq('id', producto.id);
              
              if (stockError) {
                console.error(`❌ Error actualizando stock del producto ${producto.id}:`, stockError);
              } else {
                console.log(`✅ Stock actualizado para producto ${producto.id} (${producto.nombre})`);
                
                // Registrar movimiento de stock
                await registrarMovimientoStock(producto.id, 'venta', -producto.cantidad, pedidoId);
              }
              
            } catch (error) {
              console.error(`❌ Error procesando stock del producto ${producto.id}:`, error);
            }
          } else {
            console.log(`⚠️ Producto manual "${producto.nombre}" - No se actualiza stock`);
          }
        }
        console.log('✅ Proceso de actualización de stock completado');
      }
    } else {
      console.warn('⚠️ No hay productos para guardar en detalles_pedido');
    }
    
    // Insertar tasa BCV si no existe para la fecha actual
    if (ventaData.tasa_bcv) {
      const { error: tasaError } = await supabase
        .from('tasa_cambio')
        .insert({
          fecha: new Date().toISOString().split('T')[0],
          tasa_bcv: ventaData.tasa_bcv
        })
        .select()
        .single();
      
      if (tasaError && !tasaError.message.includes('duplicate key')) {
        console.error('Error al insertar tasa BCV:', tasaError);
        // No fallar la venta por error en tasa BCV
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
    // Importar el servicio BCV dinámicamente para evitar dependencias circulares
    const { getTasaBCV } = await import('./bcvService.js');
    const tasa = await getTasaBCV();
    console.log('✅ Tasa BCV obtenida:', tasa);
    return tasa;
  } catch (err) {
    console.error('❌ Error al obtener tasa de cambio:', err.message);
    // NO usar tasa de respaldo - lanzar error
    throw new Error('No se pudo obtener la tasa de cambio del BCV');
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

// Función para registrar movimiento de stock
async function registrarMovimientoStock(productoId, tipoMovimiento, cantidad, pedidoId = null) {
  try {
    console.log(`📊 Registrando movimiento de stock: Producto ${productoId}, Tipo: ${tipoMovimiento}, Cantidad: ${cantidad}`);
    
    const { error } = await supabase
      .from('movimientos_stock')
      .insert([
        {
          producto_id: productoId,
          tipo_movimiento: tipoMovimiento,
          cantidad: cantidad,
          motivo: tipoMovimiento === 'venta' ? `Venta - Pedido #${pedidoId}` : 'Ajuste manual',
          fecha: new Date().toISOString(),
          pedido_id: pedidoId
        }
      ]);
    
    if (error) {
      console.error('Error al registrar movimiento de stock:', error);
    } else {
      console.log('✅ Movimiento de stock registrado correctamente');
    }
  } catch (error) {
    console.error('Error al registrar movimiento de stock:', error);
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