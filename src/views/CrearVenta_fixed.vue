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
import { ref, onMounted, computed, watch } from 'vue';
import { getProducts, createSale, getTasaCambio } from '../services/apiService.js';
import { buscarClientePorCedula, buscarClientesPorNombre, crearCliente } from '../services/clientService.js';
import ProductSearch from '../components/ProductSearch.vue';
import ClientSearch from '../components/ClientSearch.vue';
import { useNotifier } from '../composables/useNotifier.js';
import Swal from 'sweetalert2';

// Usar el composable de notificaciones
const { showSuccess, showError, showWarning, confirmDelete } = useNotifier();

const productos = ref([]);
const clientes = ref([]);
const productoSeleccionado = ref(null);
const cantidadSeleccionada = ref(1);
const precioSeleccionado = ref(0);
const detallesPedido = ref([]);

// Variables para autocompletado de cliente
const clienteSearchQuery = ref('');
const resultadosBusqueda = ref([]);
const mostrarResultados = ref(false);
const clientSearchInput = ref(null);

// Variable para controlar si el precio es editable
const precioEditable = ref(true);

// Variables para modal de producto manual - Actualizado
const mostrarModalProductoManual = ref(false);
const productoManual = ref({
  descripcion: '',
  precio: 0,
  cantidad: 1
});
const isSubmitting = ref(false);
const productSearchRef = ref(null);
const clientSearchRef = ref(null);

// Variables para cálculos
const descuentoPorcentaje = ref(true); // Por defecto porcentaje
const quiereDelivery = ref(false);
const quiereDescuento = ref(false);

// Función para generar el estado inicial del formulario
const getInitialVentaState = () => ({
  cliente_cedula: '',
  cliente_nombre: '',
  cliente_apellido: '',
  cliente_telefono: '',
  cliente_email: '',
  cliente_direccion: '',
  tipo_pago: '',
  metodo_pago_usd: '',
  metodo_pago_ves: '',
  esPagoMixto: false,
  referencia_pago: '',
  tasa_bcv: null,
  entrega_inmediata: false,
  aplica_iva: false,
  monto_descuento_usd: null,
  monto_delivery_usd: null,
  comentarios_descuento: '',
  comentarios: '',
  // Campos para abono
  monto_abono: null,
  fecha_vencimiento: ''
});

const venta = ref(getInitialVentaState());

// Variable computada para el cliente seleccionado
const clienteSeleccionado = computed(() => {
  if (venta.value.cliente_nombre && venta.value.cliente_apellido && venta.value.cliente_cedula) {
    return {
      nombre: venta.value.cliente_nombre,
      apellido: venta.value.cliente_apellido,
      cedula_rif: venta.value.cliente_cedula,
      telefono: venta.value.cliente_telefono,
      email: venta.value.cliente_email,
      direccion: venta.value.cliente_direccion
    };
  }
  return null;
});

onMounted(async () => {
  console.log('🚀 Iniciando carga de datos...');
  productos.value = await getProducts();
  console.log('📦 Productos cargados:', productos.value.length);
  
  clientes.value = await getClientes();
  console.log('👥 Clientes cargados:', clientes.value.length);
  console.log('👥 Lista de clientes:', clientes.value);
  
  // Cargar tasa de cambio actual
  const tasa = await getTasaCambio();
  if (tasa) {
    venta.value.tasa_bcv = tasa;
  }
  console.log('✅ Carga de datos completada');
});

// Watchers para actualizar precios automáticamente
watch(productoSeleccionado, (nuevoProducto) => {
  if (nuevoProducto) {
    precioSeleccionado.value = nuevoProducto.precio_usd;
  }
});

// Computed properties simplificadas
const subtotal = computed(() => 
  detallesPedido.value.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0)
);

const montoDescuentoCalculado = computed(() => {
  if (descuentoPorcentaje.value) {
    return (subtotal.value * (venta.value.monto_descuento_usd || 0)) / 100;
  }
  return venta.value.monto_descuento_usd || 0;
});

const ivaCalculado = computed(() => {
  if (!venta.value.aplica_iva) return 0;
  const baseImponible = subtotal.value - montoDescuentoCalculado.value;
  return baseImponible * 0.16;
});

const total = computed(() => {
  const baseImponible = subtotal.value - montoDescuentoCalculado.value;
  const iva = venta.value.aplica_iva ? baseImponible * 0.16 : 0;
  const delivery = venta.value.monto_delivery_usd || 0;
  const totalCalculado = baseImponible + iva + delivery;
  return totalCalculado < 0 ? 0 : totalCalculado;
});

const totalVES = computed(() => {
  return total.value * (venta.value.tasa_bcv || 36.0);
});

