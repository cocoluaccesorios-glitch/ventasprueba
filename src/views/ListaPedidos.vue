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
    pedidos.value = datosPedidos;
    console.log('✅ Pedidos asignados a la vista:', pedidos.value);
  } catch (error) {
    console.error('❌ Error al cargar pedidos:', error);
    pedidos.value = [];
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
  
  // Agregar productos si están disponibles
  if (pedido.detalles_pedido && pedido.detalles_pedido.length > 0) {
    pedido.detalles_pedido.forEach(detalle => {
      html += `
        <tr>
          <td>${detalle.nombre_producto || 'Producto'}</td>
          <td>${detalle.cantidad}</td>
          <td>$${detalle.precio_unitario_usd.toFixed(2)}</td>
          <td>$${(detalle.cantidad * detalle.precio_unitario_usd).toFixed(2)}</td>
        </tr>
      `;
    });
  } else {
    html += `<tr><td colspan="4" class="text-center text-muted">No hay productos disponibles</td></tr>`;
  }
  
  html += `
          </tbody>
        </table>
      </div>
      
      <hr class="my-4">
      
      <h6 class="text-primary mb-3">💰 Resumen Financiero</h6>
      <div class="row">
        <div class="col-md-6">
          <p><strong>Subtotal:</strong> $${(pedido.subtotal_usd || 0).toFixed(2)}</p>
          <p><strong>Delivery:</strong> ${pedido.monto_delivery_usd ? `$${pedido.monto_delivery_usd.toFixed(2)}` : '$0.00'}</p>
          <p><strong>Descuento:</strong> ${pedido.monto_descuento_usd && pedido.subtotal_usd > 0 ? 
            `${((pedido.monto_descuento_usd / pedido.subtotal_usd) * 100).toFixed(0)}% ($${pedido.monto_descuento_usd.toFixed(2)})` : 
            'No aplica'}</p>
          <p><strong>IVA:</strong> ${pedido.aplica_iva ? 
            `$${(pedido.monto_iva_usd || 0).toFixed(2)} (16%)` : 
            'No aplica'}</p>
          <p><strong>Total:</strong> <span style="font-weight: bold; color: #28a745;">$${(pedido.total_usd || 0).toFixed(2)}</span></p>
        </div>
        <div class="col-md-6">
          ${pedido.es_pago_mixto || pedido.metodo_pago === 'Mixto' ? `
            <p><strong>Tipo de Pago:</strong> <span style="color: #007bff; font-weight: bold;">Pago Mixto</span></p>
            ${pedido.metodo_pago_mixto_usd ? `
              <p><strong>Método USD:</strong> ${pedido.metodo_pago_mixto_usd || 'No especificado'} 
                ${pedido.referencia_mixto_usd ? `- Ref: ${pedido.referencia_mixto_usd}` : ''}</p>
              <p><strong>Método VES:</strong> ${pedido.metodo_pago_mixto_ves || 'No especificado'} 
                ${pedido.referencia_mixto_ves ? `- Ref: ${pedido.referencia_mixto_ves}` : ''}</p>
              <p><strong>Monto USD:</strong> $${(pedido.monto_mixto_usd || 0).toFixed(2)}</p>
              <p><strong>Monto VES:</strong> ${(pedido.monto_mixto_ves || 0).toFixed(2)} Bs</p>
            ` : `
              <p><strong>Estado:</strong> <span style="color: #dc3545;">⚠️ Desglose no disponible</span></p>
              <p><strong>Motivo:</strong> Faltan columnas en la base de datos</p>
              <p><strong>Solución:</strong> Ejecutar los comandos SQL proporcionados</p>
              <p><strong>Total:</strong> $${(pedido.total_usd || 0).toFixed(2)} (pago completo)</p>
            `}
          ` : `
            <p><strong>Método de Pago:</strong> ${pedido.metodo_pago || 'Efectivo'}</p>
            <p><strong>Referencia:</strong> ${pedido.referencia_pago || 'No aplica'}</p>
            ${(pedido.metodo_pago && pedido.metodo_pago.toLowerCase() !== 'efectivo') ? `
              <p><strong>Tasa BCV:</strong> ${pedido.tasa_bcv ? `${pedido.tasa_bcv} Bs/USD` : '160.0 Bs/USD'}</p>
              <p><strong>Total en Bolívares:</strong> ${pedido.tasa_bcv ? 
                `${((pedido.total_usd || 0) * pedido.tasa_bcv).toFixed(2)} Bs` : 
                `${((pedido.total_usd || 0) * 160).toFixed(2)} Bs`}</p>
            ` : `
              <p><strong>Moneda:</strong> Dólares USD</p>
              <p><strong>Tipo:</strong> Pago en efectivo</p>
            `}
          `}
        </div>
      </div>
      
      ${pedido.es_abono || pedido.tipo_pago_abono || pedido.metodo_pago === 'Abono' ? `
        <hr class="my-4">
        <h6 class="text-primary mb-3">💳 Información de Abono</h6>
        <div class="row">
          <div class="col-md-6">
            <p><strong>Tipo de Abono:</strong> ${pedido.tipo_pago_abono || 'Simple'}</p>
            ${(pedido.total_abono_usd && pedido.total_abono_usd > 0) ? `
              <p><strong>Monto Abonado:</strong> ${pedido.monto_abono_simple ? 
                `$${pedido.monto_abono_simple.toFixed(2)} USD` : 
                `$${(pedido.monto_abono_usd || 0).toFixed(2)} USD + ${(pedido.monto_abono_ves || 0).toFixed(2)} Bs`}</p>
              <p><strong>Total Abono:</strong> $${(pedido.total_abono_usd || 0).toFixed(2)} USD</p>
              <p><strong>Método del Abono:</strong> ${pedido.metodo_pago_abono || 'No especificado'}</p>
              ${pedido.referencia_pago ? `<p><strong>Referencia:</strong> ${pedido.referencia_pago}</p>` : ''}
            ` : `
              <p><strong>Estado:</strong> <span style="color: #dc3545;">⚠️ Datos de abono incompletos</span></p>
              <p><strong>Problema:</strong> El abono no se guardó correctamente en la base de datos</p>
              <p><strong>Estimado:</strong> Total del pedido indica que es un abono</p>
            `}
          </div>
          <div class="col-md-6">
            ${(pedido.total_abono_usd && pedido.total_abono_usd > 0) ? `
              <p><strong>Saldo Pendiente:</strong> <span style="color: #dc3545; font-weight: bold;">$${((pedido.total_usd || 0) - (pedido.total_abono_usd || 0)).toFixed(2)} USD</span></p>
              <p><strong>Fecha Límite:</strong> ${pedido.fecha_vencimiento ? 
                new Date(pedido.fecha_vencimiento).toLocaleDateString('es-VE') : 
                'Sin fecha límite'}</p>
            ` : `
              <p><strong>Saldo Pendiente:</strong> <span style="color: #dc3545; font-weight: bold;">$${(pedido.total_usd || 0).toFixed(2)} USD</span></p>
              <p><strong>Nota:</strong> Se asume que no se ha abonado nada</p>
              <p><strong>Acción:</strong> Crear nuevo abono con datos correctos</p>
            `}
          </div>
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