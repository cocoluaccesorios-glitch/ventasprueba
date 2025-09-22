import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref(null);
  const isAuthenticated = ref(false);
  const token = ref(null);
  const loading = ref(false);

  // Getters
  const isAdmin = computed(() => {
    return user.value?.rol === 'admin';
  });

  const isVendedor = computed(() => {
    return user.value?.rol === 'vendedor';
  });

  const isSupervisor = computed(() => {
    return user.value?.rol === 'supervisor';
  });

  const userFullName = computed(() => {
    if (!user.value) return '';
    return `${user.value.nombre} ${user.value.apellido}`.trim();
  });

  const userInitials = computed(() => {
    if (!user.value) return '';
    const nombre = user.value.nombre?.charAt(0) || '';
    const apellido = user.value.apellido?.charAt(0) || '';
    return (nombre + apellido).toUpperCase();
  });

  // Actions
  function setUser(userData) {
    user.value = userData;
    isAuthenticated.value = true;
    
    // Guardar en localStorage para persistencia
    localStorage.setItem('cocolu_user', JSON.stringify(userData));
    localStorage.setItem('cocolu_authenticated', 'true');
  }

  function setToken(tokenValue) {
    token.value = tokenValue;
    localStorage.setItem('cocolu_token', tokenValue);
  }

  function logout() {
    user.value = null;
    isAuthenticated.value = false;
    token.value = null;
    
    // Limpiar localStorage
    localStorage.removeItem('cocolu_user');
    localStorage.removeItem('cocolu_authenticated');
    localStorage.removeItem('cocolu_token');
  }

  function loadFromStorage() {
    try {
      const storedUser = localStorage.getItem('cocolu_user');
      const storedAuth = localStorage.getItem('cocolu_authenticated');
      const storedToken = localStorage.getItem('cocolu_token');

      if (storedUser && storedAuth === 'true') {
        user.value = JSON.parse(storedUser);
        isAuthenticated.value = true;
        token.value = storedToken;
      }
    } catch (error) {
      console.error('Error loading auth from storage:', error);
      logout();
    }
  }

  function hasPermission(permission) {
    if (!user.value) return false;
    
    const rolePermissions = {
      admin: ['all'],
      supervisor: ['view_reports', 'manage_orders', 'manage_inventory'],
      vendedor: ['create_orders', 'view_orders', 'manage_clients']
    };

    const userPermissions = rolePermissions[user.value.rol] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  }

  function canAccess(route) {
    if (!user.value) return false;
    
    const routePermissions = {
      '/dashboard': ['all', 'view_reports'],
      '/ventas': ['all', 'create_orders'],
      '/nueva-venta': ['all', 'create_orders'], // Mantener compatibilidad
      '/pedidos': ['all', 'view_orders', 'manage_orders'],
      '/inventario': ['all', 'manage_inventory'],
      '/clientes': ['all', 'manage_clients'],
      '/ingresos': ['all', 'view_reports'],
      '/usuarios': ['all'] // Solo admin
    };

    const requiredPermissions = routePermissions[route] || [];
    return requiredPermissions.some(permission => hasPermission(permission));
  }

  function updateUser(updates) {
    if (user.value) {
      user.value = { ...user.value, ...updates };
      localStorage.setItem('cocolu_user', JSON.stringify(user.value));
    }
  }

  function setLoading(loadingState) {
    loading.value = loadingState;
  }

  // Inicializar desde localStorage al crear el store
  loadFromStorage();

  return {
    // State
    user,
    isAuthenticated,
    token,
    loading,
    
    // Getters
    isAdmin,
    isVendedor,
    isSupervisor,
    userFullName,
    userInitials,
    
    // Actions
    setUser,
    setToken,
    logout,
    loadFromStorage,
    hasPermission,
    canAccess,
    updateUser,
    setLoading
  };
});
