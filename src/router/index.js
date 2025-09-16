import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import CrearVenta from '../views/CrearVenta.vue'
import ListaPedidos from '../views/ListaPedidos.vue'
import EditarPedido from '../views/EditarPedido.vue'
import Inventario from '../views/Inventario.vue'
import Clientes from '../views/Clientes.vue'
import Ingresos from '../views/Ingresos.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/ventas', name: 'CrearVenta', component: CrearVenta },
  { path: '/pedidos', name: 'ListaPedidos', component: ListaPedidos },
  { path: '/pedidos/:id/editar', name: 'EditarPedido', component: EditarPedido, props: true },
  { path: '/inventario', name: 'Inventario', component: Inventario },
  { path: '/clientes', name: 'Clientes', component: Clientes },
  { path: '/ingresos', name: 'Ingresos', component: Ingresos },
]
const router = createRouter({
  history: createWebHistory(),
  routes,
})
export default router