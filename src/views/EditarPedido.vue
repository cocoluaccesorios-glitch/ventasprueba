<template>
  <div class="card shadow-sm" v-if="pedido">
    <div class="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
      <h4 class="mb-0">Editando Pedido #{{ id }}</h4>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-dark btn-sm" @click="cargarPedido">
          <i class="bi bi-arrow-clockwise"></i> Recargar
        </button>
        <router-link to="/pedidos" class="btn btn-outline-dark btn-sm">
          <i class="bi bi-arrow-left"></i> Volver
        </router-link>
      </div>
    </div>
    <div class="card-body">
      <!-- Información del Pedido -->
      <div class="row mb-4">
        <div class="col-md-6">
          <h6>Información del Pedido</h6>
          <table class="table table-sm">
            <tbody>
              <tr>
                <td><strong>ID:</strong></td>
                <td>{{ pedido.id }}</td>
              </tr>
              <tr>
                <td><strong>Fecha:</strong></td>
                <td>{{ new Date(pedido.fecha_pedido).toLocaleString('es-VE') }}</td>
              </tr>
              <tr>
                <td><strong>Estado:</strong></td>
                <td>
                  <span class="badge" :class="estadoClass(pedido.estado_entrega)">
                    {{ pedido.estado_entrega }}
                  </span>
                </td>
              </tr>
              <tr>
                <td><strong>Total:</strong></td>
                <td>${{ pedido.total_usd?.toFixed(2) || '0.00' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-md-6">
          <h6>Información del Cliente</h6>
          <table class="table table-sm">
            <tbody>
              <tr>
                <td><strong>Nombre:</strong></td>
                <td>{{ pedido.cliente?.nombre || 'N/A' }}</td>
              </tr>
              <tr>
                <td><strong>Apellido:</strong></td>
                <td>{{ pedido.cliente?.apellido || 'N/A' }}</td>
              </tr>
              <tr>
                <td><strong>Teléfono:</strong></td>
                <td>{{ pedido.cliente?.telefono || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Formulario de Edición -->
      <form @submit.prevent="guardarCambios" v-if="!soloLectura">
        <fieldset class="mb-4 p-3 border rounded">
          <legend class="float-none w-auto px-2 h6">Modificar Productos</legend>
          
          <!-- Agregar Nuevo Producto -->
          <div class="row align-items-end mb-3">
            <div class="col-md-4">
              <label class="form-label">Producto</label>
              <select class="form-select" v-model="nuevoProducto.id">
                <option :value="null" disabled>-- Seleccione --</option>
                <option v-for="p in productos" :key="p.id" :value="p">
                  {{ p.nombre }} - Stock: {{ p.stock_actual }} - ${{ p.precio_usd }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Cantidad</label>
              <input type="number" class="form-control" v-model.number="nuevoProducto.cantidad" min="1">
            </div>
            <div class="col-md-2">
              <label class="form-label">Precio</label>
              <input type="number" class="form-control" v-model.number="nuevoProducto.precio" step="0.01" min="0">
            </div>
            <div class="col-md-2">
              <button type="button" class="btn btn-primary w-100" @click="agregarProducto">
                <i class="bi bi-plus"></i> Agregar
              </button>
            </div>
          </div>

          <!-- Lista de Productos Actuales -->
          <div v-if="productosEditados.length > 0">
            <h6>Productos en el Pedido</h6>
            <div class="table-responsive">
              <table class="table table-sm table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio U.</th>
                    <th>Subtotal</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in productosEditados" :key="item.id">
                    <td>{{ item.nombre }}</td>
                    <td>
                      <input type="number" class="form-control form-control-sm" 
                             v-model.number="item.cantidad" min="1" style="width: 80px;">
                    </td>
                    <td>
                      <input type="number" class="form-control form-control-sm" 
                             v-model.number="item.precio_unitario" step="0.01" min="0" style="width: 100px;">
                    </td>
                    <td class="text-end">${{ (item.cantidad * item.precio_unitario).toFixed(2) }}</td>
                    <td>
                      <button type="button" class="btn btn-danger btn-sm" @click="eliminarProducto(index)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </fieldset>

        <!-- Motivo de la Edición -->
        <fieldset class="mb-4 p-3 border rounded">
          <legend class="float-none w-auto px-2 h6">Información de la Edición</legend>
          <div class="row">
            <div class="col-md-12 mb-3">
              <label for="motivo-edicion" class="form-label">Motivo de la Edición *</label>
              <textarea id="motivo-edicion" class="form-control" v-model="motivoEdicion" 
                        placeholder="Describe el motivo de la edición..." required rows="3"></textarea>
            </div>
          </div>
        </fieldset>

        <!-- Botones de Acción -->
        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-success" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
            <i class="bi bi-check-circle"></i> Guardar Cambios
          </button>
          <button type="button" class="btn btn-secondary" @click="cancelarEdicion">
            <i class="bi bi-x-circle"></i> Cancelar
          </button>
        </div>
      </form>

      <!-- Vista de Solo Lectura -->
      <div v-else>
        <div class="alert alert-info">
          <i class="bi bi-info-circle"></i> Este pedido no puede ser editado en su estado actual.
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary" @click="cambiarEstado">
            <i class="bi bi-arrow-repeat"></i> Cambiar Estado
          </button>
          <button class="btn btn-danger" @click="anularPedido">
            <i class="bi bi-x-octagon"></i> Anular Pedido
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Cargando...</span>
    </div>
    <p class="mt-2">Cargando información del pedido...</p>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import { getPedidoPorId, getProducts, updatePedido, anularPedidoConMotivo, cambiarEstadoPedido } from '../services/apiService.js';
import Swal from 'sweetalert2';

const props = defineProps({ id: { type: String, required: true } });

const pedido = ref(null);
const productos = ref([]);
const productosEditados = ref([]);
const isSaving = ref(false);
const motivoEdicion = ref('');

const nuevoProducto = ref({
  id: null,
  cantidad: 1,
  precio: 0
});

// Determinar si el pedido es editable
const soloLectura = computed(() => {
  if (!pedido.value) return true;
  return pedido.value.estado_entrega === 'anulado' || 
         pedido.value.estado_entrega === 'entregado';
});

// Total calculado de los productos editados
const totalEditado = computed(() => {
  return productosEditados.value.reduce((acc, item) => 
    acc + (item.cantidad * item.precio_unitario), 0
  );
});

onMounted(async () => {
  await cargarPedido();
  productos.value = await getProducts();
});

async function cargarPedido() {
  try {
    pedido.value = await getPedidoPorId(props.id);
    if (pedido.value && pedido.value.detalles_pedido) {
      productosEditados.value = pedido.value.detalles_pedido.map(detalle => ({
        id: detalle.producto_id || detalle.productos?.id,
        nombre: detalle.productos?.nombre || detalle.nombre || 'Producto',
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio_unitario_usd || detalle.precio_unitario
      }));
    }
  } catch (error) {
    console.error('Error al cargar pedido:', error);
    Swal.fire('Error', 'No se pudo cargar la información del pedido', 'error');
  }
}

function agregarProducto() {
  if (!nuevoProducto.value.id || nuevoProducto.value.cantidad < 1 || nuevoProducto.value.precio <= 0) {
    Swal.fire('Error', 'Completa todos los campos del producto', 'error');
    return;
  }

  const producto = productos.value.find(p => p.id === nuevoProducto.value.id);
  if (!producto) {
    Swal.fire('Error', 'Producto no encontrado', 'error');
    return;
  }

  // Verificar si ya existe en la lista
  const existente = productosEditados.value.find(p => p.id === producto.id);
  if (existente) {
    existente.cantidad += nuevoProducto.value.cantidad;
    existente.precio_unitario = nuevoProducto.value.precio;
  } else {
    productosEditados.value.push({
      id: producto.id,
      nombre: producto.nombre,
      cantidad: nuevoProducto.value.cantidad,
      precio_unitario: nuevoProducto.value.precio
    });
  }

  // Limpiar formulario
  nuevoProducto.value = {
    id: null,
    cantidad: 1,
    precio: 0
  };
}

function eliminarProducto(index) {
  Swal.fire({
    title: '¿Eliminar producto?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      productosEditados.value.splice(index, 1);
    }
  });
}

async function guardarCambios() {
  if (!motivoEdicion.value.trim()) {
    Swal.fire('Error', 'Debes especificar el motivo de la edición', 'error');
    return;
  }

  if (productosEditados.value.length === 0) {
    Swal.fire('Error', 'El pedido debe tener al menos un producto', 'error');
    return;
  }

  isSaving.value = true;

  try {
    const cambios = {
      id: props.id,
      motivo: motivoEdicion.value,
      productos: productosEditados.value.map(item => ({
        id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      })),
      nuevo_total: totalEditado.value
    };

    await updatePedido(cambios);
    
    Swal.fire({
      title: '¡Cambios Guardados!',
      text: 'El pedido ha sido actualizado correctamente',
      icon: 'success',
      confirmButtonText: 'Continuar'
    });

    // Recargar el pedido
    await cargarPedido();
    motivoEdicion.value = '';

  } catch (error) {
    console.error('Error al guardar cambios:', error);
    Swal.fire('Error', `No se pudieron guardar los cambios: ${error.message}`, 'error');
  } finally {
    isSaving.value = false;
  }
}

function cancelarEdicion() {
  Swal.fire({
    title: '¿Cancelar edición?',
    text: 'Los cambios no guardados se perderán',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'Continuar editando'
  }).then((result) => {
    if (result.isConfirmed) {
      cargarPedido();
      motivoEdicion.value = '';
    }
  });
}

function estadoClass(estado) {
  switch (estado) {
    case 'anulado': return 'bg-danger';
    case 'entregado': return 'bg-success';
    case 'en_camino': return 'bg-warning';
    case 'pendiente': return 'bg-secondary';
    default: return 'bg-light text-dark';
  }
}

async function cambiarEstado() {
  const { value: nuevoEstado } = await Swal.fire({
    title: 'Cambiar Estado del Pedido',
    input: 'select',
    inputOptions: {
      'pendiente': 'Pendiente de Entrega',
      'en_camino': 'En Camino',
      'entregado': 'Entregado'
    },
    inputValue: pedido.value.estado_entrega,
    showCancelButton: true,
    confirmButtonText: 'Cambiar',
    cancelButtonText: 'Cancelar'
  });

  if (nuevoEstado) {
    try {
      await cambiarEstadoPedido(props.id, nuevoEstado);
      await cargarPedido();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  }
}

async function anularPedido() {
  const { value: motivo } = await Swal.fire({
    title: 'Anular Pedido',
    input: 'textarea',
    inputLabel: 'Motivo de la anulación',
    inputPlaceholder: 'Describe el motivo de la anulación...',
    showCancelButton: true,
    confirmButtonText: 'Anular',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) {
        return 'Debes especificar el motivo de la anulación';
      }
    }
  });

  if (motivo) {
    try {
      await anularPedidoConMotivo(props.id, motivo);
      await cargarPedido();
    } catch (error) {
      console.error('Error al anular pedido:', error);
    }
  }
}
</script>