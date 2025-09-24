import { createRouter, createWebHistory } from 'vue-router'
import { setupAuthGuard } from './authGuard.js'
import Dashboard from '../views/Dashboard.vue'
import CrearVenta from '../views/CrearVenta.vue'
import ListaPedidos from '../views/ListaPedidos.vue'
import EditarPedido from '../views/EditarPedido.vue'
import Inventario from '../views/Inventario.vue'
import GestionClientes from '../views/GestionClientes.vue'
import Ingresos from '../views/Ingresos.vue'
import Login from '../views/Login.vue'

const routes = [
  // Rutas públicas
  { path: '/login', name: 'Login', component: Login, meta: { requiresAuth: false } },
  
  // Rutas protegidas
  { path: '/', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/ventas', name: 'CrearVenta', component: CrearVenta, meta: { requiresAuth: true } },
  { path: '/pedidos', name: 'ListaPedidos', component: ListaPedidos, meta: { requiresAuth: true } },
  { path: '/pedidos/:id/editar', name: 'EditarPedido', component: EditarPedido, props: true, meta: { requiresAuth: true } },
  { path: '/inventario', name: 'Inventario', component: Inventario, meta: { requiresAuth: true } },
  { path: '/clientes', name: 'GestionClientes', component: GestionClientes, meta: { requiresAuth: true } },
  { path: '/ingresos', name: 'Ingresos', component: Ingresos, meta: { requiresAuth: true } },
  
  // Redirección por defecto
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Mantener posición de scroll al navegar hacia atrás
    if (savedPosition) {
      return savedPosition
    }
    // Scroll al top para navegación normal
    return { top: 0 }
  }
})

// Configurar guard de autenticación
setupAuthGuard(router)

export default router