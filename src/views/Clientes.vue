<template>
  <div class="container-fluid mt-4">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2><i class="bi bi-people"></i> Gestión de Clientes</h2>
          <button class="btn btn-primary" @click="abrirModalNuevoCliente">
            <i class="bi bi-person-plus"></i> Nuevo Cliente
          </button>
        </div>

        <!-- Filtros -->
        <div class="row mb-3">
          <div class="col-md-6">
            <input type="text" class="form-control" v-model="filtroBusqueda" 
                   placeholder="Buscar por cédula, nombre, teléfono...">
          </div>
          <div class="col-md-3">
            <button class="btn btn-outline-secondary" @click="limpiarFiltros">
              <i class="bi bi-arrow-clockwise"></i> Limpiar
            </button>
          </div>
        </div>

        <!-- Tabla de clientes -->
        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-dark">
                  <tr>
                    <th>Cédula/RIF</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Email</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cliente in clientesFiltrados" :key="cliente.id">
                    <td>{{ cliente.cedula_rif }}</td>
                    <td>{{ cliente.nombre }}</td>
                    <td>{{ cliente.apellido }}</td>
                    <td>{{ cliente.email }}</td>
                    <td>
                      <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" @click="editarCliente(cliente)" title="Editar">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" @click="verHistorial(cliente)" title="Historial">
                          <i class="bi bi-clock-history"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="eliminarCliente(cliente)" title="Eliminar">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mensaje cuando no hay clientes -->
            <div v-if="clientesFiltrados.length === 0" class="text-center py-5">
              <i class="bi bi-people display-1 text-muted"></i>
              <h4 class="text-muted mt-3">No se encontraron clientes</h4>
              <p class="text-muted">Intenta ajustar los filtros de búsqueda o crea un nuevo cliente</p>
            </div>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="row mt-4">
          <div class="col-md-4">
            <div class="card bg-primary text-white">
              <div class="card-body text-center">
                <h5>{{ clientes.length }}</h5>
                <p class="mb-0">Total Clientes</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card bg-info text-white">
              <div class="card-body text-center">
                <h5>{{ clientesConEmail }}</h5>
                <p class="mb-0">Con Email</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card bg-warning text-white">
              <div class="card-body text-center">
                <h5>{{ clientesRecientes }}</h5>
                <p class="mb-0">Últimos 30 días</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para nuevo/editar cliente -->
    <div class="modal fade" id="modalCliente" tabindex="-1" aria-labelledby="modalClienteLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalClienteLabel">
              {{ clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="guardarCliente">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="cedula" class="form-label">Cédula/RIF *</label>
                  <input type="text" id="cedula" class="form-control" v-model="clienteForm.cedula" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="nombre" class="form-label">Nombre *</label>
                  <input type="text" id="nombre" class="form-control" v-model="clienteForm.nombre" required>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="apellido" class="form-label">Apellido</label>
                  <input type="text" id="apellido" class="form-control" v-model="clienteForm.apellido">
                </div>
                <div class="col-md-6 mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input type="email" id="email" class="form-control" v-model="clienteForm.email">
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="guardarCliente">
              {{ clienteEditando ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getClientes, agregarCliente, actualizarCliente, eliminarCliente as eliminarClienteService, getEstadisticasClientes } from '../services/clientesService.js'
import Swal from 'sweetalert2'

// Estado reactivo
const clientes = ref([])
const filtroBusqueda = ref('')
const clienteEditando = ref(null)
const clienteForm = ref({
  cedula: '',
  nombre: '',
  apellido: '',
  email: ''
})

// Computed properties
const clientesFiltrados = computed(() => {
  return clientes.value.filter(cliente => {
    const coincideBusqueda = !filtroBusqueda.value || 
      cliente.cedula_rif.toLowerCase().includes(filtroBusqueda.value.toLowerCase()) ||
      cliente.nombre.toLowerCase().includes(filtroBusqueda.value.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(filtroBusqueda.value.toLowerCase()) ||
      cliente.email.toLowerCase().includes(filtroBusqueda.value.toLowerCase())
    
    return coincideBusqueda
  })
})

const clientesConEmail = computed(() => {
  return clientes.value.filter(c => c.email && c.email.trim()).length
})

const clientesRecientes = computed(() => {
  return clientes.value.length // Simplificado ya que no tenemos fecha_creacion
})

// Funciones
async function cargarClientes() {
  clientes.value = await getClientes()
}

function abrirModalNuevoCliente() {
  clienteEditando.value = null
  clienteForm.value = {
    cedula: '',
    nombre: '',
    apellido: '',
    email: ''
  }
  
  // Mostrar modal
  const modal = new bootstrap.Modal(document.getElementById('modalCliente'))
  modal.show()
}

function editarCliente(cliente) {
  clienteEditando.value = cliente
  clienteForm.value = {
    cedula: cliente.cedula_rif,
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    email: cliente.email
  }
  
  // Mostrar modal
  const modal = new bootstrap.Modal(document.getElementById('modalCliente'))
  modal.show()
}

async function guardarCliente() {
  // Validaciones
  if (!clienteForm.value.cedula.trim() || !clienteForm.value.nombre.trim()) {
    Swal.fire('Error', 'Cédula y nombre son obligatorios', 'error')
    return
  }
  
  // Verificar si la cédula ya existe (excepto si estamos editando)
  const cedulaExiste = clientes.value.find(c => 
    c.cedula === clienteForm.value.cedula && 
    (!clienteEditando.value || c.id !== clienteEditando.value.id)
  )
  
  if (cedulaExiste) {
    Swal.fire('Error', 'Ya existe un cliente con esa cédula', 'error')
    return
  }
  
  try {
    if (clienteEditando.value) {
      // Actualizar cliente existente usando el servicio
      const clienteActualizado = await actualizarCliente({
        ...clienteForm.value,
        id: clienteEditando.value.id
      })
      
      if (clienteActualizado) {
        Swal.fire('¡Éxito!', 'Cliente actualizado correctamente', 'success')
      } else {
        Swal.fire('Error', 'No se pudo actualizar el cliente', 'error')
      }
    } else {
      // Crear nuevo cliente usando el servicio
      const nuevoCliente = await agregarCliente(clienteForm.value)
      
      if (nuevoCliente) {
        Swal.fire('¡Éxito!', 'Cliente creado correctamente', 'success')
      } else {
        Swal.fire('Error', 'No se pudo crear el cliente', 'error')
      }
    }
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalCliente'))
    modal.hide()
  } catch (error) {
    console.error('Error al guardar cliente:', error)
    Swal.fire('Error', 'Error al guardar el cliente', 'error')
  }
}

async function eliminarCliente(cliente) {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `¿Deseas eliminar al cliente ${cliente.nombre} ${cliente.apellido}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33'
  })
  
  if (result.isConfirmed) {
    try {
      const eliminado = await eliminarClienteService(cliente.id)
      if (eliminado) {
        Swal.fire('¡Eliminado!', 'El cliente ha sido eliminado', 'success')
      } else {
        Swal.fire('Error', 'No se pudo eliminar el cliente', 'error')
      }
    } catch (error) {
      console.error('Error al eliminar cliente:', error)
      Swal.fire('Error', 'Error al eliminar el cliente', 'error')
    }
  }
}

function verHistorial(cliente) {
  Swal.fire({
    title: `Historial de ${cliente.nombre} ${cliente.apellido}`,
    text: 'Esta funcionalidad estará disponible próximamente',
    icon: 'info'
  })
}

function limpiarFiltros() {
  filtroBusqueda.value = ''
}

// Lifecycle
onMounted(() => {
  cargarClientes()
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

.btn-group .btn {
  margin-right: 2px;
}

.btn-group .btn:last-child {
  margin-right: 0;
}
</style>
