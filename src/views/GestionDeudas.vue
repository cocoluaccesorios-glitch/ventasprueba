<template>
  <div class="container-fluid mt-4">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2><i class="bi bi-credit-card-2-back"></i> Gestión de Deudas</h2>
            <p class="text-muted mb-0">Control y seguimiento de pagos pendientes</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary btn-sm" @click="actualizarDatos">
              <i class="bi bi-arrow-clockwise"></i> Actualizar
            </button>
            <button class="btn btn-success btn-sm" @click="mostrarFormularioAbono">
              <i class="bi bi-plus-circle"></i> Nuevo Abono
            </button>
            <button class="btn btn-info btn-sm" @click="generarReporteDeudas">
              <i class="bi bi-graph-up"></i> Reporte de Deudas
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen de Deudas -->
    <div class="row mb-4">
      <div class="col-md-3 mb-2">
        <div class="card bg-danger text-white kpi-card">
          <div class="card-body py-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title text-white-50 mb-1">Total Deudas</h6>
                <h4 class="mb-0">${{ resumenDeudas.totalDeudasUSD.toFixed(2) }}</h4>
                <small class="text-white-75">{{ resumenDeudas.totalDeudasVES.toLocaleString() }} Bs</small>
              </div>
              <div class="fs-3 opacity-50">
                <i class="bi bi-exclamation-triangle"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-2">
        <div class="card bg-warning text-white kpi-card">
          <div class="card-body py-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title text-white-50 mb-1">Clientes con Deudas</h6>
                <h4 class="mb-0">{{ resumenDeudas.clientesConDeudas }}</h4>
                <small class="text-white-75">clientes</small>
              </div>
              <div class="fs-3 opacity-50">
                <i class="bi bi-people"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-2">
        <div class="card bg-info text-white kpi-card">
          <div class="card-body py-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title text-white-50 mb-1">Pedidos Pendientes</h6>
                <h4 class="mb-0">{{ resumenDeudas.pedidosPendientes }}</h4>
                <small class="text-white-75">pedidos</small>
              </div>
              <div class="fs-3 opacity-50">
                <i class="bi bi-clock"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-2">
        <div class="card bg-success text-white kpi-card">
          <div class="card-body py-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title text-white-50 mb-1">Abonos Recibidos</h6>
                <h4 class="mb-0">${{ resumenDeudas.totalAbonosUSD.toFixed(2) }}</h4>
                <small class="text-white-75">{{ resumenDeudas.totalAbonosVES.toLocaleString() }} Bs</small>
              </div>
              <div class="fs-3 opacity-50">
                <i class="bi bi-cash-stack"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0"><i class="bi bi-funnel"></i> Filtros de Búsqueda</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3 mb-3">
                <label class="form-label">Cliente</label>
                <input type="text" class="form-control" v-model="filtros.cliente" @input="aplicarFiltros" placeholder="Buscar cliente...">
              </div>
              <div class="col-md-2 mb-3">
                <label class="form-label">Estado</label>
                <select class="form-select" v-model="filtros.estado" @change="aplicarFiltros">
                  <option value="">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="entregado">Entregado</option>
                  <option value="pagado">Pagado</option>
                </select>
              </div>
              <div class="col-md-2 mb-3">
                <label class="form-label">Rango de Deuda</label>
                <select class="form-select" v-model="filtros.rangoDeuda" @change="aplicarFiltros">
                  <option value="">Todos</option>
                  <option value="0-50">$0 - $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="100+">$100+</option>
                </select>
              </div>
              <div class="col-md-3 mb-3">
                <label class="form-label">Fecha</label>
                <input type="date" class="form-control" v-model="filtros.fecha" @change="aplicarFiltros">
              </div>
              <div class="col-md-2 mb-3 d-flex align-items-end">
                <button class="btn btn-outline-secondary" @click="limpiarFiltros">
                  <i class="bi bi-arrow-clockwise"></i> Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de Deudas -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0"><i class="bi bi-table"></i> Deudas Pendientes</h5>
            <span class="badge bg-danger">{{ deudasFiltradas.length }} deudas</span>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-dark">
                  <tr>
                    <th class="text-center">#</th>
                    <th>Cliente</th>
                    <th>Pedido</th>
                    <th class="text-end">Total</th>
                    <th class="text-end">Abonado</th>
                    <th class="text-end">Pendiente</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th class="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(deuda, index) in deudasFiltradas" :key="deuda.pedido_id" 
                      :class="getDeudaRowClass(deuda)">
                    <td class="text-center">
                      <span class="badge bg-secondary">{{ index + 1 }}</span>
                    </td>
                    <td>
                      <strong>{{ deuda.cliente_completo }}</strong>
                      <br>
                      <small class="text-muted">{{ deuda.cliente_cedula }}</small>
                    </td>
                    <td>
                      <span class="badge bg-primary">#{{ deuda.pedido_id }}</span>
                    </td>
                    <td class="text-end">
                      <span class="fw-bold">${{ deuda.total_usd.toFixed(2) }}</span>
                    </td>
                    <td class="text-end">
                      <span class="text-success fw-bold">${{ deuda.total_abonado_usd.toFixed(2) }}</span>
                    </td>
                    <td class="text-end">
                      <span class="text-danger fw-bold">${{ deuda.saldo_pendiente_usd.toFixed(2) }}</span>
                    </td>
                    <td>
                      <span :class="getEstadoBadgeClass(deuda.estado_entrega)" class="badge">
                        {{ deuda.estado_entrega }}
                      </span>
                    </td>
                    <td>
                      <small>{{ formatFecha(deuda.fecha_pedido) }}</small>
                    </td>
                    <td class="text-center">
                      <div class="btn-group" role="group">
                        <button class="btn btn-success btn-sm" @click="mostrarFormularioAbono(deuda)" title="Registrar Abono">
                          <i class="bi bi-plus-circle"></i>
                        </button>
                        <button class="btn btn-info btn-sm" @click="verDetalleAbonos(deuda)" title="Ver Abonos">
                          <i class="bi bi-list"></i>
                        </button>
                        <button class="btn btn-warning btn-sm" @click="marcarComoEntregado(deuda)" title="Marcar como Entregado">
                          <i class="bi bi-check-circle"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Formulario de Abono -->
  <div class="modal fade" id="modalAbono" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-plus-circle"></i> Registrar Abono
            <span v-if="pedidoSeleccionado" class="badge bg-primary ms-2">Pedido #{{ pedidoSeleccionado.pedido_id }}</span>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div v-if="pedidoSeleccionado" class="alert alert-info">
            <h6><i class="bi bi-info-circle"></i> Información del Pedido</h6>
            <div class="row">
              <div class="col-md-6">
                <strong>Cliente:</strong> {{ pedidoSeleccionado.cliente_completo }}<br>
                <strong>Total:</strong> ${{ pedidoSeleccionado.total_usd.toFixed(2) }}<br>
                <strong>Abonado:</strong> ${{ pedidoSeleccionado.total_abonado_usd.toFixed(2) }}
              </div>
              <div class="col-md-6">
                <strong>Pendiente:</strong> ${{ pedidoSeleccionado.saldo_pendiente_usd.toFixed(2) }}<br>
                <strong>Estado:</strong> {{ pedidoSeleccionado.estado_entrega }}<br>
                <strong>Fecha:</strong> {{ formatFecha(pedidoSeleccionado.fecha_pedido) }}
              </div>
            </div>
          </div>

          <form @submit.prevent="registrarAbono">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Monto del Abono (USD)</label>
                <input type="number" class="form-control" v-model="formularioAbono.monto_usd" 
                       step="0.01" min="0" :max="pedidoSeleccionado?.saldo_pendiente_usd || 0" required>
                <div class="form-text">Máximo: ${{ pedidoSeleccionado?.saldo_pendiente_usd.toFixed(2) || '0.00' }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Monto del Abono (VES)</label>
                <input type="number" class="form-control" v-model="formularioAbono.monto_ves" 
                       step="0.01" min="0" readonly>
                <div class="form-text">Calculado automáticamente</div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Método de Pago</label>
                <select class="form-select" v-model="formularioAbono.metodo_pago" required>
                  <option value="">Seleccionar método</option>
                  <option value="Efectivo (USD)">Efectivo (USD)</option>
                  <option value="Zelle (USD)">Zelle (USD)</option>
                  <option value="Pago Móvil (VES)">Pago Móvil (VES)</option>
                  <option value="Punto de Venta (VES)">Punto de Venta (VES)</option>
                  <option value="Transferencia (VES)">Transferencia (VES)</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Referencia de Pago</label>
                <input type="text" class="form-control" v-model="formularioAbono.referencia_pago" 
                       placeholder="Número de referencia (opcional)">
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Tasa BCV</label>
                <input type="number" class="form-control" v-model="formularioAbono.tasa_bcv" 
                       step="0.000001" min="0" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Fecha del Abono</label>
                <input type="datetime-local" class="form-control" v-model="formularioAbono.fecha_abono" required>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Comentarios</label>
              <textarea class="form-control" v-model="formularioAbono.comentarios" 
                        rows="3" placeholder="Comentarios adicionales (opcional)"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-success" @click="registrarAbono" :disabled="!formularioValido">
            <i class="bi bi-check-circle"></i> Registrar Abono
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Detalle de Abonos -->
  <div class="modal fade" id="modalDetalleAbonos" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-list"></i> Historial de Abonos
            <span v-if="pedidoSeleccionado" class="badge bg-primary ms-2">Pedido #{{ pedidoSeleccionado.pedido_id }}</span>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div v-if="abonosPedido.length > 0">
            <div class="table-responsive">
              <table class="table table-sm">
                <thead class="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th class="text-end">Monto USD</th>
                    <th class="text-end">Monto VES</th>
                    <th>Método</th>
                    <th>Referencia</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(abono, index) in abonosPedido" :key="abono.id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ formatFecha(abono.fecha_abono) }}</td>
                    <td class="text-end">${{ abono.monto_abono_usd.toFixed(2) }}</td>
                    <td class="text-end">{{ abono.monto_abono_ves.toLocaleString() }} Bs</td>
                    <td>{{ abono.metodo_pago_abono }}</td>
                    <td>{{ abono.referencia_pago || '-' }}</td>
                    <td>
                      <span :class="getEstadoAbonoBadgeClass(abono.estado_abono)" class="badge">
                        {{ abono.estado_abono }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="text-center text-muted">
            <i class="bi bi-inbox fs-1"></i>
            <p>No hay abonos registrados para este pedido</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'
import Swal from 'sweetalert2'

// Estado reactivo
const deudas = ref([])
const abonosPedido = ref([])
const pedidoSeleccionado = ref(null)
const resumenDeudas = ref({
  totalDeudasUSD: 0,
  totalDeudasVES: 0,
  clientesConDeudas: 0,
  pedidosPendientes: 0,
  totalAbonosUSD: 0,
  totalAbonosVES: 0
})

const filtros = ref({
  cliente: '',
  estado: '',
  rangoDeuda: '',
  fecha: ''
})

const formularioAbono = ref({
  monto_usd: 0,
  monto_ves: 0,
  metodo_pago: '',
  referencia_pago: '',
  tasa_bcv: 36.0,
  fecha_abono: '',
  comentarios: ''
})

// Computed properties
const deudasFiltradas = computed(() => {
  let resultado = [...deudas.value]
  
  // Filtro por cliente
  if (filtros.value.cliente) {
    const busqueda = filtros.value.cliente.toLowerCase()
    resultado = resultado.filter(deuda => 
      deuda.cliente_completo.toLowerCase().includes(busqueda) ||
      deuda.cliente_cedula.toLowerCase().includes(busqueda)
    )
  }
  
  // Filtro por estado
  if (filtros.value.estado) {
    resultado = resultado.filter(deuda => deuda.estado_entrega === filtros.value.estado)
  }
  
  // Filtro por rango de deuda
  if (filtros.value.rangoDeuda) {
    resultado = resultado.filter(deuda => {
      const pendiente = deuda.saldo_pendiente_usd
      switch (filtros.value.rangoDeuda) {
        case '0-50': return pendiente >= 0 && pendiente <= 50
        case '50-100': return pendiente > 50 && pendiente <= 100
        case '100+': return pendiente > 100
        default: return true
      }
    })
  }
  
  // Filtro por fecha
  if (filtros.value.fecha) {
    resultado = resultado.filter(deuda => {
      const fechaPedido = new Date(deuda.fecha_pedido).toISOString().split('T')[0]
      return fechaPedido === filtros.value.fecha
    })
  }
  
  return resultado
})

const formularioValido = computed(() => {
  return formularioAbono.value.monto_usd > 0 &&
         formularioAbono.value.monto_usd <= (pedidoSeleccionado.value?.saldo_pendiente_usd || 0) &&
         formularioAbono.value.metodo_pago &&
         formularioAbono.value.tasa_bcv > 0 &&
         formularioAbono.value.fecha_abono
})

// Funciones
async function cargarDatos() {
  try {
    console.log('📊 Cargando datos de deudas...')
    
    // Obtener vista de resumen de deudas
    const { data: deudasData, error } = await supabase
      .from('vista_resumen_deudas')
      .select('*')
      .gt('saldo_pendiente_usd', 0)
      .order('fecha_pedido', { ascending: false })
    
    if (error) {
      console.error('Error cargando deudas:', error)
      throw error
    }
    
    deudas.value = deudasData || []
    
    // Calcular resumen
    calcularResumenDeudas()
    
    console.log('✅ Datos de deudas cargados:', deudas.value.length)
    
  } catch (error) {
    console.error('Error cargando datos de deudas:', error)
    Swal.fire({
      title: 'Error',
      text: 'No se pudieron cargar los datos de deudas',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
  }
}

function calcularResumenDeudas() {
  const totalDeudasUSD = deudas.value.reduce((sum, deuda) => sum + deuda.saldo_pendiente_usd, 0)
  const totalDeudasVES = deudas.value.reduce((sum, deuda) => sum + (deuda.saldo_pendiente_usd * deuda.tasa_bcv), 0)
  const totalAbonosUSD = deudas.value.reduce((sum, deuda) => sum + deuda.total_abonado_usd, 0)
  const totalAbonosVES = deudas.value.reduce((sum, deuda) => sum + (deuda.total_abonado_usd * deuda.tasa_bcv), 0)
  
  const clientesUnicos = new Set(deudas.value.map(deuda => deuda.cliente_cedula))
  const pedidosPendientes = deudas.value.filter(deuda => deuda.estado_entrega === 'pendiente').length
  
  resumenDeudas.value = {
    totalDeudasUSD,
    totalDeudasVES,
    clientesConDeudas: clientesUnicos.size,
    pedidosPendientes,
    totalAbonosUSD,
    totalAbonosVES
  }
}

function aplicarFiltros() {
  // Los filtros se aplican automáticamente por el computed
}

function limpiarFiltros() {
  filtros.value = {
    cliente: '',
    estado: '',
    rangoDeuda: '',
    fecha: ''
  }
}

async function actualizarDatos() {
  await cargarDatos()
  Swal.fire({
    title: '¡Actualizado!',
    text: 'Los datos han sido actualizados correctamente',
    icon: 'success',
    timer: 1500,
    showConfirmButton: false
  })
}

function mostrarFormularioAbono(deuda = null) {
  pedidoSeleccionado.value = deuda
  
  // Limpiar formulario
  formularioAbono.value = {
    monto_usd: 0,
    monto_ves: 0,
    metodo_pago: '',
    referencia_pago: '',
    tasa_bcv: deuda?.tasa_bcv || 36.0,
    fecha_abono: new Date().toISOString().slice(0, 16),
    comentarios: ''
  }
  
  const modal = new bootstrap.Modal(document.getElementById('modalAbono'))
  modal.show()
}

async function verDetalleAbonos(deuda) {
  pedidoSeleccionado.value = deuda
  
  try {
    const { data: abonosData, error } = await supabase
      .from('abonos')
      .select('*')
      .eq('pedido_id', deuda.pedido_id)
      .order('fecha_abono', { ascending: false })
    
    if (error) {
      console.error('Error cargando abonos:', error)
      throw error
    }
    
    abonosPedido.value = abonosData || []
    
    const modal = new bootstrap.Modal(document.getElementById('modalDetalleAbonos'))
    modal.show()
    
  } catch (error) {
    console.error('Error cargando abonos:', error)
    Swal.fire({
      title: 'Error',
      text: 'No se pudieron cargar los abonos del pedido',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
  }
}

async function registrarAbono() {
  if (!formularioValido.value) {
    Swal.fire('Error', 'Por favor completa todos los campos requeridos', 'error')
    return
  }
  
  try {
    // Calcular monto en VES
    const montoVES = formularioAbono.value.monto_usd * formularioAbono.value.tasa_bcv
    
    const { error } = await supabase
      .from('abonos')
      .insert({
        pedido_id: pedidoSeleccionado.value.pedido_id,
        cliente_id: null, // Se puede obtener del pedido si es necesario
        monto_abono_usd: formularioAbono.value.monto_usd,
        monto_abono_ves: montoVES,
        tasa_bcv: formularioAbono.value.tasa_bcv,
        metodo_pago_abono: formularioAbono.value.metodo_pago,
        referencia_pago: formularioAbono.value.referencia_pago,
        tipo_abono: 'simple',
        fecha_abono: formularioAbono.value.fecha_abono,
        estado_abono: 'confirmado',
        comentarios: formularioAbono.value.comentarios
      })
    
    if (error) {
      console.error('Error registrando abono:', error)
      throw error
    }
    
    // Verificar si el pedido está completamente pagado
    await verificarEstadoPedido(pedidoSeleccionado.value.pedido_id)
    
    // Cerrar modal y actualizar datos
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalAbono'))
    modal.hide()
    
    await cargarDatos()
    
    Swal.fire({
      title: '¡Abono Registrado!',
      text: `Se registró un abono de $${formularioAbono.value.monto_usd.toFixed(2)}`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    })
    
  } catch (error) {
    console.error('Error registrando abono:', error)
    Swal.fire({
      title: 'Error',
      text: 'No se pudo registrar el abono',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
  }
}

async function verificarEstadoPedido(pedidoId) {
  try {
    // Calcular saldo pendiente usando la función de la base de datos
    const { data: saldoPendiente, error } = await supabase
      .rpc('calcular_saldo_pendiente', { pedido_id_param: pedidoId })
    
    if (error) {
      console.error('Error calculando saldo pendiente:', error)
      return
    }
    
    // Si el saldo es 0 o menor, marcar como pagado
    if (saldoPendiente <= 0) {
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({ estado_entrega: 'pagado' })
        .eq('id', pedidoId)
      
      if (updateError) {
        console.error('Error actualizando estado del pedido:', updateError)
      } else {
        console.log(`✅ Pedido #${pedidoId} marcado como pagado`)
      }
    }
  } catch (error) {
    console.error('Error verificando estado del pedido:', error)
  }
}

async function marcarComoEntregado(deuda) {
  const result = await Swal.fire({
    title: '¿Marcar como Entregado?',
    text: `¿Estás seguro de marcar el pedido #${deuda.pedido_id} como entregado?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, marcar',
    cancelButtonText: 'Cancelar'
  })
  
  if (result.isConfirmed) {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado_entrega: 'entregado' })
        .eq('id', deuda.pedido_id)
      
      if (error) {
        console.error('Error actualizando estado:', error)
        throw error
      }
      
      await cargarDatos()
      
      Swal.fire({
        title: '¡Actualizado!',
        text: `Pedido #${deuda.pedido_id} marcado como entregado`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      })
      
    } catch (error) {
      console.error('Error marcando como entregado:', error)
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el estado del pedido',
        icon: 'error',
        confirmButtonText: 'Entendido'
      })
    }
  }
}

function generarReporteDeudas() {
  // Implementar generación de reporte
  Swal.fire({
    title: 'Reporte de Deudas',
    text: 'Funcionalidad en desarrollo',
    icon: 'info',
    confirmButtonText: 'Entendido'
  })
}

// Funciones de utilidad
function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function getDeudaRowClass(deuda) {
  if (deuda.saldo_pendiente_usd <= 0) return 'table-success'
  if (deuda.saldo_pendiente_usd <= deuda.total_usd * 0.5) return 'table-warning'
  return 'table-danger'
}

function getEstadoBadgeClass(estado) {
  const clases = {
    'pendiente': 'bg-warning',
    'entregado': 'bg-info',
    'pagado': 'bg-success',
    'anulado': 'bg-danger'
  }
  return clases[estado] || 'bg-secondary'
}

function getEstadoAbonoBadgeClass(estado) {
  const clases = {
    'confirmado': 'bg-success',
    'pendiente': 'bg-warning',
    'anulado': 'bg-danger'
  }
  return clases[estado] || 'bg-secondary'
}

// Watchers para calcular VES automáticamente
import { watch } from 'vue'

watch(() => formularioAbono.value.monto_usd, (nuevoValor) => {
  if (nuevoValor && formularioAbono.value.tasa_bcv) {
    formularioAbono.value.monto_ves = nuevoValor * formularioAbono.value.tasa_bcv
  }
})

watch(() => formularioAbono.value.tasa_bcv, (nuevoValor) => {
  if (formularioAbono.value.monto_usd && nuevoValor) {
    formularioAbono.value.monto_ves = formularioAbono.value.monto_usd * nuevoValor
  }
})

// Lifecycle
onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
.kpi-card {
  min-height: auto !important;
  height: auto !important;
}

.kpi-card .card-body {
  padding: 1rem !important;
}

.kpi-card h4, .kpi-card h3 {
  font-size: 1.5rem !important;
  font-weight: 700 !important;
}

.kpi-card h6 {
  font-size: 0.875rem !important;
  font-weight: 500 !important;
}

.kpi-card small {
  font-size: 0.75rem !important;
}

.kpi-card .fs-3 {
  font-size: 1.5rem !important;
}

.table th {
  border-top: none;
  font-weight: 600;
}

.badge {
  font-size: 0.75em;
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

.table-success {
  background-color: rgba(25, 135, 84, 0.1) !important;
}

.table-warning {
  background-color: rgba(255, 193, 7, 0.1) !important;
}

.table-danger {
  background-color: rgba(220, 53, 69, 0.1) !important;
}

@media print {
  .btn, .modal, .card-header .btn {
    display: none !important;
  }
  
  .card {
    box-shadow: none !important;
    border: 1px solid #dee2e6 !important;
  }
}
</style>
