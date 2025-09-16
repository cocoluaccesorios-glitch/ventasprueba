import { createRouter, createWebHistory } from 'vue-router'
import CrearVenta from '../views/CrearVenta.vue'
import ListaPedidos from '../views/ListaPedidos.vue'
import EditarPedido from '../views/EditarPedido.vue'
const routes = [
  { path: '/', name: 'CrearVenta', component: CrearVenta },
  { path: '/pedidos', name: 'ListaPedidos', component: ListaPedidos },
  { path: '/pedidos/:id/editar', name: 'EditarPedido', component: EditarPedido, props: true },
]
const router = createRouter({
  history: createWebHistory(),
  routes,
})
export default router