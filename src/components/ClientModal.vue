<template>
  <div class="modal-overlay" v-if="show" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditing ? '✏️ Editar Cliente' : '➕ Nuevo Cliente' }}</h2>
        <button class="modal-close" @click="closeModal">&times;</button>
      </div>
      
      <form @submit.prevent="saveClient">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Cédula/RIF *</label>
            <input type="text" class="form-control" v-model="clientForm.cedula" 
                   :disabled="isEditing" required>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Nombre *</label>
            <input type="text" class="form-control" v-model="clientForm.nombre" required>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Apellido</label>
            <input type="text" class="form-control" v-model="clientForm.apellido">
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Teléfono</label>
            <input type="tel" class="form-control" v-model="clientForm.telefono">
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" v-model="clientForm.email">
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Dirección</label>
            <input type="text" class="form-control" v-model="clientForm.direccion">
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
            {{ isSaving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Swal from 'sweetalert2';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  client: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'saved']);

const isEditing = ref(false);
const isSaving = ref(false);

const clientForm = ref({
  cedula: '',
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  direccion: ''
});

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.client) {
      isEditing.value = true;
      clientForm.value = { ...props.client };
    } else {
      isEditing.value = false;
      resetForm();
    }
  }
});

function resetForm() {
  clientForm.value = {
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: ''
  };
}

function closeModal() {
  emit('close');
}

async function saveClient() {
  try {
    // Validaciones
    if (!clientForm.value.cedula.trim() || !clientForm.value.nombre.trim()) {
      await Swal.fire({
        title: 'Error',
        text: 'Cédula y nombre son campos obligatorios',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Validar formato de cédula venezolana
    if (!/^[VE]\d{5,8}$/i.test(clientForm.value.cedula)) {
      await Swal.fire({
        title: 'Error',
        text: 'Formato de cédula inválido. Debe ser V12345678 o E12345678',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Validar email si se proporciona
    if (clientForm.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientForm.value.email)) {
      await Swal.fire({
        title: 'Error',
        text: 'Formato de correo electrónico inválido',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    isSaving.value = true;

    // Simular guardado (aquí implementarías la lógica real)
    await new Promise(resolve => setTimeout(resolve, 1000));

    await Swal.fire({
      title: '¡Éxito!',
      text: `Cliente ${isEditing.value ? 'actualizado' : 'creado'} correctamente`,
      icon: 'success',
      confirmButtonText: 'Continuar'
    });

    emit('saved', { ...clientForm.value });
    closeModal();

  } catch (error) {
    console.error('Error al guardar cliente:', error);
    await Swal.fire({
      title: 'Error',
      text: 'No se pudo guardar el cliente',
      icon: 'error',
      confirmButtonText: 'Entendido'
    });
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: var(--color-fondo);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  font-family: var(--font-titulos);
  margin: 0;
  font-size: 22px;
  color: var(--color-texto);
}

.modal-close {
  font-size: 1.8rem;
  cursor: pointer;
  border: none;
  background: none;
  color: var(--gray-dark);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: var(--gray-light);
  color: var(--color-texto);
}

.modal-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
