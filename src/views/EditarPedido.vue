<template>
  <div class="card shadow-sm" v-if="pedido">
    <div class="card-header"><h4 class="mb-0">Editando Pedido #{{ id }}</h4></div>
    <div class="card-body">
      <p><strong>Cliente:</strong> {{ pedido.cliente.nombre_completo }}</p>
      <p><strong>Fecha:</strong> {{ new Date(pedido.fecha_pedido).toLocaleString('es-VE') }}</p>
      <h5>Detalles</h5>
      <ul><li v-for="detalle in pedido.detalles" :key="detalle.id">{{ detalle.cantidad }} x {{ detalle.producto.nombre }}</li></ul>
      <router-link to="/pedidos" class="btn btn-secondary mt-3">Volver a la lista</router-link>
    </div>
  </div>
  <div v-else class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div></div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { getPedidoPorId } from '../services/apiService.js';
const props = defineProps({ id: { type: String, required: true } });
const pedido = ref(null);
onMounted(async () => {
  pedido.value = await getPedidoPorId(props.id);
});
</script>