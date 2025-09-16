<template>
  <div class="product-search-wrapper">
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
        v-if="searchQuery && !selectedProduct"
        class="btn btn-outline-secondary" 
        type="button"
        @click="clearSearch"
        title="Limpiar"
      >
        <i class="bi bi-x"></i>
      </button>
    </div>
    
    <!-- Dropdown de resultados - TELEPORT AL BODY -->
    <Teleport to="body">
      <div 
        v-if="showDropdown && filteredProducts.length > 0" 
        class="product-search-dropdown-overlay"
        :style="dropdownStyle"
      >
        <div
          v-for="(product, index) in filteredProducts"
          :key="product.id"
          class="dropdown-item"
          :class="{ 'active': index === selectedIndex }"
          @mousedown="selectProduct(product)"
          @mouseenter="selectedIndex = index"
        >
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>{{ product.nombre }}</strong>
              <span v-if="product.sku" class="text-muted ms-2">({{ product.sku }})</span>
            </div>
            <div class="text-end">
              <div class="text-success fw-bold">${{ product.precio_usd.toFixed(2) }}</div>
              <small class="text-muted">Stock: {{ product.stock_actual }}</small>
            </div>
          </div>
          <div v-if="product.categorias_producto" class="text-muted small">
            {{ product.categorias_producto.nombre }}
          </div>
        </div>
        
        <!-- Mensaje cuando no hay resultados -->
        <div v-if="searchQuery && filteredProducts.length === 0" class="dropdown-item text-muted">
          <i class="bi bi-search me-2"></i>
          No se encontraron productos
        </div>
      </div>
    </Teleport>
    
    <!-- Producto seleccionado -->
    <div v-if="selectedProduct" class="mt-2 p-2 bg-light rounded border">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <strong>{{ selectedProduct.nombre }}</strong>
          <span v-if="selectedProduct.sku" class="text-muted ms-2">({{ selectedProduct.sku }})</span>
          <br>
          <small class="text-muted">${{ selectedProduct.precio_usd.toFixed(2) }} - Stock: {{ selectedProduct.stock_actual }}</small>
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
  products: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Buscar producto...'
  },
  hasError: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'clear'])

const searchInput = ref(null)
const searchQuery = ref('')
const showDropdown = ref(false)
const selectedIndex = ref(-1)
const selectedProduct = ref(null)
const dropdownPosition = ref({ top: 0, left: 0, width: 0 })

// Calcular posición del dropdown
const dropdownStyle = computed(() => {
  if (!searchInput.value) return {}
  
  const rect = searchInput.value.getBoundingClientRect()
  return {
    position: 'fixed',
    top: `${rect.bottom + window.scrollY + 2}px`,
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`,
    zIndex: 9999
  }
})

// Filtrar productos basado en la búsqueda
const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) return []
  
  const query = searchQuery.value.toLowerCase()
  return props.products.filter(product => 
    product.nombre.toLowerCase().includes(query) ||
    (product.sku && product.sku.toLowerCase().includes(query)) ||
    (product.categorias_producto && product.categorias_producto.nombre.toLowerCase().includes(query))
  ).slice(0, 10) // Limitar a 10 resultados
})

// Manejar búsqueda
const onSearch = () => {
  showDropdown.value = true
  selectedIndex.value = -1
  // Actualizar posición cuando aparece el dropdown
  nextTick(() => {
    updateDropdownPosition()
  })
}

// Actualizar posición del dropdown
const updateDropdownPosition = () => {
  if (!searchInput.value || !showDropdown.value) return
  
  const rect = searchInput.value.getBoundingClientRect()
  dropdownPosition.value = {
    top: rect.bottom + window.scrollY + 2,
    left: rect.left + window.scrollX,
    width: rect.width
  }
}

// Listener para scroll y resize
const handleScrollResize = () => {
  if (showDropdown.value) {
    updateDropdownPosition()
  }
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
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredProducts.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0 && filteredProducts.value[selectedIndex.value]) {
        selectProduct(filteredProducts.value[selectedIndex.value])
      }
      break
    case 'Escape':
      showDropdown.value = false
      selectedIndex.value = -1
      break
  }
}

// Seleccionar producto
const selectProduct = (product) => {
  selectedProduct.value = product
  searchQuery.value = product.nombre
  showDropdown.value = false
  selectedIndex.value = -1
  emit('select', product)
}

// Limpiar búsqueda
const clearSearch = () => {
  searchQuery.value = ''
  showDropdown.value = false
  selectedIndex.value = -1
}

// Limpiar selección
const clearSelection = () => {
  selectedProduct.value = null
  searchQuery.value = ''
  showDropdown.value = false
  selectedIndex.value = -1
  emit('clear')
}

// Exponer métodos para uso externo
defineExpose({
  clearSelection,
  focus: () => searchInput.value?.focus()
})

// Lifecycle hooks
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  window.addEventListener('scroll', handleScrollResize)
  window.addEventListener('resize', handleScrollResize)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScrollResize)
  window.removeEventListener('resize', handleScrollResize)
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

/* ===== CONTEXTO DE POSICIONAMIENTO ===== */
.product-search-wrapper {
  position: relative;
  width: 100%;
}

/* ===== OVERLAY DE DROPDOWN - TELEPORT AL BODY ===== */
.product-search-dropdown-overlay {
  /* POSICIONAMIENTO FIJO - COMPLETAMENTE FUERA DEL FLUJO */
  position: fixed;
  
  /* VISIBILIDAD Y CAPAS - MÁXIMA PRIORIDAD */
  z-index: 9999;
  
  /* DIMENSIONES Y ESPACIADO */
  max-height: 300px;
  
  /* APARIENCIA VISUAL */
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  
  /* SCROLL Y OVERFLOW */
  overflow-y: auto;
  
  /* ANIMACIÓN SUAVE */
  animation: dropdownFadeIn 0.15s ease-out;
  
  /* ASEGURAR QUE NO AFECTE EL LAYOUT */
  pointer-events: auto;
  will-change: transform, opacity;
}

/* ===== ANIMACIÓN DE ENTRADA ===== */
@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== ELEMENTOS DEL DROPDOWN ===== */
.product-search-dropdown-overlay .dropdown-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f8f9fa;
  cursor: pointer;
  transition: all 0.15s ease;
}

.product-search-dropdown-overlay .dropdown-item:last-child {
  border-bottom: none;
}

.product-search-dropdown-overlay .dropdown-item:hover,
.product-search-dropdown-overlay .dropdown-item.active {
  background-color: #007bff;
  color: white;
}

.product-search-dropdown-overlay .dropdown-item:hover .text-muted,
.product-search-dropdown-overlay .dropdown-item.active .text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
}

.product-search-dropdown-overlay .dropdown-item:hover .text-success,
.product-search-dropdown-overlay .dropdown-item.active .text-success {
  color: #90ee90 !important;
}
</style>
