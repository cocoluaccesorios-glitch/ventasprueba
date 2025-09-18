<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">
        <img src="/vite.svg" alt="Logo" width="30" height="24" class="d-inline-block align-text-top">
        Cocolú Ventas
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">
              <i class="bi bi-speedometer2"></i> Dashboard
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/ventas">
              <i class="bi bi-cart-plus-fill"></i> Nueva Venta
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/pedidos">
              <i class="bi bi-list-ul"></i> Ver Pedidos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/inventario">
              <i class="bi bi-box-seam"></i> Inventario
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/clientes">
              <i class="bi bi-people"></i> Clientes
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/ingresos">
              <i class="bi bi-cash-stack"></i> Ingresos
            </router-link>
          </li>
        </ul>
        
        <!-- Usuario y logout -->
        <ul class="navbar-nav">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <div class="user-avatar me-2">
                {{ authStore.userInitials }}
              </div>
              <span class="user-info">
                <div class="user-name">{{ authStore.userFullName }}</div>
                <div class="user-role">{{ authStore.user?.rol }}</div>
              </span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
              <li>
                <h6 class="dropdown-header">
                  <i class="bi bi-person-circle me-2"></i>
                  {{ authStore.userFullName }}
                </h6>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" href="#" @click="showProfile">
                  <i class="bi bi-person me-2"></i>
                  Mi Perfil
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click="showSettings">
                  <i class="bi bi-gear me-2"></i>
                  Configuración
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item text-danger" href="#" @click="handleLogout">
                  <i class="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/authStore.js';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const authStore = useAuthStore();
const router = useRouter();

function showProfile() {
  Swal.fire({
    title: 'Mi Perfil',
    html: `
      <div class="text-start">
        <p><strong>Nombre:</strong> ${authStore.userFullName}</p>
        <p><strong>Usuario:</strong> ${authStore.user?.username}</p>
        <p><strong>Email:</strong> ${authStore.user?.email}</p>
        <p><strong>Rol:</strong> ${authStore.user?.rol}</p>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'Cerrar'
  });
}

function showSettings() {
  Swal.fire({
    title: 'Configuración',
    text: 'Funcionalidad de configuración próximamente disponible.',
    icon: 'info',
    confirmButtonText: 'Entendido'
  });
}

async function handleLogout() {
  const result = await Swal.fire({
    title: '¿Cerrar sesión?',
    text: '¿Estás seguro de que quieres cerrar sesión?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    // Cerrar sesión
    authStore.logout();
    
    // Mostrar mensaje de confirmación
    await Swal.fire({
      title: 'Sesión cerrada',
      text: 'Has cerrado sesión correctamente.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
    
    // Redirigir al login
    router.push('/login');
  }
}
</script>

<style scoped>
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

.user-info {
  text-align: left;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  line-height: 1.2;
}

.user-role {
  font-size: 0.75rem;
  color: #ccc;
  text-transform: capitalize;
  line-height: 1.2;
}

.dropdown-menu {
  min-width: 200px;
}

.dropdown-header {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.dropdown-item {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.text-danger:hover {
  background-color: #f8d7da;
  color: #721c24;
}

/* Responsive */
@media (max-width: 768px) {
  .user-info {
    display: none;
  }
  
  .user-avatar {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }
}
</style>