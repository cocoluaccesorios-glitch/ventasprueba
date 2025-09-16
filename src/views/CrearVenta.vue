<template>
  <div class="ultra-modern-sales">
    <!-- Header con búsqueda de clientes -->
    <SalesHeader
      :cliente-seleccionado="clienteSeleccionado"
      @cliente-seleccionado="seleccionarCliente"
      @cliente-removido="quitarClienteSeleccionado"
      @nuevo-cliente="nuevoCliente"
    />
    
    <!-- Layout Principal Centrado -->
    <div class="main-container">
      <!-- Contenedor Centrado -->
      <div class="centered-layout">
        <!-- Formulario Principal -->
        <div class="form-container">
          <form @submit.prevent="handleSubmit" class="sales-form">
            
            <!-- Sección Productos -->
            <ProductForm
              :productos="productos"
              :producto-seleccionado="productoSeleccionado"
              :cantidad-seleccionada="cantidadSeleccionada"
              :precio-seleccionado="precioSeleccionado"
              @producto-seleccionado="onProductSelected"
              @producto-limpiado="onProductCleared"
              @cantidad-cambiada="cantidadSeleccionada = $event"
              @precio-cambiado="precioSeleccionado = $event"
              @agregar-producto="agregarProducto"
              @abrir-modal-manual="abrirModalProductoManual"
            />
            
            <!-- Detalles del Pedido -->
            <OrderDetailsTable
              :detalles-pedido="detallesPedido"
              @cantidad-cambiada="validarCantidad"
              @precio-cambiado="validarPrecio"
              @producto-eliminado="eliminarProducto"
            />
            
            <!-- Configuración de Pago y Entrega -->
            <div class="modern-payment-section">
              <div class="section-header">
                <div class="header-icon">
                  <i class="bi bi-credit-card"></i>
                </div>
                <div class="header-text">
                  <h3>Configuración de Pago y Entrega</h3>
                  <p>Define el método de pago y opciones adicionales</p>
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
                  
                  <!-- Referencia de Pago -->
                  <div v-if="requiereReferencia" class="form-group reference-group">
                    <label class="modern-label">
                      <i class="bi bi-hash"></i>
                      Referencia *
                    </label>
                    <input type="text" class="modern-input" 
                           v-model="venta.referencia_pago" 
                           placeholder="Número de referencia"
                           required>
                  </div>
                  
                  <!-- Tasa BCV -->
                  <div class="form-group rate-group">
                    <label class="modern-label">
                      <i class="bi bi-arrow-left-right"></i>
                      Tasa BCV *
                    </label>
                    <input type="number" class="modern-input" 
                           v-model.number="venta.tasa_bcv" step="0.01" min="0" required>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Sección de Abonos -->
            <InstallmentSection
              :es-abono="venta.metodo_pago === 'Abono'"
              :total-venta="total"
              :tasa-b-c-v="venta.tasa_bcv"
              :fecha-vencimiento="venta.fecha_vencimiento"
              @tipo-pago-cambiado="tipoPagoAbono = $event"
              @metodo-pago-cambiado="metodoPagoAbono = $event"
              @monto-simple-cambiado="montoAbonoSimple = $event"
              @monto-usd-cambiado="montoAbonoUSD = $event"
              @monto-ves-cambiado="montoAbonoVES = $event"
              @fecha-vencimiento-cambiada="venta.fecha_vencimiento = $event"
            />
            
            <!-- Opciones Adicionales -->
            <div class="options-row">
              <div class="option-group">
                <div class="modern-checkbox">
                  <input type="checkbox" id="checkIVA" v-model="venta.aplica_iva">
                  <label for="checkIVA">
                    <i class="bi bi-percent"></i>
                    Aplicar IVA (16%)
                  </label>
                </div>
              </div>
              
              <div class="option-group">
                <div class="modern-checkbox">
                  <input type="checkbox" id="checkDelivery" v-model="venta.entrega_inmediata">
                  <label for="checkDelivery">
                    <i class="bi bi-truck"></i>
                    Entrega Inmediata
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Comentarios -->
            <div class="comments-section">
              <div class="form-group">
                <label class="modern-label">
                  <i class="bi bi-chat-text"></i>
                  Comentarios
                </label>
                <textarea class="modern-textarea" 
                          v-model="venta.comentarios"
                          placeholder="Comentarios adicionales sobre la venta..."></textarea>
              </div>
            </div>
          </form>
        </div>
        
        <!-- Panel de Resumen -->
        <div class="summary-panel">
          <div class="summary-header">
            <h3>
              <i class="bi bi-calculator"></i>
              Resumen de Venta
            </h3>
          </div>
          
          <div class="summary-content">
            <!-- Totales -->
            <div class="totals-section">
              <div class="total-item">
                <span class="total-label">Subtotal:</span>
                <span class="total-value">${{ subtotal.toFixed(2) }}</span>
              </div>
              
              <div v-if="venta.monto_descuento_usd > 0" class="total-item discount">
                <span class="total-label">Descuento:</span>
                <span class="total-value">-${{ venta.monto_descuento_usd.toFixed(2) }}</span>
              </div>
              
              <div v-if="venta.aplica_iva" class="total-item">
                <span class="total-label">IVA (16%):</span>
                <span class="total-value">${{ (subtotal * 0.16).toFixed(2) }}</span>
              </div>
              
              <div v-if="venta.monto_delivery_usd > 0" class="total-item">
                <span class="total-label">Delivery:</span>
                <span class="total-value">${{ venta.monto_delivery_usd.toFixed(2) }}</span>
              </div>
              
              <div class="total-item final-total">
                <span class="total-label">Total:</span>
                <span class="total-value">${{ total.toFixed(2) }}</span>
              </div>
            </div>
            
            <!-- Información del Cliente -->
            <div v-if="clienteSeleccionado" class="client-summary">
              <h4>Cliente</h4>
              <div class="client-info">
                <div class="client-name">{{ clienteSeleccionado.nombre }} {{ clienteSeleccionado.apellido }}</div>
                <div class="client-cedula">{{ clienteSeleccionado.cedula_rif }}</div>
              </div>
            </div>
            
            <!-- Método de Pago -->
            <div v-if="venta.metodo_pago" class="payment-summary">
              <h4>Método de Pago</h4>
              <div class="payment-info">
                <div class="payment-method">{{ venta.metodo_pago }}</div>
                <div v-if="venta.referencia_pago" class="payment-reference">
                  Ref: {{ venta.referencia_pago }}
                </div>
              </div>
            </div>
            
            <!-- Botón de Envío -->
            <div class="submit-section">
              <button type="submit" 
                      class="submit-btn"
                      :disabled="isSubmitting"
                      @click="handleSubmit">
                <i v-if="isSubmitting" class="bi bi-hourglass-split"></i>
                <i v-else class="bi bi-check-circle"></i>
                <span>{{ isSubmitting ? 'Procesando...' : 'Registrar Venta' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de Cliente -->
    <ClientModal
      v-if="showClientModal"
      @close="showClientModal = false"
      @cliente-guardado="onClienteGuardado"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSalesForm } from '@/composables/useSalesForm'
import { useInstallments } from '@/composables/useInstallments'
import { useNotifier } from '@/composables/useNotifier'
import SalesHeader from '@/components/SalesHeader.vue'
import ProductForm from '@/components/ProductForm.vue'
import OrderDetailsTable from '@/components/OrderDetailsTable.vue'
import InstallmentSection from '@/components/InstallmentSection.vue'
import ClientModal from '@/components/ClientModal.vue'

// Composables
const {
  venta,
  detallesPedido,
  productoSeleccionado,
  cantidadSeleccionada,
  precioSeleccionado,
  clienteSeleccionado,
  subtotal,
  total,
  requiereReferencia,
  seleccionarCliente,
  quitarClienteSeleccionado,
  onProductSelected,
  onProductCleared,
  agregarProducto,
  eliminarProducto,
  validarCantidad,
  validarPrecio,
  validarFormulario,
  resetForm
} = useSalesForm()

const {
  tipoPagoAbono,
  metodoPagoAbono,
  montoAbonoSimple,
  montoAbonoUSD,
  montoAbonoVES,
  resetInstallments
} = useInstallments()

const { showSuccess, showError } = useNotifier()

// Estado local
const productos = ref([])
const isSubmitting = ref(false)
const showClientModal = ref(false)

// Funciones
async function handleSubmit() {
  try {
    // Validaciones
    const errores = validarFormulario()
    if (errores.length > 0) {
      await showError('Error de Validación', errores.join('\n'))
      return
    }

    // Validaciones específicas para abono
    if (venta.metodo_pago === 'Abono') {
      const erroresAbono = validarAbono(total.value)
      if (erroresAbono.length > 0) {
        await showError('Error en Abono', erroresAbono.join('\n'))
        return
      }
    }

    isSubmitting.value = true

    // Construir payload
    const payload = {
      // Datos del cliente
      cliente_cedula: venta.cliente_cedula,
      cliente_nombre: venta.cliente_nombre,
      cliente_apellido: venta.cliente_apellido,
      cliente_telefono: venta.cliente_telefono,
      cliente_email: venta.cliente_email,
      cliente_direccion: venta.cliente_direccion,
      
      // Configuración de la venta
      metodo_pago: venta.metodo_pago,
      referencia_pago: venta.referencia_pago,
      tasa_bcv: venta.tasa_bcv,
      estado_entrega: venta.entrega_inmediata ? 'entregado' : 'pendiente',
      aplica_iva: venta.aplica_iva,
      
      // Datos del abono (si aplica)
      es_abono: venta.metodo_pago === 'Abono',
      tipo_pago_abono: venta.metodo_pago === 'Abono' ? tipoPagoAbono.value : null,
      metodo_pago_abono: venta.metodo_pago === 'Abono' && tipoPagoAbono.value === 'simple' ? 
        metodoPagoAbono.value : null,
      monto_abono_simple: venta.metodo_pago === 'Abono' && tipoPagoAbono.value === 'simple' ? 
        montoAbonoSimple.value : 0,
      monto_abono_usd: venta.metodo_pago === 'Abono' && tipoPagoAbono.value === 'mixto' ? 
        montoAbonoUSD.value : 0,
      monto_abono_ves: venta.metodo_pago === 'Abono' && tipoPagoAbono.value === 'mixto' ? 
        montoAbonoVES.value : 0,
      total_abono_usd: venta.metodo_pago === 'Abono' ? totalAbonoCalculado.value : 0,
      fecha_vencimiento: venta.fecha_vencimiento || null,
      
      // Totales
      monto_descuento_usd: venta.monto_descuento_usd || 0,
      monto_delivery_usd: venta.monto_delivery_usd || 0,
      monto_iva_usd: venta.aplica_iva ? (venta.subtotal - venta.monto_descuento_usd) * 0.16 : 0,
      comentarios_descuento: venta.comentarios_descuento,
      comentarios_delivery: '',
      comentarios_generales: venta.comentarios,
      
      // Productos
      productos: detallesPedido.value.map(item => ({
        id: item.es_manual ? 'MANUAL' : item.id,
        cantidad: item.cantidad,
        precio: item.precio_unitario,
        nombre: item.nombre,
        descripcion_manual: item.es_manual ? item.nombre : null
      }))
    }

    // Aquí iría la llamada al API
    console.log('Payload para envío:', payload)
    
    // Simular envío exitoso
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    await showSuccess('¡Venta Registrada!', 'La venta se ha registrado exitosamente')
    
    // Reset del formulario
    resetForm()
    resetInstallments()
    
  } catch (error) {
    console.error('Error al procesar venta:', error)
    await showError('Error', 'No se pudo procesar la venta. Inténtalo de nuevo.')
  } finally {
    isSubmitting.value = false
  }
}

function nuevoCliente() {
  showClientModal.value = true
}

function onClienteGuardado(cliente) {
  seleccionarCliente(cliente)
  showClientModal.value = false
}

function abrirModalProductoManual() {
  // Implementar modal de producto manual
  console.log('Abrir modal de producto manual')
}

function validarAbono(totalVenta) {
  const errores = []
  
  if (tipoPagoAbono.value === 'simple') {
    if (!metodoPagoAbono.value) {
      errores.push('Debe seleccionar un método de pago')
    }
    if (montoAbonoSimple.value <= 0) {
      errores.push('El monto del abono debe ser mayor a 0')
    }
  } else {
    if (montoAbonoUSD.value <= 0 && montoAbonoVES.value <= 0) {
      errores.push('Debe ingresar al menos un monto (USD o VES)')
    }
  }
  
  const totalAbono = tipoPagoAbono.value === 'simple' ? 
    (metodoPagoAbono.value.includes('USD') ? montoAbonoSimple.value : montoAbonoSimple.value / venta.tasa_bcv) :
    (montoAbonoUSD.value + (montoAbonoVES.value / venta.tasa_bcv))
    
  if (totalAbono > totalVenta) {
    errores.push(`El total del abono ($${totalAbono.toFixed(2)}) no puede exceder el total de la venta ($${totalVenta.toFixed(2)})`)
  }
  
  return errores
}

const totalAbonoCalculado = computed(() => {
  if (tipoPagoAbono.value === 'simple') {
    if (metodoPagoAbono.value.includes('USD')) {
      return montoAbonoSimple.value || 0
    } else {
      return venta.tasa_bcv > 0 ? (montoAbonoSimple.value || 0) / venta.tasa_bcv : 0
    }
  } else {
    const montoUSD = montoAbonoUSD.value || 0
    const montoVESEnUSD = venta.tasa_bcv > 0 ? (montoAbonoVES.value || 0) / venta.tasa_bcv : 0
    return montoUSD + montoVESEnUSD
  }
})

// Cargar datos iniciales
onMounted(async () => {
  try {
    // Cargar productos desde el servicio
    // productos.value = await cargarProductos()
    console.log('Componente montado, cargando datos...')
  } catch (error) {
    console.error('Error cargando datos iniciales:', error)
  }
})
</script>

<style scoped>
/* ===== ESTILOS PRINCIPALES ===== */
.ultra-modern-sales {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.centered-layout {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 2rem;
  align-items: start;
}

/* Formulario */
.form-container {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.sales-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Secciones */
.modern-payment-section {
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(25, 135, 84, 0.1) 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(40, 167, 69, 0.2);
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
  background: linear-gradient(135deg, #28a745 0%, #198754 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(40, 167, 69, 0.3);
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

/* Formulario de pago */
.payment-form-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  align-items: end;
}

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
  color: #28a745;
  font-size: 0.9rem;
}

.select-container {
  position: relative;
}

.modern-select,
.modern-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  transition: all 0.2s ease;
}

.modern-select:focus,
.modern-input:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}

.select-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
}

