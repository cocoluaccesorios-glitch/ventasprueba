import { useAuthStore } from '../stores/authStore.js';

export function setupAuthGuard(router) {
  // Guard para verificar autenticación
  router.beforeEach((to, from, next) => {
    try {
      const authStore = useAuthStore();
      
      // Rutas que no requieren autenticación
      const publicRoutes = ['/login', '/register', '/forgot-password'];
      
      // Si la ruta es pública, permitir acceso
      if (publicRoutes.includes(to.path)) {
        // Si ya está autenticado y trata de ir a login, redirigir al dashboard
        if (to.path === '/login' && authStore.isAuthenticated) {
          next('/dashboard');
          return;
        }
        next();
        return;
      }
      
      // Si no está autenticado, redirigir al login
      if (!authStore.isAuthenticated) {
        console.log('🔒 Usuario no autenticado, redirigiendo al login');
        next('/login');
        return;
      }
      
      // Verificar permisos para la ruta
      if (!authStore.canAccess(to.path)) {
        console.log('🚫 Usuario no tiene permisos para acceder a:', to.path);
        // Redirigir al dashboard si no tiene permisos
        next('/dashboard');
        return;
      }
      
      // Permitir acceso
      next();
    } catch (error) {
      console.error('Error en auth guard:', error);
      // En caso de error, redirigir al login
      next('/login');
    }
  });
  
  // Guard para verificar permisos después de la navegación
  router.afterEach((to, from) => {
    try {
      const authStore = useAuthStore();
      
      // Log de navegación para debugging
      console.log(`📍 Navegación: ${from.path} → ${to.path}`);
      console.log(`👤 Usuario: ${authStore.userFullName} (${authStore.user?.rol})`);
    } catch (error) {
      console.error('Error en afterEach guard:', error);
    }
  });
}

// Función para verificar si el usuario puede acceder a una ruta específica
export function canAccessRoute(routePath) {
  const authStore = useAuthStore();
  return authStore.canAccess(routePath);
}

// Función para verificar si el usuario tiene un permiso específico
export function hasPermission(permission) {
  const authStore = useAuthStore();
  return authStore.hasPermission(permission);
}

// Función para obtener información del usuario actual
export function getCurrentUser() {
  const authStore = useAuthStore();
  return authStore.user;
}

// Función para verificar si el usuario es admin
export function isAdmin() {
  const authStore = useAuthStore();
  return authStore.isAdmin;
}

// Función para verificar si el usuario es vendedor
export function isVendedor() {
  const authStore = useAuthStore();
  return authStore.isVendedor;
}

// Función para verificar si el usuario es supervisor
export function isSupervisor() {
  const authStore = useAuthStore();
  return authStore.isSupervisor;
}
