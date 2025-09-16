<template>
  <div class="card shadow-sm">
    <div class="card-header bg-primary text-white"><h4 class="mb-0">Registrar Nueva Venta</h4></div>
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <fieldset class="mb-4 p-3 border rounded">
          <legend class="float-none w-auto px-2 h6">Datos del Cliente</legend>
          <div class="row">
            <div class="col-md-4 mb-3">
              <label for="cliente-cedula" class="form-label">Cédula/RIF</label>
              <input type="text" id="cliente-cedula" class="form-control" v-model="venta.cliente_cedula" required>
            </div>
            <div class="col-md-4 mb-3">
              <label for="cliente-nombre" class="form-label">Nombre</label>
              <input type="text" id="cliente-nombre" class="form-control" v-model="venta.cliente_nombre" required>
            </div>
            <div class="col-md-4 mb-3">
              <label for="cliente-apellido" class="form-label">Apellido</label>
              <input type="text" id="cliente-apellido" class="form-control" v-model="venta.cliente_apellido">
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="cliente-telefono" class="form-label">Teléfono</label>
              <input type="tel" id="cliente-telefono" class="form-control" v-model="venta.cliente_telefono">
            </div>
            <div class="col-md-6 mb-3">
              <label for="cliente-email" class="form-label">Email</label>
              <input type="email" id="cliente-email" class="form-control" v-model="venta.cliente_email">
            </div>
          </div>
        </fieldset>
        <fieldset class="mb-4 p-3 border rounded">
          <legend class="float-none w-auto px-2 h6">Añadir Productos</legend>
          <div class="row align-items-end">
            <div class="col-md-8">
              <label for="producto-select" class="form-label">Producto</label>
              <select id="producto-select" class="form-select" v-model="productoSeleccionado">
                <option :value="null" disabled>-- Seleccione --</option>
                <option v-for="p in productos" :key="p.id" :value="p">
                  {{ p.nombre }} 
                  <span v-if="p.sku">({{ p.sku }})</span>
                  - Stock: {{ p.stock_actual }} - ${{ p.precio_usd }}
                  <span v-if="p.categorias_producto">[{{ p.categorias_producto.nombre }}]</span>
                </option>
              </select>
            </div>
            <div class="col-md-2"><label for="producto-cantidad" class="form-label">Cantidad</label><input type="number" id="producto-cantidad" class="form-control" v-model.number="cantidadSeleccionada" min="1"></div>
            <div class="col-md-2"><button type="button" class="btn btn-secondary w-100" @click="agregarProducto" :disabled="!productoSeleccionado || cantidadSeleccionada < 1">Añadir</button></div>
          </div>
        </fieldset>
        <div v-if="detallesPedido.length > 0">
            <h5 class="mt-4">Detalles del Pedido</h5>
            <div class="table-responsive"><table class="table table-bordered table-striped table-hover"><thead class="table-dark"><tr><th>Producto</th><th>Cantidad</th><th>Precio U.</th><th>Subtotal</th><th>Acción</th></tr></thead><tbody><tr v-for="(item, index) in detallesPedido" :key="item.id"><td>{{ item.nombre }}</td><td>{{ item.cantidad }}</td><td>${{ item.precio_unitario.toFixed(2) }}</td><td>${{ (item.cantidad * item.precio_unitario).toFixed(2) }}</td><td><button type="button" class="btn btn-danger btn-sm" @click="eliminarProducto(index)">Eliminar</button></td></tr></tbody></table></div>
        </div>
        <div v-else class="alert alert-info text-center">Aún no has añadido productos al pedido.</div>
        <div class="row justify-content-end mt-4">
          <div class="col-md-5">
            <ul class="list-group">
              <li class="list-group-item d-flex justify-content-between align-items-center"><strong>Subtotal:</strong><span class="badge bg-light text-dark fs-6">${{ subtotal.toFixed(2) }}</span></li>
              <li class="list-group-item">
                <div class="input-group">
                  <span class="input-group-text">Descuento ($)</span>
                  <input type="number" class="form-control" v-model.number="venta.monto_descuento_usd" min="0" :max="subtotal">
                </div>
                <input v-if="venta.monto_descuento_usd > 0" type="text" class="form-control mt-2" v-model="venta.comentarios" placeholder="Comentario del descuento" required>
              </li>
              <li class="list-group-item">
                <div class="input-group">
                  <span class="input-group-text">IVA ($)</span>
                  <input type="number" class="form-control" v-model.number="venta.monto_iva_usd" min="0">
                </div>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white"><strong class="fs-5">TOTAL:</strong><span class="badge bg-success fs-5">${{ total.toFixed(2) }}</span></li>
            </ul>
          </div>
        </div>
        <div class="d-grid gap-2 mt-4"><button type="submit" class="btn btn-primary btn-lg" :disabled="isSubmitting || detallesPedido.length === 0"><span v-if="isSubmitting" class="spinner-border spinner-border-sm"></span> {{ isSubmitting ? 'Procesando...' : 'Registrar Venta' }}</button></div>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import { getProducts, createSale } from '../services/apiService.js';
