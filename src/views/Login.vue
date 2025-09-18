<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <i class="bi bi-shop"></i>
          <h2>Cocolú Ventas</h2>
        </div>
        <p class="subtitle">Sistema de Gestión de Ventas</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username" class="form-label">
            <i class="bi bi-person"></i>
            Usuario
          </label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            class="form-control"
            :class="{ 'is-invalid': errors.username }"
            placeholder="Ingresa tu usuario"
            required
            autocomplete="username"
          />
          <div v-if="errors.username" class="invalid-feedback">
            {{ errors.username }}
          </div>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">
            <i class="bi bi-lock"></i>
            Contraseña
          </label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="form.password"
              class="form-control"
              :class="{ 'is-invalid': errors.password }"
              placeholder="Ingresa tu contraseña"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <div v-if="errors.password" class="invalid-feedback">
            {{ errors.password }}
          </div>
        </div>

        <div class="form-group">
          <div class="form-check">
            <input
              type="checkbox"
              id="remember"
              v-model="form.remember"
              class="form-check-input"
            />
            <label for="remember" class="form-check-label">
              Recordar mi sesión
            </label>
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-login"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-box-arrow-in-right me-2"></i>
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>

        <div v-if="error" class="alert alert-danger mt-3">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>
      </form>

      <div class="login-footer">
        <div class="demo-credentials">
          <h6>Credenciales de Prueba:</h6>
          <div class="credential-item">
            <strong>Admin:</strong> admin / admin123
          </div>
          <div class="credential-item">
            <strong>Vendedor:</strong> vendedor / vendedor123
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore.js';
import Swal from 'sweetalert2';

const router = useRouter();
const authStore = useAuthStore();

// Estado del formulario
const form = reactive({
  username: '',
  password: '',
  remember: false
});

// Estado de la UI
const loading = ref(false);
const showPassword = ref(false);
const error = ref('');
const errors = reactive({
  username: '',
  password: ''
});

// Función para limpiar errores
function clearErrors() {
  error.value = '';
  errors.username = '';
  errors.password = '';
}

// Función para validar el formulario
function validateForm() {
  clearErrors();
  let isValid = true;

  if (!form.username.trim()) {
    errors.username = 'El usuario es requerido';
    isValid = false;
  }

  if (!form.password.trim()) {
    errors.password = 'La contraseña es requerida';
    isValid = false;
  }

  return isValid;
}

// Función para manejar el login
async function handleLogin() {
  if (!validateForm()) {
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    console.log('🔐 Intentando iniciar sesión...');
    
    // Simular autenticación (por ahora)
    // TODO: Implementar autenticación real con Supabase
    const success = await simulateLogin(form.username, form.password);
    
    if (success) {
      // Guardar datos del usuario en el store
      authStore.setUser({
        id: 1,
        username: form.username,
        nombre: form.username === 'admin' ? 'Administrador' : 'Vendedor',
        apellido: 'Sistema',
        rol: form.username === 'admin' ? 'admin' : 'vendedor',
        email: `${form.username}@cocolu.com`
      });

      // Mostrar mensaje de éxito
      await Swal.fire({
        title: '¡Bienvenido!',
        text: `Hola ${authStore.user.nombre}, has iniciado sesión correctamente.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      // Redirigir al dashboard
      router.push('/dashboard');
    } else {
      error.value = 'Usuario o contraseña incorrectos';
    }
  } catch (err) {
    console.error('Error en login:', err);
    error.value = 'Error al iniciar sesión. Intenta nuevamente.';
  } finally {
    loading.value = false;
  }
}

// Función simulada de login (temporal)
async function simulateLogin(username, password) {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Credenciales válidas
  const validCredentials = [
    { username: 'admin', password: 'admin123' },
    { username: 'vendedor', password: 'vendedor123' }
  ];
  
  return validCredentials.some(cred => 
    cred.username === username && cred.password === password
  );
}

// Función para manejar tecla Enter
function handleKeyPress(event) {
  if (event.key === 'Enter') {
    handleLogin();
  }
}

// Agregar listener para tecla Enter
document.addEventListener('keypress', handleKeyPress);
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.logo i {
  font-size: 2.5rem;
  color: #667eea;
}

.logo h2 {
  margin: 0;
  color: #333;
  font-weight: 700;
}

.subtitle {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.login-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-label i {
  color: #667eea;
}

.form-control {
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 5px;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0;
  font-size: 1.1rem;
}

.password-toggle:hover {
  color: #333;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-check-input {
  margin: 0;
}

.form-check-label {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.btn-login {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert {
  border-radius: 10px;
  border: none;
  font-size: 0.9rem;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e1e5e9;
}

.demo-credentials {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  margin-top: 15px;
}

.demo-credentials h6 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 0.9rem;
}

.credential-item {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 5px;
}

.credential-item:last-child {
  margin-bottom: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .logo h2 {
    font-size: 1.5rem;
  }
}
</style>
