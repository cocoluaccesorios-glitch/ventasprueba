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
                  <div class="checkbox-container">
                    <div class="modern-checkbox">
                      <input type="checkbox" id="quiere-iva" v-model="venta.aplica_iva">
                      <label for="quiere-iva">
                        <div class="checkbox-custom">
                          <i class="bi bi-check"></i>
                        </div>
                        <span class="checkbox-label">
                          <i class="bi bi-percent"></i>
                          ¿Quiere IVA/Factura? (16%)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <!-- Descuento -->
                <div class="form-group">
                  <div class="checkbox-container">
                    <div class="modern-checkbox">
                      <input type="checkbox" id="quiere-descuento" v-model="quiereDescuento">
                      <label for="quiere-descuento">
                        <div class="checkbox-custom">
                          <i class="bi bi-check"></i>
                        </div>
                        <span class="checkbox-label">
                          <i class="bi bi-percent"></i>
                          ¿Aplica Descuento?
                        </span>
                      </label>
                    </div>
                  </div>
                  <!-- Campos de descuento solo si está marcado -->
                  <div v-if="quiereDescuento" class="input-container" style="margin-top: 0.5rem;">
                    <div class="discount-toggle">
                      <label class="toggle-label">
                        <input type="checkbox" v-model="descuentoPorcentaje">
                        <span class="toggle-text">Por %</span>
                      </label>
                    </div>
                    <div class="modern-input-group">
                      <i class="bi bi-percent input-icon" v-if="descuentoPorcentaje"></i>
                      <i class="bi bi-currency-dollar input-icon" v-else></i>
                      <input 
                        type="number" 
                        class="modern-input" 
                        v-model.number="venta.monto_descuento_usd" 
                        @input="calcularDescuento"
                        :step="descuentoPorcentaje ? 1 : 0.01"
                        min="0"
                        :max="descuentoPorcentaje ? 100 : subtotal"
                        placeholder=""
                      >
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Segunda fila: Tipo de Pago, Referencia -->
              <div class="form-row">
                <!-- Tipo de Pago -->
                <div class="form-group payment-type-group">
                  <label class="modern-label">
                    <i class="bi bi-credit-card"></i>
                    Tipo de Pago *
                  </label>
                  <div class="select-container">
                    <select class="modern-select" v-model="venta.tipo_pago" required>
                      <option value="">-- Seleccione --</option>
                      <option value="Contado">Contado</option>
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
                </div>
              
              <!-- Tercera fila: Método de Pago (USD) -->
              <div class="form-row" v-if="!esPagoMixto">
                <!-- Método de Pago USD -->
                <div class="form-group payment-method-group">
                  <label class="modern-label">
                    <i class="bi bi-wallet2"></i>
                    Método de Pago USD *
                  </label>
                  <div class="select-container">
                    <select class="modern-select" v-model="venta.metodo_pago_usd" required>
                <option value="">-- Seleccione --</option>
                <option value="Efectivo (USD)">Efectivo (USD)</option>
                <option value="Zelle (USD)">Zelle (USD)</option>
                    </select>
                    <i class="bi bi-chevron-down select-icon"></i>
          </div>
        </div>
                
                <!-- Método de Pago VES -->
                <div class="form-group payment-method-group">
                  <label class="modern-label">
                    <i class="bi bi-wallet2"></i>
                    Método de Pago VES *
                  </label>
                  <div class="select-container">
                    <select class="modern-select" v-model="venta.metodo_pago_ves" required>
                      <option value="">-- Seleccione --</option>
                <option value="Punto de Venta (VES)">Punto de Venta (VES)</option>
                <option value="Pago Móvil (VES)">Pago Móvil (VES)</option>
                <option value="Transferencia (VES)">Transferencia (VES)</option>
              </select>
                    <i class="bi bi-chevron-down select-icon"></i>
            </div>
            </div>
            </div>
              
              <!-- Tercera fila: Método de Pago (Mixto) -->
              <div class="form-row" v-if="esPagoMixto">
                <!-- Método de Pago USD -->
                <div class="form-group payment-method-group">
                  <label class="modern-label">
                    <i class="bi bi-wallet2"></i>
                    Método de Pago USD *
                  </label>
                  <div class="select-container">
                    <select class="modern-select" v-model="venta.metodo_pago_usd" required>
                      <option value="">-- Seleccione --</option>
                      <option value="Efectivo (USD)">Efectivo (USD)</option>
                      <option value="Zelle (USD)">Zelle (USD)</option>
                    </select>
                    <i class="bi bi-chevron-down select-icon"></i>
          </div>
                </div>
                
                <!-- Método de Pago VES -->
                <div class="form-group payment-method-group">
                  <label class="modern-label">
                    <i class="bi bi-wallet2"></i>
                    Método de Pago VES *
                  </label>
                  <div class="select-container">
                    <select class="modern-select" v-model="venta.metodo_pago_ves" required>
                      <option value="">-- Seleccione --</option>
                      <option value="Punto de Venta (VES)">Punto de Venta (VES)</option>
                      <option value="Pago Móvil (VES)">Pago Móvil (VES)</option>
                      <option value="Transferencia (VES)">Transferencia (VES)</option>
                    </select>
                    <i class="bi bi-chevron-down select-icon"></i>
                  </div>
                </div>
              </div>
              
              <!-- Checkbox para Pago Mixto -->
              <div class="form-row">
                <div class="form-group">
                  <div class="checkbox-container">
                    <div class="modern-checkbox">
                      <input type="checkbox" id="pago-mixto" v-model="esPagoMixto">
                      <label for="pago-mixto">
                        <div class="checkbox-custom">
                          <i class="bi bi-check"></i>
                        </div>
                        <span class="checkbox-label">
                          <i class="bi bi-currency-exchange"></i>
                          Pago Mixto (USD + VES)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Configuración de Abono -->
              <div v-if="venta.tipo_pago === 'Abono'" class="installment-section">
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
                                 placeholder=""
                                 required>
                        </div>
                        <!-- Conversión de moneda -->
                        <div v-if="conversionAbonoSimple" class="conversion-display">
                          {{ conversionAbonoSimple }}
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
                                 placeholder="">
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
                                 placeholder="">
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
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Configuración de Pago Mixto -->
              <div v-if="esPagoMixto && venta.tipo_pago === 'Contado'" class="mixed-payment-section">
                <div class="installment-header">
                  <h4>
                    <i class="bi bi-currency-exchange"></i>
                    Configuración de Pago Mixto
                  </h4>
                  <p class="installment-subtitle">Define los montos en USD y VES para el pago mixto</p>
                </div>
                
                <div class="installment-form">
                  <!-- Información de cálculo automático -->
                  <div class="auto-calculation-info">
                    <i class="bi bi-calculator"></i>
                    <span>Cálculo automático: Al ingresar un monto, se calculará automáticamente el restante en la otra moneda</span>
                  </div>
                  
                  <!-- Montos Mixtos -->
                  <div class="mixed-amounts-section">
                    <div class="form-row">
                      <div class="form-group">
                        <label class="modern-label">
                          <i class="bi bi-currency-dollar"></i>
                          Monto en USD *
                        </label>
                        <div class="input-container">
                          <span class="currency-symbol">$</span>
                          <input 
                            type="number" 
                            class="modern-input" 
                            v-model="montoMixtoUSD" 
                            step="0.01" 
                            min="0"
                            placeholder=""
                            @input="calcularRestanteUSD"
                            required>
                        </div>
                      </div>
                      
                      <div class="form-group">
                        <label class="modern-label">
                          <i class="bi bi-currency-exchange"></i>
                          Monto en VES *
                        </label>
                        <div class="input-container">
                          <span class="currency-symbol">Bs</span>
                          <input 
                            type="number" 
                            class="modern-input" 
                            v-model="montoMixtoVES" 
                            step="0.01" 
                            min="0"
                            placeholder=""
                            @input="calcularRestanteVES"
                            required>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Resumen del Pago Mixto -->
                  <div class="mixed-total-section">
                    <div class="mixed-total-card">
                      <div class="total-item">
                        <span class="total-label">USD</span>
                        <span class="total-value">${{ montoMixtoUSD.toFixed(2) }}</span>
                      </div>
                      <div class="total-item">
                        <span class="total-label">VES</span>
                        <span class="total-value">Bs {{ montoMixtoVES.toFixed(2) }}</span>
                      </div>
                      <div class="total-item highlight">
                        <span class="total-label">Total USD</span>
                        <span class="total-value">${{ totalMixtoCalculado.toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Información del Pago Mixto -->
                  <div class="installment-info">
                    <div class="info-card">
                      <div class="info-item">
                        <span class="info-label">Total de la Venta:</span>
                        <span class="info-value">${{ totalVenta.toFixed(2) }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Monto USD:</span>
                        <span class="info-value">${{ montoMixtoUSD.toFixed(2) }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Monto VES:</span>
                        <span class="info-value">Bs {{ montoMixtoVES.toFixed(2) }}</span>
                      </div>
                      <div class="info-item highlight">
                        <span class="info-label">Total Mixto:</span>
                        <span class="info-value">${{ totalMixtoCalculado.toFixed(2) }}</span>
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
                        placeholder=""
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
                        step="1"
                        @input="forzarEnteroManual($event)"
                        @keydown="soloNumeros($event)"
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
          <!-- Cálculos Dinámicos -->
          <div class="calculations-section">
            <!-- Subtotal -->
            <div class="calc-row">
              <span class="calc-label">Subtotal</span>
              <span class="calc-value">${{ subtotal.toFixed(2) }}</span>
                </div>
            
            <!-- Descuento (solo si aplica) -->
            <div v-if="venta.monto_descuento_usd > 0" class="calc-row discount-row">
              <span class="calc-label">Descuento</span>
                <span class="calc-value discount-value">-${{ montoDescuentoCalculado.toFixed(2) }}</span>
            </div>
            
            <!-- IVA (solo si aplica) -->
            <div v-if="venta.aplica_iva && montoIVACalculado > 0" class="calc-row iva-row">
              <span class="calc-label">IVA (16%)</span>
              <span class="calc-value iva-value">${{ montoIVACalculado.toFixed(2) }}</span>
            </div>
            
            <!-- Delivery (solo si aplica) -->
            <div v-if="venta.monto_delivery_usd > 0" class="calc-row delivery-row">
              <span class="calc-label">Delivery</span>
                <span class="calc-value delivery-value">${{ (venta.monto_delivery_usd || 0).toFixed(2) }}</span>
            </div>
            
            <!-- Total -->
            <div class="calc-row total-row">
              <span class="calc-label">Total</span>
              <span class="calc-value total-value">${{ totalVenta.toFixed(2) }}</span>
            </div>
          </div>
          
          <!-- Información de Pago -->
          <div class="payment-info-section">
            <div class="payment-method-info">
              <span class="info-label">Método:</span>
              <span class="info-value">{{ venta.metodo_pago || 'No seleccionado' }}</span>
            </div>
            
            <div v-if="venta.referencia_pago" class="payment-reference-info">
              <span class="info-label">Ref:</span>
              <span class="info-value">{{ venta.referencia_pago }}</span>
            </div>
            
            <div class="delivery-status-info">
              <span class="info-label">Entrega:</span>
              <span class="info-value">{{ venta.entrega_inmediata ? 'Inmediata' : 'Programada' }}</span>
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
  background: linear-gradient(135deg, #F8F9FA 0%, #E8F4FD 100%);
}

/* Header estilo Bootstrap estándar como inventario */
.futuristic-header {
  background: linear-gradient(135deg, #E8F5E8 0%, #F0E6F0 100%);
  border-bottom: 1px solid #D4E6D4;
  padding: 1rem 0;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
}

.centered-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: start;
  max-width: 1400px;
  margin: 0 auto;
  padding-right: 490px; /* Padding reducido 40px más para ensanchar el formulario */
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
  position: fixed;
  top: 200px; /* Justo en la línea que separa la sección de cliente con "Añadir Productos" */
  right: 120px; /* 40 puntos más a la izquierda desde right: 80px */
  width: 480px; /* Más ancho */
  height: fit-content;
  z-index: 1000;
}

.summary-panel {
  background: #fff;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  padding: 1rem;
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
  padding: 0.25rem 0;
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
  background: linear-gradient(135deg, #E8F4FD 0%, #F0E6F0 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(232, 244, 253, 0.3);
  color: #2D5A2D;
  overflow: visible;
  border: 1px solid #D4E6D4;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding-left: 0;
}

.header-icon {
  display: none;
}

.header-icon i {
  font-size: 2rem;
  color: #2D5A2D;
}

.header-content h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2D5A2D;
}

.header-content p {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 1rem;
  color: #4A7C4A;
}

.products-form-container {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  overflow: visible;
  border: 1px solid #D4E6D4;
}

/* ===== NUEVO LAYOUT DEL FORMULARIO DE PRODUCTOS ===== */
.form-group.full-width {
  grid-column: 1 / -1;
}

.form-row-second {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1.5rem;
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
  width: 60px;
  padding: 0.5rem;
  border: 1px solid #D4E6D4;
  border-radius: 0.375rem;
  text-align: center;
  font-size: 0.9rem;
  background: white;
  transition: border-color 0.2s ease;
}

.table-qty-input:focus {
  outline: none;
  border-color: #A8E6A8;
  box-shadow: 0 0 0 0.2rem rgba(168, 230, 168, 0.25);
}

.price-cell {
  width: 20%;
  text-align: right;
}

/* CSS eliminado - ya no se usa price-input-group */

.table-price-input {
  width: 120px;
  padding: 0.5rem;
  border: 1px solid #D4E6D4;
  border-radius: 0.375rem;
  text-align: right;
  font-size: 0.9rem;
  background: white;
  transition: border-color 0.2s ease;
}

.table-price-input:focus {
  outline: none;
  border-color: #A8E6A8;
  box-shadow: 0 0 0 0.2rem rgba(168, 230, 168, 0.25);
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

/* Estilos para sección de pago mixto independiente */
.mixed-payment-section {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Información de cálculo automático */
.auto-calculation-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #E8F5E8 0%, #F0E6F0 100%);
  border: 1px solid #C4E6C4;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #2D5A2D;
}

.auto-calculation-info i {
  color: #4A7C4A;
  font-size: 1rem;
}

.mixed-amounts-section {
  margin-bottom: 1.5rem;
}

.mixed-amounts-section .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 1200px) {
  .summary-container {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    margin-top: 2rem;
  }
  
  .centered-layout {
    padding-right: 30px;
  }
}

@media (max-width: 768px) {
  .mixed-amounts-section .form-row {
    grid-template-columns: 1fr;
  }
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
  background: linear-gradient(135deg, #E8F5E8 0%, #F0E6F0 100%);
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #C4E6C4;
}

.total-label {
  font-size: 0.75rem;
  color: #4A7C4A;
  font-weight: 500;
}

.total-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2D5A2D;
}

.total-item.highlight .total-value {
  color: #2D5A2D;
  font-size: 1rem;
  font-weight: 700;
}

/* Sección de saldo */
.balance-section {
  margin-top: 1rem;
}

.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #E8F5E8 0%, #F0E6F0 100%);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #C4E6C4;
}

.balance-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4A7C4A;
}

.balance-amount {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2D5A2D;
}

.balance-display {
  background: linear-gradient(135deg, #E8F5E8 0%, #F0E6F0 100%);
  border-radius: 8px;
  padding: 0.75rem;
  border: 1px solid #C4E6C4;
  text-align: center;
}

.balance-amount {
  color: #2D5A2D;
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
    width: 50px;
  }
  
  .table-price-input {
    width: 100px;
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
  color: #1a1a1a;
}

.modern-label i {
  margin-right: 0.5rem;
  font-size: 0.8rem;
  color: #333333;
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
  background: linear-gradient(135deg, #A8E6A8 0%, #B8D4B8 100%);
  color: #2D5A2D;
  border: 1px solid #C4E6C4;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #98D698 0%, #A8C4A8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(168, 230, 168, 0.3);
}

.btn-primary:disabled {
  background: #D4E6D4;
  color: #8FA68F;
  cursor: not-allowed;
}

.btn-secondary {
  background: linear-gradient(135deg, #FFE4B5 0%, #F0D4A0 100%);
  color: #8B6914;
  border: 1px solid #F5D4A0;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #F5D4A0 0%, #E6C490 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 228, 181, 0.3);
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
  background: linear-gradient(135deg, #E8F4FD 0%, #D1E7F0 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(232, 244, 253, 0.3);
  color: #1a1a1a;
  border: 1px solid #B8D4E8;
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
  color: #1a1a1a;
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
