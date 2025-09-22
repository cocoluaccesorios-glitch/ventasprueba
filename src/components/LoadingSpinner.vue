<template>
  <div class="loading-container" :class="containerClass">
    <div class="loading-spinner" :class="spinnerClass">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>
    <div v-if="message" class="loading-message">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  color: {
    type: String,
    default: 'primary'
  },
  message: {
    type: String,
    default: ''
  },
  overlay: {
    type: Boolean,
    default: false
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})

const containerClass = computed(() => ({
  'loading-overlay': props.overlay,
  'loading-fullscreen': props.fullscreen,
  [`loading-${props.size}`]: true
}))

const spinnerClass = computed(() => ({
  [`spinner-${props.color}`]: true
}))
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  z-index: 1000;
}

.loading-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  z-index: 9999;
}

.loading-spinner {
  position: relative;
  display: inline-block;
}

.loading-small .loading-spinner {
  width: 24px;
  height: 24px;
}

.loading-medium .loading-spinner {
  width: 40px;
  height: 40px;
}

.loading-large .loading-spinner {
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
}

.spinner-primary .spinner-ring {
  border-top-color: #667eea;
}

.spinner-secondary .spinner-ring {
  border-top-color: #6c757d;
}

.spinner-success .spinner-ring {
  border-top-color: #28a745;
}

.spinner-danger .spinner-ring {
  border-top-color: #dc3545;
}

.spinner-warning .spinner-ring {
  border-top-color: #ffc107;
}

.spinner-info .spinner-ring {
  border-top-color: #17a2b8;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-message {
  font-size: 0.9rem;
  color: #6c757d;
  text-align: center;
  font-weight: 500;
}

.loading-small .loading-message {
  font-size: 0.8rem;
}

.loading-large .loading-message {
  font-size: 1rem;
}

/* Animación de fade in */
.loading-container {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .loading-message {
    font-size: 0.85rem;
    padding: 0 1rem;
  }
}
</style>