// Validaciones dinámicas
const requiereReferencia = computed(() => {
  const metodosConReferencia = ['zelle', 'pago_movil', 'transferencia'];
  return metodosConReferencia.includes(venta.value.metodo_pago.toLowerCase());
});

const requiereComentariosDescuento = computed(() => {
  return venta.value.monto_descuento_usd > 0;
});

// Variables computadas para abono
const totalVenta = computed(() => total.value);

const fechaMinima = computed(() => {
  const hoy = new Date();
  hoy.setDate(hoy.getDate() + 1); // Mínimo mañana
  return hoy.toISOString().split('T')[0];
});

// Variables para manejo de abonos mejorado
const tipoPagoAbono = ref('simple'); // 'simple' o 'mixto'

// Variables para pago simple
const metodoPagoAbono = ref('');
const montoAbonoSimple = ref(0);

// Variables para pago mixto
const montoAbonoUSD = ref(0);
const montoAbonoVES = ref(0);

// Variables para pago mixto independiente
const montoMixtoUSD = ref(0);
const montoMixtoVES = ref(0);

// Cálculos para pago simple
const conversionAbonoSimple = computed(() => {
  if (!montoAbonoSimple.value || montoAbonoSimple.value <= 0) return '';
  
  const tasaBCV = venta.value.tasa_bcv || 36.0;
  
  if (metodoPagoAbono.value.includes('USD')) {
    const montoVES = montoAbonoSimple.value * tasaBCV;
    return `Equivale a Bs. ${montoVES.toFixed(2)}`;
  } else {
    const montoUSD = montoAbonoSimple.value / tasaBCV;
    return `Equivale a $${montoUSD.toFixed(2)}`;
  }
});

// Cálculos para pago mixto
const totalAbonoMixto = computed(() => {
  const montoUSD = montoAbonoUSD.value || 0;
  const montoVESEnUSD = venta.value.tasa_bcv > 0 ? (montoAbonoVES.value || 0) / venta.value.tasa_bcv : 0;
  return montoUSD + montoVESEnUSD;
});

// Total del abono calculado (para ambos tipos)
const totalAbonoCalculado = computed(() => {
  if (tipoPagoAbono.value === 'simple') {
    if (metodoPagoAbono.value.includes('USD')) {
      return montoAbonoSimple.value || 0;
    } else {
      return venta.value.tasa_bcv > 0 ? (montoAbonoSimple.value || 0) / venta.value.tasa_bcv : 0;
    }
  } else {
    return totalAbonoMixto.value;
  }
});

// Cálculo para pago mixto independiente
const totalMixtoCalculado = computed(() => {
  const usdAmount = montoMixtoUSD.value || 0;
  const vesAmount = montoMixtoVES.value || 0;
  const vesInUSD = venta.value.tasa_bcv > 0 ? vesAmount / venta.value.tasa_bcv : 0;
  return usdAmount + vesInUSD;
});

// Funciones para cálculo automático del pago mixto
function calcularRestanteUSD() {
  if (venta.value.tasa_bcv > 0 && montoMixtoUSD.value > 0) {
    const totalVentaUSD = totalVenta.value;
    const restanteUSD = totalVentaUSD - montoMixtoUSD.value;
    
    if (restanteUSD > 0) {
      // Calcular el equivalente en VES
      const restanteVES = restanteUSD * venta.value.tasa_bcv;
      montoMixtoVES.value = Math.round(restanteVES * 100) / 100; // Redondear a 2 decimales
    } else {
      montoMixtoVES.value = 0;
    }
  }
}

function calcularRestanteVES() {
  if (venta.value.tasa_bcv > 0 && montoMixtoVES.value > 0) {
    const totalVentaUSD = totalVenta.value;
    const vesEnUSD = montoMixtoVES.value / venta.value.tasa_bcv;
    const restanteUSD = totalVentaUSD - vesEnUSD;
    
    if (restanteUSD > 0) {
      montoMixtoUSD.value = Math.round(restanteUSD * 100) / 100; // Redondear a 2 decimales
    } else {
      montoMixtoUSD.value = 0;
    }
  }
}

// Saldo pendiente actualizado
const saldoPendiente = computed(() => {
  return Math.max(0, totalVenta.value - totalAbonoCalculado.value);
});

// Validación de abono mejorada
const esAbonoValido = computed(() => {
  if (!venta.value.metodo_pago || venta.value.metodo_pago !== 'Abono') return true;
  
  const fechaVencimiento = venta.value.fecha_vencimiento;
  const fechaValida = fechaVencimiento && fechaVencimiento >= fechaMinima.value;
  
  if (tipoPagoAbono.value === 'simple') {
    const montoValido = montoAbonoSimple.value > 0 && totalAbonoCalculado.value <= totalVenta.value;
    const metodoValido = metodoPagoAbono.value !== '';
    return montoValido && metodoValido && fechaValida;
  } else {
    const montoValido = (montoAbonoUSD.value > 0 || montoAbonoVES.value > 0) && 
                       totalAbonoCalculado.value <= totalVenta.value;
    return montoValido && fechaValida;
  }
});

