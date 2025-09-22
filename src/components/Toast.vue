<template>
  <Transition name="toast" appear>
    <div 
      v-if="visible" 
      class="toast-container"
      :class="[
        `toast-${type}`,
        `toast-${position}`,
        { 'toast-closable': closable }
      ]"
      role="alert"
      :aria-live="type === 'error' ? 'assertive' : 'polite'"
    >
      <div class="toast-content">
        <div class="toast-icon">
          <i :class="iconClass"></i>
        </div>
        <div class="toast-body">
          <div v-if="title" class="toast-title">{{ title }}</div>
          <div class="toast-message">{{ message }}</div>
        </div>
        <button 
          v-if="closable" 
          class="toast-close"
          @click="close"
          aria-label="Cerrar notificación"
        >
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div v-if="progress" class="toast-progress">
        <div 
          class="toast-progress-bar" 
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 5000
  },
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  persistent: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const visible = ref(false)
const progress = ref(100)
const timer = ref(null)
const progressTimer = ref(null)

const iconClass = computed(() => {
  const icons = {
    success: 'bi bi-check-circle-fill',
    error: 'bi bi-exclamation-triangle-fill',
    warning: 'bi bi-exclamation-circle-fill',
    info: 'bi bi-info-circle-fill'
  }
  return icons[props.type] || icons.info
})

function startTimer() {
  if (props.persistent || props.duration <= 0) return
  
  // Timer para ocultar
  timer.value = setTimeout(() => {
    close()
  }, props.duration)
  
  // Timer para progreso
  const progressInterval = 50 // Actualizar cada 50ms
  const totalSteps = props.duration / progressInterval
  let currentStep = 0
  
  progressTimer.value = setInterval(() => {
    currentStep++
    progress.value = Math.max(0, 100 - (currentStep / totalSteps) * 100)
    
    if (currentStep >= totalSteps) {
      clearInterval(progressTimer.value)
    }
  }, progressInterval)
}

function close() {
  visible.value = false
  
  // Limpiar timers
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
  
  if (progressTimer.value) {
    clearInterval(progressTimer.value)
    progressTimer.value = null
  }
  
  // Emitir evento después de la animación
  setTimeout(() => {
    emit('close')
  }, 300)
}

function pauseTimer() {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
  
  if (progressTimer.value) {
    clearInterval(progressTimer.value)
    progressTimer.value = null
  }
}

function resumeTimer() {
  if (!props.persistent && props.duration > 0) {
    startTimer()
  }
}

onMounted(() => {
  visible.value = true
  startTimer()
})

onUnmounted(() => {
  if (timer.value) clearTimeout(timer.value)
  if (progressTimer.value) clearInterval(progressTimer.value)
})

// Exponer métodos para control externo
defineExpose({
  close,
  pauseTimer,
  resumeTimer
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 9999;
  max-width: 400px;
  min-width: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  margin: 1rem;
}

.toast-top-left {
  top: 0;
  left: 0;
}

.toast-top-right {
  top: 0;
  right: 0;
}

.toast-top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.toast-bottom-left {
  bottom: 0;
  left: 0;
}

.toast-bottom-right {
  bottom: 0;
  right: 0;
}

.toast-bottom-center {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  gap: 0.75rem;
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.2rem;
}

.toast-success .toast-icon {
  color: #28a745;
  background: rgba(40, 167, 69, 0.1);
}

.toast-error .toast-icon {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
}

.toast-warning .toast-icon {
  color: #ffc107;
  background: rgba(255, 193, 7, 0.1);
}

.toast-info .toast-icon {
  color: #17a2b8;
  background: rgba(23, 162, 184, 0.1);
}

.toast-body {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.toast-message {
  font-size: 0.85rem;
  color: #6c757d;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: #6c757d;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background: rgba(108, 117, 125, 0.1);
  color: #495057;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
}

.toast-progress-bar {
  height: 100%;
  background: currentColor;
  transition: width 0.05s linear;
}

.toast-success .toast-progress-bar {
  background: #28a745;
}

.toast-error .toast-progress-bar {
  background: #dc3545;
}

.toast-warning .toast-progress-bar {
  background: #ffc107;
}

.toast-info .toast-progress-bar {
  background: #17a2b8;
}

/* Animaciones */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

/* Responsive */
@media (max-width: 768px) {
  .toast-container {
    max-width: calc(100vw - 2rem);
    min-width: auto;
    margin: 0.5rem;
  }
  
  .toast-content {
    padding: 0.75rem;
  }
  
  .toast-title {
    font-size: 0.85rem;
  }
  
  .toast-message {
    font-size: 0.8rem;
  }
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .toast-container {
    background: #2c3e50;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .toast-title {
    color: #ecf0f1;
  }
  
  .toast-message {
    color: #bdc3c7;
  }
  
  .toast-close {
    color: #bdc3c7;
  }
  
  .toast-close:hover {
    background: rgba(189, 195, 199, 0.1);
    color: #ecf0f1;
  }
}
</style>
