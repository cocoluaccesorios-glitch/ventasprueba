<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col">
        <div class="d-flex justify-content-between align-items-center">
          <h2><i class="bi bi-people"></i> Gestión de Clientes</h2>
          <div>
            <button class="btn btn-primary me-2" @click="mostrarFormularioNuevo">
              <i class="bi bi-person-plus"></i> Nuevo Cliente
            </button>
            <button class="btn btn-outline-secondary" @click="cargarClientes">
              <i class="bi bi-arrow-clockwise"></i> Recargar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros y Búsqueda -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input 
            type="text" 
            class="form-control" 
            placeholder="Buscar por nombre, apellido o cédula..."
            v-model="terminoBusqueda"
            @input="buscarClientes"
          >
        </div>
      </div>
      <div class="col-md-3">
        <select class="form-select" v-model="filtroEstado" @change="aplicarFiltros">
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>
      <div class="col-md-3">
        <select class="form-select" v-model="ordenamiento" @change="aplicarFiltros">
          <option value="fecha_desc">Más recientes</option>
          <option value="fecha_asc">Más antiguos</option>
          <option value="nombre_asc">Nombre A-Z</option>
          <option value="nombre_desc">Nombre Z-A</option>
        </select>
      </div>
    </div>

    <!-- Lista de Clientes -->
    <div class="row">
      <div class="col">
        <div class="card">
          <div class="card-body">
            <div v-if="cargando" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-2">Cargando clientes...</p>
            </div>

            <div v-else-if="clientesFiltrados.length === 0" class="text-center py-4">
              <i class="bi bi-person-x display-1 text-muted"></i>
              <h4 class="text-muted">No se encontraron clientes</h4>
              <p class="text-muted">Intenta ajustar los filtros de búsqueda</p>
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Cédula</th>
                    <th>Nombre Completo</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Dirección</th>
                    <th>Estado</th>
                    <th>Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cliente in clientesFiltrados" :key="cliente.id">
                    <td>
                      <code>{{ cliente.cedula }}</code>
                    </td>
                    <td>
                      <strong>{{ cliente.nombre }} {{ cliente.apellido }}</strong>
                    </td>
                    <td>
                      <i class="bi bi-telephone"></i> {{ cliente.telefono || 'N/A' }}
                    </td>
                    <td>
                      <i class="bi bi-envelope"></i> {{ cliente.email || 'N/A' }}
                    </td>
                    <td>
                      <small class="text-muted">{{ cliente.direccion || 'N/A' }}</small>
                    </td>
                    <td>
                      <span class="badge" :class="cliente.estado === 'activo' ? 'bg-success' : 'bg-secondary'">
                        {{ cliente.estado }}
                      </span>
                    </td>
                    <td>
                      <small>{{ new Date(cliente.fecha_registro).toLocaleDateString('es-VE') }}</small>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm" role="group">
                        <button 
                          class="btn btn-outline-primary" 
                          @click="verDetalles(cliente)"
                          title="Ver detalles"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        <button 
                          class="btn btn-outline-warning" 
                          @click="editarCliente(cliente)"
                          title="Editar"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button 
                          class="btn btn-outline-info" 
                          @click="verHistorial(cliente)"
                          title="Ver historial"
                        >
                          <i class="bi bi-clock-history"></i>
                        </button>
                        <button 
                          v-if="cliente.estado === 'activo'"
                          class="btn btn-outline-danger" 
                          @click="desactivarCliente(cliente)"
                          title="Desactivar"
                        >
                          <i class="bi bi-person-x"></i>
                        </button>
                        <button 
                          v-else
                          class="btn btn-outline-success" 
                          @click="activarCliente(cliente)"
                          title="Activar"
                        >
                          <i class="bi bi-person-check"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo/Editar Cliente -->
    <div class="modal fade" id="modalCliente" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="guardarCliente">
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Cédula <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="formularioCliente.cedula"
                      :disabled="clienteEditando"
                      required
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Estado</label>
                    <select class="form-select" v-model="formularioCliente.estado">
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Nombre <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="formularioCliente.nombre"
                      required
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Apellido <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="formularioCliente.apellido"
                      required
                    >
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Teléfono</label>
                    <input 
                      type="tel" 
                      class="form-control" 
                      v-model="formularioCliente.telefono"
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input 
                      type="email" 
                      class="form-control" 
                      v-model="formularioCliente.email"
                    >
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Dirección</label>
                <textarea 
                  class="form-control" 
                  rows="3" 
                  v-model="formularioCliente.direccion"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="guardando">
                <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
                {{ clienteEditando ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Detalles del Cliente -->
    <div class="modal fade" id="modalDetalles" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detalles del Cliente</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="clienteSeleccionado">
            <div class="row">
              <div class="col-md-6">
                <h6>Información Personal</h6>
                <table class="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>Cédula:</strong></td>
                      <td><code>{{ clienteSeleccionado.cedula }}</code></td>
                    </tr>
                    <tr>
                      <td><strong>Nombre:</strong></td>
                      <td>{{ clienteSeleccionado.nombre }} {{ clienteSeleccionado.apellido }}</td>
                    </tr>
                    <tr>
                      <td><strong>Teléfono:</strong></td>
                      <td>{{ clienteSeleccionado.telefono || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td><strong>Email:</strong></td>
                      <td>{{ clienteSeleccionado.email || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td><strong>Estado:</strong></td>
                      <td>
                        <span class="badge" :class="clienteSeleccionado.estado === 'activo' ? 'bg-success' : 'bg-secondary'">
                          {{ clienteSeleccionado.estado }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="col-md-6">
                <h6>Información Adicional</h6>
                <table class="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>Dirección:</strong></td>
                      <td>{{ clienteSeleccionado.direccion || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td><strong>Fecha Registro:</strong></td>
                      <td>{{ new Date(clienteSeleccionado.fecha_registro).toLocaleString('es-VE') }}</td>
                    </tr>
                    <tr>
                      <td><strong>Total Pedidos:</strong></td>
                      <td>{{ historialCliente.length }}</td>
                    </tr>
                    <tr>
                      <td><strong>Total Gastado:</strong></td>
                      <td>${{ totalGastado.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Historial de Pedidos -->
            <div v-if="historialCliente.length > 0" class="mt-4">
              <h6>Últimos Pedidos</h6>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="pedido in historialCliente.slice(0, 5)" :key="pedido.id">
                      <td>{{ pedido.id }}</td>
                      <td>{{ new Date(pedido.fecha_pedido).toLocaleDateString('es-VE') }}</td>
                      <td>${{ pedido.total_usd?.toFixed(2) || '0.00' }}</td>
                      <td>
                        <span class="badge" :class="estadoClass(pedido.estado_entrega)">
                          {{ pedido.estado_entrega }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary" @click="verPedido(pedido.id)">
                          <i class="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Historial Completo -->
    <div class="modal fade" id="modalHistorial" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Historial de Pedidos - {{ clienteSeleccionado?.nombre }} {{ clienteSeleccionado?.apellido }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="cargandoHistorial" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
            </div>
            <div v-else-if="historialCliente.length === 0" class="text-center py-4">
              <i class="bi bi-cart-x display-1 text-muted"></i>
              <h4 class="text-muted">Sin pedidos</h4>
              <p class="text-muted">Este cliente aún no tiene pedidos registrados</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Total USD</th>
                    <th>Estado</th>
                    <th>Productos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pedido in historialCliente" :key="pedido.id">
                    <td><strong>{{ pedido.id }}</strong></td>
                    <td>{{ new Date(pedido.fecha_pedido).toLocaleString('es-VE') }}</td>
                    <td>${{ pedido.total_usd?.toFixed(2) || '0.00' }}</td>
                    <td>
                      <span class="badge" :class="estadoClass(pedido.estado_entrega)">
                        {{ pedido.estado_entrega }}
                      </span>
                    </td>
                    <td>{{ pedido.detalles_pedido?.[0]?.count || 0 }}</td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary" @click="verPedido(pedido.id)">
                        <i class="bi bi-eye"></i> Ver
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getClientes, 
  buscarClientesPorNombre, 
  crearCliente, 
  actualizarCliente, 
  desactivarCliente,
  getHistorialCliente 
} from '../services/clientService.js'
import Swal from 'sweetalert2'

export default {
  name: 'GestionClientes',
  setup() {
    const router = useRouter()
    
    // Estado reactivo
    const clientes = ref([])
    const clientesFiltrados = ref([])
    const cargando = ref(false)
    const guardando = ref(false)
    const cargandoHistorial = ref(false)
    
    // Filtros y búsqueda
    const terminoBusqueda = ref('')
    const filtroEstado = ref('')
    const ordenamiento = ref('fecha_desc')
    
    // Formulario
    const clienteEditando = ref(null)
    const formularioCliente = ref({
      cedula: '',
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      direccion: '',
      estado: 'activo'
    })
    
    // Detalles
    const clienteSeleccionado = ref(null)
    const historialCliente = ref([])

    // Computed
    const totalGastado = computed(() => {
      return historialCliente.value.reduce((total, pedido) => {
        return total + (pedido.total_usd || 0)
      }, 0)
    })

    // Métodos
    const cargarClientes = async () => {
      cargando.value = true
      try {
        clientes.value = await getClientes()
        aplicarFiltros()
      } catch (error) {
        console.error('Error al cargar clientes:', error)
      } finally {
        cargando.value = false
      }
    }

    const buscarClientes = async () => {
      if (!terminoBusqueda.value.trim()) {
        aplicarFiltros()
        return
      }

      cargando.value = true
      try {
        const resultados = await buscarClientesPorNombre(terminoBusqueda.value)
        clientesFiltrados.value = resultados
      } catch (error) {
        console.error('Error al buscar clientes:', error)
      } finally {
        cargando.value = false
      }
    }

    const aplicarFiltros = () => {
      let filtrados = [...clientes.value]

      // Filtrar por estado
      if (filtroEstado.value) {
        filtrados = filtrados.filter(c => c.estado === filtroEstado.value)
      }

      // Ordenar
      switch (ordenamiento.value) {
        case 'fecha_desc':
          filtrados.sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro))
          break
        case 'fecha_asc':
          filtrados.sort((a, b) => new Date(a.fecha_registro) - new Date(b.fecha_registro))
          break
        case 'nombre_asc':
          filtrados.sort((a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`))
          break
        case 'nombre_desc':
          filtrados.sort((a, b) => `${b.nombre} ${b.apellido}`.localeCompare(`${a.nombre} ${a.apellido}`))
          break
      }

      clientesFiltrados.value = filtrados
    }

    const mostrarFormularioNuevo = () => {
      clienteEditando.value = null
      formularioCliente.value = {
        cedula: '',
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        direccion: '',
        estado: 'activo'
      }
      
      const modal = new bootstrap.Modal(document.getElementById('modalCliente'))
      modal.show()
    }

    const editarCliente = (cliente) => {
      clienteEditando.value = cliente
      formularioCliente.value = { ...cliente }
      
      const modal = new bootstrap.Modal(document.getElementById('modalCliente'))
      modal.show()
    }

    const guardarCliente = async () => {
      guardando.value = true
      try {
        if (clienteEditando.value) {
          await actualizarCliente(clienteEditando.value.id, formularioCliente.value)
        } else {
          await crearCliente(formularioCliente.value)
        }
        
        await cargarClientes()
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCliente'))
        modal.hide()
      } catch (error) {
        console.error('Error al guardar cliente:', error)
      } finally {
        guardando.value = false
      }
    }

    const verDetalles = async (cliente) => {
      clienteSeleccionado.value = cliente
      
      cargandoHistorial.value = true
      try {
        historialCliente.value = await getHistorialCliente(cliente.id)
      } catch (error) {
        console.error('Error al cargar historial:', error)
        historialCliente.value = []
      } finally {
        cargandoHistorial.value = false
      }
      
      const modal = new bootstrap.Modal(document.getElementById('modalDetalles'))
      modal.show()
    }

    const verHistorial = async (cliente) => {
      clienteSeleccionado.value = cliente
      
      cargandoHistorial.value = true
      try {
        historialCliente.value = await getHistorialCliente(cliente.id)
      } catch (error) {
        console.error('Error al cargar historial:', error)
        historialCliente.value = []
      } finally {
        cargandoHistorial.value = false
      }
      
      const modal = new bootstrap.Modal(document.getElementById('modalHistorial'))
      modal.show()
    }

    const desactivarClienteConfirm = async (cliente) => {
      const result = await Swal.fire({
        title: '¿Desactivar cliente?',
        text: `¿Estás seguro de desactivar a ${cliente.nombre} ${cliente.apellido}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, desactivar',
        cancelButtonText: 'Cancelar'
      })

      if (result.isConfirmed) {
        try {
          await desactivarCliente(cliente.id)
          await cargarClientes()
        } catch (error) {
          console.error('Error al desactivar cliente:', error)
        }
      }
    }

    const activarCliente = async (cliente) => {
      try {
        await actualizarCliente(cliente.id, { estado: 'activo' })
        await cargarClientes()
      } catch (error) {
        console.error('Error al activar cliente:', error)
      }
    }

    const verPedido = (pedidoId) => {
      router.push({ name: 'EditarPedido', params: { id: pedidoId } })
    }

    const estadoClass = (estado) => {
      const classes = {
        'pendiente': 'bg-warning',
        'en_proceso': 'bg-info',
        'entregado': 'bg-success',
        'anulado': 'bg-danger',
        'activo': 'bg-success',
        'inactivo': 'bg-secondary'
      }
      return classes[estado] || 'bg-secondary'
    }

    // Lifecycle
    onMounted(() => {
      cargarClientes()
    })

    return {
      // Estado
      clientes,
      clientesFiltrados,
      cargando,
      guardando,
      cargandoHistorial,
      terminoBusqueda,
      filtroEstado,
      ordenamiento,
      clienteEditando,
      formularioCliente,
      clienteSeleccionado,
      historialCliente,
      
      // Computed
      totalGastado,
      
      // Métodos
      cargarClientes,
      buscarClientes,
      aplicarFiltros,
      mostrarFormularioNuevo,
      editarCliente,
      guardarCliente,
      verDetalles,
      verHistorial,
      desactivarCliente: desactivarClienteConfirm,
      activarCliente,
      verPedido,
      estadoClass
    }
  }
}
</script>

<style scoped>
.table-responsive {
  max-height: 600px;
  overflow-y: auto;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}

.modal-xl {
  max-width: 90%;
}

code {
  background-color: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}
</style>