// Validación para pago mixto independiente
const esMixtoValido = computed(() => {
  if (!venta.value.metodo_pago || venta.value.metodo_pago !== 'Mixto') return true;
  
  const montoValido = (montoMixtoUSD.value > 0 || montoMixtoVES.value > 0) && 
                     totalMixtoCalculado.value <= totalVenta.value;
  return montoValido;
});

// Funciones para cálculos - simplificadas
// Los cálculos ahora se manejan directamente en las computed properties

// Funciones para manejar la selección de clientes
function onClientSelected(client) {
  venta.value.cliente_cedula = client.cedula_rif;
  venta.value.cliente_nombre = client.nombre;
  venta.value.cliente_apellido = client.apellido;
  venta.value.cliente_telefono = client.telefono || '';
  venta.value.cliente_email = client.email || '';
  venta.value.cliente_direccion = client.direccion || '';
}

function onClientCleared() {
  venta.value.cliente_cedula = '';
  venta.value.cliente_nombre = '';
  venta.value.cliente_apellido = '';
  venta.value.cliente_telefono = '';
  venta.value.cliente_email = '';
  venta.value.cliente_direccion = '';
}

function abrirModalNuevoCliente() {
  Swal.fire({
    title: 'Nuevo Cliente',
    html: `
      <div class="mb-3">
        <label class="form-label">Cédula/RIF *</label>
        <input id="swal-cedula" class="form-control" placeholder="Ej: V12345678">
      </div>
      <div class="mb-3">
        <label class="form-label">Nombre *</label>
        <input id="swal-nombre" class="form-control" placeholder="Nombre del cliente">
      </div>
      <div class="mb-3">
        <label class="form-label">Apellido</label>
        <input id="swal-apellido" class="form-control" placeholder="Apellido del cliente">
      </div>
      <div class="mb-3">
        <label class="form-label">Teléfono</label>
        <input id="swal-telefono" class="form-control" placeholder="Ej: 0412-1234567">
      </div>
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input id="swal-email" class="form-control" placeholder="cliente@email.com">
      </div>
      <div class="mb-3">
        <label class="form-label">Dirección</label>
        <input id="swal-direccion" class="form-control" placeholder="Dirección del cliente">
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Guardar Cliente',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const cedula = document.getElementById('swal-cedula').value;
      const nombre = document.getElementById('swal-nombre').value;
      const apellido = document.getElementById('swal-apellido').value;
      const telefono = document.getElementById('swal-telefono').value;
      const email = document.getElementById('swal-email').value;
      const direccion = document.getElementById('swal-direccion').value;
      
      if (!cedula || !nombre) {
        Swal.showValidationMessage('Cédula y nombre son obligatorios');
        return false;
      }
      
      return { cedula, nombre, apellido, telefono, email, direccion };
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        // Aquí podrías agregar el cliente a la base de datos
        // Por ahora, solo lo agregamos al formulario
        venta.value.cliente_cedula = result.value.cedula;
        venta.value.cliente_nombre = result.value.nombre;
        venta.value.cliente_apellido = result.value.apellido;
        venta.value.cliente_telefono = result.value.telefono;
        venta.value.cliente_email = result.value.email;
        venta.value.cliente_direccion = result.value.direccion;
        
        // Actualizar la lista de clientes
        clientes.value = await getClientes();
        
        Swal.fire('¡Éxito!', 'Cliente creado y seleccionado', 'success');
      } catch (error) {
        console.error('Error al crear cliente:', error);
        Swal.fire('Error', 'No se pudo crear el cliente', 'error');
      }
    }
  });
}

// Funciones para manejar la selección de productos
function onProductSelected(product) {
  productoSeleccionado.value = product;
  precioSeleccionado.value = product.precio_usd;
  // El precio no es editable para productos de inventario
  precioEditable.value = false;
}

function onProductCleared() {
  productoSeleccionado.value = null;
  precioSeleccionado.value = 0;
  // El precio vuelve a ser editable cuando no hay producto seleccionado
  precioEditable.value = true;
}

function agregarProducto() {
  if (!productoSeleccionado.value || cantidadSeleccionada.value < 1) {
    Swal.fire('Atención', 'Selecciona un producto y una cantidad válida.', 'warning');
    return;
  }
  
  if (cantidadSeleccionada.value > productoSeleccionado.value.stock_actual) {
    Swal.fire('Stock Insuficiente', `Solo quedan ${productoSeleccionado.value.stock_actual} unidades.`, 'error');
    return;
  }
  
  if (precioSeleccionado.value <= 0) {
    Swal.fire('Error', 'El precio debe ser mayor a 0.', 'error');
    return;
  }
  
  const productoExistente = detallesPedido.value.find(item => item.id === productoSeleccionado.value.id);
  
  if (productoExistente) {
    productoExistente.cantidad += cantidadSeleccionada.value;
    productoExistente.precio_unitario = precioSeleccionado.value;
  } else {
    detallesPedido.value.push({
      id: productoSeleccionado.value.id,
      nombre: productoSeleccionado.value.nombre,
      sku: productoSeleccionado.value.sku,
      cantidad: cantidadSeleccionada.value,
      precio_unitario: precioSeleccionado.value,
      es_manual: false
    });
  }
  
  limpiarSeleccionProducto();
}

function agregarProductoManual() {
  if (!productoManual.value.descripcion.trim() || productoManual.value.cantidad < 1 || productoManual.value.precio <= 0) {
    Swal.fire('Error', 'Completa todos los campos del producto manual.', 'error');
    return;
  }
  
  const idManual = `MANUAL-${Date.now()}`;
  detallesPedido.value.push({
    id: idManual,
    nombre: productoManual.value.descripcion,
    sku: 'MANUAL',
    cantidad: productoManual.value.cantidad,
    precio_unitario: productoManual.value.precio,
    es_manual: true
  });
  
  limpiarProductoManual();
}

function limpiarSeleccionProducto() {
  productoSeleccionado.value = null;
  cantidadSeleccionada.value = 1;
  precioSeleccionado.value = 0;
  // Limpiar también el componente de búsqueda
  if (productSearchRef.value) {
    productSearchRef.value.clearSelection();
  }
}

// Funciones para modal de producto manual
function abrirModalProductoManual() {
  mostrarModalProductoManual.value = true;
  // Limpiar datos del modal
  productoManual.value = {
    descripcion: '',
    precio: 0,
    cantidad: 1
  };
}

function cerrarModalProductoManual() {
  mostrarModalProductoManual.value = false;
}

function limpiarProductoManual() {
  productoManual.value = {
    descripcion: '',
    precio: 0,
    cantidad: 1
  };
  cerrarModalProductoManual();
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
  detallesPedido.value.splice(index, 1);
    }
  });
}

// Funciones para control de cantidad
function incrementarCantidad() {
  if (cantidadSeleccionada.value < 999) {
    cantidadSeleccionada.value++;
  }
}

function decrementarCantidad() {
  if (cantidadSeleccionada.value > 1) {
    cantidadSeleccionada.value--;
  }
}

function incrementarCantidadItem(index) {
  if (detallesPedido.value[index].cantidad < 999) {
    detallesPedido.value[index].cantidad++;
  }
}

function decrementarCantidadItem(index) {
  if (detallesPedido.value[index].cantidad > 1) {
    detallesPedido.value[index].cantidad--;
  }
}

function modificarCantidad(index, cambio) {
  const item = detallesPedido.value[index];
  const nuevaCantidad = item.cantidad + cambio;
  
  if (nuevaCantidad < 1) return;
  
  // Validar stock para productos de inventario
  if (!item.es_manual) {
    const producto = productos.value.find(p => p.id === item.id);
    if (producto && nuevaCantidad > producto.stock_actual) {
      Swal.fire('Stock Insuficiente', `Solo quedan ${producto.stock_actual} unidades.`, 'error');
      return;
    }
  }
  
  item.cantidad = nuevaCantidad;
}

function validarCantidad(index) {
  const item = detallesPedido.value[index];
  
  if (item.cantidad < 1) {
    item.cantidad = 1;
  }
  
  // Validar stock para productos de inventario
  if (!item.es_manual) {
    const producto = productos.value.find(p => p.id === item.id);
    if (producto && item.cantidad > producto.stock_actual) {
      Swal.fire('Stock Insuficiente', `Solo quedan ${producto.stock_actual} unidades.`, 'error');
      item.cantidad = producto.stock_actual;
    }
  }
}

// Funciones para forzar enteros en cantidades
function forzarEntero(event, index) {
  const value = parseFloat(event.target.value);
  if (!isNaN(value)) {
    const entero = Math.floor(value);
    if (entero < 1) {
      detallesPedido.value[index].cantidad = 1;
    } else {
      detallesPedido.value[index].cantidad = entero;
    }
  }
}

function forzarEnteroSeleccionado(event) {
  const value = parseFloat(event.target.value);
  if (!isNaN(value)) {
    const entero = Math.floor(value);
    if (entero < 1) {
      cantidadSeleccionada.value = 1;
    } else {
      cantidadSeleccionada.value = entero;
    }
  }
}

function forzarEnteroManual(event) {
  const value = parseFloat(event.target.value);
  if (!isNaN(value)) {
    const entero = Math.floor(value);
    if (entero < 1) {
      productoManual.value.cantidad = 1;
    } else {
      productoManual.value.cantidad = entero;
    }
  }
}

// Función para permitir solo números en cantidades
function soloNumeros(event) {
  // Permitir teclas de control (backspace, delete, tab, escape, enter)
  if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
      // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (event.keyCode === 65 && event.ctrlKey === true) ||
      (event.keyCode === 67 && event.ctrlKey === true) ||
      (event.keyCode === 86 && event.ctrlKey === true) ||
      (event.keyCode === 88 && event.ctrlKey === true) ||
      // Permitir teclas de navegación (flechas, home, end)
      (event.keyCode >= 35 && event.keyCode <= 40)) {
    return;
  }
  
  // Solo permitir números (0-9)
  if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
    event.preventDefault();
  }
}

function validarPrecio(index) {
  const item = detallesPedido.value[index];
  
  if (item.precio_unitario < 0) {
    item.precio_unitario = 0;
  }
}

// Funciones de búsqueda de clientes
async function buscarClientePorCedulaLocal() {
  if (!venta.value.cliente_cedula.trim()) return;
  
  try {
    // Buscar cliente por cédula
    const clienteEncontrado = await buscarClienteEnBD(venta.value.cliente_cedula);
    if (clienteEncontrado) {
      venta.value.cliente_nombre = clienteEncontrado.nombre;
      venta.value.cliente_apellido = clienteEncontrado.apellido;
      venta.value.cliente_telefono = clienteEncontrado.telefono;
      venta.value.cliente_email = clienteEncontrado.email;
      venta.value.cliente_direccion = clienteEncontrado.direccion;
      
      // Mostrar mensaje de éxito
      Swal.fire({
        title: '¡Cliente Encontrado!',
        text: `${clienteEncontrado.nombre} ${clienteEncontrado.apellido}`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      // Mostrar mensaje de que no se encontró
      Swal.fire({
        title: 'Cliente No Encontrado',
        text: 'No se encontró un cliente con esa cédula. Puedes crear uno nuevo.',
        icon: 'info',
        confirmButtonText: 'Crear Nuevo Cliente',
        showCancelButton: true,
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          nuevoCliente();
        }
      });
    }
  } catch (error) {
    console.log('Error al buscar cliente:', error);
    Swal.fire({
      title: 'Error',
      text: 'Hubo un error al buscar el cliente',
      icon: 'error'
    });
  }
}

async function buscarClienteEnBD(cedula) {
  try {
    const cliente = await buscarClientePorCedula(cedula);
    return cliente;
  } catch (error) {
    console.error('Error al buscar cliente:', error);
    return null;
  }
}

async function buscarClientePorCriterio(criterio) {
  try {
    const clientes = await buscarClientesPorNombre(criterio);
    return clientes.length > 0 ? clientes[0] : null;
  } catch (error) {
    console.error('Error al buscar cliente:', error);
    return null;
  }
}

// Funciones para autocompletado de cliente
function buscarClientesEnTiempoReal() {
  console.log('🔍 Función de búsqueda llamada');
  console.log('📝 Query actual:', clienteSearchQuery.value);
  console.log('👥 Clientes disponibles:', clientes.value);
  
  if (!clienteSearchQuery.value || !clienteSearchQuery.value.trim()) {
    console.log('❌ Query vacío, limpiando resultados');
    resultadosBusqueda.value = [];
    return;
  }
  
  const query = clienteSearchQuery.value.trim();
  console.log('🔍 Buscando con query:', query);
  
  if (!clientes.value || clientes.value.length === 0) {
    console.log('❌ No hay clientes cargados');
    resultadosBusqueda.value = [];
    return;
  }
  
  const resultados = clientes.value.filter(cliente => {
    if (!cliente) return false;
    
    const nombre = (cliente.nombre || '').toLowerCase();
    const apellido = (cliente.apellido || '').toLowerCase();
    const cedula = (cliente.cedula_rif || '').toLowerCase();
    const telefono = (cliente.telefono || '').toLowerCase();
    const queryLower = query.toLowerCase();
    
    const matchNombre = nombre.includes(queryLower);
    const matchApellido = apellido.includes(queryLower);
    const matchCedula = cedula.includes(queryLower);
    const matchTelefono = telefono.includes(queryLower);
    
    const match = matchNombre || matchApellido || matchCedula || matchTelefono;
    
    if (match) {
      console.log(`✅ Cliente encontrado: ${cliente.nombre} ${cliente.apellido} (${cliente.cedula_rif})`);
    }
    
    return match;
  });
  
  resultadosBusqueda.value = resultados.slice(0, 10);
  console.log('📋 Resultados finales:', resultadosBusqueda.value.length, 'clientes');
}

function seleccionarCliente(cliente) {
  // Llenar los campos del formulario
  venta.value.cliente_cedula = cliente.cedula_rif;
  venta.value.cliente_nombre = cliente.nombre;
  venta.value.cliente_apellido = cliente.apellido;
  venta.value.cliente_telefono = cliente.telefono;
  venta.value.cliente_email = cliente.email;
  venta.value.cliente_direccion = cliente.direccion;
  
  // Limpiar búsqueda y ocultar resultados
  clienteSearchQuery.value = '';
  resultadosBusqueda.value = [];
  mostrarResultados.value = false;
  
  // Mostrar confirmación
  showSuccess('Cliente Seleccionado', `${cliente.nombre} ${cliente.apellido}`);
}

function limpiarBusquedaCliente() {
  clienteSearchQuery.value = '';
  resultadosBusqueda.value = [];
  mostrarResultados.value = false;
}

function quitarClienteSeleccionado() {
  // Limpiar todos los datos del cliente
  venta.value.cliente_cedula = '';
  venta.value.cliente_nombre = '';
  venta.value.cliente_apellido = '';
  venta.value.cliente_telefono = '';
  venta.value.cliente_email = '';
  venta.value.cliente_direccion = '';
  
  // Limpiar también la búsqueda
  clienteSearchQuery.value = '';
  resultadosBusqueda.value = [];
  mostrarResultados.value = false;
  
  // Mostrar confirmación
  showSuccess('Cliente Removido', 'El cliente ha sido removido de la venta');
}

function ocultarResultados() {
  // Delay para permitir el click en los resultados
  setTimeout(() => {
    mostrarResultados.value = false;
  }, 200);
}

function buscarCliente() {
  Swal.fire({
    title: 'Buscar Cliente',
    input: 'text',
    inputPlaceholder: 'Ingresa cédula, nombre o teléfono',
    showCancelButton: true,
    confirmButtonText: 'Buscar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) {
        return 'Debes ingresar un criterio de búsqueda';
      }
    }
  }).then(async (result) => {
    if (result.isConfirmed && result.value) {
      const criterio = result.value.trim();
      
      // Buscar cliente por diferentes criterios
      const clienteEncontrado = await buscarClientePorCriterio(criterio);
      
      if (clienteEncontrado) {
        // Llenar los campos del formulario
        venta.value.cliente_cedula = clienteEncontrado.cedula_rif;
        venta.value.cliente_nombre = clienteEncontrado.nombre;
        venta.value.cliente_apellido = clienteEncontrado.apellido;
        venta.value.cliente_telefono = clienteEncontrado.telefono;
        venta.value.cliente_email = clienteEncontrado.email;
        venta.value.cliente_direccion = clienteEncontrado.direccion;
        
        Swal.fire({
          title: '¡Cliente Encontrado!',
          text: `${clienteEncontrado.nombre} ${clienteEncontrado.apellido}`,
          icon: 'success',
          timer: 2000
        });
      } else {
        Swal.fire({
          title: 'Cliente No Encontrado',
          text: 'No se encontró ningún cliente con ese criterio',
          icon: 'info',
          confirmButtonText: 'Crear Nuevo Cliente',
          showCancelButton: true,
    cancelButtonText: 'Cancelar'
  }).then((result) => {
          if (result.isConfirmed) {
            nuevoCliente();
          }
        });
      }
    }
  });
}

function nuevoCliente() {
  Swal.fire({
    title: 'Nuevo Cliente',
    html: `
      <div class="text-start">
        <div class="mb-3">
          <label class="form-label">Cédula/RIF *</label>
          <input type="text" class="form-control" id="nueva-cedula" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Nombre *</label>
          <input type="text" class="form-control" id="nuevo-nombre" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Apellido</label>
          <input type="text" class="form-control" id="nuevo-apellido">
        </div>
        <div class="mb-3">
          <label class="form-label">Teléfono</label>
          <input type="tel" class="form-control" id="nuevo-telefono">
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" id="nuevo-email">
        </div>
        <div class="mb-3">
          <label class="form-label">Dirección</label>
          <input type="text" class="form-control" id="nueva-direccion">
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const cedula = document.getElementById('nueva-cedula').value;
      const nombre = document.getElementById('nuevo-nombre').value;
      const apellido = document.getElementById('nuevo-apellido').value;
      const telefono = document.getElementById('nuevo-telefono').value;
      const email = document.getElementById('nuevo-email').value;
      const direccion = document.getElementById('nueva-direccion').value;
      
      if (!cedula || !nombre) {
        Swal.showValidationMessage('Cédula y nombre son obligatorios');
        return false;
      }
      
      return { cedula, nombre, apellido, telefono, email, direccion };
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      const clienteData = result.value;
      
      try {
        // Crear cliente en la base de datos
        const nuevoCliente = await crearCliente({
          cedula: clienteData.cedula,
          nombre: clienteData.nombre,
          apellido: clienteData.apellido,
          telefono: clienteData.telefono,
          email: clienteData.email,
          direccion: clienteData.direccion
        });
        
        // Actualizar formulario de venta
        venta.value.cliente_cedula = clienteData.cedula;
        venta.value.cliente_nombre = clienteData.nombre;
        venta.value.cliente_apellido = clienteData.apellido;
        venta.value.cliente_telefono = clienteData.telefono;
        venta.value.cliente_email = clienteData.email;
        venta.value.cliente_direccion = clienteData.direccion;
        
        console.log('Cliente creado:', nuevoCliente);
      } catch (error) {
        console.error('Error al crear cliente:', error);
        Swal.fire('Error', 'No se pudo crear el cliente. Intenta nuevamente.', 'error');
      }
    }
  });
}