/* Opciones adicionales */
.options-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.option-group {
  display: flex;
  align-items: center;
}

.modern-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.modern-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #28a745;
}

.modern-checkbox label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
  cursor: pointer;
}

.modern-checkbox label i {
  color: #28a745;
}

/* Comentarios */
.comments-section {
  margin-top: 1rem;
}

.modern-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 100px;
}

.modern-textarea:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}

/* Panel de resumen */
.summary-panel {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 2rem;
}

.summary-header {
  margin-bottom: 2rem;
}

.summary-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-header h3 i {
  color: #28a745;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Totales */
.totals-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.total-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  background: #f8f9fa;
}

.total-item.discount {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.total-item.final-total {
  background: linear-gradient(135deg, #28a745 0%, #198754 100%);
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
}

.total-label {
  font-weight: 600;
  color: #2c3e50;
}

.total-item.final-total .total-label {
  color: white;
}

.total-value {
  font-weight: 700;
  color: #28a745;
}

.total-item.final-total .total-value {
  color: white;
}

/* Información del cliente */
.client-summary,
.payment-summary {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.client-summary h4,
.payment-summary h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.client-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.client-cedula {
  font-size: 0.85rem;
  color: #6c757d;
}

.payment-method {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.payment-reference {
  font-size: 0.85rem;
  color: #6c757d;
}

/* Botón de envío */
.submit-section {
  margin-top: 1rem;
}

.submit-btn {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #28a745 0%, #198754 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 4px 16px rgba(40, 167, 69, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(40, 167, 69, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.submit-btn i {
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .centered-layout {
    grid-template-columns: 1fr;
  }
  
  .summary-panel {
    position: static;
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 1rem;
  }
  
  .form-container,
  .summary-panel {
    padding: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .options-row {
    grid-template-columns: 1fr;
  }
}
</style>
