<template>
  <div class="card">
    <div class="card-header">
      <h4 class="mb-0">📋 Historial de Pedidos</h4>
    </div>
    <div class="card-body">
      <div v-if="loading" class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2">Cargando pedidos...</p>
      </div>
      <div v-else class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th># Pedido</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Debe</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pedido in pedidos" :key="pedido.id">
              <td><strong>{{ pedido.id }}</strong></td>
              <td>{{ new Date(pedido.fecha_pedido).toLocaleDateString('es-VE') }}</td>
              <td>{{ pedido.clientes.nombre }} {{ pedido.clientes.apellido || '' }}</td>
              <td><strong>${{ pedido.total_usd.toFixed(2) }}</strong></td>
              <td>
                <span class="badge" :class="debeClass(pedido)">
                  {{ calcularDebe(pedido) }}
                </span>
              </td>
              <td>
                <span class="badge" :class="estadoClass(pedido.estado_entrega)">
                  {{ pedido.estado_entrega }}
                </span>
              </td>
              <td>
                <div class="d-flex gap-2">
                  <button class="btn btn-info btn-sm" 
                          @click="verDetalle(pedido)" 
                          title="Ver Detalle">
                    👁️
                  </button>
                  <router-link :to="'/pedidos/' + pedido.id + '/editar'" 
                               class="btn btn-primary btn-sm" 
                               title="Editar">
                    ✏️
                  </router-link>
                  <button class="btn btn-danger btn-sm" 
                          @click="confirmarAnulacion(pedido.id)" 
                          :disabled="pedido.estado_entrega === 'anulado'" 
                          title="Anular">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { getPedidos, anularPedido } from '../services/apiService.js';
import Swal from 'sweetalert2';
const pedidos = ref([]);
const loading = ref(true);
async function cargarPedidos() {
  console.log('🔄 Iniciando carga de pedidos en ListaPedidos...');
  loading.value = true;
  
  try {
    const datosPedidos = await getPedidos();
    console.log('📋 Pedidos recibidos en ListaPedidos:', datosPedidos);
    
    // Asegurar que siempre sea un array
    pedidos.value = Array.isArray(datosPedidos) ? datosPedidos : [];
    console.log('✅ Pedidos asignados a la vista:', pedidos.value);
  } catch (error) {
    console.error('❌ Error al cargar pedidos:', error);
    pedidos.value = [];
    // No mostrar alerta aquí para evitar bucles
  } finally {
    loading.value = false;
  }
}
onMounted(cargarPedidos);
function estadoClass(estado) {
  if (estado === 'anulado') return 'bg-danger';
  if (estado === 'entregado') return 'bg-success';
  if (estado === 'en_camino') return 'bg-warning';
  return 'bg-secondary';
}

function calcularDebe(pedido) {
  // Si el pedido está anulado
  if (pedido.estado_entrega === 'anulado') {
    return 'Anulado';
  }
  
  // Si es un abono, calcular saldo pendiente
  if (pedido.es_abono || pedido.tipo_pago_abono || pedido.metodo_pago === 'Abono') {
    const totalPedido = pedido.total_usd || 0;
    const totalAbonado = pedido.total_abono_usd || 0;
    const saldoPendiente = totalPedido - totalAbonado;
    
    if (saldoPendiente <= 0.01) { // Tolerancia para decimales
      return 'Pagado';
    } else {
      return `$${saldoPendiente.toFixed(2)}`;
    }
  }
  
  // Si no es abono (pago completo: Contado, Mixto, etc.)
  return 'Pagado';
}

function debeClass(pedido) {
  const debe = calcularDebe(pedido);
  
  if (debe === 'Anulado') return 'bg-danger';
  if (debe === 'Pagado') return 'bg-success';
  if (debe.startsWith('$')) return 'bg-warning text-dark'; // Tiene deuda pendiente
  return 'bg-secondary';
}

