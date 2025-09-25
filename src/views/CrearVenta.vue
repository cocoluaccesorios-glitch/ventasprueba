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
              <label class="search-label">Buscar Cliente</label>
              <div class="search-input-wrapper">
                <!-- Estado de búsqueda normal -->
                <div v-if="!clienteSeleccionado" class="search-state">
                  <i class="bi bi-search search-icon"></i>
                  <input 
                    type="text" 
                    class="client-search-input" 
                    v-model="clienteSearchQuery"
                    @input="buscarClientesEnTiempoReal"
                    @focus="mostrarResultados = true"
                    @blur="ocultarResultadosConDelay"
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
                <div v-else class="selected-client-display">
                  <i class="bi bi-person-check-fill selected-icon"></i>
                  <div class="selected-client-info">
                    <span class="selected-client-name">{{ clienteSeleccionado.nombre }} {{ clienteSeleccionado.apellido }}</span>
                    <span class="selected-client-cedula">{{ clienteSeleccionado.cedula_rif }}</span>
                  </div>
                  <button 
                    type="button" 
                    class="remove-selected-client-btn"
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
                  @mousedown.prevent
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
                  <input type="number" class="price-input readonly-input" 
                         v-model.number="precioSeleccionado" step="0.01" min="0"
                         readonly
                         placeholder="">
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
                      <input type="number" class="table-price-input readonly" 
                           v-model.number="item.precio_unitario" step="0.01" min="0"
                         readonly
                         placeholder="">
                  </td>
                    
                    <!-- Columna Subtotal -->
                    <td class="subtotal-cell">
                      <div class="subtotal-amount">
                        {{ (item.cantidad * item.precio_unitario).toFixed(2) }}
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
              
              <!-- Segunda fila: Tipo de Pago, Método de Pago, Referencia -->
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
                      <option value="Mixto">Mixto</option>
              </select>
                    <i class="bi bi-chevron-down select-icon"></i>
            </div>
          </div>
                
                <!-- Método de Pago (solo si NO es abono y NO es mixto) -->
                <div v-if="venta.tipo_pago !== 'Abono' && venta.tipo_pago !== 'Mixto'" class="form-group payment-method-group">
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
              </select>
                    <i class="bi bi-chevron-down select-icon"></i>
        </div>
                </div>
                
                <!-- Referencia (solo para métodos que la requieren y NO es abono y NO es mixto) -->
                <div v-if="requiereReferencia && venta.tipo_pago !== 'Abono' && venta.tipo_pago !== 'Mixto'" class="form-group reference-group">
                  <label class="modern-label">
                    <i class="bi bi-hash"></i>
                    Referencia *
                  </label>
                  <div class="input-container">
                    <input type="text" class="modern-input" 
                           v-model="venta.referencia_pago" 
                           placeholder="Número de referencia"
                           required>
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
                        <input type="number" class="amount-input" 
                               v-model.number="montoAbonoSimple" step="0.01" min="0.01"
                               :max="metodoPagoAbono.includes('USD') ? totalVenta : totalVenta * venta.tasa_bcv"
                               placeholder=""
                               required>
                        <!-- Conversión de moneda -->
                        <div v-if="conversionAbonoSimple" class="conversion-display">
                          {{ conversionAbonoSimple }}
                        </div>
                      </div>
                      
                      <!-- Referencia para abono (solo si el método la requiere) -->
                      <div v-if="requiereReferenciaAbono" class="form-group reference-group">
                        <label class="modern-label">
                          <i class="bi bi-hash"></i>
                          Referencia del Abono *
                        </label>
                        <div class="input-container">
                          <input type="text" class="modern-input" 
                                 v-model="venta.referencia_pago" 
                                 placeholder="Número de referencia del abono"
                                 required>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                  
                  <!-- Pago Mixto -->
                  <div v-if="tipoPagoAbono === 'mixto'" class="mixed-payment-section">
                    
                    <!-- Pago en Dólares -->
                    <div class="payment-block usd-block">
                      <div class="block-header">
                        <i class="bi bi-currency-dollar"></i>
                        <span>Pago en Dólares</span>
                      </div>
                      <div class="block-content">
                        <div class="form-group">
                          <label class="modern-label">Monto USD</label>
                          <input type="number" class="amount-input" 
                                 v-model.number="montoAbonoUSD" step="0.01" min="0"
                                 :max="totalVenta"
                                 placeholder="Ej: 50.00">
                        </div>
                        <div class="form-group">
                          <label class="modern-label">Método de Pago</label>
                          <select class="form-select" v-model="metodoPagoAbonoUSD">
                            <option value="">Seleccionar método</option>
                            <option v-for="opcion in opcionesMetodoPagoUSD" :key="opcion.value" :value="opcion.value">
                              {{ opcion.label }}
                            </option>
                          </select>
                        </div>
                        <div v-if="necesitaReferenciaAbonoUSD" class="form-group">
                          <label class="modern-label">Referencia</label>
                          <input type="text" class="form-control" 
                                 v-model="referenciaAbonoUSD"
                                 :placeholder="getPlaceholderReferencia(metodoPagoAbonoUSD)">
                        </div>
                      </div>
                    </div>
                    
                    <!-- Conversión de Monedas -->
                    <div class="conversion-block">
                      <div class="block-header">
                        <i class="bi bi-arrow-repeat"></i>
                        <span>Conversión de Monedas</span>
                      </div>
                      <div class="block-content">
                        <div class="conversion-toggle">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" 
                                   v-model="conversionActiva" 
                                   id="conversionToggle">
                            <label class="form-check-label" for="conversionToggle">
                              Conversión automática
                            </label>
                          </div>
                        </div>
                        <div v-if="conversionActiva" class="conversion-fields">
                          <div class="form-group">
                            <label class="modern-label">Monto a convertir</label>
                            <div class="input-with-convert">
                              <input type="number" class="amount-input" 
                                     v-model.number="montoConversion" step="0.01" min="0"
                                     placeholder="Ej: 20.00">
                              <span class="currency-label">USD</span>
                            </div>
                          </div>
                          <div class="convert-button-container">
                            <button type="button" class="convert-btn" 
                                    @click="convertirMonto"
                                    :disabled="!montoConversion || montoConversion <= 0">
                              <i class="bi bi-arrow-down"></i>
                              Convertir
                            </button>
                          </div>
                          <div class="conversion-result">
                            <span class="result-label">Resultado:</span>
                            <span class="result-value">{{ resultadoConversion.toFixed(2) }} Bs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Pago en Bolívares -->
                    <div class="payment-block ves-block">
                      <div class="block-header">
                        <i class="bi bi-currency-exchange"></i>
                        <span>Pago en Bolívares</span>
                      </div>
                      <div class="block-content">
                        <div class="form-group">
                          <label class="modern-label">Monto VES</label>
                          <input type="number" class="amount-input" 
                                 v-model.number="montoAbonoVES" step="0.01" min="0"
                                 :max="totalVenta * venta.tasa_bcv"
                                 placeholder="Ej: 5000.00">
                        </div>
                        <div class="form-group">
                          <label class="modern-label">Método de Pago</label>
                          <select class="form-select" v-model="metodoPagoAbonoVES">
                            <option value="">Seleccionar método</option>
                            <option v-for="opcion in opcionesMetodoPagoVES" :key="opcion.value" :value="opcion.value">
                              {{ opcion.label }}
                            </option>
                          </select>
                        </div>
                        <div v-if="necesitaReferenciaAbonoVES" class="form-group">
                          <label class="modern-label">Referencia</label>
                          <input type="text" class="form-control" 
                                 v-model="referenciaAbonoVES"
                                 :placeholder="getPlaceholderReferencia(metodoPagoAbonoVES)">
                        </div>
                      </div>
                    </div>
                    
                    <!-- Resumen del Abono -->
                    <div class="abono-summary">
                      <div class="summary-header">
                        <i class="bi bi-calculator"></i>
                        <span>Resumen del Abono</span>
                      </div>
                      <div class="summary-content">
                        <div class="summary-item">
                          <span class="summary-label">Abono USD:</span>
                          <span class="summary-value usd-value">${{ (montoAbonoUSD || 0).toFixed(2) }}</span>
                        </div>
                        <div class="summary-item">
                          <span class="summary-label">Abono VES:</span>
                          <span class="summary-value ves-value">
                            {{ (montoAbonoVES || 0).toFixed(2) }} Bs 
                            <span class="equivalent">(${{ ((montoAbonoVES || 0) / venta.tasa_bcv).toFixed(2) }} USD)</span>
                          </span>
                        </div>
                        <div class="summary-item total-item">
                          <span class="summary-label">Total Abono:</span>
                          <span class="summary-value total-value">
                            ${{ (totalAbonoMixtoCalculado || 0).toFixed(2) }} USD
                          </span>
                        </div>
                        <div class="summary-item">
                          <span class="summary-label">Saldo Pendiente:</span>
                          <span class="summary-value pending-value">
                            ${{ (totalVenta - totalAbonoMixtoCalculado).toFixed(2) }} USD
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Métodos de Pago para Abono Mixto -->
                  </div>
                </div>
              </div>
              
              <!-- Configuración de Pago Mixto -->
              <div v-if="venta.tipo_pago === 'Mixto'" class="mixed-payment-section">
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
                      
                      <div class="form-group">
                        <label class="modern-label">
                          <i class="bi bi-currency-exchange"></i>
                          Monto en VES *
                        </label>
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
                  
                  <!-- Métodos de Pago Mixtos -->
                  <div class="mixed-payment-methods-section">
                    <div class="form-row">
                      <!-- Método de Pago USD (si hay monto USD) -->
                      <div v-if="montoMixtoUSD > 0" class="form-group">
                        <label class="modern-label">
                          <i class="bi bi-credit-card"></i>
                          Método de Pago USD *
                        </label>
                        <select 
                          class="modern-input" 
                          v-model="metodoPagoMixtoUSD" 
                          required>
                          <option value="">-- Seleccione --</option>
                          <option 
                            v-for="opcion in opcionesMetodoPagoUSD" 
                            :key="opcion.value" 
                            :value="opcion.value">
                            {{ opcion.label }}
                </option>
              </select>
            </div>
                      
                      <!-- Método de Pago VES (si hay monto VES) -->
                      <div v-if="montoMixtoVES > 0" class="form-group">
                        <label class="modern-label">
                          <i class="bi bi-credit-card"></i>
                          Método de Pago VES *
                        </label>
                        <select 
                          class="modern-input" 
                          v-model="metodoPagoMixtoVES" 
                          required>
                          <option value="">-- Seleccione --</option>
                          <option 
                            v-for="opcion in opcionesMetodoPagoVES" 
                            :key="opcion.value" 
                            :value="opcion.value">
                            {{ opcion.label }}
                          </option>
                        </select>
          </div>
        </div>
                </div>
                  
                  <!-- Referencias Múltiples para Pago Mixto -->
                  <div class="mixed-references-section">
                    <div class="form-row">
                      <!-- Referencia USD (si hay monto USD y método requiere referencia) -->
                      <div v-if="montoMixtoUSD > 0 && metodoPagoMixtoUSD === 'zelle'" class="form-group">
                        <label class="modern-label">
                          <i class="bi bi-hash"></i>
                          Referencia USD *
                        </label>
                        <input type="text" class="modern-input" 
                               v-model="referenciaMixtoUSD" 
                               placeholder="Referencia del pago en USD"
                               required>
                </div>
                      
                      <!-- Referencia VES (si hay monto VES y método requiere referencia) -->
                      <div v-if="montoMixtoVES > 0 && (metodoPagoMixtoVES === 'pago_movil' || metodoPagoMixtoVES === 'transferencia')" class="form-group">
                        <label class="modern-label">
                          <i class="bi bi-hash"></i>
                          Referencia VES *
                        </label>
                        <input type="text" class="modern-input" 
                               v-model="referenciaMixtoVES" 
                               placeholder="Referencia del pago en VES"
                               required>
          </div>
        </div>
                  </div>
                  
                  <!-- Resumen del Pago Mixto -->
                  <div class="mixed-total-section">
                    <div class="mixed-total-card">
                      <div class="total-item">
                        <span class="total-label">USD</span>
                        <span class="total-value">{{ (montoMixtoUSD || 0).toFixed(2) }}</span>
                      </div>
                      <div class="total-item">
                        <span class="total-label">VES</span>
                        <span class="total-value">Bs {{ (montoMixtoVES || 0).toFixed(2) }}</span>
                      </div>
                      <div class="total-item highlight">
                        <span class="total-label">Total USD</span>
                        <span class="total-value">{{ totalMixtoCalculado.toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Información del Pago Mixto -->
                  <div class="installment-info">
                    <div class="info-card">
                      <div class="info-item">
                        <span class="info-label">Total de la Venta:</span>
                        <span class="info-value">{{ totalVenta.toFixed(2) }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Monto USD:</span>
                        <span class="info-value">{{ (montoMixtoUSD || 0).toFixed(2) }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Monto VES:</span>
                        <span class="info-value">Bs {{ (montoMixtoVES || 0).toFixed(2) }}</span>
                      </div>
                      <div class="info-item highlight">
                        <span class="info-label">Total Mixto:</span>
                        <span class="info-value">{{ totalMixtoCalculado.toFixed(2) }}</span>
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
              <span class="calc-value">{{ subtotal.toFixed(2) }}</span>
            </div>
            
            <!-- Descuento (solo si aplica) -->
            <div v-if="venta.monto_descuento_usd > 0" class="calc-row discount-row">
              <span class="calc-label">Descuento</span>
              <span class="calc-value discount-value">-{{ montoDescuentoCalculado.toFixed(2) }}</span>
            </div>
            
            <!-- IVA (solo si aplica) -->
            <div v-if="venta.aplica_iva && ivaCalculado > 0" class="calc-row iva-row">
              <span class="calc-label">IVA (16%)</span>
              <span class="calc-value iva-value">{{ ivaCalculado.toFixed(2) }}</span>
            </div>
            
            <!-- Delivery (solo si aplica) -->
            <div v-if="venta.monto_delivery_usd > 0" class="calc-row delivery-row">
              <span class="calc-label">Delivery</span>
                <span class="calc-value delivery-value">{{ (venta.monto_delivery_usd || 0).toFixed(2) }}</span>
            </div>
            
            <!-- Total USD -->
            <div class="calc-row total-row">
              <span class="calc-label">Total USD</span>
              <span class="calc-value total-value">${{ totalVenta.toFixed(2) }}</span>
            </div>
            
            <!-- Total VES -->
            <div class="calc-row total-row ves-row">
              <span class="calc-label">Total VES</span>
              <span class="calc-value total-value ves-value">Bs {{ totalVES.toFixed(2) }}</span>
            </div>
            
            <!-- Tasa BCV (Automática) -->
            <div class="calc-row rate-row">
              <span class="calc-label">Tasa BCV</span>
              <div class="rate-display-container">
                <span class="rate-value">{{ venta.tasa_bcv.toFixed(2) }}</span>
                <span class="rate-currency">Bs/USD</span>
                <button 
                  @click="actualizarTasaBCV" 
                  class="btn-update-rate"
                  :disabled="isUpdatingRate"
                  title="Actualizar tasa del BCV"
                >
                  <span v-if="!isUpdatingRate">🔄</span>
                  <span v-else>⏳</span>
                </button>
              </div>
            </div>
            
            <!-- Total en Bolívares (solo para métodos VES o mixto) -->
            <div v-if="esMetodoVES || venta.tipo_pago === 'Mixto'" class="calc-row ves-row">
              <span class="calc-label">Total en Bolívares</span>
              <span class="calc-value ves-value">Bs. {{ totalVES.toFixed(2) }}</span>
            </div>
          </div>
          
          <!-- Información de Pago -->
          <div class="payment-info-section">
            <!-- Método de Pago Normal -->
            <div v-if="venta.metodo_pago !== 'Mixto'" class="payment-method-info">
              <span class="info-label">Método:</span>
              <span class="info-value">{{ venta.metodo_pago || 'No seleccionado' }}</span>
            </div>
            
            <!-- Desglose Pago Mixto -->
            <div v-if="venta.metodo_pago === 'Mixto'" class="mixed-payment-breakdown">
              <div class="mixed-method-title">
                <span class="info-label">Método: Mixto</span>
              </div>
              <div class="mixed-amounts-display">
                <div class="mixed-amount-item">
                  <span class="currency-label">USD:</span>
                  <span class="currency-value">{{ (montoMixtoUSD || 0).toFixed(2) }}</span>
                  <span class="method-detail">({{ metodoPagoMixtoUSD === 'zelle' ? 'Zelle' : 'Efectivo' }})</span>
                </div>
                <div class="mixed-amount-item">
                  <span class="currency-label">VES:</span>
                  <span class="currency-value">Bs. {{ (montoMixtoVES || 0).toFixed(2) }}</span>
                  <span class="method-detail">({{ metodoPagoMixtoVES === 'pago_movil' ? 'Pago Móvil' : 'Transferencia' }})</span>
                </div>
              </div>
            </div>
            
            <div v-if="venta.referencia_pago" class="payment-reference-info">
              <span class="info-label">Ref:</span>
              <span class="info-value">{{ venta.referencia_pago }}</span>
            </div>
            
            <!-- Referencias Mixtas -->
            <div v-if="venta.metodo_pago === 'Mixto'" class="mixed-references">
              <div v-if="referenciaMixtoUSD && metodoPagoMixtoUSD === 'zelle'" class="ref-item">
                <span class="ref-label">Ref USD:</span>
                <span class="ref-value">{{ referenciaMixtoUSD }}</span>
              </div>
              <div v-if="referenciaMixtoVES && (metodoPagoMixtoVES === 'pago_movil' || metodoPagoMixtoVES === 'transferencia')" class="ref-item">
                <span class="ref-label">Ref VES:</span>
                <span class="ref-value">{{ referenciaMixtoVES }}</span>
              </div>
            </div>
            
            <div class="delivery-status-info">
              <span class="info-label">Entrega:</span>
              <span class="info-value">{{ venta.entrega_inmediata ? 'Inmediata' : 'Programada' }}</span>
            </div>
          </div>
        </div>
        </div>
      </div>
      
      <!-- Sección de Comentarios -->
      <div class="comments-section">
        <div class="comments-header">
          <div class="comments-icon">
            <i class="bi bi-chat-text"></i>
          </div>
          <div class="comments-title">
            <h3>Comentarios</h3>
            <p>Notas adicionales</p>
          </div>
        </div>
        
        <div class="comments-content">
          <div class="form-group">
            <label class="modern-label">
              <i class="bi bi-pencil"></i>
              Comentarios
            </label>
            <textarea 
              class="modern-textarea" 
              v-model="venta.comentarios" 
              placeholder="Agregar comentarios sobre la venta..."
              rows="4"
              maxlength="500">
            </textarea>
            <div class="character-count">
              {{ venta.comentarios.length }}/500 caracteres
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

/* Estado de cliente seleccionado en el campo de búsqueda */
.selected-client-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border: 2px solid #28a745;
  border-radius: 8px;
  padding: 0.75rem;
  min-height: 48px;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.15);
}

.selected-icon {
  color: #28a745;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.selected-client-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.selected-client-name {
  font-weight: 700;
  color: #155724;
  font-size: 1rem;
}

.selected-client-cedula {
  font-weight: 600;
  color: #28a745;
  font-size: 0.9rem;
}

.remove-selected-client-btn {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid #dc3545;
  border-radius: 6px;
  padding: 0.5rem;
  color: #dc3545;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
}

.remove-selected-client-btn:hover {
  background: rgba(220, 53, 69, 0.2);
  transform: scale(1.05);
}

.remove-selected-client-btn i {
  font-size: 1rem;
}

/* Información del Cliente Seleccionado - Muy Compacto */

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
  grid-template-columns: 2fr 1fr; /* Dos columnas: formulario más ancho, resumen más estrecho */
  gap: 2rem;
  align-items: start;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px; /* Padding uniforme */
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
  top: 2rem; /* Posición sticky para seguir el scroll */
  width: 100%; /* Ancho completo de la columna del grid */
  height: calc(100vh - 4rem); /* Altura fija para ocupar toda la pantalla disponible */
  overflow-y: auto; /* Barra de desplazamiento vertical */
  overflow-x: hidden; /* Sin barra horizontal */
  display: flex;
  flex-direction: column;
}

/* Panel de resumen - distribución del contenido */
.summary-panel {
  display: flex;
  flex-direction: column;
  height: 100%; /* Usar toda la altura disponible */
}

.summary-content {
  flex: 1; /* Ocupar el espacio disponible */
  display: flex;
  flex-direction: column;
}

/* Sección de comentarios */
.comments-section {
  margin-top: auto; /* Empujar hacia abajo */
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.comments-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.comments-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.comments-icon i {
  font-size: 1.5rem;
  color: white;
}

.comments-title h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.2;
}

.comments-title p {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.comments-content {
  padding: 0;
}

.modern-textarea {
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #2c3e50;
  background: white;
  transition: all 0.3s ease;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.modern-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: #f8f9ff;
}

.modern-textarea::placeholder {
  color: #adb5bd;
  font-weight: 400;
}

.character-count {
  text-align: right;
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.5rem;
  font-weight: 500;
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
  margin-bottom: 1.5rem; /* Aumentado para mejor separación */
  overflow: visible; /* Asegurar que el contenido sea visible */
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

/* Subtotal más pequeño */
.calc-row:first-child .calc-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.calc-row:first-child .calc-value {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 600;
}

/* Delivery, Descuento e IVA más pequeños */
.discount-row .calc-label,
.discount-row .discount-value,
.iva-row .calc-label,
.iva-row .iva-value,
.delivery-row .calc-label,
.delivery-row .delivery-value {
  font-size: 0.9rem;
  font-weight: 600;
}

/* Descuento en rojo */
.discount-row .calc-label {
  color: #6c757d;
}

.discount-row .discount-value {
  color: #dc3545;
  font-weight: 600;
}

/* IVA y Delivery en gris */
.iva-row .calc-label,
.iva-row .iva-value,
.delivery-row .calc-label,
.delivery-row .delivery-value {
  color: #6c757d;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* Tasa BCV - Simplificado sin recuadro */
.rate-row {
  background: transparent; /* Sin fondo */
  border: none; /* Sin borde */
  padding: 0.5rem 0; /* Padding mínimo */
  margin-top: 0.5rem;
  margin-bottom: 0.5rem; /* Margen reducido */
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rate-value {
  color: #495057; /* Color más discreto */
  font-weight: 600; /* Peso reducido */
}

/* Tasa BCV Display */
.rate-display-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0; /* Evitar que se comprima */
}

.rate-currency {
  color: #495057; /* Color más discreto */
  font-weight: 600; /* Peso reducido */
  font-size: 0.9rem;
}

.btn-update-rate {
  background: transparent; /* Sin fondo */
  border: 1px solid #dee2e6; /* Borde discreto */
  border-radius: 4px;
  padding: 0.25rem; /* Padding reducido */
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem; /* Tamaño de fuente reducido */
  color: #6c757d; /* Color más discreto */
  min-width: 32px; /* Ancho mínimo reducido */
  height: 32px; /* Altura reducida */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* Evitar que se comprima */
}

.btn-update-rate:hover:not(:disabled) {
  background: #f8f9fa; /* Fondo discreto al hover */
  border-color: #adb5bd; /* Borde más visible al hover */
  transform: none; /* Sin transformación */
}

.btn-update-rate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-update-rate:disabled span {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Total en Bolívares - Misma estructura que Total USD */
.ves-row {
  background: #fff3e0;
  border: 2px solid #ff9800;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 0.5rem;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ves-row .calc-label {
  font-size: inherit; /* Usar el mismo tamaño que .calc-label base */
  color: #212529;
  font-weight: 600; /* Usar el mismo peso que .calc-label base */
}

.ves-value {
  color: #f57c00;
  font-weight: 700; /* Usar el mismo peso que .calc-value base */
  font-size: inherit; /* Usar el mismo tamaño que .calc-value base */
}

.total-label {
  font-size: 1.3rem;
  color: #212529;
  font-weight: 800;
}

.total-value {
  font-size: 1.4rem;
  color: #28a745;
  font-weight: 800;
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
@media (max-width: 1200px) {
  .centered-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .summary-container {
    position: static;
    height: auto; /* Altura automática en pantallas pequeñas */
    max-height: none;
  }
  
  .summary-panel {
    height: auto; /* Altura automática en pantallas pequeñas */
  }
}

@media (max-width: 768px) {
  .centered-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0 15px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .summary-container {
    position: static;
    height: auto; /* Altura automática en móviles */
    max-height: none;
  }
  
  .summary-panel {
    height: auto; /* Altura automática en móviles */
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

.table-price-input.readonly {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  border-color: #e9ecef;
}

.table-price-input.readonly:focus {
  border-color: #e9ecef;
  box-shadow: none;
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

/* Sección de métodos de pago mixtos */
.mixed-payment-methods-section {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.mixed-payment-methods-section .form-row {
  gap: 1rem;
}

/* Total del abono mixto */
.mixed-references-section {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.mixed-references-section .form-row {
  gap: 1rem;
}

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
import { ref, onMounted, computed, watch } from 'vue';
import { getProducts, createSale, getTasaCambio } from '../services/apiService.js';
import { buscarClientePorCedula, buscarClientesPorNombre, crearCliente, getClientes } from '../services/clientService.js';
import { actualizarTasaBCV as actualizarTasaBCVService } from '../services/bcvService.js';
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
const isUpdatingRate = ref(false);
const productSearchRef = ref(null);
const clientSearchRef = ref(null);

// Variables para cálculos
const descuentoPorcentaje = ref(true); // Por defecto porcentaje
const quiereDelivery = ref(false);
const quiereDescuento = ref(false);

// Función para actualizar delivery
function actualizarDelivery() {
  if (venta.value.monto_delivery_usd < 0) {
    venta.value.monto_delivery_usd = 0;
  }
}

// Función para generar el estado inicial del formulario
const getInitialVentaState = () => ({
  cliente_id: null, // Agregar cliente_id
  cliente_cedula: '',
  cliente_nombre: '',
  cliente_apellido: '',
  cliente_telefono: '',
  cliente_email: '',
  cliente_direccion: '',
  tipo_pago: '',
  metodo_pago: '',
  referencia_pago: '',
  tasa_bcv: 166.58,
  entrega_inmediata: false,
  aplica_iva: false,
  monto_descuento_usd: null,
  monto_delivery_usd: null,
  comentarios_descuento: '',
  comentarios: '',
  // Campos para abono
  monto_abono: null
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
  console.log('🔍 Tasa obtenida en onMounted:', tasa);
  if (tasa) {
    venta.value.tasa_bcv = tasa;
    console.log('✅ Tasa asignada a venta.value.tasa_bcv:', venta.value.tasa_bcv);
  } else {
    // Usar tasa por defecto si no hay tasa en la base de datos
    venta.value.tasa_bcv = 166.58;
    console.log('⚠️ Usando tasa por defecto:', venta.value.tasa_bcv);
  }
  console.log('✅ Carga de datos completada');
});

// Watcher para verificar cambios en el cliente
watch(() => venta.value.cliente_cedula, (nuevaCedula) => {
  console.log('🔄 Cliente cedula cambió:', nuevaCedula);
});

watch(() => venta.value.cliente_nombre, (nuevoNombre) => {
  console.log('🔄 Cliente nombre cambió:', nuevoNombre);
});

watch(() => venta.value.cliente_id, (nuevoId) => {
  console.log('🔄 Cliente ID cambió:', nuevoId);
});

// Watchers para actualizar precios automáticamente
watch(productoSeleccionado, (nuevoProducto) => {
  if (nuevoProducto) {
    precioSeleccionado.value = nuevoProducto.precio_usd;
  }
});

// Watcher para limpiar delivery cuando se desmarca
watch(quiereDelivery, (nuevoValor) => {
  if (!nuevoValor) {
    venta.value.monto_delivery_usd = null;
  }
});

// Watcher para limpiar descuento cuando se desmarca
watch(quiereDescuento, (nuevoValor) => {
  if (!nuevoValor) {
    venta.value.monto_descuento_usd = null;
  }
});

// Watcher para sincronizar tipo_pago con metodo_pago
watch(() => venta.value.tipo_pago, (nuevoTipo) => {
  if (nuevoTipo === 'Mixto') {
    venta.value.metodo_pago = 'Mixto';
  } else if (nuevoTipo === 'Abono') {
    venta.value.metodo_pago = 'Abono';
  } else if (nuevoTipo === 'Contado') {
    // Para contado, limpiar metodo_pago para que se seleccione manualmente
    if (venta.value.metodo_pago === 'Mixto' || venta.value.metodo_pago === 'Abono') {
      venta.value.metodo_pago = '';
    }
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

// Verificar si el método de pago es en VES
const esMetodoVES = computed(() => {
  if (!venta.value.metodo_pago) return false;
  return venta.value.metodo_pago.toLowerCase().includes('ves');
});

// Verificar si el método de pago del abono requiere referencia
const requiereReferenciaAbono = computed(() => {
  if ((venta.value.tipo_pago !== 'Abono' && venta.value.metodo_pago !== 'Abono') || !metodoPagoAbono.value) return false;
  const metodosConReferencia = ['zelle', 'pago móvil', 'transferencia'];
  return metodosConReferencia.some(metodo => 
    metodoPagoAbono.value.toLowerCase().includes(metodo.toLowerCase())
  );
});

// Validaciones dinámicas
const requiereReferencia = computed(() => {
  const metodosConReferencia = ['zelle', 'pago móvil', 'transferencia'];
  return metodosConReferencia.some(metodo => 
    venta.value.metodo_pago.toLowerCase().includes(metodo.toLowerCase())
  );
});

const requiereComentariosDescuento = computed(() => {
  return venta.value.monto_descuento_usd > 0;
});

// Validación para referencias múltiples en pago mixto
const requiereReferenciasMixtas = computed(() => {
  if (venta.value.tipo_pago !== 'Mixto') return false;
  
  const necesitaReferenciaUSD = montoMixtoUSD.value > 0 && 
    metodoPagoMixtoUSD.value === 'zelle' && 
    !referenciaMixtoUSD.value.trim();
  
  const necesitaReferenciaVES = montoMixtoVES.value > 0 && 
    (metodoPagoMixtoVES.value === 'pago_movil' || metodoPagoMixtoVES.value === 'transferencia') && 
    !referenciaMixtoVES.value.trim();
  
  return necesitaReferenciaUSD || necesitaReferenciaVES;
});

// Validación para abono con pago mixto
const requiereReferenciasAbonoMixto = computed(() => {
  if (venta.value.tipo_pago !== 'Abono' || tipoPagoAbono.value !== 'mixto') return false;
  
  const necesitaReferenciaUSD = montoAbonoUSD.value > 0 && 
    metodoPagoAbonoUSD.value === 'zelle' && 
    !referenciaAbonoUSD.value.trim();
  
  const necesitaReferenciaVES = montoAbonoVES.value > 0 && 
    (metodoPagoAbonoVES.value === 'pago_movil' || metodoPagoAbonoVES.value === 'transferencia') && 
    !referenciaAbonoVES.value.trim();
  
  return necesitaReferenciaUSD || necesitaReferenciaVES;
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
const metodoPagoAbonoUSD = ref('');
const metodoPagoAbonoVES = ref('');
const referenciaAbonoUSD = ref('');
const referenciaAbonoVES = ref('');

// Variables para pago mixto independiente
const montoMixtoUSD = ref(0);
const montoMixtoVES = ref(0);

// Variables para referencias múltiples en pago mixto
const referenciaMixtoUSD = ref('');
const referenciaMixtoVES = ref('');

// Variables para métodos de pago mixtos
const metodoPagoMixtoUSD = ref('');
const metodoPagoMixtoVES = ref('');

// Variables para conversión de monedas
const conversionActiva = ref(false);
const montoConversion = ref(0);
const resultadoConversion = ref(0);

// Función para convertir monto
function convertirMonto() {
  const monto = montoConversion.value || 0;
  const tasaBCV = venta.value.tasa_bcv || 0;
  
  if (monto > 0 && tasaBCV > 0) {
    resultadoConversion.value = parseFloat((monto * tasaBCV).toFixed(2));
    console.log(`💱 Conversión: $${monto} USD = ${resultadoConversion.value} Bs`);
  }
}

// Función para obtener placeholder de referencia
function getPlaceholderReferencia(metodo) {
  switch (metodo) {
    case 'zelle':
      return 'Ej: 1234567890';
    case 'efectivo':
      return 'Efectivo - Sin referencia';
    case 'pago_movil':
      return 'Ej: 04141234567';
    case 'transferencia':
      return 'Ej: 12345678901234567890';
    default:
      return 'Ingresa la referencia';
  }
}

// Computed para validar si necesita referencia USD
const necesitaReferenciaAbonoUSD = computed(() => {
  return metodoPagoAbonoUSD.value && metodoPagoAbonoUSD.value !== 'efectivo';
});

// Computed para validar si necesita referencia VES
const necesitaReferenciaAbonoVES = computed(() => {
  return metodoPagoAbonoVES.value && metodoPagoAbonoVES.value !== 'efectivo';
});

// Cálculo del total del abono mixto
const totalAbonoMixtoCalculado = computed(() => {
  const montoUSD = montoAbonoUSD.value || 0;
  const montoVES = montoAbonoVES.value || 0;
  const tasaBCV = venta.value.tasa_bcv || 0;
  
  // Convertir VES a USD y sumar con USD
  const montoVESEnUSD = tasaBCV > 0 ? montoVES / tasaBCV : 0;
  const totalAbono = montoUSD + montoVESEnUSD;
  
  console.log(`💰 Abono Mixto: $${montoUSD} USD + ${montoVES} Bs ($${montoVESEnUSD.toFixed(2)} USD) = $${totalAbono.toFixed(2)} USD`);
  
  return parseFloat(totalAbono.toFixed(2));
});

// Opciones de métodos de pago para USD
const opcionesMetodoPagoUSD = [
  { value: 'zelle', label: 'Zelle' },
  { value: 'efectivo', label: 'Efectivo' }
];

// Opciones de métodos de pago para VES
const opcionesMetodoPagoVES = [
  { value: 'pago_movil', label: 'Pago Móvil' },
  { value: 'transferencia', label: 'Transferencia' }
];

// Cálculos para pago simple
const conversionAbonoSimple = computed(() => {
  if (!montoAbonoSimple.value || montoAbonoSimple.value <= 0) return '';
  
  const tasaBCV = venta.value.tasa_bcv || 166.58;
  
  // Los métodos en USD son: Efectivo y Zelle
  const metodosUSD = ['efectivo', 'zelle'];
  const esMetodoUSD = metodosUSD.some(metodo => 
    metodoPagoAbono.value.toLowerCase().includes(metodo)
  );
  
  if (esMetodoUSD) {
    const montoVES = montoAbonoSimple.value * tasaBCV;
    return `Equivale a Bs. ${montoVES.toFixed(2)}`;
  } else {
    // Es método VES (Pago Móvil, Transferencia)
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
    // Los métodos en USD son: Efectivo y Zelle
    // Los métodos en VES son: Pago Móvil y Transferencia
    const metodosUSD = ['efectivo', 'zelle'];
    const esMetodoUSD = metodosUSD.some(metodo => 
      metodoPagoAbono.value.toLowerCase().includes(metodo)
    );
    
    if (esMetodoUSD) {
      return montoAbonoSimple.value || 0;
    } else {
      // Es método VES (Pago Móvil, Transferencia)
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

// Funciones para cálculo automático del abono mixto
// NOTA: En abono mixto NO se calcula el restante, solo se registra el monto del abono
function calcularRestanteAbonoUSD() {
  // En abono mixto, no calculamos automáticamente el restante
  // El usuario ingresa manualmente los montos USD y VES del abono
  // Solo validamos que no exceda el total de la venta
  if (totalAbonoCalculado.value > totalVenta.value) {
    console.warn('⚠️ El abono no puede exceder el total de la venta');
  }
}

function calcularRestanteAbonoVES() {
  // En abono mixto, no calculamos automáticamente el restante
  // El usuario ingresa manualmente los montos USD y VES del abono
  // Solo validamos que no exceda el total de la venta
  if (totalAbonoCalculado.value > totalVenta.value) {
    console.warn('⚠️ El abono no puede exceder el total de la venta');
  }
}

// Saldo pendiente actualizado
const saldoPendiente = computed(() => {
  return Math.max(0, totalVenta.value - totalAbonoCalculado.value);
});

// Computed properties para controlar visibilidad de referencias
const requiereReferenciaUSD = computed(() => {
  return metodoPagoAbonoUSD.value && 
         metodoPagoAbonoUSD.value !== 'Efectivo (USD)';
});

const requiereReferenciaVES = computed(() => {
  return metodoPagoAbonoVES.value && 
         metodoPagoAbonoVES.value !== 'Punto de Venta (VES)';
});

const requiereReferenciaAbonoMixto = computed(() => {
  return requiereReferenciaUSD.value || requiereReferenciaVES.value;
});

// Validación de abono mejorada
const esAbonoValido = computed(() => {
  if (venta.value.tipo_pago !== 'Abono' && venta.value.metodo_pago !== 'Abono') return true;
  
  if (tipoPagoAbono.value === 'simple') {
    const montoValido = montoAbonoSimple.value > 0 && totalAbonoCalculado.value <= totalVenta.value;
    const metodoValido = metodoPagoAbono.value !== '';
    const referenciaValida = !requiereReferenciaAbono.value || (venta.value.referencia_pago && venta.value.referencia_pago.trim());
    return montoValido && metodoValido && referenciaValida;
  } else {
    const montoValido = (montoAbonoUSD.value > 0 || montoAbonoVES.value > 0) && 
                       totalAbonoCalculado.value <= totalVenta.value;
    
    // Validar que si hay monto USD, tenga método de pago USD
    const metodoUSDValido = montoAbonoUSD.value <= 0 || metodoPagoAbonoUSD.value !== '';
    
    // Validar que si hay monto VES, tenga método de pago VES
    const metodoVESValido = montoAbonoVES.value <= 0 || metodoPagoAbonoVES.value !== '';
    
    // Validar referencias cuando aplique
    const requiereReferenciaUSDValida = metodoPagoAbonoUSD.value && 
                                       metodoPagoAbonoUSD.value !== 'Efectivo (USD)' && 
                                       montoAbonoUSD.value > 0;
    const referenciaUSDValida = !requiereReferenciaUSDValida || referenciaAbonoUSD.value.trim() !== '';
    
    const requiereReferenciaVESValida = metodoPagoAbonoVES.value && 
                                       metodoPagoAbonoVES.value !== 'Punto de Venta (VES)' && 
                                       montoAbonoVES.value > 0;
    const referenciaVESValida = !requiereReferenciaVESValida || referenciaAbonoVES.value.trim() !== '';
    
    return montoValido && metodoUSDValido && metodoVESValido && referenciaUSDValida && referenciaVESValida;
  }
});

// Validación para pago mixto independiente
const esMixtoValido = computed(() => {
  if (!venta.value.metodo_pago || venta.value.metodo_pago !== 'Mixto') return true;
  
  // Validar que al menos un monto esté ingresado
  const tieneMontos = montoMixtoUSD.value > 0 || montoMixtoVES.value > 0;
  
  // Validar que si hay monto USD, tenga método de pago
  const metodoPagoUSDValido = montoMixtoUSD.value <= 0 || metodoPagoMixtoUSD.value !== '';
  
  // Validar que si hay monto VES, tenga método de pago
  const metodoPagoVESValido = montoMixtoVES.value <= 0 || metodoPagoMixtoVES.value !== '';
  
  // Validar que el total no exceda el total de la venta (con tolerancia para precisión decimal)
  const totalValido = totalMixtoCalculado.value <= totalVenta.value + 0.01;
  
  // Validar referencias si son requeridas
  const referenciaUSDValida = montoMixtoUSD.value <= 0 || 
    metodoPagoMixtoUSD.value !== 'zelle' || 
    referenciaMixtoUSD.value.trim() !== '';
  
  const referenciaVESValida = montoMixtoVES.value <= 0 || 
    (metodoPagoMixtoVES.value !== 'pago_movil' && metodoPagoMixtoVES.value !== 'transferencia') || 
    referenciaMixtoVES.value.trim() !== '';
  
  return tieneMontos && metodoPagoUSDValido && metodoPagoVESValido && totalValido && referenciaUSDValida && referenciaVESValida;
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
    position: 'center',
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
        venta.value.cliente_id = null; // Nuevo cliente, sin ID aún
        venta.value.cliente_cedula = result.value.cedula;
        venta.value.cliente_nombre = result.value.nombre;
        venta.value.cliente_apellido = result.value.apellido;
        venta.value.cliente_telefono = result.value.telefono;
        venta.value.cliente_email = result.value.email;
        venta.value.cliente_direccion = result.value.direccion;
        
        // Actualizar la lista de clientes
        clientes.value = await getClientes();
        
        Swal.fire({
          title: '¡Éxito!',
          text: 'Cliente creado y seleccionado',
          icon: 'success',
          position: 'center'
        });
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
    Swal.fire({
      title: 'Atención',
      text: 'Selecciona un producto y una cantidad válida.',
      icon: 'warning',
      position: 'center'
    });
    return;
  }
  
  if (cantidadSeleccionada.value > productoSeleccionado.value.stock_actual) {
    Swal.fire({
      title: 'Stock Insuficiente',
      text: `Solo quedan ${productoSeleccionado.value.stock_actual} unidades.`,
      icon: 'error',
      position: 'center'
    });
    return;
  }
  
  if (precioSeleccionado.value <= 0) {
    Swal.fire({
      title: 'Error',
      text: 'El precio debe ser mayor a 0.',
      icon: 'error',
      position: 'center'
    });
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
  if (!productoManual.value.descripcion || !productoManual.value.descripcion.trim() || productoManual.value.cantidad < 1 || productoManual.value.precio <= 0) {
    Swal.fire({
      title: 'Error',
      text: 'Completa todos los campos del producto manual.',
      icon: 'error',
      position: 'center'
    });
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
    cancelButtonText: 'Cancelar',
    position: 'center'
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

// Función para validar la tasa BCV
function validarTasaBCV() {
  if (venta.value.tasa_bcv < 0) {
    venta.value.tasa_bcv = 166.58;
  }
  if (!venta.value.tasa_bcv || venta.value.tasa_bcv === 0) {
    venta.value.tasa_bcv = 166.58;
  }
}

// Función para actualizar la tasa BCV automáticamente
async function actualizarTasaBCV() {
  try {
    isUpdatingRate.value = true;
    
    const nuevaTasa = await actualizarTasaBCVService();
    venta.value.tasa_bcv = nuevaTasa;
    
    showSuccess(`Tasa BCV actualizada: ${nuevaTasa.toFixed(2)} Bs/USD`);
    
  } catch (error) {
    console.error('Error al actualizar tasa BCV:', error);
    showError('No se pudo actualizar la tasa BCV. Usando tasa actual.');
  } finally {
    isUpdatingRate.value = false;
  }
}

// Funciones de búsqueda de clientes
async function buscarClientePorCedulaLocal() {
  if (!venta.value.cliente_cedula || !venta.value.cliente_cedula.trim()) return;
  
  try {
    // Buscar cliente por cédula
    const clienteEncontrado = await buscarClienteEnBD(venta.value.cliente_cedula);
    if (clienteEncontrado) {
      venta.value.cliente_nombre = clienteEncontrado.nombre;
      venta.value.cliente_apellido = clienteEncontrado.apellido;
      venta.value.cliente_telefono = clienteEncontrado.telefono;
      venta.value.cliente_email = clienteEncontrado.email;
      venta.value.cliente_direccion = clienteEncontrado.direccion;
      
      // Cliente encontrado silenciosamente (sin alerta)
      console.log('✅ Cliente encontrado:', `${clienteEncontrado.nombre} ${clienteEncontrado.apellido}`);
    } else {
      // Mostrar mensaje de que no se encontró
      Swal.fire({
        title: 'Cliente No Encontrado',
        text: 'No se encontró un cliente con esa cédula. Puedes crear uno nuevo.',
        icon: 'info',
        confirmButtonText: 'Crear Nuevo Cliente',
        showCancelButton: true,
        position: 'center'
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
      icon: 'error',
      position: 'center'
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
      console.log(`📋 Datos del cliente:`, cliente);
    }
    
    return match;
  });
  
  resultadosBusqueda.value = resultados.slice(0, 10);
  console.log('📋 Resultados finales:', resultadosBusqueda.value.length, 'clientes');
}

function seleccionarCliente(cliente) {
  console.log('👤 Seleccionando cliente:', cliente);
  console.log('📋 Campos del cliente:', {
    id: cliente.id,
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    cedula_rif: cliente.cedula_rif,
    telefono: cliente.telefono,
    email: cliente.email,
    direccion: cliente.direccion
  });
  
  // Verificar que el cliente tenga los campos necesarios
  if (!cliente.cedula_rif) {
    console.error('❌ Error: El cliente no tiene cedula_rif');
    console.log('📋 Cliente completo:', JSON.stringify(cliente, null, 2));
    showError('Error', 'El cliente seleccionado no tiene cédula válida.');
    return;
  }
  
  // Llenar los campos del formulario
  venta.value.cliente_id = cliente.id;
  venta.value.cliente_cedula = cliente.cedula_rif; // Usar cedula_rif del cliente
  venta.value.cliente_nombre = cliente.nombre;
  venta.value.cliente_apellido = cliente.apellido;
  venta.value.cliente_telefono = cliente.telefono;
  venta.value.cliente_email = cliente.email;
  venta.value.cliente_direccion = cliente.direccion;
  
  console.log('✅ Cliente asignado a venta:', {
    cliente_id: venta.value.cliente_id,
    cliente_nombre: venta.value.cliente_nombre,
    cliente_apellido: venta.value.cliente_apellido,
    cliente_cedula: venta.value.cliente_cedula
  });
  
  // Limpiar búsqueda y ocultar resultados
  clienteSearchQuery.value = '';
  resultadosBusqueda.value = [];
  mostrarResultados.value = false;
  
  // Cliente seleccionado silenciosamente (sin alerta)
  console.log('✅ Cliente seleccionado:', `${cliente.nombre} ${cliente.apellido}`);
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
  
  // Cliente removido silenciosamente (sin alerta)
  console.log('✅ Cliente removido');
}

function ocultarResultadosConDelay() {
  // Delay más largo para permitir el click en los resultados
  setTimeout(() => {
    mostrarResultados.value = false;
  }, 300);
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
        venta.value.cliente_id = clienteEncontrado.id; // Agregar cliente_id
        venta.value.cliente_cedula = clienteEncontrado.cedula_rif;
        venta.value.cliente_nombre = clienteEncontrado.nombre;
        venta.value.cliente_apellido = clienteEncontrado.apellido;
        venta.value.cliente_telefono = clienteEncontrado.telefono;
        venta.value.cliente_email = clienteEncontrado.email;
        venta.value.cliente_direccion = clienteEncontrado.direccion;
        
        // Cliente encontrado silenciosamente (sin alerta)
        console.log('✅ Cliente encontrado:', `${clienteEncontrado.nombre} ${clienteEncontrado.apellido}`);
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
    position: 'center',
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
      try {
        const cliente = result.value;
        
        // Crear el cliente en la base de datos
        const nuevoCliente = await crearCliente(cliente);
        
        if (nuevoCliente) {
          // Asignar el cliente creado al formulario de venta
          venta.value.cliente_id = nuevoCliente.id;
          venta.value.cliente_cedula = cliente.cedula;
          venta.value.cliente_nombre = cliente.nombre;
          venta.value.cliente_apellido = cliente.apellido;
          venta.value.cliente_telefono = cliente.telefono;
          venta.value.cliente_email = cliente.email;
          venta.value.cliente_direccion = cliente.direccion;
          
          // Actualizar la lista de clientes
          clientes.value = await getClientes();
          
          Swal.fire({
            title: '¡Éxito!',
            text: 'Cliente creado y agregado correctamente',
            icon: 'success',
            position: 'center'
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo crear el cliente',
            icon: 'error',
            position: 'center'
          });
        }
      } catch (error) {
        console.error('Error al crear cliente:', error);
        Swal.fire({
          title: 'Error',
          text: 'Error al crear el cliente',
          icon: 'error',
          position: 'center'
        });
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
  metodoPagoAbonoUSD.value = '';
  metodoPagoAbonoVES.value = '';
  referenciaAbonoUSD.value = '';
  referenciaAbonoVES.value = '';
  
  // Limpiar campos de conversión
  conversionActiva.value = false;
  montoConversion.value = 0;
  resultadoConversion.value = 0;
  
  // Limpiar campos de pago mixto independiente
  montoMixtoUSD.value = 0;
  montoMixtoVES.value = 0;
  referenciaMixtoUSD.value = '';
  referenciaMixtoVES.value = '';
  metodoPagoMixtoUSD.value = '';
  metodoPagoMixtoVES.value = '';
  
  // Limpiar checkboxes de servicios
  quiereDelivery.value = false;
  quiereDescuento.value = false;
  descuentoPorcentaje.value = true; // Por defecto porcentaje
}

async function handleSubmit() {
  // Validaciones
  if (detallesPedido.value.length === 0) {
      await showError('Error', 'Debes añadir al menos un producto.');
    return;
  }
  
  if (!venta.value.cliente_cedula || !venta.value.cliente_cedula.trim() || !venta.value.cliente_nombre || !venta.value.cliente_nombre.trim()) {
    console.log('❌ Validación de cliente falló:');
    console.log('   cliente_cedula:', venta.value.cliente_cedula);
    console.log('   cliente_nombre:', venta.value.cliente_nombre);
    console.log('   cliente_apellido:', venta.value.cliente_apellido);
    console.log('   cliente_id:', venta.value.cliente_id);
    showError('Error', 'Cédula y nombre del cliente son obligatorios.');
    return;
  }
  
  if (!venta.value.metodo_pago && !venta.value.tipo_pago) {
      await Swal.fire({
        title: 'Error',
        text: 'Debes seleccionar un método de pago.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        position: 'center'
      });
    return;
  }
  
  // Validación dinámica de referencia
  if (requiereReferencia.value && (!venta.value.referencia_pago || !venta.value.referencia_pago.trim())) {
      await Swal.fire({
        title: 'Error',
        text: 'La referencia es obligatoria para este método de pago.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        position: 'center'
      });
    return;
  }
  
  // Validación de referencias múltiples para pago mixto
  if (requiereReferenciasMixtas.value) {
    let mensajeError = 'Error en las referencias del pago mixto:';
    
    if (montoMixtoUSD.value > 0 && metodoPagoMixtoUSD.value === 'zelle' && (!referenciaMixtoUSD.value || !referenciaMixtoUSD.value.trim())) {
      mensajeError += '\n• La referencia USD es obligatoria para Zelle';
    }
    
    if (montoMixtoVES.value > 0 && (metodoPagoMixtoVES.value === 'pago_movil' || metodoPagoMixtoVES.value === 'transferencia') && (!referenciaMixtoVES.value || !referenciaMixtoVES.value.trim())) {
      mensajeError += '\n• La referencia VES es obligatoria para Pago Móvil/Transferencia';
    }
    
    await Swal.fire({
      title: 'Error',
      text: mensajeError,
      icon: 'error',
      confirmButtonText: 'Entendido',
      position: 'center'
    });
    return;
  }
  
  // Validación dinámica de comentarios por descuento
  if (requiereComentariosDescuento.value && (!venta.value.comentarios || !venta.value.comentarios.trim())) {
      await Swal.fire({
        title: 'Error',
        text: 'Los comentarios son obligatorios cuando se aplica descuento.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        position: 'center'
      });
    return;
  }
  
  // Si hay descuento, usar los comentarios generales como motivo del descuento
  if (venta.value.monto_descuento_usd > 0 && venta.value.comentarios && venta.value.comentarios.trim()) {
    venta.value.comentarios_descuento = venta.value.comentarios;
  }
  
  if (venta.value.tasa_bcv <= 0) {
      await Swal.fire({
        title: 'Error',
        text: 'La tasa BCV debe ser mayor a 0.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        position: 'center'
      });
    return;
  }
  
  // Validaciones específicas para abono mejorado
  if (venta.value.tipo_pago === 'Abono' || venta.value.metodo_pago === 'Abono') {
    if (!esAbonoValido.value) {
      let mensajeError = 'Error en la configuración del abono:';
      
      if (tipoPagoAbono.value === 'simple') {
        if (!metodoPagoAbono.value) mensajeError += '\n• Debe seleccionar un método de pago';
        if (montoAbonoSimple.value <= 0) mensajeError += '\n• El monto del abono debe ser mayor a 0';
        if (requiereReferenciaAbono.value && (!venta.value.referencia_pago || !venta.value.referencia_pago.trim())) mensajeError += '\n• La referencia del abono es obligatoria';
      } else {
        if (montoAbonoUSD.value <= 0 && montoAbonoVES.value <= 0) {
          mensajeError += '\n• Debe ingresar al menos un monto (USD o VES)';
        }
      }
      
      if (totalAbonoCalculado.value > totalVenta.value) {
        mensajeError += `\n• El total del abono ($${totalAbonoCalculado.value.toFixed(2)}) no puede exceder el total de la venta ($${totalVenta.value.toFixed(2)})`;
      }
      
      await Swal.fire({
        title: 'Error',
        text: mensajeError,
        icon: 'error',
        confirmButtonText: 'Entendido',
        position: 'center'
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
      
      if (montoMixtoUSD.value > 0 && !metodoPagoMixtoUSD.value) {
        mensajeError += '\n• Debe seleccionar un método de pago para USD';
      }
      
      if (montoMixtoVES.value > 0 && !metodoPagoMixtoVES.value) {
        mensajeError += '\n• Debe seleccionar un método de pago para VES';
      }
      
      if (montoMixtoUSD.value > 0 && metodoPagoMixtoUSD.value === 'zelle' && !referenciaMixtoUSD.value.trim()) {
        mensajeError += '\n• La referencia para Zelle (USD) es obligatoria';
      }
      
      if (montoMixtoVES.value > 0 && (metodoPagoMixtoVES.value === 'pago_movil' || metodoPagoMixtoVES.value === 'transferencia') && !referenciaMixtoVES.value.trim()) {
        mensajeError += '\n• La referencia para ' + (metodoPagoMixtoVES.value === 'pago_movil' ? 'Pago Móvil' : 'Transferencia') + ' (VES) es obligatoria';
      }
      
      // Usar tolerancia de 0.01 para errores de precisión decimal
      if (totalMixtoCalculado.value > totalVenta.value + 0.01) {
        mensajeError += `\n• El total del pago mixto ($${totalMixtoCalculado.value.toFixed(2)}) no puede ser mayor al total de la venta ($${totalVenta.value.toFixed(2)})`;
      }
      
      await Swal.fire({
        title: 'Error',
        text: mensajeError,
        icon: 'error',
        confirmButtonText: 'Entendido',
        position: 'center'
      });
      return;
    }
  }
  
  isSubmitting.value = true;
  
  console.log('🔍 Tasa BCV antes de enviar:', venta.value.tasa_bcv);
  
  const payload = {
    // Datos del cliente
    cliente_id: venta.value.cliente_id, // Agregar cliente_id
    cliente_cedula: venta.value.cliente_cedula,
    cliente_nombre: venta.value.cliente_nombre,
    cliente_apellido: venta.value.cliente_apellido,
    cliente_telefono: venta.value.cliente_telefono,
    cliente_email: venta.value.cliente_email,
    cliente_direccion: venta.value.cliente_direccion,
    
    // Configuración de la venta
    metodo_pago: venta.value.tipo_pago === 'Abono' ? 'Abono' : venta.value.metodo_pago,
    tipo_pago: venta.value.tipo_pago || venta.value.metodo_pago, // Asegurar que tipo_pago esté definido
    referencia_pago: venta.value.referencia_pago,
    tasa_bcv: venta.value.tasa_bcv,
    estado_entrega: venta.value.entrega_inmediata ? 'entregado' : 'pendiente',
    aplica_iva: venta.value.aplica_iva,
    
    // Datos del abono mejorado (si aplica)
    es_abono: venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono',
    tipo_pago_abono: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') ? tipoPagoAbono.value : null,
    
    // Datos para pago simple
    metodo_pago_abono: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'simple' ? 
      metodoPagoAbono.value : null,
    monto_abono_simple: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'simple' ? 
      montoAbonoSimple.value : 0,
    
    // Datos para pago mixto
    monto_abono_usd: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
      montoAbonoUSD.value : 0,
    monto_abono_ves: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
      montoAbonoVES.value : 0,
    
    // Referencias para abono mixto (para reportes y cierres de caja)
    // SOLO se envían si es un abono mixto, NO para pago mixto de contado
    referencia_abono_usd: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
      referenciaAbonoUSD.value : null,
    referencia_abono_ves: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
      referenciaAbonoVES.value : null,
    metodo_pago_abono_usd: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
      metodoPagoAbonoUSD.value : null,
    metodo_pago_abono_ves: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') && tipoPagoAbono.value === 'mixto' ? 
      metodoPagoAbonoVES.value : null,
    
    // Total del abono calculado
    total_abono_usd: (venta.value.metodo_pago === 'Abono' || venta.value.tipo_pago === 'Abono') ? totalAbonoCalculado.value : 0,
    
    // Datos del pago mixto independiente (si aplica)
    es_pago_mixto: venta.value.metodo_pago === 'Mixto',
    monto_mixto_usd: venta.value.metodo_pago === 'Mixto' ? montoMixtoUSD.value : 0,
    monto_mixto_ves: venta.value.metodo_pago === 'Mixto' ? montoMixtoVES.value : 0,
    total_mixto_usd: venta.value.metodo_pago === 'Mixto' ? totalMixtoCalculado.value : 0,
    referencia_mixto_usd: venta.value.metodo_pago === 'Mixto' ? referenciaMixtoUSD.value : '',
    referencia_mixto_ves: venta.value.metodo_pago === 'Mixto' ? referenciaMixtoVES.value : '',
    metodo_pago_mixto_usd: venta.value.metodo_pago === 'Mixto' ? metodoPagoMixtoUSD.value : '',
    metodo_pago_mixto_ves: venta.value.metodo_pago === 'Mixto' ? metodoPagoMixtoVES.value : '',
    
    // Totales
    monto_descuento_usd: montoDescuentoCalculado.value || 0,
    monto_delivery_usd: venta.value.monto_delivery_usd || 0,
    monto_iva_usd: ivaCalculado.value || 0,
    subtotal_usd: subtotal.value || 0,
    total_usd: total.value || 0,
    comentarios_descuento: venta.value.comentarios_descuento,
    comentarios_delivery: '',
    comentarios_generales: venta.value.comentarios,
    
    // Productos
    productos: detallesPedido.value.map(item => ({
      id: item.es_manual ? null : item.id, // null para productos manuales
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      nombre: item.nombre,
      sku: item.sku || 'N/A',
      es_manual: item.es_manual || false
    }))
  };
  
  try {
    const resultado = await createSale(payload);
    await Swal.fire({
      title: '¡Venta Registrada!',
      text: `Venta #${resultado} procesada correctamente`,
      icon: 'success',
      confirmButtonText: 'Continuar',
      position: 'center'
    });
    resetForm();
  } catch (error) {
    console.error("Error al procesar la venta:", error);
    await Swal.fire({
      title: 'Error',
      text: `No se pudo procesar la venta: ${error.message}`,
      icon: 'error',
      confirmButtonText: 'Entendido',
      position: 'center'
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>
<style scoped>
/* Estilos para el resumen dinámico */
.payment-info-section {
  margin-top: 1.5rem; /* Aumentado para evitar superposición con rate-row */
  padding-top: 0.75rem;
  border-top: 1px solid #E8F5E8;
  position: relative;
  z-index: 0; /* Z-index menor que rate-row */
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

/* Estilos para desglose de pago mixto */
.mixed-payment-breakdown {
  margin-bottom: 0.5rem;
}

.mixed-method-title {
  margin-bottom: 0.5rem;
}

.mixed-amounts-display {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 0.5rem;
  margin-bottom: 0.25rem;
}

.mixed-amount-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
}

.mixed-amount-item:last-child {
  margin-bottom: 0;
}

.currency-label {
  color: #4A7C4A;
  font-weight: 600;
  min-width: 40px;
}

.currency-value {
  font-weight: 600;
  color: #2d5a2d;
}

.method-detail {
  color: #6c757d;
  font-size: 0.75rem;
  font-style: italic;
}

.mixed-references {
  background: #f1f8f1;
  border-radius: 4px;
  padding: 0.4rem;
  margin-bottom: 0.25rem;
}

.ref-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;
  font-size: 0.8rem;
}

.ref-item:last-child {
  margin-bottom: 0;
}

.ref-label {
  color: #4A7C4A;
  font-weight: 500;
  font-size: 0.75rem;
}

.ref-value {
  color: #666;
  font-family: monospace;
  font-size: 0.75rem;
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

/* Estilos para abono mixto estructurado */
.payment-block {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #dee2e6;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.usd-block {
  border-color: #007bff;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.ves-block {
  border-color: #fd7e14;
  background: linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%);
}

.block-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  font-size: 1.2rem;
  color: #495057;
}

.usd-block .block-header {
  color: #007bff;
}

.ves-block .block-header {
  color: #fd7e14;
}

.block-header i {
  font-size: 1.4rem;
}

.block-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.conversion-block {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border: 2px solid #28a745;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
}

.conversion-block .block-header {
  color: #155724;
}

.conversion-block .block-header i {
  color: #28a745;
}

.conversion-toggle {
  margin-bottom: 1rem;
}

.conversion-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-with-convert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.currency-label {
  background: #28a745;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
}

.convert-button-container {
  display: flex;
  justify-content: center;
}

.convert-btn {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}

.convert-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(40, 167, 69, 0.4);
}

.convert-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.conversion-result {
  background: rgba(40, 167, 69, 0.1);
  border: 1px solid #28a745;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-label {
  font-weight: 600;
  color: #155724;
}

.result-value {
  font-weight: 700;
  color: #28a745;
  font-size: 1.1rem;
}

.abono-summary {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 2px solid #ffc107;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.2);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-weight: 700;
  color: #856404;
  font-size: 1.1rem;
}

.summary-header i {
  color: #ffc107;
  font-size: 1.3rem;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.summary-item.total-item {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border-left-color: #155724;
  font-weight: 700;
}

.summary-label {
  font-weight: 600;
  color: #856404;
  font-size: 0.95rem;
}

.total-item .summary-label {
  color: white;
}

.summary-value {
  font-weight: 700;
  font-size: 1rem;
}

.usd-value {
  color: #007bff;
}

.ves-value {
  color: #fd7e14;
}

.equivalent {
  font-size: 0.85rem;
  font-weight: 500;
  color: #6c757d;
}

.total-value {
  color: white;
  font-size: 1.1rem;
}

.pending-value {
  color: #dc3545;
  font-weight: 700;
}
</style>