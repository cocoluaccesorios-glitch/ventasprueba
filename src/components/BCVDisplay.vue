<template>
  <div class="bcv-display">
    <div class="bcv-card">
      <div class="bcv-header">
        <h3>💰 Tasa BCV</h3>
        <button 
          @click="actualizarTasa" 
          :disabled="isLoading"
          class="btn-update"
          :class="{ 'loading': isLoading }"
        >
          <span v-if="!isLoading">🔄</span>
          <span v-else>⏳</span>
        </button>
      </div>
      
      <div class="bcv-content">
        <div class="tasa-display">
          <span class="tasa-value">{{ tasaFormateada }}</span>
          <span class="tasa-currency">Bs/USD</span>
        </div>
        
        <div class="tasa-info">
          <p class="last-updated">
            <span class="label">Tasa del día:</span>
            <span class="value">{{ new Date().toLocaleDateString('es-VE') }}</span>
          </p>
          
          <div v-if="necesitaActualizacion" class="update-warning">
            ⚠️ Nueva tasa disponible para hoy
          </div>
        </div>
      </div>
      
      <div v-if="error" class="error-message">
        ❌ {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBCV } from '../composables/useBCV.js'

const {
  tasaBCV,
  isLoading,
  error,
  tasaFormateada,
  tiempoTranscurrido,
  necesitaActualizacion,
  actualizarTasa
} = useBCV()
</script>

<style scoped>
.bcv-display {
  margin: 1rem 0;
}

.bcv-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.bcv-card:hover {
  transform: translateY(-2px);
}

.bcv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.bcv-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.btn-update {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.2rem;
}

.btn-update:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.btn-update:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-update.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.bcv-content {
  text-align: center;
}

.tasa-display {
  margin-bottom: 1rem;
}

.tasa-value {
  font-size: 2.5rem;
  font-weight: bold;
  display: block;
  line-height: 1;
}

.tasa-currency {
  font-size: 1rem;
  opacity: 0.8;
  margin-left: 0.5rem;
}

.tasa-info {
  font-size: 0.9rem;
  opacity: 0.9;
}

.last-updated {
  margin: 0.5rem 0;
}

.label {
  font-weight: 500;
}

.value {
  margin-left: 0.5rem;
}

.update-warning {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.5);
  border-radius: 6px;
  padding: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.error-message {
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.5);
  border-radius: 6px;
  padding: 0.5rem;
  margin-top: 1rem;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .bcv-card {
    padding: 1rem;
  }
  
  .tasa-value {
    font-size: 2rem;
  }
  
  .bcv-header h3 {
    font-size: 1rem;
  }
}
</style>