import Swal from 'sweetalert2';

const productos = ref([]);
const productoSeleccionado = ref(null);
const cantidadSeleccionada = ref(1);
const detallesPedido = ref([]);
const isSubmitting = ref(false);

const venta = ref({
  cliente_cedula: '',
  cliente_nombre: '',
  cliente_apellido: '',
  cliente_telefono: '',
  cliente_email: '',
  monto_descuento_usd: 0,
  monto_iva_usd: 0,
  comentarios: ''
});

onMounted(async () => {
  productos.value = await getProducts();
});

const subtotal = computed(() => 
  detallesPedido.value.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0)
);

const total = computed(() => {
  const totalCalculado = subtotal.value - (venta.value.monto_descuento_usd || 0) + (venta.value.monto_iva_usd || 0);
  return totalCalculado < 0 ? 0 : totalCalculado;
});

function agregarProducto() {
  if (!productoSeleccionado.value || cantidadSeleccionada.value < 1) {
    Swal.fire('Atención', 'Selecciona un producto y una cantidad válida.', 'warning');
    return;
  }
  
  if (cantidadSeleccionada.value > productoSeleccionado.value.stock_actual) {
    Swal.fire('Stock Insuficiente', `Solo quedan ${productoSeleccionado.value.stock_actual} unidades.`, 'error');
    return;
  }
  
  const productoExistente = detallesPedido.value.find(item => item.id === productoSeleccionado.value.id);
  
  if (productoExistente) {
    productoExistente.cantidad += cantidadSeleccionada.value;
  } else {
    detallesPedido.value.push({
      id: productoSeleccionado.value.id,
      nombre: productoSeleccionado.value.nombre,
      sku: productoSeleccionado.value.sku,
      cantidad: cantidadSeleccionada.value,
      precio_unitario: productoSeleccionado.value.precio_usd
    });
  }
  
  productoSeleccionado.value = null;
  cantidadSeleccionada.value = 1;
}

function eliminarProducto(index) {
  detallesPedido.value.splice(index, 1);
}

function resetForm() {
  venta.value = {
    cliente_cedula: '',
    cliente_nombre: '',
    cliente_apellido: '',
    cliente_telefono: '',
    cliente_email: '',
    monto_descuento_usd: 0,
    monto_iva_usd: 0,
    comentarios: ''
  };
  detallesPedido.value = [];
  productoSeleccionado.value = null;
  cantidadSeleccionada.value = 1;
}

async function handleSubmit() {
  if (detallesPedido.value.length === 0) {
    Swal.fire('Error', 'Debes añadir al menos un producto.', 'error');
    return;
  }
  
  if (venta.value.monto_descuento_usd > 0 && !venta.value.comentarios.trim()) {
    Swal.fire('Error', 'El comentario del descuento es obligatorio.', 'error');
    return;
  }
  
  isSubmitting.value = true;
  
  const payload = {
    ...venta.value,
    productos: detallesPedido.value.map(item => ({
      id: item.id,
      cantidad: item.cantidad
    }))
  };
  
  try {
    await createSale(payload);
    resetForm();
  } catch (error) {
    console.error("Fallo el envío de la venta:", error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>
<style scoped>
fieldset { border: 1px solid #dee2e6 !important; }
legend { font-size: 1rem; font-weight: 600; }
</style>