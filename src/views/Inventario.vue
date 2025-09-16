<template>
  <div class="container-fluid mt-4">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2><i class="bi bi-box-seam"></i> Inventario de Productos</h2>
          <button class="btn btn-primary" @click="cargarInventario">
            <i class="bi bi-arrow-clockwise"></i> Actualizar
          </button>
        </div>

        <!-- Filtros -->
        <div class="row mb-3">
          <div class="col-md-4">
            <input type="text" class="form-control" v-model="filtroBusqueda" 
                   placeholder="Buscar producto...">
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="filtroCategoria">
              <option value="">Todas las categorías</option>
              <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
                {{ categoria.nombre }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="filtroEstado">
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <!-- Tabla de inventario -->
        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio USD</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="producto in productosFiltrados" :key="producto.id">
                    <td>{{ producto.id }}</td>
                    <td>{{ producto.nombre }}</td>
                    <td>{{ producto.categoria_nombre || 'Sin categoría' }}</td>
                    <td>${{ producto.precio_usd?.toFixed(2) || '0.00' }}</td>
                    <td>
                      <span :class="producto.stock <= 5 ? 'text-danger fw-bold' : ''">
                        {{ producto.stock || 0 }}
                      </span>
                    </td>
                    <td>
                      <span :class="producto.activo ? 'badge bg-success' : 'badge bg-secondary'">
                        {{ producto.activo ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary" @click="editarProducto(producto)">
                        <i class="bi bi-pencil"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mensaje cuando no hay productos -->
            <div v-if="productosFiltrados.length === 0" class="text-center py-5">
              <i class="bi bi-box-seam display-1 text-muted"></i>
              <h4 class="text-muted mt-3">No se encontraron productos</h4>
              <p class="text-muted">Intenta ajustar los filtros de búsqueda</p>
            </div>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="row mt-4">
          <div class="col-md-3">
            <div class="card bg-primary text-white">
              <div class="card-body text-center">
                <h5>{{ productos.length }}</h5>
                <p class="mb-0">Total Productos</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-success text-white">
              <div class="card-body text-center">
                <h5>{{ productosActivos }}</h5>
                <p class="mb-0">Productos Activos</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-warning text-white">
              <div class="card-body text-center">
                <h5>{{ productosStockBajo }}</h5>
                <p class="mb-0">Stock Bajo</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-info text-white">
              <div class="card-body text-center">
                <h5>{{ categorias.length }}</h5>
                <p class="mb-0">Categorías</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiService } from '../services/apiService'
import Swal from 'sweetalert2'

// Estado reactivo
const productos = ref([])
const categorias = ref([])
const filtroBusqueda = ref('')
const filtroCategoria = ref('')
const filtroEstado = ref('')

// Computed properties
const productosFiltrados = computed(() => {
  return productos.value.filter(producto => {
    const coincideBusqueda = !filtroBusqueda.value || 
      producto.nombre.toLowerCase().includes(filtroBusqueda.value.toLowerCase())
    
    const coincideCategoria = !filtroCategoria.value || 
      producto.categoria_id === parseInt(filtroCategoria.value)
    
    const coincideEstado = !filtroEstado.value || 
      (filtroEstado.value === 'activo' && producto.activo) ||
      (filtroEstado.value === 'inactivo' && !producto.activo)
    
    return coincideBusqueda && coincideCategoria && coincideEstado
  })
})

const productosActivos = computed(() => {
  return productos.value.filter(p => p.activo).length
})

const productosStockBajo = computed(() => {
  return productos.value.filter(p => p.stock <= 5).length
})

// Funciones
async function cargarInventario() {
  try {
    const response = await apiService.getProductos()
    productos.value = response.data || []
    
    const catResponse = await apiService.getCategorias()
    categorias.value = catResponse.data || []
    
  } catch (error) {
    console.error('Error cargando inventario:', error)
    Swal.fire({
      title: 'Error',
      text: 'No se pudo cargar el inventario',
      icon: 'error'
    })
  }
}

function editarProducto(producto) {
  Swal.fire({
    title: 'Editar Producto',
    text: 'Esta funcionalidad estará disponible próximamente',
    icon: 'info'
  })
}

// Lifecycle
onMounted(() => {
  cargarInventario()
})
</script>

<style scoped>
.table th {
  border-top: none;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.btn-sm {
  padding: 0.25rem 0.5rem;
}
</style>
