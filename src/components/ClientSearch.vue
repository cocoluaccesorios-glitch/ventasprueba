<template>
  <div class="position-relative">
    <!-- Input de búsqueda -->
    <div class="input-group">
      <input
        ref="searchInput"
        type="text"
        class="form-control"
        :class="{ 'is-invalid': hasError }"
        v-model="searchQuery"
        @input="onSearch"
        @focus="showDropdown = true"
        @blur="onBlur"
        @keydown="onKeydown"
        :placeholder="placeholder"
        autocomplete="off"
      />
      <button 
        v-if="searchQuery && !selectedClient"
        class="btn btn-outline-secondary" 
        type="button"
        @click="clearSearch"
        title="Limpiar"
      >
        <i class="bi bi-x"></i>
      </button>
    </div>
    
    <!-- Dropdown de resultados -->
    <div 
      v-if="showDropdown && filteredClients.length > 0" 
      class="dropdown-menu show w-100 position-absolute"
      style="top: 100%; z-index: 1000; max-height: 300px; overflow-y: auto;"
    >
      <div
        v-for="(client, index) in filteredClients"
        :key="client.id"
        class="dropdown-item"
        :class="{ 'active': index === selectedIndex }"
        @mousedown="selectClient(client)"
        @mouseenter="selectedIndex = index"
      >
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong>{{ client.nombre }} {{ client.apellido }}</strong>
            <br>
            <small class="text-muted">{{ client.cedula_rif }}</small>
          </div>
          <div class="text-end">
            <div v-if="client.telefono" class="text-primary small">
              <i class="bi bi-telephone"></i> {{ client.telefono }}
            </div>
            <div v-if="client.email" class="text-info small">
              <i class="bi bi-envelope"></i> {{ client.email }}
            </div>
          </div>
        </div>
        <div v-if="client.direccion" class="text-muted small mt-1">
          <i class="bi bi-geo-alt"></i> {{ client.direccion }}
        </div>
      </div>
      
      <!-- Mensaje cuando no hay resultados -->
      <div v-if="searchQuery && filteredClients.length === 0" class="dropdown-item text-muted">
        <i class="bi bi-search me-2"></i>
        No se encontraron clientes
      </div>
      
      <!-- Opción para crear nuevo cliente -->
      <div class="dropdown-divider"></div>
      <div 
        class="dropdown-item text-primary"
        @mousedown="createNewClient"
      >
        <i class="bi bi-plus-circle me-2"></i>
        Crear nuevo cliente
      </div>
    </div>
    
    <!-- Cliente seleccionado -->
    <div v-if="selectedClient" class="mt-2 p-2 bg-light rounded border">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <strong>{{ selectedClient.nombre }} {{ selectedClient.apellido }}</strong>
          <br>
          <small class="text-muted">{{ selectedClient.cedula_rif }}</small>
          <div v-if="selectedClient.telefono" class="text-primary small">
            <i class="bi bi-telephone"></i> {{ selectedClient.telefono }}
          </div>
        </div>
        <button 
          class="btn btn-sm btn-outline-danger" 
          @click="clearSelection"
          title="Quitar selección"
        >
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  clients: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Buscar cliente por cédula, nombre o apellido...'
  },
  hasError: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'clear', 'create-new'])

const searchInput = ref(null)
const searchQuery = ref('')
const showDropdown = ref(false)
const selectedIndex = ref(-1)
const selectedClient = ref(null)

// Filtrar clientes basado en la búsqueda
const filteredClients = computed(() => {
  if (!searchQuery.value.trim()) return []
  
  const query = searchQuery.value.toLowerCase()
  return props.clients.filter(client => 
    client.nombre.toLowerCase().includes(query) ||
    client.apellido.toLowerCase().includes(query) ||
    client.cedula_rif.toLowerCase().includes(query) ||
    (client.telefono && client.telefono.includes(query)) ||
    (client.email && client.email.toLowerCase().includes(query))
  ).slice(0, 8) // Limitar a 8 resultados
})

// Manejar búsqueda
const onSearch = () => {
  showDropdown.value = true
  selectedIndex.value = -1
}

// Manejar blur del input
const onBlur = () => {
  // Delay para permitir que el click en dropdown funcione
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

// Manejar teclado
const onKeydown = (event) => {
  if (!showDropdown.value) return
  
  const totalItems = filteredClients.value.length + 1 // +1 para "Crear nuevo cliente"
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, totalItems - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0 && selectedIndex.value < filteredClients.value.length) {
        selectClient(filteredClients.value[selectedIndex.value])
      } else if (selectedIndex.value === filteredClients.value.length) {
        createNewClient()
      }
      break
    case 'Escape':
      showDropdown.value = false
      selectedIndex.value = -1
      break
  }
}

// Seleccionar cliente
const selectClient = (client) => {
  selectedClient.value = client
  searchQuery.value = `${client.nombre} ${client.apellido}`
  showDropdown.value = false
  selectedIndex.value = -1
  emit('select', client)
}

// Crear nuevo cliente
const createNewClient = () => {
  showDropdown.value = false
  selectedIndex.value = -1
  emit('create-new')
}

// Limpiar búsqueda
const clearSearch = () => {
  searchQuery.value = ''
  showDropdown.value = false
  selectedIndex.value = -1
}

// Limpiar selección
const clearSelection = () => {
  selectedClient.value = null
  searchQuery.value = ''
  showDropdown.value = false
  selectedIndex.value = -1
  emit('clear')
}

// Exponer métodos para uso externo
defineExpose({
  clearSelection,
  focus: () => searchInput.value?.focus(),
  setClient: (client) => {
    selectedClient.value = client
    searchQuery.value = `${client.nombre} ${client.apellido}`
  }
})
</script>

<style scoped>
.dropdown-item {
  cursor: pointer;
  padding: 0.75rem 1rem;
}

.dropdown-item:hover,
.dropdown-item.active {
  background-color: var(--bs-primary);
  color: white;
}

.dropdown-item.active {
  background-color: var(--bs-primary);
}

.form-control:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.dropdown-divider {
  margin: 0.5rem 0;
}
</style>