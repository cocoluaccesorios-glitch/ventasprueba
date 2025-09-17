<template>
  <div class="ultra-modern-sales">
    <!-- Header Rediseñado -->
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
        </div>
        
        <div class="header-actions">
          <button type="button" class="futuristic-btn add-btn" @click="nuevoCliente">
            <i class="bi bi-person-plus"></i>
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Layout Principal Centrado -->
    <div class="main-container">
      <!-- Contenedor Centrado -->
      <div class="centered-layout">
        <!-- Formulario Principal -->
        <div class="form-container">
          <form @submit.prevent="handleSubmit" class="sales-form">
            <!-- Sección Productos Rediseñada -->
            <div class="modern-products-section">
              <div class="section-header">
                <div class="header-icon" style="display: none;">
                  <i class="bi bi-boxes"></i>
                </div>
                <div class="header-content">
                  <h2>Añadir Productos</h2>
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
                             v-model.number="cantidadSeleccionada" min="1" max="999" step="1"
                             @input="forzarEnteroSeleccionado($event)"
                             @keydown="soloNumeros($event)"
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
                             placeholder="">
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
            
            <!-- Detalles del Pedido - TABLA LIMPIA -->
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
                               v-model.number="item.cantidad" min="1" step="1"
                               @change="validarCantidad(index)"
                               @input="forzarEntero($event, index)"
                               @keydown="soloNumeros($event)">
                      </td>
                      
                      <!-- Columna Precio Unitario -->
                      <td class="price-cell">
                        <input type="number" class="table-price-input" 
                               v-model.number="item.precio_unitario" step="0.01" min="0"
                               @change="validarPrecio(index)"
                               placeholder="">
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
            
            <div v-else class="empty-state">
              <div class="empty-icon">
                <i class="bi bi-box"></i>
              </div>
              <h4>Aún no has añadido productos</h4>
              <p>Selecciona productos del inventario o crea un producto manual para comenzar</p>
            </div>
          </div>
          
          <!-- Configuración de Pago y Entrega Rediseñada -->
          <div class="modern-payment-section">
            <div class="section-header">
              <div class="header-icon" style="display: none;">
                <i class="bi bi-credit-card"></i>
              </div>
              <div class="header-content">
                <h2>Configuración de Pago y Entrega</h2>
                <p>Define los detalles de pago y entrega</p>
              </div>
            </div>
            
            <div class="payment-form-container">
              <!-- Primera fila: Delivery, IVA/Factura, Descuento -->
              <div class="form-row">
                <!-- Delivery -->
                <div class="form-group">
                  <label class="modern-label">
                    <i class="bi bi-truck"></i>
                    ¿Quiere Delivery?
                  </label>
                  <div class="checkbox-container">
                    <div class="modern-checkbox">
                      <input type="checkbox" id="quiere-delivery" v-model="quiereDelivery">
                      <label for="quiere-delivery">
                        <div class="checkbox-custom">
                          <i class="bi bi-check"></i>
                        </div>
                        <span class="checkbox-label">
                          <i class="bi bi-truck"></i>
                          Aplicar Delivery
                        </span>
                      </label>
                    </div>
                  </div>
                  <!-- Campo de monto solo si está marcado -->
                  <div v-if="quiereDelivery" class="input-container" style="margin-top: 0.5rem;">
                    <div class="modern-input-group">
                      <i class="bi bi-currency-dollar input-icon"></i>
                      <input 
                        type="number" 
                        class="modern-input" 
                        v-model.number="venta.monto_delivery_usd" 
                        step="0.01"
                        min="0"
                        placeholder=""
                      >
                    </div>
                  </div>
                </div>
                
                <!-- IVA/Factura -->
                <div class="form-group">
                  <label class="modern-label">
                    <i class="bi bi-receipt"></i>
                    ¿Aplicar IVA?
                  </label>
                  <div class="checkbox-container">
                    <div class="modern-checkbox">
                      <input type="checkbox" id="aplicar-iva" v-model="venta.aplicar_iva">
                      <label for="aplicar-iva">
                        <div class="checkbox-custom">
                          <i class="bi bi-check"></i>
                        </div>
                        <span class="checkbox-label">
                          <i class="bi bi-receipt"></i>
                          Aplicar IVA (16%)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <!-- Descuento -->
                <div class="form-group">
                  <label class="modern-label">
                    <i class="bi bi-percent"></i>
                    Descuento
                  </label>
                  <div class="modern-input-group">
                    <i class="bi bi-percent input-icon"></i>
                    <input 
                      type="number" 
                      class="modern-input" 
                      v-model.number="venta.descuento_usd" 
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    >
                  </div>
                </div>
              </div>
              
              <!-- Segunda fila: Tipo de Pago -->
              <div class="form-row">
                <div class="form-group full-width">
                  <label class="modern-label">
                    <i class="bi bi-credit-card"></i>
                    Tipo de Pago
                  </label>
                  <div class="payment-type-selector">
                    <div class="payment-option" 
                         :class="{ active: venta.tipo_pago === 'Contado' }"
                         @click="venta.tipo_pago = 'Contado'">
                      <i class="bi bi-cash-stack"></i>
                      <span>Contado</span>
                    </div>
                    <div class="payment-option" 
                         :class="{ active: venta.tipo_pago === 'Abono' }"
                         @click="venta.tipo_pago = 'Abono'">
                      <i class="bi bi-credit-card"></i>
                      <span>Abono</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Tercera fila: Método de Pago -->
              <div class="form-row">
                <div class="form-group">
                  <label class="modern-label">
                    <i class="bi bi-wallet2"></i>
                    Método de Pago
                  </label>
                  <select class="modern-select" v-model="venta.metodo_pago">
                    <option value="">Seleccionar método</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Pago Móvil">Pago Móvil</option>
                    <option value="Zelle">Zelle</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Binance">Binance</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="modern-label">
                    <i class="bi bi-hash"></i>
                    Referencia
                  </label>
                  <div class="modern-input-group">
                    <i class="bi bi-hash input-icon"></i>
                    <input 
                      type="text" 
                      class="modern-input" 
                      v-model="venta.referencia_pago"
                      placeholder="Número de referencia"
                    >
                  </div>
                </div>
              </div>
              
              <!-- Cuarta fila: Tasa de Cambio -->
              <div class="form-row">
                <div class="form-group">
                  <label class="modern-label">
                    <i class="bi bi-arrow-left-right"></i>
                    Tasa de Cambio BCV
                  </label>
                  <div class="modern-input-group">
                    <i class="bi bi-currency-exchange input-icon"></i>
                    <input 
                      type="number" 
                      class="modern-input" 
                      v-model.number="venta.tasa_cambio_bcv" 
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    >
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="modern-label">
                    <i class="bi bi-clock"></i>
                    Entrega
                  </label>
                  <div class="checkbox-container">
                    <div class="modern-checkbox">
                      <input type="checkbox" id="entrega-inmediata" v-model="venta.entrega_inmediata">
                      <label for="entrega-inmediata">
                        <div class="checkbox-custom">
                          <i class="bi bi-check"></i>
                        </div>
                        <span class="checkbox-label">
                          <i class="bi bi-clock"></i>
                          Entrega Inmediata
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Botón de Envío -->
          <div class="submit-container">
            <button type="submit" class="modern-btn primary submit-btn" :disabled="isSubmitting || detallesPedido.length === 0">
              <div v-if="isSubmitting" class="spinner"></div>
              <i v-else class="bi bi-check-circle"></i>
              <span>{{ isSubmitting ? 'Procesando...' : 'Registrar Venta' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Modal para Producto Manual -->
    <div v-if="mostrarModalProductoManual" class="modal-overlay" @click="cerrarModalProductoManual">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>Producto Personalizado</h4>
          <button type="button" class="btn-close" @click="cerrarModalProductoManual">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Descripción del Producto/Servicio *</label>
            <textarea 
              class="form-control" 
              v-model="productoManual.descripcion"
              rows="3"
              placeholder="Ej: Servicio de envío especial, Producto único, etc."
              required
            ></textarea>
          </div>
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Cantidad *</label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model.number="productoManual.cantidad" 
                  min="1" 
                  step="1"
                  required
                >
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Precio Unitario (USD) *</label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model.number="productoManual.precio" 
                  step="0.01" 
                  min="0"
                  required
                >
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cerrarModalProductoManual">
            Cancelar
          </button>
          <button type="button" class="btn btn-primary" @click="agregarProductoManual" 
                  :disabled="!productoManual.descripcion || !productoManual.precio || !productoManual.cantidad">
            <i class="bi bi-plus-circle"></i>
            Añadir al Pedido
          </button>
        </div>
      </div>
    </div>
    
    <!-- Panel de Resumen -->
    <div class="summary-container">
      <div class="summary-section">
        <div class="summary-panel">
          <div class="summary-header">
            <div class="summary-icon">
              <i class="bi bi-calculator"></i>
            </div>
            <div class="summary-title">
              <h3>Resumen de la Venta</h3>
              <p>Total de productos: {{ detallesPedido.length }}</p>
            </div>
          </div>
          
          <div class="calculations-section">
            <div class="calculation-row">
              <span class="calculation-label">Subtotal:</span>
              <span class="calculation-value">${{ subtotal.toFixed(2) }}</span>
            </div>
            
            <div v-if="venta.descuento_usd > 0" class="calculation-row discount">
              <span class="calculation-label">Descuento:</span>
              <span class="calculation-value">-${{ venta.descuento_usd.toFixed(2) }}</span>
            </div>
            
            <div v-if="venta.monto_delivery_usd > 0" class="calculation-row delivery">
              <span class="calculation-label">Delivery:</span>
              <span class="calculation-value">${{ venta.monto_delivery_usd.toFixed(2) }}</span>
            </div>
            
            <div v-if="venta.aplicar_iva" class="calculation-row iva">
              <span class="calculation-label">IVA (16%):</span>
              <span class="calculation-value">${{ ivaCalculado.toFixed(2) }}</span>
            </div>
            
            <div class="calculation-row total">
              <span class="calculation-label">Total USD:</span>
              <span class="calculation-value">${{ totalVES.toFixed(2) }}</span>
            </div>
            
            <div v-if="venta.tasa_cambio_bcv > 0" class="calculation-row total-ves">
              <span class="calculation-label">Total VES:</span>
              <span class="calculation-value">Bs. {{ (totalVES * venta.tasa_cambio_bcv).toFixed(2) }}</span>
            </div>
          </div>
          
          <div class="payment-info-section">
            <div class="payment-info-item">
              <span class="info-label">Tipo de Pago:</span>
              <span class="info-value">{{ venta.tipo_pago }}</span>
            </div>
            <div class="payment-info-item">
              <span class="info-label">Método:</span>
              <span class="info-value">{{ venta.metodo_pago || 'No especificado' }}</span>
            </div>
            <div class="payment-info-item">
              <span class="info-label">Entrega:</span>
              <span class="info-value">{{ venta.entrega_inmediata ? 'Inmediata' : 'Programada' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { getProducts, createSale, getTasaCambio } from '../services/apiService.js';
import { buscarClientePorCedula, buscarClientesPorNombre, crearCliente } from '../services/clientService.js';
import ProductSearch from '../components/ProductSearch.vue';
import ClientSearch from '../components/ClientSearch.vue';
import { useNotifier } from '../composables/useNotifier.js';
import Swal from 'sweetalert2';

// ... resto del script ...
</script>

<style scoped>
/* ... estilos ... */
</style>