function verDetalle(pedido) {
  // Construir HTML con todos los detalles del pedido
  let html = `
    <div class="text-start">
      <div class="row">
        <div class="col-md-6">
          <h6 class="text-primary mb-3">📋 Información del Pedido</h6>
          <p><strong># Pedido:</strong> ${pedido.id}</p>
          <p><strong>Fecha:</strong> ${new Date(pedido.fecha_pedido).toLocaleDateString('es-VE')}</p>
          <p><strong>Estado:</strong> <span class="badge ${estadoClass(pedido.estado_entrega)}">${pedido.estado_entrega}</span></p>
          <p><strong>Debe:</strong> <span class="badge ${debeClass(pedido)}">${calcularDebe(pedido)}</span></p>
        </div>
        <div class="col-md-6">
          <h6 class="text-primary mb-3">👤 Información del Cliente</h6>
          <p><strong>Nombre:</strong> ${pedido.clientes.nombre} ${pedido.clientes.apellido || ''}</p>
          <p><strong>Teléfono:</strong> ${pedido.clientes.telefono || 'No disponible'}</p>
          <p><strong>Email:</strong> ${pedido.clientes.email || 'No disponible'}</p>
        </div>
      </div>
      
      <hr class="my-4">
      
      <h6 class="text-primary mb-3">🛒 Productos Comprados</h6>
      <div class="table-responsive">
        <table class="table table-sm table-bordered">
          <thead class="table-light">
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  // Agregar productos si están disponibles (eliminar duplicados)
  if (pedido.detalles_pedido && pedido.detalles_pedido.length > 0) {
    // Crear un mapa para eliminar duplicados basado en nombre_producto
    const productosUnicos = new Map();
    
    pedido.detalles_pedido.forEach(detalle => {
      const nombre = detalle.nombre_producto || 'Producto';
      if (productosUnicos.has(nombre)) {
        // Si ya existe, sumar la cantidad
        const existente = productosUnicos.get(nombre);
        existente.cantidad += detalle.cantidad;
        existente.subtotal = existente.cantidad * existente.precio_unitario_usd;
      } else {
        // Si no existe, agregarlo
        productosUnicos.set(nombre, {
          nombre_producto: nombre,
          cantidad: detalle.cantidad,
          precio_unitario_usd: detalle.precio_unitario_usd,
          subtotal: detalle.cantidad * detalle.precio_unitario_usd
        });
      }
    });
    
    // Mostrar productos únicos
    productosUnicos.forEach(detalle => {
      html += `
        <tr>
          <td>${detalle.nombre_producto}</td>
          <td>${detalle.cantidad}</td>
          <td>$${detalle.precio_unitario_usd.toFixed(2)}</td>
          <td>$${detalle.subtotal.toFixed(2)}</td>
        </tr>
      `;
    });
  } else {
    html += `<tr><td colspan="4" class="text-center text-muted">No hay productos disponibles</td></tr>`;
  }
  
  // Agregar filas de resumen financiero en la misma tabla
  html += `
            <tr class="table-light">
              <td colspan="3"><strong>Subtotal</strong></td>
              <td><strong>$${(pedido.subtotal_usd || 0).toFixed(2)}</strong></td>
            </tr>
            <tr>
              <td colspan="3"><strong>Delivery</strong></td>
              <td><strong>${pedido.monto_delivery_usd ? `$${pedido.monto_delivery_usd.toFixed(2)}` : '$0.00'}</strong></td>
            </tr>
            <tr>
              <td colspan="3"><strong>Descuento</strong></td>
              <td><strong>${pedido.monto_descuento_usd && pedido.subtotal_usd > 0 ? 
                `<span style="color: #dc3545;">-$${pedido.monto_descuento_usd.toFixed(2)} (${((pedido.monto_descuento_usd / pedido.subtotal_usd) * 100).toFixed(0)}%)</span>` : 
                'No aplica'}</strong></td>
            </tr>
            <tr>
              <td colspan="3"><strong>IVA</strong></td>
              <td><strong>${pedido.aplica_iva ? 
                `$${(pedido.monto_iva_usd || 0).toFixed(2)} (16%)` : 
                'No aplica'}</strong></td>
            </tr>
            <tr class="table-success">
              <td colspan="3"><strong>TOTAL</strong></td>
              <td><strong>$${(pedido.total_usd || 0).toFixed(2)}</strong></td>
            </tr>
  `;
  
  html += `
          </tbody>
        </table>
      </div>
      
      <hr class="my-4">
      
      <h6 class="text-primary mb-3">💳 Información de Pago</h6>
      <div class="table-responsive">
        <table class="table table-sm table-bordered">
          <thead class="table-light">
            <tr>
              <th>Concepto</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  // Determinar el tipo de pago y mostrar la información correspondiente
  if (pedido.es_pago_mixto || pedido.metodo_pago === 'Mixto') {
    // PAGO MIXTO - Opción 3: Tabla Expandida
    html += `
            <tr class="table-info">
              <td><strong>Tipo de Pago</strong></td>
              <td><span style="color: #007bff; font-weight: bold;">Pago Mixto</span></td>
            </tr>
    `;
    
    if (pedido.metodo_pago_mixto_usd) {
      html += `
            <tr>
              <td><strong>Método USD</strong></td>
              <td>${pedido.metodo_pago_mixto_usd || 'No especificado'}</td>
            </tr>
            <tr>
              <td><strong>Referencia USD</strong></td>
              <td>${pedido.referencia_mixto_usd || '-'}</td>
            </tr>
            <tr>
              <td><strong>Monto USD</strong></td>
              <td>$${(pedido.monto_mixto_usd || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Método VES</strong></td>
              <td>${pedido.metodo_pago_mixto_ves || 'No especificado'}</td>
            </tr>
            <tr>
              <td><strong>Referencia VES</strong></td>
              <td>${pedido.referencia_mixto_ves || '-'}</td>
            </tr>
            <tr>
              <td><strong>Monto VES</strong></td>
              <td>${(pedido.monto_mixto_ves || 0).toFixed(2)} Bs</td>
            </tr>
            <tr>
              <td><strong>Tasa BCV</strong></td>
              <td>${pedido.tasa_bcv ? `${pedido.tasa_bcv} Bs/USD` : '166.58 Bs/USD'}</td>
            </tr>
      `;
    } else {
      html += `
            <tr class="table-warning">
              <td><strong>Estado</strong></td>
              <td><span style="color: #dc3545;">⚠️ Desglose no disponible</span></td>
            </tr>
            <tr>
              <td><strong>Motivo</strong></td>
              <td>Faltan columnas en la base de datos</td>
            </tr>
            <tr>
              <td><strong>Total</strong></td>
              <td>$${(pedido.total_usd || 0).toFixed(2)} (pago completo)</td>
            </tr>
      `;
    }
    
  } else if (pedido.es_abono || pedido.tipo_pago_abono || pedido.metodo_pago === 'Abono') {
    // ABONO
    html += `
            <tr class="table-warning">
              <td><strong>Tipo de Pago</strong></td>
              <td><span style="color: #ffc107; font-weight: bold;">Abono</span></td>
            </tr>
            <tr>
              <td><strong>Tipo de Abono</strong></td>
              <td>${pedido.tipo_pago_abono || 'Simple'}</td>
            </tr>
    `;
    
    if (pedido.tipo_pago_abono === 'simple') {
      // ABONO SIMPLE
      html += `
            <tr>
              <td><strong>Método de Pago</strong></td>
              <td>${pedido.metodo_pago || 'Efectivo'}</td>
            </tr>
            <tr>
              <td><strong>Referencia</strong></td>
              <td>${pedido.referencia_pago && pedido.referencia_pago !== 'No aplica' ? pedido.referencia_pago : 'No aplica'}</td>
            </tr>
            <tr>
              <td><strong>Monto Abonado</strong></td>
              <td>$${(pedido.monto_abono_simple || 0).toFixed(2)} USD</td>
            </tr>
            <tr>
              <td><strong>Saldo Pendiente</strong></td>
              <td>$${((pedido.total_usd || 0) - (pedido.monto_abono_simple || 0)).toFixed(2)} USD</td>
            </tr>
      `;
      
      if (pedido.metodo_pago && pedido.metodo_pago.toLowerCase() !== 'efectivo' && pedido.metodo_pago.toLowerCase() !== 'efectivo (usd)') {
        html += `
            <tr>
              <td><strong>Tasa BCV</strong></td>
              <td>${pedido.tasa_bcv ? `${pedido.tasa_bcv} Bs/USD` : '166.58 Bs/USD'}</td>
            </tr>
            <tr>
              <td><strong>Total en Bolívares</strong></td>
              <td>${pedido.tasa_bcv ? 
                `${((pedido.total_usd || 0) * pedido.tasa_bcv).toFixed(2)} Bs` : 
                `${((pedido.total_usd || 0) * 166.58).toFixed(2)} Bs`}</td>
            </tr>
        `;
      }
      
    } else if (pedido.tipo_pago_abono === 'mixto') {
      // ABONO MIXTO - Misma estructura que Pago Mixto
      html += `
            <tr>
              <td><strong>Método USD</strong></td>
              <td>${pedido.metodo_pago_abono_usd || 'No especificado'}</td>
            </tr>
            <tr>
              <td><strong>Referencia USD</strong></td>
              <td>${pedido.referencia_abono_usd || '-'}</td>
            </tr>
            <tr>
              <td><strong>Monto Abono USD</strong></td>
              <td>$${(pedido.monto_abono_usd || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Método VES</strong></td>
              <td>${pedido.metodo_pago_abono_ves || 'No especificado'}</td>
            </tr>
            <tr>
              <td><strong>Referencia VES</strong></td>
              <td>${pedido.referencia_abono_ves || '-'}</td>
            </tr>
            <tr>
              <td><strong>Monto Abono VES</strong></td>
              <td>${(pedido.monto_abono_ves || 0).toFixed(2)} Bs</td>
            </tr>
            <tr>
              <td><strong>Tasa BCV</strong></td>
              <td>${pedido.tasa_bcv ? `${pedido.tasa_bcv} Bs/USD` : '166.58 Bs/USD'}</td>
            </tr>
      `;
    }
    
  } else {
    // PAGO SIMPLE (CONTADO)
    html += `
            <tr class="table-success">
              <td><strong>Tipo de Pago</strong></td>
              <td><span style="color: #28a745; font-weight: bold;">Contado</span></td>
            </tr>
            <tr>
              <td><strong>Método de Pago</strong></td>
              <td>${pedido.metodo_pago || 'Efectivo'}</td>
            </tr>
    `;
    
    // Mostrar Total en Bolívares primero si es pago en VES
    if (pedido.metodo_pago && pedido.metodo_pago.toLowerCase() !== 'efectivo' && pedido.metodo_pago.toLowerCase() !== 'efectivo (usd)') {
      html += `
            <tr class="table-success">
              <td><strong>Total en Bolívares</strong></td>
              <td><span style="color: #28a745; font-weight: bold;">${pedido.tasa_bcv ? 
                `${((pedido.total_usd || 0) * pedido.tasa_bcv).toFixed(2)} Bs` : 
                `${((pedido.total_usd || 0) * 166.58).toFixed(2)} Bs`}</span></td>
            </tr>
      `;
    }
    
    // Mostrar Referencia si aplica
    if (pedido.referencia_pago && pedido.referencia_pago !== 'No aplica') {
      html += `
            <tr>
              <td><strong>Referencia</strong></td>
              <td>${pedido.referencia_pago}</td>
            </tr>
      `;
    }
    
    // Mostrar Tasa BCV al final si es pago en VES
    if (pedido.metodo_pago && pedido.metodo_pago.toLowerCase() !== 'efectivo' && pedido.metodo_pago.toLowerCase() !== 'efectivo (usd)') {
      html += `
            <tr>
              <td><strong>Tasa BCV</strong></td>
              <td>${pedido.tasa_bcv ? `${pedido.tasa_bcv} Bs/USD` : '166.58 Bs/USD'}</td>
            </tr>
      `;
    } else {
      html += `
            <tr>
              <td><strong>Moneda</strong></td>
              <td>Dólares USD</td>
            </tr>
            <tr>
              <td><strong>Tipo</strong></td>
              <td>Pago en efectivo</td>
            </tr>
      `;
    }
  }
  
  html += `
          </tbody>
        </table>
      </div>
      
      ${pedido.es_abono || pedido.tipo_pago_abono || pedido.metodo_pago === 'Abono' ? `
        <hr class="my-4">
        <h6 class="text-primary mb-3">📋 Estado del Abono</h6>
        <div class="table-responsive">
          <table class="table table-sm table-bordered">
            <thead class="table-light">
              <tr>
                <th>Concepto</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Total del Pedido</strong></td>
                <td>$${(pedido.total_usd || 0).toFixed(2)} USD</td>
              </tr>
              <tr>
                <td><strong>Monto Abonado</strong></td>
                <td>$${(pedido.total_abono_usd || pedido.monto_abono_simple || 0).toFixed(2)} USD</td>
              </tr>
              <tr class="table-warning">
                <td><strong>Saldo Pendiente</strong></td>
                <td><strong>$${((pedido.total_usd || 0) - (pedido.total_abono_usd || pedido.monto_abono_simple || 0)).toFixed(2)} USD</strong></td>
              </tr>
              <tr>
                <td><strong>Estado</strong></td>
                <td>${((pedido.total_usd || 0) - (pedido.total_abono_usd || pedido.monto_abono_simple || 0)) <= 0 ? 
                  '<span class="badge bg-success">Pagado</span>' : 
                  '<span class="badge bg-warning">Pendiente</span>'}</td>
              </tr>
              ${pedido.fecha_vencimiento ? `
                <tr>
                  <td><strong>Fecha Límite</strong></td>
                  <td>${new Date(pedido.fecha_vencimiento).toLocaleDateString('es-VE')}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
        </div>
      ` : ''}
      
      <hr class="my-4">
      
      <h6 class="text-primary mb-3">💬 Comentarios</h6>
      <div class="bg-light p-3 rounded">
        <p class="mb-0">${pedido.comentarios || 'Sin comentarios'}</p>
        ${pedido.comentarios_descuento ? `<p class="mt-2 mb-0"><strong>Motivo del descuento:</strong> ${pedido.comentarios_descuento}</p>` : ''}
      </div>
    </div>
  `;
  
  // Mostrar modal con detalles del pedido
  Swal.fire({
    title: `Detalle Completo del Pedido #${pedido.id}`,
    html: html,
    width: '800px',
    showCancelButton: true,
    confirmButtonText: 'Editar Pedido',
    cancelButtonText: 'Cerrar',
    confirmButtonColor: '#007bff',
    customClass: {
      popup: 'swal-wide'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // Redirigir a editar pedido
      window.location.href = `/pedidos/${pedido.id}/editar`;
    }
  });
}
function confirmarAnulacion(id) {
  Swal.fire({
    title: '¿Estás seguro?', text: "Esta acción anulará el pedido y devolverá los productos al inventario.", icon: 'warning',
    showCancelButton: true, confirmButtonColor: '#d33', cancelButtonText: 'Cancelar', confirmButtonText: 'Sí, ¡anular!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      await anularPedido(id);
      await cargarPedidos();
    }
  });
}
</script>

<style scoped>
.table th {
  background-color: #f8f9fa;
  border-top: none;
}

/* Estilos para el modal de detalle */
:deep(.swal-wide) {
  width: 800px !important;
  max-width: 90vw !important;
}

:deep(.swal2-html-container) {
  text-align: left !important;
}

:deep(.swal2-popup) {
  font-size: 14px !important;
}

:deep(.table-sm th),
:deep(.table-sm td) {
  padding: 0.5rem !important;
  font-size: 0.875rem !important;
}

:deep(.bg-light) {
  background-color: #f8f9fa !important;
}
</style>