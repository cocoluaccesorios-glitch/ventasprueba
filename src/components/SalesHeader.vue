<template>
  <div class="futuristic-header">
    <div class="header-bg-animation"></div>
    <div class="header-content">
      <div class="brand-section">
        <div class="brand-icon">
          <i class="bi bi-lightning-charge-fill"></i>
        </div>
        <div class="brand-text">
          <h1 class="brand-title">Nueva Venta</h1>
          <p class="brand-subtitle">Sistema de Ventas Cocolú</p>
        </div>
      </div>
      
      <!-- Sección de Búsqueda de Cliente Integrada -->
      <div class="client-search-section">
        <div class="client-search-container">
          <div class="client-search-field">
            <label class="search-label">{{ clienteSeleccionado ? 'Cliente Seleccionado' : 'Buscar Cliente' }}</label>
            <div class="search-input-wrapper">
              <!-- Estado de búsqueda -->
              <div v-if="!clienteSeleccionado" class="search-state">
                <i class="bi bi-search search-icon"></i>
                <input 
                  type="text" 
                  class="client-search-input" 
                  v-model="clienteSearchQuery"
                  @input="buscarClientesEnTiempoReal"
                  @focus="mostrarResultados = true"
                  @blur="ocultarResultados"
                  placeholder="Escribe nombre, cédula o teléfono..."
                  ref="clientSearchInput"
                >
                <button 
                  v-if="clienteSearchQuery" 
                  type="button" 
                  class="clear-search-btn"
                  @click="limpiarBusquedaCliente"
                >
                  <i class="bi bi-x"></i>
                </button>
              </div>
              
              <!-- Estado de cliente seleccionado -->
              <div v-else class="selected-client-state">
                <div class="selected-client-info">
                  <i class="bi bi-person-check-fill client-icon"></i>
                  <div class="client-details">
                    <div class="client-name">{{ clienteSeleccionado.nombre }} {{ clienteSeleccionado.apellido }}</div>
                    <div class="client-cedula">{{ clienteSeleccionado.cedula_rif }}</div>
                  </div>
                </div>
                <button 
                  type="button" 
                  class="remove-client-btn"
                  @click="quitarClienteSeleccionado"
                  title="Quitar cliente"
                >
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
            
            <!-- Lista desplegable de resultados -->
            <div v-if="mostrarResultados && resultadosBusqueda.length > 0" class="search-results-dropdown">
              <div 
                v-for="cliente in resultadosBusqueda" 
                :key="cliente.id"
                class="search-result-item"
                @click="seleccionarCliente(cliente)"
              >
                <div class="result-info">
                  <div class="result-name">{{ cliente.nombre }} {{ cliente.apellido }}</div>
                  <div class="result-details">
                    <span class="result-cedula">{{ cliente.cedula_rif }}</span>
                    <span v-if="cliente.telefono" class="result-phone">{{ cliente.telefono }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Mensaje cuando no hay resultados -->
            <div v-if="mostrarResultados && clienteSearchQuery && resultadosBusqueda.length === 0" class="no-results">
              <div class="no-results-content">
                <i class="bi bi-person-x"></i>
                <span>No se encontraron clientes</span>
                <button type="button" class="btn btn-sm btn-outline-primary" @click="nuevoCliente">
                  Crear Nuevo Cliente
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button type="button" class="futuristic-btn add-btn" @click="nuevoCliente">
            <i class="bi bi-person-plus"></i>
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useClientesService } from '@/services/clientService'
import { useNotifier } from '@/composables/useNotifier'

// Props
const props = defineProps({
  clienteSeleccionado: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits([
  'cliente-seleccionado',
  'cliente-removido',
  'nuevo-cliente'
])

// Composables
const { buscarClientes } = useClientesService()
const { showSuccess } = useNotifier()

// Variables reactivas
const clienteSearchQuery = ref('')
const resultadosBusqueda = ref([])
const mostrarResultados = ref(false)
const clientSearchInput = ref(null)

// Computed
const clienteSeleccionado = computed(() => props.clienteSeleccionado)

// Funciones
async function buscarClientesEnTiempoReal() {
  if (clienteSearchQuery.value.length < 2) {
    resultadosBusqueda.value = []
    return
  }
  
  try {
    const resultados = await buscarClientes(clienteSearchQuery.value)
    resultadosBusqueda.value = resultados
  } catch (error) {
    console.error('Error buscando clientes:', error)
    resultadosBusqueda.value = []
  }
}

function seleccionarCliente(cliente) {
  emit('cliente-seleccionado', cliente)
  clienteSearchQuery.value = ''
  resultadosBusqueda.value = []
  mostrarResultados.value = false
}

function quitarClienteSeleccionado() {
  emit('cliente-removido')
  showSuccess('Cliente Removido', 'El cliente ha sido removido de la venta')
}

function limpiarBusquedaCliente() {
  clienteSearchQuery.value = ''
  resultadosBusqueda.value = []
  mostrarResultados.value = false
}

function ocultarResultados() {
  setTimeout(() => {
    mostrarResultados.value = false
  }, 200)
}

function nuevoCliente() {
  emit('nuevo-cliente')
}

// Event listeners
function handleClickOutside(event) {
  if (clientSearchInput.value && !clientSearchInput.value.contains(event.target)) {
    mostrarResultados.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* ===== HEADER FUTURISTA ===== */
.futuristic-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-bg-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.header-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  align-items: center;
}

/* Brand Section */
.brand-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.brand-icon i {
  font-size: 1.8rem;
  color: white;
}

.brand-text {
  color: white;
}

.brand-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.brand-subtitle {
  font-size: 0.9rem;
  margin: 0.25rem 0 0 0;
  opacity: 0.9;
  font-weight: 300;
}

/* Client Search Section */
.client-search-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.client-search-container {
  flex: 1;
}

.client-search-field {
  position: relative;
}

.search-label {
  display: block;
  color: white;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.search-input-wrapper {
  position: relative;
}

.search-state {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  z-index: 2;
  pointer-events: none;
}

.client-search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 3rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.client-search-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.client-search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.clear-search-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 3;
}

.clear-search-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

/* Selected Client State */
.selected-client-state {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(40, 167, 69, 0.2);
  border: 2px solid rgba(40, 167, 69, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.selected-client-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.client-icon {
  color: #28a745;
  font-size: 1.2rem;
}

.client-details {
  color: white;
}

.client-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.client-cedula {
  font-size: 0.8rem;
  opacity: 0.8;
}

.remove-client-btn {
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #dc3545;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-client-btn:hover {
  background: rgba(220, 53, 69, 0.3);
  color: white;
}

/* Search Results Dropdown */
.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.search-result-item {
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f8f9fa;
}

.search-result-item:hover {
  background-color: #f8f9fa;
}

.search-result-item:last-child {
  border-bottom: none;
}

.result-info {
  color: #2c3e50;
}

.result-name {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.result-details {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #6c757d;
}

.result-cedula {
  font-weight: 500;
}

/* No Results */
.no-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 0.5rem;
  padding: 1.5rem;
  text-align: center;
}

.no-results-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #6c757d;
}

.no-results-content i {
  font-size: 2rem;
  color: #dee2e6;
}

/* Header Actions */
.header-actions {
  display: flex;
  gap: 1rem;
}

.futuristic-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.futuristic-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.futuristic-btn i {
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    grid-template-columns: 1fr;
    gap: 1rem;
    text-align: center;
  }
  
  .brand-title {
    font-size: 1.5rem;
  }
  
  .client-search-section {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    justify-content: center;
  }
}
</style>
