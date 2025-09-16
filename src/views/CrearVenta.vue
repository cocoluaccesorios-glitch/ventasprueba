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
              <div class="header-icon">
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
          
          <div v-else class="empty-state">
            <div class="empty-icon">
              <i class="bi bi-box"></i>
            </div>
            <h4>Aún no has añadido productos</h4>
            <p>Selecciona productos del inventario o crea un producto manual para comenzar</p>
          </div>
          <!-- Configuración de Pago y Entrega Rediseñada -->
          <div class="modern-payment-section">
            <div class="section-header">
              <div class="header-icon">
                <i class="bi bi-credit-card"></i>
              </div>
              <div class="header-content">
                <h2>Configuración de Pago y Entrega</h2>
                <p>Define los detalles de pago y entrega</p>
              </div>
            </div>
            
            <div class="payment-form-container">
              <div class="form-row">
                <!-- Método de Pago -->
                <div class="form-group payment-method-group">
                  <label class="modern-label">
                    <i class="bi bi-wallet2"></i>
                    Método de Pago *
                  </label>
                  <div class="select-container">
                    <select class="modern-select" v-model="venta.metodo_pago" required>
                      <option value="">-- Seleccione --</option>
                      <option value="Efectivo (USD)">Efectivo (USD)</option>
                      <option value="Zelle (USD)">Zelle (USD)</option>
                      <option value="Punto de Venta (VES)">Punto de Venta (VES)</option>
                      <option value="Pago Móvil (VES)">Pago Móvil (VES)</option>
                      <option value="Transferencia (VES)">Transferencia (VES)</option>
                      <option value="Abono">Abono</option>
                    </select>
                    <i class="bi bi-chevron-down select-icon"></i>
                  </div>
                </div>
                
                <!-- Referencia -->
                <div class="form-group reference-group">
                  <label class="modern-label">
                    <i class="bi bi-hash"></i>
                    Referencia
                  </label>
                  <div class="input-container">
                    <input type="text" class="modern-input" 
                           v-model="venta.referencia_pago" 
                           placeholder="Número de referencia">
                  </div>
                </div>
                
                <!-- Tasa BCV -->
                <div class="form-group rate-group">
                  <label class="modern-label">
                    <i class="bi bi-graph-up"></i>
                    Tasa BCV
                  </label>
                  <div class="rate-container">
                    <span class="rate-label">Bs.</span>
                    <input type="number" class="rate-input" 
                           v-model.number="venta.tasa_bcv" step="0.01" min="0" required>
                  </div>
                </div>
              </div>
              
              <!-- Configuración de Abono -->
              <div v-if="venta.metodo_pago === 'Abono'" class="installment-section">
                <div class="installment-header">
                  <h4>
                    <i class="bi bi-calendar-check"></i>
                    Configuración de Abono
                  </h4>
                  <p class="installment-subtitle">Define los métodos de pago y montos del abono inicial</p>
                </div>
                
                <div class="installment-form">
                  <!-- Tipo de Pago -->
                  <div class="payment-type-section">
                    <label class="modern-label">
                      <i class="bi bi-credit-card"></i>
                      Tipo de Pago del Abono *
                    </label>
                    <div class="payment-type-options">
                      <div class="payment-type-option" 
                           :class="{ active: tipoPagoAbono === 'simple' }"
                           @click="tipoPagoAbono = 'simple'">
                        <i class="bi bi-currency-dollar"></i>
                        <span>Pago Simple</span>
                        <small>Un solo método de pago</small>
                      </div>
                      <div class="payment-type-option" 
                           :class="{ active: tipoPagoAbono === 'mixto' }"
                           @click="tipoPagoAbono = 'mixto'">
                        <i class="bi bi-arrow-left-right"></i>
                        <span>Pago Mixto</span>
                        <small>USD + VES combinados</small>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Pago Simple -->
                  <div v-if="tipoPagoAbono === 'simple'" class="simple-payment-section">
                    <div class="form-row">
                      <!-- Método de Pago Simple -->
                      <div class="form-group payment-method-group">
                        <label class="modern-label">
                          <i class="bi bi-wallet2"></i>
                          Método de Pago *
                        </label>
                        <div class="select-container">
                          <select class="modern-select" v-model="metodoPagoAbono" required>
                            <option value="">-- Seleccione --</option>
                            <option value="Efectivo (USD)">Efectivo (USD)</option>
                            <option value="Zelle (USD)">Zelle (USD)</option>
                            <option value="Punto de Venta (VES)">Punto de Venta (VES)</option>
                            <option value="Pago Móvil (VES)">Pago Móvil (VES)</option>
                            <option value="Transferencia (VES)">Transferencia (VES)</option>
                          </select>
                          <i class="bi bi-chevron-down select-icon"></i>
                        </div>
                      </div>
                      
                      <!-- Monto del Abono Simple -->
                      <div class="form-group installment-amount-group">
                        <label class="modern-label">
                          <i class="bi bi-currency-dollar"></i>
                          Monto del Abono *
                        </label>
                        <div class="amount-container">
                          <span class="currency-symbol">{{ metodoPagoAbono.includes('USD') ? '$' : 'Bs.' }}</span>
                          <input type="number" class="amount-input" 
                                 v-model.number="montoAbonoSimple" step="0.01" min="0.01"
                                 :max="metodoPagoAbono.includes('USD') ? totalVenta : totalVenta * venta.tasa_bcv"
                                 placeholder="0.00"
                                 required>
                        </div>
                        <!-- Conversión de moneda -->
                        <div v-if="conversionAbonoSimple" class="conversion-display">
                          {{ conversionAbonoSimple }}
                        </div>
                      </div>
                      
                      <!-- Fecha de Vencimiento -->
                      <div class="form-group due-date-group">
                        <label class="modern-label">
                          <i class="bi bi-calendar-event"></i>
                          Fecha de Vencimiento *
                        </label>
                        <div class="date-container">
                          <input type="date" class="date-input" 
                                 v-model="venta.fecha_vencimiento"
                                 :min="fechaMinima"
                                 required>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Pago Mixto -->
                  <div v-if="tipoPagoAbono === 'mixto'" class="mixed-payment-section">
                    <div class="form-row">
                      <!-- Monto en USD -->
                      <div class="form-group usd-amount-group">
                        <label class="modern-label">
                          <i class="bi bi-currency-dollar"></i>
                          Monto en USD
                        </label>
                        <div class="amount-container">
                          <span class="currency-symbol">$</span>
                          <input type="number" class="amount-input" 
                                 v-model.number="montoAbonoUSD" step="0.01" min="0"
                                 :max="totalVenta"
                                 placeholder="0.00">
                        </div>
                      </div>
                      
                      <!-- Monto en VES -->
                      <div class="form-group ves-amount-group">
                        <label class="modern-label">
                          <i class="bi bi-currency-exchange"></i>
                          Monto en VES
                        </label>
                        <div class="amount-container">
                          <span class="currency-symbol">Bs.</span>
                          <input type="number" class="amount-input" 
                                 v-model.number="montoAbonoVES" step="0.01" min="0"
                                 :max="totalVenta * venta.tasa_bcv"
                                 placeholder="0.00">
                        </div>
                      </div>
                      
                      <!-- Fecha de Vencimiento -->
                      <div class="form-group due-date-group">
                        <label class="modern-label">
                          <i class="bi bi-calendar-event"></i>
                          Fecha de Vencimiento *
                        </label>
                        <div class="date-container">
                          <input type="date" class="date-input" 
                                 v-model="venta.fecha_vencimiento"
                                 :min="fechaMinima"
                                 required>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Total del Abono Mixto -->
                    <div class="mixed-total-section">
                      <div class="mixed-total-card">
                        <div class="total-item">
                          <span class="total-label">USD:</span>
                          <span class="total-value">${{ montoAbonoUSD.toFixed(2) }}</span>
                        </div>
                        <div class="total-item">
                          <span class="total-label">VES:</span>
                          <span class="total-value">Bs. {{ montoAbonoVES.toFixed(2) }}</span>
                        </div>
                        <div class="total-item highlight">
                          <span class="total-label">Total Abono:</span>
                          <span class="total-value">${{ totalAbonoMixto.toFixed(2) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Saldo Pendiente -->
                  <div class="balance-section">
                    <div class="balance-display">
                      <div class="balance-info">
                        <span class="balance-label">Saldo Pendiente:</span>
                        <span class="balance-amount">${{ saldoPendiente.toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Información del Abono -->
                  <div class="installment-info">
                    <div class="info-card">
                      <div class="info-item">
                        <span class="info-label">Total de la Venta:</span>
                        <span class="info-value">${{ totalVenta.toFixed(2) }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Monto del Abono:</span>
                        <span class="info-value">${{ totalAbonoCalculado.toFixed(2) }}</span>
                      </div>
                      <div class="info-item highlight">
                        <span class="info-label">Saldo Pendiente:</span>
                        <span class="info-value">${{ saldoPendiente.toFixed(2) }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Fecha de Vencimiento:</span>
                        <span class="info-value">{{ venta.fecha_vencimiento || 'No especificada' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Opciones Adicionales -->
              <div class="options-row">
                <div class="option-group">
                  <div class="modern-checkbox">
                    <input type="checkbox" id="entrega-inmediata" v-model="venta.entrega_inmediata">
                    <label for="entrega-inmediata">
                      <div class="checkbox-custom">
                        <i class="bi bi-check"></i>
                      </div>
                      <span class="checkbox-label">
                        <i class="bi bi-truck"></i>
                        Entrega Inmediata
                      </span>
                    </label>
                  </div>
                </div>
                
                <div class="option-group">
                  <div class="modern-checkbox">
                    <input type="checkbox" id="aplica-iva" v-model="venta.aplica_iva">
                    <label for="aplica-iva">
                      <div class="checkbox-custom">
                        <i class="bi bi-check"></i>
                      </div>
                      <span class="checkbox-label">
                        <i class="bi bi-percent"></i>
                        Aplicar IVA (16%)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón de Submit Moderno -->
          <div class="submit-container">
            <button type="submit" class="modern-btn primary submit-btn" :disabled="isSubmitting || detallesPedido.length === 0">
              <div v-if="isSubmitting" class="spinner"></div>
              <i v-else class="bi bi-check-circle"></i>
              <span>{{ isSubmitting ? 'Procesando...' : 'Registrar Venta' }}</span>
            </button>
          </div>
        </form>
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
                    <label class="form-label">Precio Unitario (USD) *</label>
                    <div class="input-wrapper">
                      <i class="bi bi-currency-dollar input-icon"></i>
                      <input 
                        type="number" 
                        class="input-field" 
                        v-model.number="productoManual.precio"
                        step="0.01" 
                        min="0"
                        placeholder="0.00"
                        required
                      >
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Cantidad *</label>
                    <div class="input-wrapper">
                      <i class="bi bi-hash input-icon"></i>
                      <input 
                        type="number" 
                        class="input-field" 
                        v-model.number="productoManual.cantidad"
                        min="1" 
                        max="999"
                        placeholder="1"
                        required
                      >
                    </div>
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
            <h3>Resumen de Cuentas</h3>
            <p>Cálculos y totales</p>
          </div>
        </div>
        
        <div class="summary-content">
          <!-- Cálculos -->
          <div class="calculations-section">
            <!-- Subtotal -->
            <div class="calc-row">
              <span class="calc-label">Subtotal</span>
              <span class="calc-value">${{ subtotal.toFixed(2) }}</span>
                </div>
            
            <!-- Descuento -->
            <div class="calc-row discount-row">
              <div class="calc-left">
                <div class="discount-controls">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="descuentoPorcentaje" @change="calcularDescuento">
                    <span class="checkbox-text">Descuento por %</span>
                  </label>
                  <div class="discount-input">
                    <div class="modern-input-group">
                      <i class="bi bi-percent input-icon" v-if="descuentoPorcentaje"></i>
                      <i class="bi bi-currency-dollar input-icon" v-else></i>
                      <input 
                        type="number" 
                        class="modern-input discount-input-field" 
                        v-model.number="venta.monto_descuento_usd" 
                        @input="calcularDescuento"
                        :step="descuentoPorcentaje ? 1 : 0.01"
                        min="0"
                        :max="descuentoPorcentaje ? 100 : subtotal"
                      >
                    </div>
                  </div>
                </div>
              </div>
              <div class="calc-right">
                <span class="calc-value discount-value">-${{ montoDescuentoCalculado.toFixed(2) }}</span>
              </div>
            </div>
            
            <!-- IVA -->
            <div class="calc-row iva-row">
              <div class="calc-left">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="venta.aplica_iva" @change="calcularIVA">
                  <span class="checkbox-text">Aplicar IVA (16%)</span>
                </label>
              </div>
              <div class="calc-right">
                <span class="calc-value iva-value">${{ ivaCalculado.toFixed(2) }}</span>
              </div>
            </div>
            
            <!-- Delivery -->
            <div class="calc-row delivery-row">
              <div class="calc-left">
                <div class="modern-input-group">
                  <i class="bi bi-truck input-icon"></i>
                  <input 
                    type="number" 
                    class="modern-input delivery-input" 
                    v-model.number="venta.monto_delivery_usd" 
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  >
          </div>
        </div>
              <div class="calc-right">
                <span class="calc-value delivery-value">${{ (venta.monto_delivery_usd || 0).toFixed(2) }}</span>
              </div>
            </div>
            
            <!-- Total -->
            <div class="calc-row total-row">
              <span class="calc-label total-label">Total USD</span>
              <span class="calc-value total-value">${{ total.toFixed(2) }}</span>
            </div>
            
            <!-- Total en Bolívares -->
            <div class="calc-row ves-row">
              <div class="ves-controls">
                <div class="modern-input-group">
                  <i class="bi bi-arrow-repeat input-icon"></i>
                  <input 
                    type="number" 
                    class="modern-input ves-input" 
                    v-model.number="venta.tasa_bcv" 
                    step="0.01"
                    min="0"
                  >
                </div>
              </div>
              <div class="ves-result">
                <span class="calc-label">Total VES</span>
                <span class="calc-value ves-value">Bs. {{ totalVES.toFixed(2) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Tipo de Pago -->
          <div class="payment-section">
            <h4 class="summary-subtitle">
              <i class="bi bi-credit-card"></i>
              Método de Pago
            </h4>
            <div class="payment-info">
              <span class="payment-method-display">
                {{ venta.metodo_pago || 'No seleccionado' }}
              </span>
            </div>
            
            <!-- Referencia de Pago (solo lectura) -->
            <div v-if="venta.referencia_pago" class="payment-reference-display">
              <div class="reference-info">
                <i class="bi bi-hash"></i>
                <span>Referencia: {{ venta.referencia_pago }}</span>
              </div>
            </div>
            
            <!-- Entrega Inmediata (solo lectura) -->
            <div v-if="venta.entrega_inmediata" class="delivery-info">
              <div class="delivery-status">
                <i class="bi bi-truck"></i>
                <span>Entrega Inmediata</span>
              </div>
            </div>
          </div>
          
          <!-- Comentarios -->
          <div class="comments-section">
            <h4 class="summary-subtitle">
              <i class="bi bi-chat-text"></i>
              Comentarios
            </h4>
            <div class="modern-input-group">
              <i class="bi bi-pencil input-icon"></i>
              <textarea 
                class="modern-input comments-textarea" 
                v-model="venta.comentarios"
                :placeholder="requiereComentariosDescuento ? 'Comentarios adicionales (obligatorio por descuento)...' : 'Comentarios adicionales...'"
                :required="requiereComentariosDescuento"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>
        </div>
      </div>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
/* Variables CSS para consistencia */
:root {
  --input-height: 48px;
  --input-padding: 0.75rem 1rem;
  --input-border: 1px solid #ced4da;
  --input-border-radius: 6px;
  --input-font-size: 0.95rem;
  --input-line-height: 1.5;
  --primary-color: #0d6efd;
  --success-color: #198754;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #0dcaf0;
  --light-color: #f8f9fa;
  --dark-color: #212529;
  --border-radius-sm: 0.375rem;
  --border-radius-md: 6px;
  --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  --shadow-md: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  --transition-base: all 0.15s ease-in-out;
}

/* Estilos base para inputs sin !important */
.input-field, 
.modern-input,
.form-control {
  width: 100%;
  height: var(--input-height);
  padding: var(--input-padding);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  line-height: var(--input-line-height);
  color: var(--dark-color);
  background: #fff;
  box-sizing: border-box;
  transition: var(--transition-base);
}

.input-field:focus, 
.modern-input:focus,
.form-control:focus {
  border-color: var(--primary-color);
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Estilos para selects */
select.form-control {
  height: var(--input-height);
  padding: var(--input-padding);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  line-height: var(--input-line-height);
}

/* Contenedor principal */
.ultra-modern-sales {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Header estilo Bootstrap estándar como inventario */
.futuristic-header {
  background: #fff;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem 0;
  margin-bottom: 1.5rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.futuristic-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.search-btn {
  background: #6c757d;
  color: white;
}

.search-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.add-btn {
  background: #28a745;
  color: white;
}

.add-btn:hover {
  background: #218838;
  transform: translateY(-1px);
}

.brand-title {
  color: #212529;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.brand-subtitle {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
}

/* Sección de búsqueda de cliente en el header */
.client-search-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 2rem;
}

.client-search-container {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.client-search-field {
  position: relative;
}

.search-label {
  display: block;
  color: #495057;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: #6c757d;
  font-size: 0.9rem;
  z-index: 2;
  pointer-events: none;
}

.client-search-input {
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 3.5rem !important;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  background: #fff;
  box-sizing: border-box;
  transition: border-color 0.15s ease;
}

.client-search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.client-search-input::placeholder {
  color: #6c757d;
  font-weight: 400;
}

.clear-search-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: color 0.15s ease;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.clear-search-btn:hover {
  color: #495057;
}

/* Estilos para el estado de cliente seleccionado */
.search-state {
  position: relative;
  width: 100%;
}

.selected-client-state {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 2.5rem 0.5rem 3.5rem;
  border: 1px solid #28a745;
  border-radius: 0.375rem;
  background: #f8fff9;
  min-height: 48px;
  box-sizing: border-box;
}

.selected-client-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.client-icon {
  color: #28a745;
  font-size: 1.1rem;
  margin-right: 0.75rem;
}

.client-details {
  display: flex;
  flex-direction: column;
}

.client-name {
  font-weight: 600;
  color: #212529;
  font-size: 0.95rem;
  line-height: 1.2;
}

.client-cedula {
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 500;
}

.remove-client-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: #dc3545;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.15s ease;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 0.8rem;
}

.remove-client-btn:hover {
  background: #c82333;
  transform: translateY(-50%) scale(1.1);
}

/* Lista desplegable de resultados */
.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #dee2e6;
  border-top: none;
  border-radius: 0 0 0.375rem 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.search-result-item {
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
  transition: background-color 0.15s ease;
}

.search-result-item:hover {
  background: #f8f9fa;
}

.search-result-item:last-child {
  border-bottom: none;
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.result-name {
  font-weight: 600;
  color: #212529;
  font-size: 0.9rem;
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

.result-phone {
  font-style: italic;
}

/* Mensaje cuando no hay resultados */
.no-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #dee2e6;
  border-top: none;
  border-radius: 0 0 0.375rem 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  z-index: 1000;
}

.no-results-content {
  padding: 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.no-results-content i {
  font-size: 1.5rem;
  color: #6c757d;
}

.no-results-content span {
  color: #6c757d;
  font-size: 0.9rem;
}

/* Layout principal */
.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.centered-layout {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 2rem;
  align-items: start;
}

/* Formulario estilo Bootstrap estándar */
.form-container {
  background: #fff;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  padding: 1.5rem;
  border: 1px solid #dee2e6;
}

.card-title h3 {
  color: #212529;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.card-title p {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
}

/* Inputs uniformes - FORZAR MISMO TAMAÑO */
.input-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.input-label {
  color: #212529;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
  font-size: 0.9rem;
  height: 20px;
}

/* Inputs con tipos específicos */
input[type="text"], 
input[type="email"], 
input[type="tel"], 
input[type="number"] {
  width: 100%;
  height: var(--input-height);
  padding: var(--input-padding);
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  line-height: var(--input-line-height);
  color: var(--dark-color);
  background: #fff;
  box-sizing: border-box;
  transition: var(--transition-base);
}

input[type="text"]:focus, 
input[type="email"]:focus, 
input[type="tel"]:focus, 
input[type="number"]:focus {
  border-color: var(--primary-color);
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

input[type="text"]::placeholder, 
input[type="email"]::placeholder, 
input[type="tel"]::placeholder, 
input[type="number"]::placeholder,
.input-field::placeholder, 
.modern-input::placeholder,
.form-control::placeholder {
  color: #6c757d !important;
  font-weight: 400 !important;
}

.input-icon {
  color: #6c757d;
  margin-right: 0.5rem;
  font-size: 1rem;
}

/* Inputs especiales */
.comments-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #212529;
  background: #fff;
  resize: vertical;
  min-height: 100px;
  box-sizing: border-box;
  transition: all 0.15s ease-in-out;
}

.comments-textarea:focus {
  border-color: #007bff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.comments-textarea::placeholder {
  color: #6c757d;
  font-weight: 400;
}

/* Inputs con iconos - estilo limpio */
.modern-input-group, .input-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.modern-input-group .input-icon, .input-wrapper .input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1rem;
  z-index: 2;
  pointer-events: none;
}

.modern-input-group .modern-input, .input-wrapper .input-field {
  padding-left: 2.5rem;
  width: 100%;
  height: var(--input-height);
  padding: 0.375rem 0.75rem 0.375rem 2.5rem;
  border: var(--input-border);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
  line-height: var(--input-line-height);
  color: var(--dark-color);
  background: #fff;
  box-sizing: border-box;
  transition: var(--transition-base);
}

/* Grid de inputs - ALINEACIÓN PERFECTA */
.input-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: start;
}

.input-grid .full-width {
  grid-column: 1 / -1;
}

.input-grid .input-group {
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  height: auto;
}

.input-grid .input-group .input-label {
  height: 20px;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.input-grid .input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.input-grid .input-wrapper .input-field {
  flex: 1;
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
}

/* Selects */
select, .form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #212529;
  background: #fff;
  height: 48px;
  box-sizing: border-box;
  transition: all 0.15s ease-in-out;
}

select:focus, .form-select:focus {
  border-color: #007bff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Form controls de Bootstrap */
.form-control, .form-control-sm {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #212529;
  background: #fff;
  height: 48px;
  box-sizing: border-box;
  transition: all 0.15s ease-in-out;
}

.form-control-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  height: 38px;
}

.form-control:focus, .form-control-sm:focus {
  border-color: #007bff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Labels de Bootstrap */
.form-label {
  color: #212529;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
  font-size: 0.9rem;
}

/* Inputs numéricos */
input[type="number"] {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #212529;
  background: #fff;
  height: 48px;
  box-sizing: border-box;
  transition: all 0.15s ease-in-out;
}

input[type="number"]:focus {
  border-color: #007bff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Botones estilo Bootstrap estándar */
.search-btn, .add-btn {
  background: #0d6efd;
  color: #fff;
  border: 1px solid #0d6efd;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 400;
  cursor: pointer;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.search-btn:hover, .add-btn:hover {
  background: #0b5ed7;
  border-color: #0a58ca;
}

.add-btn {
  background: #198754;
  border-color: #198754;
}

.add-btn:hover {
  background: #157347;
  border-color: #146c43;
}

/* Botones de Bootstrap */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #6c757d;
  background: transparent;
}

.btn-outline-secondary:hover {
  color: #fff;
  background: #6c757d;
  border-color: #6c757d;
}

.btn-danger {
  color: #fff;
  background: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  background: #c82333;
  border-color: #bd2130;
}

/* Tablas */
.products-table, .table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.products-table th, .table th {
  background: #343a40;
  color: #fff;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  border: none;
}

.products-table td, .table td {
  padding: 0.75rem;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
}

.products-table tbody tr:hover, .table tbody tr:hover {
  background: #f8f9fa;
}

.table-bordered {
  border: 1px solid #dee2e6;
}

.table-bordered th, .table-bordered td {
  border: 1px solid #dee2e6;
}

.table-striped tbody tr:nth-of-type(odd) {
  background: rgba(0, 0, 0, 0.05);
}

.table-hover tbody tr:hover {
  background: rgba(0, 0, 0, 0.075);
}

.table-dark th {
  background: #343a40;
  color: #fff;
}

/* Información de método de pago */
.payment-info {
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 0.375rem;
  border: 1px solid #e9ecef;
}

.payment-method-display {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

/* Estilos para información de solo lectura en resumen */
.payment-reference-display {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #e9ecef;
  border-radius: 6px;
  border-left: 3px solid #17a2b8;
}

.reference-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #495057;
}

.reference-info i {
  color: #17a2b8;
}

.delivery-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #d4edda;
  border-radius: 6px;
  border-left: 3px solid #28a745;
}

.delivery-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #155724;
  font-weight: 600;
}

.delivery-status i {
  color: #28a745;
}
.button-group {
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
}

.manual-product-btn {
  background: linear-gradient(135deg, #ffc107, #ff8f00);
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.manual-product-btn:hover {
  background: linear-gradient(135deg, #ff8f00, #ff6f00);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 193, 7, 0.3);
}

.manual-product-btn:active {
  transform: translateY(0);
}

/* Modal para producto manual */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-content {
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h4 {
  margin: 0;
  color: #212529;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.15s ease;
}

.btn-close:hover {
  background: #f8f9fa;
  color: #495057;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
}
.readonly-field {
  background-color: #f8f9fa !important;
  color: #6c757d !important;
  cursor: not-allowed !important;
}

.readonly-field:focus {
  border-color: #dee2e6 !important;
  box-shadow: none !important;
}
.simple-quantity-input,
.simple-price-input {
  width: 80px;
  padding: 0.375rem 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  text-align: center;
  background: #fff;
  transition: border-color 0.15s ease;
}

.simple-quantity-input:focus,
.simple-price-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Eliminar spinners de campos numéricos */
.simple-quantity-input::-webkit-outer-spin-button,
.simple-quantity-input::-webkit-inner-spin-button,
.simple-price-input::-webkit-outer-spin-button,
.simple-price-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.simple-quantity-input[type=number],
.simple-price-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* Estilo de tabla más ligero */
.table tbody tr {
  background: #fff;
  border-bottom: 1px solid #e9ecef;
}

.table tbody tr:hover {
  background: #f8f9fa;
}

.table tbody tr:last-child {
  border-bottom: none;
}

/* Badges */
.badge {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  display: inline-block;
}

.bg-primary {
  background: #007bff !important;
  color: #fff;
}

.bg-warning {
  background: #ffc107 !important;
  color: #212529;
}

/* Alerts */
.alert {
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid transparent;
}

.alert-info {
  color: #0c5460;
  background: #d1ecf1;
  border-color: #bee5eb;
}

/* Fieldset y Legend */
fieldset {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

legend {
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  padding: 0 0.5rem;
  width: auto;
}

/* Panel de resumen estilo Bootstrap estándar */
.summary-container {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.summary-panel {
  background: #fff;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  padding: 1.5rem;
  border: 1px solid #dee2e6;
}

.summary-title h3 {
  color: #212529;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.summary-title p {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
}

.summary-subtitle {
  color: #212529;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Lista de productos */
.product-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #dee2e6;
}

.product-item:last-child {
  border-bottom: none;
}

.product-info {
  flex: 1;
}

.product-name {
  color: #212529;
  font-weight: 600;
  display: block;
}

.product-sku {
  color: #6c757d;
  font-size: 0.8rem;
}

.product-details {
  text-align: right;
}

.product-qty {
  color: #495057;
  font-size: 0.8rem;
  display: block;
}

.product-total {
  color: #212529;
  font-weight: 700;
  font-size: 0.9rem;
}

/* Sección de cálculos */
.calculations-section {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #dee2e6;
}

.calc-row:last-child {
  border-bottom: none;
}

.calc-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.calc-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* Checkbox labels con alineación perfecta */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin: 0;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
  transform: scale(1.1);
}

.checkbox-text {
  font-weight: 500;
  color: #495057;
}

.calc-label {
  color: #495057;
  font-weight: 600;
}

.calc-value {
  color: #212529;
  font-weight: 700;
}

/* Inputs de productos - ALINEACIÓN PERFECTA */
.product-inputs, .product-search-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: start;
}

.product-inputs .input-group, .product-search-section .input-group {
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
}

.product-inputs .input-group .input-label, .product-search-section .input-group .input-label {
  height: 20px;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.product-inputs .input-field, .product-search-section .input-field {
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
  padding: 0.75rem 1rem !important;
  font-size: 0.95rem !important;
}

/* Clases específicas del formulario */
.form-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.card-header {
  background: #f8f9fa;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-icon {
  width: 40px;
  height: 40px;
  background: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.2rem;
}

.card-title h3 {
  color: #212529;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.card-title p {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
}

.card-content {
  padding: 1.5rem;
}

/* Grid de controles de productos */
/* Grid de productos con 4 columnas perfectamente alineadas */
.products-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 1rem;
  align-items: baseline;
}

.product-search-column {
  display: flex;
  flex-direction: column;
}

.quantity-column {
  display: flex;
  flex-direction: column;
}

.price-column {
  display: flex;
  flex-direction: column;
}

.add-button-column {
  display: flex;
  flex-direction: column;
}

/* Inputs numéricos más anchos */
.quantity-input,
.price-input {
  min-width: 120px;
  width: 100%;
}

/* Botón añadir producto */
.add-product-btn {
  background: #28a745;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 48px;
  box-sizing: border-box;
}

.add-product-btn:hover:not(:disabled) {
  background: #1e7e34;
  transform: translateY(-1px);
}

.add-product-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

/* Inputs de cantidad y precio */
.quantity-input, .price-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #212529;
  background: #fff;
  height: 48px;
  box-sizing: border-box;
  transition: all 0.15s ease-in-out;
}

.quantity-input:focus, .price-input:focus {
  border-color: #007bff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.discount-inputs {
  display: flex;
  gap: 0.5rem;
}

/* Filas especiales */
.discount-row {
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
}

/* Inputs del panel de resumen */
.discount-inputs input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.95rem;
  height: 48px;
  box-sizing: border-box;
  transition: all 0.15s ease-in-out;
}

.discount-inputs input:focus {
  border-color: #007bff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.discount-inputs select {
  padding: 0.75rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.95rem;
  height: 48px;
  box-sizing: border-box;
  transition: all 0.15s ease-in-out;
}

.discount-inputs select:focus {
  border-color: #007bff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Totales */
.total-row {
  background: #d4edda;
  border: 2px solid #28a745;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 0.5rem;
}

.total-label {
  font-size: 1.1rem;
  color: #212529;
  font-weight: 700;
}

.total-value {
  font-size: 1.2rem;
  color: #28a745;
  font-weight: 700;
}

.ves-row {
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
}

.ves-value {
  font-size: 1rem;
  color: #495057;
  font-weight: 600;
}

/* Métodos de pago */
.payment-section {
  margin-bottom: 1rem;
}

.payment-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.payment-option {
  position: relative;
}

.payment-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.payment-option input[type="radio"] + label {
  display: block;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  color: #212529;
  font-weight: 600;
}

.payment-option input[type="radio"]:checked + label {
  background: #007bff;
  color: #fff;
  border-color: #007bff;
}

.payment-option input[type="radio"] + label:hover {
  background: #e9ecef;
}

.payment-option input[type="radio"]:checked + label:hover {
  background: #0056b3;
}

/* Inputs de referencia y campos especiales */
.payment-reference input, 
.reference-input,
.tasa-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #212529;
  background: #fff;
  height: 48px;
  box-sizing: border-box;
  transition: all 0.15s ease-in-out;
}

.payment-reference input:focus, 
.reference-input:focus,
.tasa-input:focus {
  border-color: #007bff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.payment-reference input::placeholder, 
.reference-input::placeholder,
.tasa-input::placeholder {
  color: #6c757d;
  font-weight: 400;
}

/* Comentarios */
.comments-section {
  margin-bottom: 0;
}

.comments-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #212529;
  background: #fff;
  resize: vertical;
  min-height: 100px;
  box-sizing: border-box;
  transition: all 0.15s ease-in-out;
}

.comments-textarea:focus {
  border-color: #007bff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.comments-textarea::placeholder {
  color: #6c757d;
  font-weight: 400;
}

/* Botón procesar */
.process-btn {
  width: 100%;
  background: #28a745;
  color: #fff;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.process-btn:hover {
  background: #1e7e34;
}

.process-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .centered-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .summary-container {
    position: static;
  }
  
  .payment-options {
    grid-template-columns: 1fr;
  }
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* ===== ESTILOS DEL NUEVO DISEÑO MODERNO ===== */

/* Sección de Productos Moderna */
.modern-products-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  color: white;
  overflow: visible;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.header-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  margin-right: 1rem;
  backdrop-filter: blur(10px);
}

.header-icon i {
  font-size: 2rem;
  color: white;
}

.header-content h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.header-content p {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 1rem;
}

.products-form-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  overflow: visible;
}

/* ===== NUEVO LAYOUT DEL FORMULARIO DE PRODUCTOS ===== */
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

/* ===== BOTONES APILADOS ===== */
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
}

.action-buttons-stacked .btn.compact {
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-buttons-stacked .btn i {
  font-size: 0.9rem;
}

.action-buttons-stacked .btn span {
  font-weight: 500;
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
  border-bottom: 1px solid #f1f3f4;
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

/* ===== COLUMNAS DE LA TABLA ===== */
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

/* ===== CELDAS DE LA TABLA ===== */
.product-cell {
  width: 40%;
}

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

.quantity-cell {
  width: 15%;
  text-align: center;
}

.table-qty-input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  text-align: center;
  font-size: 0.9rem;
  background: white;
  transition: border-color 0.2s ease;
}

.table-qty-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.price-cell {
  width: 20%;
  text-align: right;
}

.price-input-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
}

.price-input-group .currency-symbol {
  color: #28a745;
  font-weight: 600;
  font-size: 0.9rem;
}

.table-price-input {
  width: 100px;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  text-align: right;
  font-size: 0.9rem;
  background: white;
  transition: border-color 0.2s ease;
}

.table-price-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.subtotal-cell {
  width: 15%;
  text-align: right;
}

.subtotal-amount {
  font-weight: 600;
  color: #28a745;
  font-size: 0.9rem;
}

.actions-cell {
  width: 10%;
  text-align: center;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.remove-btn:hover {
  background: #c82333;
  transform: scale(1.05);
}

.remove-btn i {
  font-size: 0.8rem;
}

/* ===== OCULTAR SPINNERS DE INPUTS NUMÉRICOS ===== */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}

input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* ===== SECCIÓN DE ABONO ===== */
.installment-section {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.installment-header {
  margin-bottom: 1.5rem;
}

.installment-header h4 {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.installment-header i {
  font-size: 1rem;
}

.installment-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Campos específicos de abono */
.amount-container {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.amount-container .currency-symbol {
  color: #28a745;
  font-weight: 600;
  margin-right: 0.5rem;
  font-size: 0.9rem;
}

.amount-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
}

.amount-input:focus {
  outline: none;
}

.date-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.date-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
}

.date-input:focus {
  outline: none;
}

/* Conversión de moneda */
.conversion-display {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0.25rem;
  font-style: italic;
}

/* Selector de moneda */
.currency-select-container {
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.currency-select {
  width: 100%;
  padding: 0.5rem;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
  appearance: none;
  cursor: pointer;
}

.currency-select:focus {
  outline: none;
}

.select-icon {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
}

/* Texto de conversión en info card */
.conversion-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

/* ===== SECCIÓN DE ABONO MEJORADA ===== */
.installment-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  margin-top: 0.5rem;
  font-style: italic;
}

/* Opciones de tipo de pago */
.payment-type-section {
  margin-bottom: 1.5rem;
}

.payment-type-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
}

.payment-type-option {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.payment-type-option:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.payment-type-option.active {
  background: rgba(40, 167, 69, 0.2);
  border-color: #28a745;
  color: white;
}

.payment-type-option i {
  font-size: 1.5rem;
  color: #28a745;
}

.payment-type-option.active i {
  color: white;
}

.payment-type-option span {
  font-weight: 600;
  font-size: 0.9rem;
}

.payment-type-option small {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Secciones de pago */
.simple-payment-section,
.mixed-payment-section {
  margin-top: 1rem;
}

/* Total del abono mixto */
.mixed-total-section {
  margin-top: 1rem;
}

.mixed-total-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.total-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.total-item.highlight {
  background: rgba(40, 167, 69, 0.2);
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #28a745;
}

.total-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.total-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

.total-item.highlight .total-value {
  color: #28a745;
  font-size: 1rem;
}

/* Sección de saldo */
.balance-section {
  margin-top: 1rem;
}

.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(40, 167, 69, 0.2);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #28a745;
}

.balance-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

.balance-amount {
  font-size: 1.1rem;
  font-weight: 700;
  color: #28a745;
}

.balance-display {
  background: rgba(40, 167, 69, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  border: 1px solid rgba(40, 167, 69, 0.3);
  text-align: center;
}

.balance-amount {
  color: #28a745;
  font-weight: 700;
  font-size: 1.1rem;
}

/* Información del abono */
.installment-info {
  margin-top: 1rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item.highlight {
  background: rgba(40, 167, 69, 0.2);
  margin: 0 -1rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.info-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 500;
}

.info-value {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.info-item.highlight .info-label,
.info-item.highlight .info-value {
  color: #28a745;
  font-weight: 700;
}

/* ===== RESPONSIVE PARA TABLA ===== */
@media (max-width: 768px) {
  .form-row-second {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .order-table-container {
    overflow-x: auto;
  }
  
  .order-table {
    min-width: 600px;
  }
  
  .order-table th,
  .order-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .table-qty-input {
    width: 60px;
  }
  
  .table-price-input {
    width: 80px;
  }
  
  /* Responsive para abono */
  .installment-form .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: visible;
}

.form-group.product-search-group {
  z-index: 20;
  /* CONTEXTO DE POSICIONAMIENTO PARA OVERLAY */
  isolation: isolate;
}

.modern-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
}

.modern-label i {
  margin-right: 0.5rem;
  font-size: 0.8rem;
}

.search-container {
  position: relative;
  z-index: 10;
  overflow: visible;
  /* CONTEXTO DE POSICIONAMIENTO PARA OVERLAY */
  isolation: isolate;
}

.quantity-container {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quantity-btn {
  background: #f8f9fa;
  border: none;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
}

.quantity-btn:hover {
  background: #e9ecef;
}

.quantity-btn.minus {
  border-right: 1px solid #dee2e6;
}

.quantity-btn.plus {
  border-left: 1px solid #dee2e6;
}

.quantity-input {
  border: none;
  padding: 0.75rem;
  text-align: center;
  font-weight: 600;
  font-size: 1rem;
  width: 100%;
  background: white;
}

.price-container {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.currency-symbol {
  background: #28a745;
  color: white;
  padding: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
}

.price-input {
  border: none;
  padding: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  width: 100%;
  background: white;
}

/* Input simple para cantidad */
.simple-input-container {
  position: relative;
}

.simple-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: white;
  font-weight: 600;
  font-size: 1rem;
  color: #495057;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.simple-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

/* Estilos para precio read-only */
.price-container.readonly {
  opacity: 0.8;
  background: #f8f9fa;
}

.readonly-input {
  background: #f8f9fa !important;
  color: #6c757d !important;
  cursor: not-allowed;
}

.readonly-input:focus {
  box-shadow: none !important;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.btn-primary {
  background: #28a745;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #ffc107;
  color: #212529;
}

.btn-secondary:hover {
  background: #e0a800;
  transform: translateY(-1px);
}

/* Detalles del Pedido Modernos */
.modern-order-details {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f8f9fa;
}

.details-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
}

.items-count {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.order-item:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.item-name strong {
  color: #495057;
  font-size: 1rem;
}

.item-sku {
  color: #6c757d;
  font-size: 0.8rem;
}

.item-quantity label,
.item-price label,
.item-subtotal label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 0.25rem;
  display: block;
}

.quantity-controls {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.qty-btn {
  background: #f8f9fa;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
}

.qty-btn:hover {
  background: #e9ecef;
}

.qty-input {
  border: none;
  padding: 0.5rem;
  text-align: center;
  font-weight: 600;
  width: 60px;
  background: white;
}

.price-control {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.price-control .currency {
  background: #17a2b8;
  color: white;
  padding: 0.5rem;
  font-weight: 600;
  font-size: 0.8rem;
}

.price-control .price-input {
  border: none;
  padding: 0.5rem;
  font-weight: 600;
  width: 100%;
  background: white;
}

.subtotal-amount {
  font-weight: 700;
  font-size: 1.1rem;
  color: #28a745;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #c82333;
  transform: scale(1.1);
}

/* Estado Vacío */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.empty-icon {
  font-size: 4rem;
  color: #6c757d;
  margin-bottom: 1rem;
}

.empty-state h4 {
  color: #495057;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6c757d;
  margin: 0;
}

/* Sección de Pago Moderna */
.modern-payment-section {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(240, 147, 251, 0.3);
  color: white;
}

.payment-form-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.select-container {
  position: relative;
}

.modern-select {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: white;
  font-weight: 600;
  font-size: 1rem;
  color: #495057;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  appearance: none;
  cursor: pointer;
}

.select-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
}

.input-container {
  position: relative;
}

.modern-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: white;
  font-weight: 600;
  font-size: 1rem;
  color: #495057;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rate-container {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rate-label {
  background: #17a2b8;
  color: white;
  padding: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.rate-input {
  border: none;
  padding: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  width: 100%;
  background: white;
}

.options-row {
  display: flex;
  gap: 2rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.option-group {
  flex: 1;
}

.modern-checkbox {
  position: relative;
}

.modern-checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.modern-checkbox label {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.modern-checkbox label:hover {
  background: rgba(255, 255, 255, 0.2);
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modern-checkbox input[type="checkbox"]:checked + label .checkbox-custom {
  background: #28a745;
  border-color: #28a745;
}

.modern-checkbox input[type="checkbox"]:checked + label .checkbox-custom i {
  color: white;
  font-size: 0.8rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: white;
}

.checkbox-label i {
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .order-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .options-row {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { getProducts, createSale, getTasaCambio } from '../services/apiService.js';
import { getClientePorCedula, buscarClientePorCriterio as buscarClientePorCriterioService, getClientes } from '../services/clientesService.js';
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
const descuentoPorcentaje = ref(false);

// Función para generar el estado inicial del formulario
const getInitialVentaState = () => ({
  cliente_cedula: '',
  cliente_nombre: '',
  cliente_apellido: '',
  cliente_telefono: '',
  cliente_email: '',
  cliente_direccion: '',
  metodo_pago: '',
  referencia_pago: '',
  tasa_bcv: 36.0,
  entrega_inmediata: false,
  aplica_iva: false,
  monto_descuento_usd: 0,
  monto_delivery_usd: 0,
  comentarios_descuento: '',
  comentarios: '',
  // Campos para abono
  monto_abono: 0,
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

function validarPrecio(index) {
  const item = detallesPedido.value[index];
  
  if (item.precio_unitario < 0) {
    item.precio_unitario = 0;
  }
}

// Funciones de búsqueda de clientes
async function buscarClientePorCedula() {
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
  // Buscar en la lista de clientes cargada
  const cliente = clientes.value.find(c => 
    c.cedula_rif.toLowerCase() === cedula.toLowerCase()
  );
  
  if (cliente) {
    console.log('Cliente encontrado:', cliente);
    return cliente;
  }
  
  console.log('Cliente no encontrado para cédula:', cedula);
  return null;
}

async function buscarClientePorCriterio(criterio) {
  // Buscar en la lista de clientes cargada
  const cliente = clientes.value.find(c => 
    c.cedula_rif.toLowerCase().includes(criterio.toLowerCase()) ||
    c.nombre.toLowerCase().includes(criterio.toLowerCase()) ||
    c.apellido.toLowerCase().includes(criterio.toLowerCase()) ||
    (c.telefono && c.telefono.includes(criterio))
  );
  
  if (cliente) {
    console.log('Cliente encontrado:', cliente);
    return cliente;
  }
  
  console.log('Cliente no encontrado para criterio:', criterio);
  return null;
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
  }).then((result) => {
    if (result.isConfirmed) {
      const cliente = result.value;
      venta.value.cliente_cedula = cliente.cedula;
      venta.value.cliente_nombre = cliente.nombre;
      venta.value.cliente_apellido = cliente.apellido;
      venta.value.cliente_telefono = cliente.telefono;
      venta.value.cliente_email = cliente.email;
      venta.value.cliente_direccion = cliente.direccion;
      
      Swal.fire('¡Éxito!', 'Cliente agregado correctamente', 'success');
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
  if (venta.value.metodo_pago === 'Abono') {
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
    es_abono: venta.value.metodo_pago === 'Abono',
    tipo_pago_abono: venta.value.metodo_pago === 'Abono' ? tipoPagoAbono.value : null,
    
    // Datos para pago simple
    metodo_pago_abono: venta.value.metodo_pago === 'Abono' && tipoPagoAbono.value === 'simple' ? 
      metodoPagoAbono.value : null,
    monto_abono_simple: venta.value.metodo_pago === 'Abono' && tipoPagoAbono.value === 'simple' ? 
      montoAbonoSimple.value : 0,
    
    // Datos para pago mixto
    monto_abono_usd: venta.value.metodo_pago === 'Abono' && tipoPagoAbono.value === 'mixto' ? 
      montoAbonoUSD.value : 0,
    monto_abono_ves: venta.value.metodo_pago === 'Abono' && tipoPagoAbono.value === 'mixto' ? 
      montoAbonoVES.value : 0,
    
    // Total del abono calculado
    total_abono_usd: venta.value.metodo_pago === 'Abono' ? totalAbonoCalculado.value : 0,
    fecha_vencimiento: venta.value.fecha_vencimiento || null,
    
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
fieldset { border: 1px solid #dee2e6 !important; }
legend { font-size: 1rem; font-weight: 600; }
</style>