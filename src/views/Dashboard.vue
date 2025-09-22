<template>
  <div class="container-fluid mt-4">
    <!-- Header del Dashboard -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2><i class="bi bi-speedometer2"></i> Dashboard</h2>
            <p class="text-muted mb-0">Resumen general de tu negocio</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary btn-sm" @click="actualizarDatos">
              <i class="bi bi-arrow-clockwise"></i> Actualizar
            </button>
            <div class="dropdown">
              <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-calendar"></i> {{ periodoActual }}
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" @click="cambiarPeriodo('hoy')">Hoy</a></li>
                <li><a class="dropdown-item" @click="cambiarPeriodo('semana')">Esta Semana</a></li>
                <li><a class="dropdown-item" @click="cambiarPeriodo('mes')">Este Mes</a></li>
                <li><a class="dropdown-item" @click="cambiarPeriodo('año')">Este Año</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tarjetas de Estadísticas Principales -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card bg-primary text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title text-white-50">Ventas Totales</h6>
                <h3 class="mb-0">${{ estadisticas.ventasTotales.toFixed(2) }}</h3>
                <small class="text-white-75">{{ estadisticas.totalVentas }} pedidos</small>
              </div>
              <div class="fs-1 opacity-50">
                <i class="bi bi-currency-dollar"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-3">
        <div class="card bg-success text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title text-white-50">Productos Vendidos</h6>
                <h3 class="mb-0">{{ estadisticas.productosVendidos }}</h3>
                <small class="text-white-75">{{ estadisticas.totalProductos }} en inventario</small>
              </div>
              <div class="fs-1 opacity-50">
                <i class="bi bi-box-seam"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-3">
        <div class="card bg-info text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title text-white-50">Clientes Activos</h6>
                <h3 class="mb-0">{{ estadisticas.clientesActivos }}</h3>
                <small class="text-white-75">{{ estadisticas.nuevosClientes }} nuevos</small>
              </div>
              <div class="fs-1 opacity-50">
                <i class="bi bi-people"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-3">
        <div class="card bg-warning text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title text-white-50">Stock Bajo</h6>
                <h3 class="mb-0">{{ estadisticas.stockBajo }}</h3>
                <small class="text-white-75">productos</small>
              </div>
              <div class="fs-1 opacity-50">
                <i class="bi bi-exclamation-triangle"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficos y Tablas -->
    <div class="row">
      <!-- Gráfico de Ventas -->
      <div class="col-md-8 mb-4">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="mb-0"><i class="bi bi-graph-up"></i> Ventas por Día</h5>
          </div>
          <div class="card-body">
            <div style="height: 300px; position: relative;">
              <canvas ref="ventasChart" style="max-height: 300px;"></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Top Productos -->
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="mb-0"><i class="bi bi-trophy"></i> Top Productos</h5>
          </div>
          <div class="card-body">
            <div class="list-group list-group-flush">
              <div v-for="(producto, index) in topProductos" :key="producto.id" 
                   class="list-group-item d-flex justify-content-between align-items-center px-0">
                <div class="d-flex align-items-center">
                  <span class="badge bg-primary me-2">{{ index + 1 }}</span>
                  <div>
                    <h6 class="mb-0">{{ producto.nombre }}</h6>
                    <small class="text-muted">{{ producto.cantidadVendida }} vendidos</small>
                  </div>
                </div>
                <span class="badge bg-success">${{ producto.totalVentas.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tablas de Información -->
    <div class="row">
      <!-- Pedidos Recientes -->
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0"><i class="bi bi-clock-history"></i> Pedidos Recientes</h5>
            <router-link to="/pedidos" class="btn btn-sm btn-outline-primary">Ver Todos</router-link>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pedido in pedidosRecientes" :key="pedido.id">
                    <td>#{{ pedido.id }}</td>
                    <td>{{ pedido.cliente }}</td>
                    <td>${{ pedido.total.toFixed(2) }}</td>
                    <td>
                      <span :class="getEstadoBadgeClass(pedido.estado)" class="badge">
                        {{ pedido.estado }}
                      </span>
                    </td>
                    <td>{{ formatFecha(pedido.fecha) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Alertas de Inventario -->
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0"><i class="bi bi-exclamation-triangle"></i> Alertas de Inventario</h5>
            <router-link to="/inventario" class="btn btn-sm btn-outline-warning">Ver Inventario</router-link>
          </div>
          <div class="card-body">
            <div v-if="alertasInventario.length === 0" class="text-center py-3">
              <i class="bi bi-check-circle text-success fs-1"></i>
              <p class="text-muted mt-2">¡Todo en orden! No hay alertas de inventario.</p>
            </div>
            <div v-else>
              <div v-for="alerta in alertasInventario" :key="alerta.id" 
                   class="alert alert-warning d-flex justify-content-between align-items-center">
                <div>
                  <strong>{{ alerta.nombre }}</strong><br>
                  <small>Stock: {{ alerta.stock }} unidades</small>
                </div>
                <button class="btn btn-sm btn-outline-warning" @click="irAInventario">
                  <i class="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones Rápidas -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0"><i class="bi bi-lightning"></i> Acciones Rápidas</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3 mb-3">
                <router-link to="/ventas" class="btn btn-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                  <i class="bi bi-cart-plus fs-1 mb-2"></i>
                  <span>Nueva Venta</span>
                </router-link>
              </div>
              <div class="col-md-3 mb-3">
                <router-link to="/inventario" class="btn btn-success w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                  <i class="bi bi-box-seam fs-1 mb-2"></i>
                  <span>Ver Inventario</span>
                </router-link>
              </div>
              <div class="col-md-3 mb-3">
                <router-link to="/clientes" class="btn btn-info w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                  <i class="bi bi-people fs-1 mb-2"></i>
                  <span>Gestionar Clientes</span>
                </router-link>
              </div>
              <div class="col-md-3 mb-3">
                <router-link to="/pedidos" class="btn btn-warning w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                  <i class="bi bi-list-ul fs-1 mb-2"></i>
                  <span>Ver Pedidos</span>
                </router-link>
              </div>
            </div>
            <div class="row">
              <div class="col-md-3 mb-3">
                <router-link to="/ingresos" class="btn btn-success w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                  <i class="bi bi-cash-stack fs-1 mb-2"></i>
                  <span>Ver Ingresos</span>
                </router-link>
              </div>
              <div class="col-md-3 mb-3">
                <div class="btn btn-outline-secondary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                  <i class="bi bi-graph-up fs-1 mb-2"></i>
                  <span>Reportes</span>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="btn btn-outline-info w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                  <i class="bi bi-gear fs-1 mb-2"></i>
                  <span>Configuración</span>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="btn btn-outline-warning w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                  <i class="bi bi-download fs-1 mb-2"></i>
                  <span>Backup</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  calcularEstadisticasGenerales, 
  obtenerTopProductos, 
  obtenerPedidosRecientes, 
  obtenerAlertasInventario,
  obtenerDatosVentasPorPeriodo 
} from '../services/dashboardService.js'

// Estado reactivo
const periodoActual = ref('Este Mes')
const ventasChart = ref(null)
let chartInstance = null

// Datos mock para el dashboard
const estadisticas = ref({
  ventasTotales: 0,
  totalVentas: 0,
  productosVendidos: 0,
  totalProductos: 0,
  clientesActivos: 0,
  nuevosClientes: 0,
  stockBajo: 0
})

const topProductos = ref([])
const pedidosRecientes = ref([])
const alertasInventario = ref([])

// Computed properties
const datosVentas = computed(() => {
  // Obtener datos según el período actual
  const periodo = periodoActual.value.toLowerCase().replace('este ', '').replace('esta ', '')
  return obtenerDatosVentasPorPeriodo(periodo)
})

// Funciones
async function cargarDatos() {
  try {
    // Cargar datos usando el servicio
    const [estadisticasData, topProductosData, pedidosRecientesData, alertasData] = await Promise.all([
      calcularEstadisticasGenerales(),
      obtenerTopProductos(5),
      obtenerPedidosRecientes(5),
      obtenerAlertasInventario(3)
    ])
    
    estadisticas.value = estadisticasData
    topProductos.value = topProductosData
    pedidosRecientes.value = pedidosRecientesData
    alertasInventario.value = alertasData
    
  } catch (error) {
    console.error('Error cargando datos del dashboard:', error)
    // Usar datos mock en caso de error
    cargarDatosMock()
  }
}

function cargarDatosMock() {
  estadisticas.value = {
    ventasTotales: 1250.50,
    totalVentas: 15,
    productosVendidos: 45,
    totalProductos: 25,
    clientesActivos: 8,
    nuevosClientes: 2,
    stockBajo: 3
  }
  
  topProductos.value = [
    { id: 1, nombre: 'Producto A', cantidadVendida: 12, totalVentas: 240.00 },
    { id: 2, nombre: 'Producto B', cantidadVendida: 8, totalVentas: 180.00 },
    { id: 3, nombre: 'Producto C', cantidadVendida: 6, totalVentas: 150.00 }
  ]
  
  pedidosRecientes.value = [
    { id: 1, cliente: 'Juan Pérez', total: 85.50, estado: 'pendiente', fecha: new Date().toISOString() },
    { id: 2, cliente: 'María González', total: 120.00, estado: 'entregado', fecha: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, cliente: 'Carlos Rodríguez', total: 95.75, estado: 'en_proceso', fecha: new Date(Date.now() - 172800000).toISOString() }
  ]
  
  alertasInventario.value = [
    { id: 1, nombre: 'Producto X', stock: 2 },
    { id: 2, nombre: 'Producto Y', stock: 1 },
    { id: 3, nombre: 'Producto Z', stock: 0 }
  ]
}

function crearGrafico() {
  if (!ventasChart.value) return
  
  // Importar Chart.js dinámicamente
  import('chart.js').then(({ Chart, registerables }) => {
    Chart.register(...registerables)
    
    const ctx = ventasChart.value.getContext('2d')
    
    if (chartInstance) {
      chartInstance.destroy()
    }
    
    // Asegurar que tenemos datos válidos
    const datos = datosVentas.value || []
    const labels = datos.map(d => d.fecha) || []
    const ventas = datos.map(d => d.ventas) || []
    
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ventas ($)',
          data: ventas,
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: Math.max(...ventas, 100), // Limitar el máximo
            ticks: {
              callback: function(value) {
                return '$' + value
              }
            }
          }
        }
      }
    })
  }).catch(error => {
    console.error('Error cargando Chart.js:', error)
  })
}

