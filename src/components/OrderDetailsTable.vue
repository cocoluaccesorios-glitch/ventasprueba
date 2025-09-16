<template>
  <div v-if="detallesPedido.length > 0" class="modern-order-details">
    <div class="details-header">
      <h3>
        <i class="bi bi-list-ul"></i>
        Detalles del Pedido
      </h3>
      <span class="items-count">{{ detallesPedido.length }} producto{{ detallesPedido.length !== 1 ? 's' : '' }}</span>
    </div>
    
    <!-- Tabla de Productos -->
    <div class="order-table-container">
      <table class="order-table">
        <thead>
          <tr>
            <th class="product-col">Producto</th>
            <th class="quantity-col">Cantidad</th>
            <th class="price-col">Precio Unit.</th>
            <th class="subtotal-col">Subtotal</th>
            <th class="actions-col">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in detallesPedido" :key="item.id" class="order-row">
            <!-- Columna Producto -->
            <td class="product-cell">
              <div class="product-info">
                <div class="product-name">{{ item.nombre }}</div>
                <div v-if="item.sku && item.sku !== 'MANUAL'" class="product-sku">
                  SKU: {{ item.sku }}
                </div>
              </div>
            </td>
            
            <!-- Columna Cantidad -->
            <td class="quantity-cell">
              <input type="number" class="table-qty-input" 
                     v-model.number="item.cantidad" min="1" 
                     @change="validarCantidad(index)">
            </td>
            
            <!-- Columna Precio Unitario -->
            <td class="price-cell">
              <div class="price-input-group">
                <span class="currency-symbol">$</span>
                <input type="number" class="table-price-input" 
                       v-model.number="item.precio_unitario" step="0.01" min="0"
                       @change="validarPrecio(index)">
              </div>
            </td>
            
            <!-- Columna Subtotal -->
            <td class="subtotal-cell">
              <div class="subtotal-amount">
                ${{ (item.cantidad * item.precio_unitario).toFixed(2) }}
              </div>
            </td>
            
            <!-- Columna Acciones -->
            <td class="actions-cell">
              <button type="button" class="remove-btn" 
                      @click="eliminarProducto(index)" 
                      title="Eliminar producto">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  
  <!-- Estado vacío -->
  <div v-else class="empty-state">
    <div class="empty-icon">
      <i class="bi bi-box"></i>
    </div>
    <h4>Aún no has añadido productos</h4>
    <p>Selecciona productos del inventario o crea un producto manual para comenzar</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  detallesPedido: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'cantidad-cambiada',
  'precio-cambiado',
  'producto-eliminado'
])

// Computed
const detallesPedido = computed(() => props.detallesPedido)

// Funciones
function validarCantidad(index) {
  const item = detallesPedido.value[index]
  if (item.cantidad < 1) {
    item.cantidad = 1
  }
  emit('cantidad-cambiada', { index, cantidad: item.cantidad })
}

function validarPrecio(index) {
  const item = detallesPedido.value[index]
  if (item.precio_unitario < 0) {
    item.precio_unitario = 0
  }
  emit('precio-cambiado', { index, precio: item.precio_unitario })
}

function eliminarProducto(index) {
  emit('producto-eliminado', index)
}
</script>

<style scoped>
/* ===== DETALLES DEL PEDIDO MODERNOS ===== */
.modern-order-details {
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(25, 135, 84, 0.1) 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(40, 167, 69, 0.2);
  backdrop-filter: blur(10px);
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.details-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.details-header h3 i {
  color: #28a745;
}

.items-count {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid rgba(40, 167, 69, 0.2);
}

/* ===== TABLA DE DETALLES DEL PEDIDO ===== */
.order-table-container {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.order-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.order-table th {
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.order-table tbody tr {
  border-bottom: 1px solid #f8f9fa;
  transition: background-color 0.2s ease;
}

.order-table tbody tr:hover {
  background-color: #f8f9fa;
}

.order-table tbody tr:last-child {
  border-bottom: none;
}

.order-table td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
}

/* Columnas específicas */
.product-col {
  width: 40%;
}

.quantity-col {
  width: 15%;
  text-align: center;
}

.price-col {
  width: 20%;
  text-align: right;
}

.subtotal-col {
  width: 15%;
  text-align: right;
}

.actions-col {
  width: 10%;
  text-align: center;
}

/* Celdas específicas */
.product-cell {
  width: 40%;
}

.quantity-cell {
  width: 15%;
  text-align: center;
}

.price-cell {
  width: 20%;
  text-align: right;
}

.subtotal-cell {
  width: 15%;
  text-align: right;
}

.actions-cell {
  width: 10%;
  text-align: center;
}

/* Información del producto */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.product-sku {
  font-size: 0.75rem;
  color: #6c757d;
  font-style: italic;
}

/* Inputs de la tabla */
.table-qty-input,
.table-price-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.85rem;
  text-align: center;
  background: white;
  transition: border-color 0.2s ease;
}

.table-qty-input:focus,
.table-price-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.table-price-input {
  text-align: right;
}

/* Grupo de precio */
.price-input-group {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
}

.price-input-group .currency-symbol {
  padding: 0.5rem 0.25rem;
  background: #28a745;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
}

.price-input-group .table-price-input {
  border: none;
  border-radius: 0;
}

/* Subtotal */
.subtotal-amount {
  font-weight: 600;
  color: #28a745;
  font-size: 0.9rem;
}

/* Botón de eliminar */
.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
}

.remove-btn i {
  font-size: 0.9rem;
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6c757d;
}

.empty-icon {
  margin-bottom: 1rem;
}

.empty-icon i {
  font-size: 3rem;
  color: #dee2e6;
}

.empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1.25rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

/* Ocultar spinners de inputs numéricos */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}

input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* Responsive */
@media (max-width: 768px) {
  .order-table-container {
    overflow-x: auto;
  }
  
  .order-table {
    min-width: 600px;
  }
  
  .modern-order-details {
    padding: 1.5rem;
  }
  
  .details-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
