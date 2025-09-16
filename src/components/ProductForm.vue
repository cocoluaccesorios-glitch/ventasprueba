<template>
  <div class="modern-products-section">
    <div class="section-header">
      <div class="header-icon">
        <i class="bi bi-boxes"></i>
      </div>
      <div class="header-text">
        <h3>Añadir Productos</h3>
        <p>Selecciona productos para la venta</p>
      </div>
    </div>
    
    <div class="products-form-container">
      <!-- Buscador de Producto - FILA COMPLETA -->
      <div class="form-group product-search-group full-width">
        <label class="modern-label">
          <i class="bi bi-search"></i>
          Buscar Producto
        </label>
        <div class="search-container">
          <ProductSearch
            :products="productos"
            placeholder="Buscar producto por nombre, SKU o categoría..."
            @select="onProductSelected"
            @clear="onProductCleared"
            ref="productSearchRef"
          />
        </div>
      </div>
      
      <!-- Segunda fila: Cantidad, Precio y Botones -->
      <div class="form-row-second">
        <!-- Cantidad -->
        <div class="form-group quantity-group">
          <label class="modern-label">
            <i class="bi bi-hash"></i>
            Cantidad
          </label>
          <div class="simple-input-container">
            <input type="number" class="simple-input" 
                   v-model.number="cantidadSeleccionada" min="1" max="999"
                   placeholder="1">
          </div>
        </div>
        
        <!-- Precio Unitario -->
        <div class="form-group price-group">
          <label class="modern-label">
            <i class="bi bi-currency-dollar"></i>
            Precio Unit.
          </label>
          <div class="price-container readonly">
            <span class="currency-symbol">$</span>
            <input type="number" class="price-input readonly-input" 
                   v-model.number="precioSeleccionado" step="0.01" min="0"
                   readonly
                   placeholder="0.00">
          </div>
        </div>
        
        <!-- Botones de Acción - APILADOS -->
        <div class="form-group actions-group">
          <label class="modern-label">&nbsp;</label>
          <div class="action-buttons-stacked">
            <button type="button" class="btn-primary add-btn compact" @click="agregarProducto" 
                    :disabled="!productoSeleccionado || cantidadSeleccionada < 1">
              <i class="bi bi-plus-circle"></i>
              <span>Añadir</span>
            </button>
            <button type="button" class="btn-secondary manual-btn compact" @click="abrirModalProductoManual">
              <i class="bi bi-pencil-square"></i>
              <span>Manual</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ProductSearch from './ProductSearch.vue'

// Props
const props = defineProps({
  productos: {
    type: Array,
    default: () => []
  },
  productoSeleccionado: {
    type: Object,
    default: null
  },
  cantidadSeleccionada: {
    type: Number,
    default: 1
  },
  precioSeleccionado: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits([
  'producto-seleccionado',
  'producto-limpiado',
  'cantidad-cambiada',
  'precio-cambiado',
  'agregar-producto',
  'abrir-modal-manual'
])

// Variables reactivas
const productSearchRef = ref(null)

// Computed
const cantidadSeleccionada = computed({
  get: () => props.cantidadSeleccionada,
  set: (value) => emit('cantidad-cambiada', value)
})

const precioSeleccionado = computed({
  get: () => props.precioSeleccionado,
  set: (value) => emit('precio-cambiado', value)
})

// Funciones
function onProductSelected(producto) {
  emit('producto-seleccionado', producto)
}

function onProductCleared() {
  emit('producto-limpiado')
}

function agregarProducto() {
  emit('agregar-producto')
}

function abrirModalProductoManual() {
  emit('abrir-modal-manual')
}

// Expose methods for parent component
defineExpose({
  focusSearch: () => productSearchRef.value?.focus(),
  clearSearch: () => productSearchRef.value?.clear()
})
</script>

<style scoped>
/* ===== SECCIÓN DE PRODUCTOS MODERNA ===== */
.modern-products-section {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(10px);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.header-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.header-icon i {
  font-size: 1.5rem;
  color: white;
}

.header-text h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.header-text p {
  margin: 0.25rem 0 0 0;
  color: #6c757d;
  font-size: 0.9rem;
}

/* Formulario de Productos */
.products-form-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-row-second {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  align-items: end;
  margin-top: 1rem;
}

/* Labels modernos */
.modern-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.modern-label i {
  color: #667eea;
  font-size: 0.9rem;
}

/* Contenedor de búsqueda */
.search-container {
  position: relative;
}

/* Inputs simples */
.simple-input-container {
  position: relative;
}

.simple-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  transition: all 0.2s ease;
}

.simple-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Contenedor de precio */
.price-container {
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.price-container.readonly {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.currency-symbol {
  padding: 0.75rem 0.5rem;
  background: #28a745;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.price-input {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  font-weight: 500;
}

.readonly-input {
  background: #f8f9fa;
  color: #6c757d;
}

.price-input:focus {
  outline: none;
}

/* Botones de acción */
.action-buttons-stacked {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-buttons-stacked .btn {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
}

.action-buttons-stacked .btn.compact {
  min-height: 36px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .form-row-second {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .action-buttons-stacked {
    flex-direction: row;
  }
  
  .modern-products-section {
    padding: 1.5rem;
  }
}
</style>
