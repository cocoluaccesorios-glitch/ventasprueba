<template>
  <div v-if="esAbono" class="installment-section">
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
                     :max="metodoPagoAbono.includes('USD') ? totalVenta : totalVenta * tasaBCV"
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
                     v-model="fechaVencimiento"
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
                     :max="totalVenta * tasaBCV"
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
                     v-model="fechaVencimiento"
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
            <span class="info-value">{{ fechaVencimiento || 'No especificada' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  esAbono: {
    type: Boolean,
    default: false
  },
  totalVenta: {
    type: Number,
    default: 0
  },
  tasaBCV: {
    type: Number,
    default: 36.0
  },
  fechaVencimiento: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits([
  'tipo-pago-cambiado',
  'metodo-pago-cambiado',
  'monto-simple-cambiado',
  'monto-usd-cambiado',
  'monto-ves-cambiado',
  'fecha-vencimiento-cambiada'
])

// Variables reactivas
const tipoPagoAbono = ref('simple')
const metodoPagoAbono = ref('')
const montoAbonoSimple = ref(0)
const montoAbonoUSD = ref(0)
const montoAbonoVES = ref(0)

// Computed
const fechaMinima = computed(() => {
  const hoy = new Date()
  hoy.setDate(hoy.getDate() + 1) // Mínimo mañana
  return hoy.toISOString().split('T')[0]
})

const conversionAbonoSimple = computed(() => {
  if (!montoAbonoSimple.value || montoAbonoSimple.value <= 0) return ''
  
  if (metodoPagoAbono.value.includes('USD')) {
    const montoVES = montoAbonoSimple.value * props.tasaBCV
    return `Equivale a Bs. ${montoVES.toFixed(2)}`
  } else {
    const montoUSD = montoAbonoSimple.value / props.tasaBCV
    return `Equivale a $${montoUSD.toFixed(2)}`
  }
})

const totalAbonoMixto = computed(() => {
  const montoUSD = montoAbonoUSD.value || 0
  const montoVESEnUSD = props.tasaBCV > 0 ? (montoAbonoVES.value || 0) / props.tasaBCV : 0
  return montoUSD + montoVESEnUSD
})

const totalAbonoCalculado = computed(() => {
  if (tipoPagoAbono.value === 'simple') {
    if (metodoPagoAbono.value.includes('USD')) {
      return montoAbonoSimple.value || 0
    } else {
      return props.tasaBCV > 0 ? (montoAbonoSimple.value || 0) / props.tasaBCV : 0
    }
  } else {
    return totalAbonoMixto.value
  }
})

const saldoPendiente = computed(() => {
  return Math.max(0, props.totalVenta - totalAbonoCalculado.value)
})

// Watchers
watch(tipoPagoAbono, (newValue) => {
  emit('tipo-pago-cambiado', newValue)
})

watch(metodoPagoAbono, (newValue) => {
  emit('metodo-pago-cambiado', newValue)
})

watch(montoAbonoSimple, (newValue) => {
  emit('monto-simple-cambiado', newValue)
})

watch(montoAbonoUSD, (newValue) => {
  emit('monto-usd-cambiado', newValue)
})

watch(montoAbonoVES, (newValue) => {
  emit('monto-ves-cambiado', newValue)
})

watch(() => props.fechaVencimiento, (newValue) => {
  // Sync with parent
})

// Expose computed values for parent
defineExpose({
  tipoPagoAbono,
  metodoPagoAbono,
  montoAbonoSimple,
  montoAbonoUSD,
  montoAbonoVES,
  totalAbonoCalculado,
  saldoPendiente
})
</script>

<style scoped>
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
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.installment-header h4 i {
  color: #28a745;
}

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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.modern-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.modern-label i {
  color: #28a745;
  font-size: 0.9rem;
}

/* Select container */
.select-container {
  position: relative;
}

.modern-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  appearance: none;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.modern-select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
}

.modern-select option {
  background: #2c3e50;
  color: white;
}

.select-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  pointer-events: none;
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

/* Conversión de moneda */
.conversion-display {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0.25rem;
  font-style: italic;
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

/* Información del abono */
.installment-info {
  margin-top: 1.5rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
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
  background: rgba(40, 167, 69, 0.1);
  margin: 0 -1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.info-value {
  font-weight: 700;
  color: white;
  font-size: 0.9rem;
}

.info-item.highlight .info-value {
  color: #28a745;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .payment-type-options {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .mixed-total-card {
    flex-direction: column;
    gap: 1rem;
  }
  
  .installment-section {
    padding: 1rem;
  }
}
</style>