function resetForm() {
  venta.value = getInitialVentaState();
  detallesPedido.value = [];
  limpiarSeleccionProducto();
  limpiarProductoManual();
  
  // Limpiar campos de abono mejorado
  tipoPagoAbono.value = 'simple';
  metodoPagoAbono.value = '';
  montoAbonoSimple.value = 0;
  montoAbonoUSD.value = 0;
  montoAbonoVES.value = 0;
  
  // Limpiar campos de pago mixto independiente
  montoMixtoUSD.value = 0;
  montoMixtoVES.value = 0;
  
  // Limpiar checkboxes de servicios
  quiereDelivery.value = false;
  quiereDescuento.value = false;
  descuentoPorcentaje.value = true; // Por defecto porcentaje
}

async function handleSubmit() {
  try {
  // Validaciones
  if (detallesPedido.value.length === 0) {
      await showError('Error', 'Debes añadir al menos un producto.');
    return;
  }
  
  if (!venta.value.cliente_cedula.trim() || !venta.value.cliente_nombre.trim()) {
    showError('Error', 'Cédula y nombre del cliente son obligatorios.');
    return;
  }
  
  if (!venta.value.metodo_pago) {
      await Swal.fire({
        title: 'Error',
        text: 'Debes seleccionar un método de pago.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    return;
  }
  
  // Validación dinámica de referencia
  if (requiereReferencia.value && !venta.value.referencia_pago.trim()) {
      await Swal.fire({
        title: 'Error',
        text: 'La referencia es obligatoria para este método de pago.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    return;
  }
  
  // Validación dinámica de comentarios por descuento
  if (requiereComentariosDescuento.value && !venta.value.comentarios.trim()) {
      await Swal.fire({
        title: 'Error',
        text: 'Los comentarios son obligatorios cuando se aplica descuento.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    return;
  }
  
  if (venta.value.monto_descuento_usd > 0 && !venta.value.comentarios_descuento.trim()) {
      await Swal.fire({
        title: 'Error',
        text: 'El motivo del descuento es obligatorio.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    return;
  }
  
  if (venta.value.tasa_bcv <= 0) {
      await Swal.fire({
        title: 'Error',
        text: 'La tasa BCV debe ser mayor a 0.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    return;
  }
  
  // Validaciones específicas para abono mejorado
  if (venta.value.tipo_pago === 'Abono') {
    if (!esAbonoValido.value) {
      let mensajeError = 'Error en la configuración del abono:';
      
      if (tipoPagoAbono.value === 'simple') {
        if (!metodoPagoAbono.value) mensajeError += '\n• Debe seleccionar un método de pago';
        if (montoAbonoSimple.value <= 0) mensajeError += '\n• El monto del abono debe ser mayor a 0';
      } else {
        if (montoAbonoUSD.value <= 0 && montoAbonoVES.value <= 0) {
          mensajeError += '\n• Debe ingresar al menos un monto (USD o VES)';
        }
      }
      
      if (!venta.value.fecha_vencimiento) mensajeError += '\n• Debe seleccionar una fecha de vencimiento';
      if (totalAbonoCalculado.value > totalVenta.value) {
        mensajeError += `\n• El total del abono ($${totalAbonoCalculado.value.toFixed(2)}) no puede exceder el total de la venta ($${totalVenta.value.toFixed(2)})`;
      }
      
      await Swal.fire({
        title: 'Error',
        text: mensajeError,
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
      return;
    }
  }
  
  // Validaciones específicas para pago mixto independiente
  if (venta.value.metodo_pago === 'Mixto') {
    if (!esMixtoValido.value) {
      let mensajeError = 'Error en la configuración del pago mixto:';
      
      if (montoMixtoUSD.value <= 0 && montoMixtoVES.value <= 0) {
        mensajeError += '\n• Debe ingresar al menos un monto (USD o VES)';
      }
      
      if (totalMixtoCalculado.value > totalVenta.value) {
        mensajeError += '\n• El total del pago mixto no puede exceder el total de la venta';
      }
      
      await Swal.fire({
        title: 'Error',
        text: mensajeError,
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
      return;
    }
  }
  
  isSubmitting.value = true;
  
  const payload = {
    // Datos del cliente
    cliente_cedula: venta.value.cliente_cedula,
    cliente_nombre: venta.value.cliente_nombre,
    cliente_apellido: venta.value.cliente_apellido,
    cliente_telefono: venta.value.cliente_telefono,
    cliente_email: venta.value.cliente_email,
    cliente_direccion: venta.value.cliente_direccion,
    
    // Configuración de la venta
    metodo_pago: venta.value.metodo_pago,
    referencia_pago: venta.value.referencia_pago,
    tasa_bcv: venta.value.tasa_bcv,
    estado_entrega: venta.value.entrega_inmediata ? 'entregado' : 'pendiente',
    aplica_iva: venta.value.aplica_iva,
    
    // Datos del abono mejorado (si aplica)
    es_abono: venta.value.tipo_pago === 'Abono',
    tipo_pago_abono: venta.value.tipo_pago === 'Abono' ? tipoPagoAbono.value : null,
    
    // Datos para pago simple
    metodo_pago_abono: venta.value.tipo_pago === 'Abono' && tipoPagoAbono.value === 'simple' ? 
      metodoPagoAbono.value : null,
    monto_abono_simple: venta.value.tipo_pago === 'Abono' && tipoPagoAbono.value === 'simple' ? 
      montoAbonoSimple.value : 0,
    
    // Datos para pago mixto
    monto_abono_usd: venta.value.tipo_pago === 'Abono' && tipoPagoAbono.value === 'mixto' ? 
      montoAbonoUSD.value : 0,
    monto_abono_ves: venta.value.tipo_pago === 'Abono' && tipoPagoAbono.value === 'mixto' ? 
      montoAbonoVES.value : 0,
    
    // Total del abono calculado
    total_abono_usd: venta.value.tipo_pago === 'Abono' ? totalAbonoCalculado.value : 0,
    fecha_vencimiento: venta.value.fecha_vencimiento || null,
    
    // Datos del pago mixto independiente (si aplica)
    es_pago_mixto: venta.value.tipo_pago === 'Mixto',
    monto_mixto_usd: venta.value.tipo_pago === 'Mixto' ? montoMixtoUSD.value : 0,
    monto_mixto_ves: venta.value.tipo_pago === 'Mixto' ? montoMixtoVES.value : 0,
    total_mixto_usd: venta.value.tipo_pago === 'Mixto' ? totalMixtoCalculado.value : 0,
    
    // Totales
    monto_descuento_usd: venta.value.monto_descuento_usd || 0,
    monto_delivery_usd: venta.value.monto_delivery_usd || 0,
    monto_iva_usd: venta.value.aplica_iva ? (venta.value.subtotal - venta.value.monto_descuento_usd) * 0.16 : 0,
    comentarios_descuento: venta.value.comentarios_descuento,
    comentarios_delivery: '',
    comentarios_generales: venta.value.comentarios,
    
    // Productos
    productos: detallesPedido.value.map(item => ({
      id: item.es_manual ? 'MANUAL' : item.id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      nombre: item.nombre,
      sku: item.sku || 'N/A'
    }))
  };
  
  try {
    const resultado = await createSale(payload);
      await Swal.fire({
      title: '¡Venta Registrada!',
      text: `Venta #${resultado} procesada correctamente`,
      icon: 'success',
      confirmButtonText: 'Continuar'
    });
    resetForm();
  } catch (error) {
    console.error("Error al procesar la venta:", error);
      await Swal.fire({
        title: 'Error',
        text: `No se pudo procesar la venta: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
  } finally {
      isSubmitting.value = false;
    }
  } catch (validationError) {
    console.error("Error de validación:", validationError);
    isSubmitting.value = false;
  }
}
</script>
<style scoped>
/* Estilos para el resumen dinámico */
.payment-info-section {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #E8F5E8;
}

.payment-method-info,
.payment-reference-info,
.delivery-status-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
}

.info-label {
  color: #4A7C4A;
  font-weight: 500;
}

.info-value {
  color: #2D5A2D;
  font-weight: 600;
}

/* Estilos para el toggle de descuento */
.discount-toggle {
  margin-bottom: 0.5rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4A7C4A;
  cursor: pointer;
}

.toggle-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.toggle-text {
  font-weight: 500;
  color: #1a1a1a;
}

fieldset { border: 1px solid #dee2e6 !important; }
legend { font-size: 1rem; font-weight: 600; }
</style>