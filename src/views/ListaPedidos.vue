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
                <span class="badge" :class="estadoClass(pedido.estado_entrega)">
                  {{ pedido.estado_entrega }}
                </span>
              </td>
              <td>
                <div class="d-flex gap-2">
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
  loading.value = true;
  pedidos.value = await getPedidos();
  loading.value = false;
}
onMounted(cargarPedidos);
function estadoClass(estado) {
  if (estado === 'anulado') return 'bg-danger';
  if (estado === 'entregado') return 'bg-success';
  if (estado === 'en_camino') return 'bg-warning';
  return 'bg-secondary';
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