function cambiarPeriodo(periodo) {
  const periodos = {
    'hoy': 'Hoy',
    'semana': 'Esta Semana',
    'mes': 'Este Mes',
    'año': 'Este Año'
  }
  periodoActual.value = periodos[periodo]
  
  // Actualizar datos del gráfico
  const nuevosDatos = obtenerDatosVentasPorPeriodo(periodo)
  if (chartInstance) {
    chartInstance.data.labels = nuevosDatos.map(d => d.fecha)
    chartInstance.data.datasets[0].data = nuevosDatos.map(d => d.ventas)
    chartInstance.update()
  }
  
  cargarDatos()
}

function actualizarDatos() {
  cargarDatos()
  if (chartInstance) {
    crearGrafico()
  }
}

function getEstadoBadgeClass(estado) {
  const clases = {
    'pendiente': 'bg-warning',
    'en_proceso': 'bg-info',
    'entregado': 'bg-success',
    'anulado': 'bg-danger'
  }
  return clases[estado] || 'bg-secondary'
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
}

function irAInventario() {
  // Navegar a inventario
  window.location.href = '/inventario'
}

// Lifecycle
onMounted(() => {
  cargarDatos()
  setTimeout(() => {
    crearGrafico()
  }, 100)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition: box-shadow 0.15s ease-in-out;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.btn {
  transition: all 0.15s ease-in-out;
}

.btn:hover {
  transform: translateY(-2px);
}

.alert {
  border-left: 4px solid #ffc107;
}

.list-group-item {
  border: none;
  border-bottom: 1px solid #dee2e6;
}

.list-group-item:last-child {
  border-bottom: none;
}

.opacity-50 {
  opacity: 0.5 !important;
}

.opacity-75 {
  opacity: 0.75 !important;
}

.text-white-50 {
  color: rgba(255, 255, 255, 0.5) !important;
}

.text-white-75 {
  color: rgba(255, 255, 255, 0.75) !important;
}
</style>
