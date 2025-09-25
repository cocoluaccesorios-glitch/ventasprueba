<template>
  <div class="container-fluid mt-4">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2><i class="bi bi-cash-stack"></i> Gestión de Ingresos</h2>
            <p class="text-muted mb-0">Control y reportes de entradas de dinero</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary btn-sm" @click="actualizarDatos">
              <i class="bi bi-arrow-clockwise"></i> Actualizar
            </button>
            <button class="btn btn-success btn-sm" @click="generarCierreCaja">
              <i class="bi bi-calculator"></i> Cierre de Caja
            </button>
            <button class="btn btn-info btn-sm" @click="generarReporteRango">
              <i class="bi bi-graph-up"></i> Reporte por Rango
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Estadísticas Rápidas -->
    <div class="row mb-3">
      <div class="col-md-3 mb-2">
        <div class="card bg-primary text-white kpi-card">
          <div class="card-body py-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title text-white-50 mb-1">Ingresos Hoy</h6>
                <h4 class="mb-0">${{ estadisticas.hoy.totalGeneralUSD.toFixed(2) }}</h4>
                <small class="text-white-75">{{ estadisticas.hoy.totalGeneralVES.toLocaleString() }} Bs</small>
              </div>
              <div class="fs-3 opacity-50">
                <i class="bi bi-calendar-day"></i>
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
                <h6 class="card-title text-white-50 mb-1">Esta Semana</h6>
                <h4 class="mb-0">${{ estadisticas.semana.totalGeneralUSD.toFixed(2) }}</h4>
                <small class="text-white-75">{{ estadisticas.semana.totalGeneralVES.toLocaleString() }} Bs</small>
              </div>
              <div class="fs-3 opacity-50">
                <i class="bi bi-calendar-week"></i>
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
                <h6 class="card-title text-white-50 mb-1">Este Mes</h6>
                <h4 class="mb-0">${{ estadisticas.mes.totalGeneralUSD.toFixed(2) }}</h4>
                <small class="text-white-75">{{ estadisticas.mes.totalGeneralVES.toLocaleString() }} Bs</small>
              </div>
              <div class="fs-3 opacity-50">
                <i class="bi bi-calendar-month"></i>
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
                <h6 class="card-title text-white-50 mb-1">Total Registros</h6>
                <h4 class="mb-0">{{ estadisticas.totalIngresos }}</h4>
                <small class="text-white-75">ingresos</small>
              </div>
              <div class="fs-3 opacity-50">
                <i class="bi bi-list-check"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen General por Moneda -->
    <div class="row mb-3">
      <div class="col-md-6 mb-2">
        <div class="card bg-success text-white kpi-card">
          <div class="card-body py-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title text-white-50 mb-1">Total en Dólares</h6>
                <h3 class="mb-0">${{ totalesGenerales.totalUSD.toFixed(2) }}</h3>
                <small class="text-white-75">USD</small>
              </div>
              <div class="fs-3 opacity-50">
                <i class="bi bi-currency-dollar"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 mb-2">
        <div class="card bg-info text-white kpi-card">
          <div class="card-body py-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title text-white-50 mb-1">Total en Bolívares</h6>
                <h3 class="mb-0">{{ totalesGenerales.totalVES.toLocaleString() }}</h3>
                <small class="text-white-75">Bs</small>
              </div>
              <div class="fs-3 opacity-50">
                <i class="bi bi-currency-exchange"></i>
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
                <label class="form-label">Fecha Inicio</label>
                <input type="date" class="form-control" v-model="filtros.fechaInicio" @change="aplicarFiltros">
              </div>
              <div class="col-md-3 mb-3">
                <label class="form-label">Fecha Fin</label>
                <input type="date" class="form-control" v-model="filtros.fechaFin" @change="aplicarFiltros">
              </div>
              <div class="col-md-2 mb-3">
                <label class="form-label">Método de Pago</label>
                <select class="form-select" v-model="filtros.metodoPago" @change="aplicarFiltros">
                  <option value="">Todos</option>
                  <option value="Efectivo (USD)">Efectivo (USD)</option>
                  <option value="Zelle (USD)">Zelle (USD)</option>
                  <option value="Punto de Venta (VES)">Punto de Venta (VES)</option>
                  <option value="Pago Móvil (VES)">Pago Móvil (VES)</option>
                  <option value="Transferencia (VES)">Transferencia (VES)</option>
                </select>
              </div>
              <div class="col-md-2 mb-3">
                <label class="form-label">Tipo de Ingreso</label>
                <select class="form-select" v-model="filtros.tipoIngreso" @change="aplicarFiltros">
                  <option value="">Todos</option>
                  <option value="Pago Completo de Contado">Pago Completo</option>
                  <option value="Abono Inicial">Abono Inicial</option>
                  <option value="Abono a Deuda">Abono a Deuda</option>
                  <option value="Delivery">Delivery</option>
                </select>
              </div>
              <div class="col-md-2 mb-3">
                <label class="form-label">Cliente</label>
                <input type="text" class="form-control" v-model="filtros.cliente" @input="aplicarFiltros" placeholder="Buscar cliente...">
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Referencia</label>
                <input type="text" class="form-control" v-model="filtros.referencia" @input="aplicarFiltros" placeholder="Buscar por referencia...">
              </div>
              <div class="col-md-6 mb-3 d-flex align-items-end">
                <button class="btn btn-outline-secondary me-2" @click="limpiarFiltros">
                  <i class="bi bi-arrow-clockwise"></i> Limpiar
                </button>
                <button class="btn btn-primary" @click="exportarDatos">
                  <i class="bi bi-download"></i> Exportar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de Ingresos -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0"><i class="bi bi-table"></i> Registro de Ingresos</h5>
            <span class="badge bg-primary">{{ ingresosFiltrados.length }} registros</span>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Monto USD</th>
                    <th>Monto VES</th>
                    <th>Método de Pago</th>
                    <th>Referencia</th>
                    <th>Tipo de Ingreso</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ingreso in ingresosFiltrados" :key="ingreso.id">
                    <td>
                      <span class="badge bg-secondary">{{ ingreso.id }}</span>
                    </td>
                    <td>{{ formatFecha(ingreso.fecha) }}</td>
                    <td>{{ ingreso.cliente }}</td>
                    <td>
                      <span v-if="ingreso.montoUSD > 0" class="text-success fw-bold">
                        ${{ ingreso.montoUSD.toFixed(2) }}
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <span v-if="ingreso.montoVES > 0" class="text-info fw-bold">
                        {{ ingreso.montoVES.toLocaleString() }} Bs
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <span :class="getMetodoBadgeClass(ingreso.metodoPago)" class="badge">
                        {{ ingreso.metodoPago }}
                      </span>
                    </td>
                    <td>
                      <span v-if="ingreso.referencia" class="text-muted">
                        {{ ingreso.referencia }}
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <span :class="getTipoBadgeClass(ingreso.tipoIngreso)" class="badge">
                        {{ ingreso.tipoIngreso }}
                      </span>
                    </td>
                    <td>
                      <span class="text-muted">{{ ingreso.descripcion }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Totales -->
            <div class="row mt-4">
              <div class="col-md-6">
                <div class="card bg-light">
                  <div class="card-body">
                    <h6 class="card-title">Totales Filtrados</h6>
                    <div class="row">
                      <div class="col-6">
                        <strong>Total USD:</strong><br>
                        <span class="text-success fs-5">${{ totalesFiltrados.totalGeneralUSD.toFixed(2) }}</span>
                      </div>
                      <div class="col-6">
                        <strong>Total VES:</strong><br>
                        <span class="text-info fs-5">{{ totalesFiltrados.totalGeneralVES.toLocaleString() }} Bs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card bg-light">
                  <div class="card-body">
                    <h6 class="card-title">Desglose por Método</h6>
                    <div v-for="(metodo, nombre) in desgloseMetodo" :key="nombre" class="d-flex justify-content-between">
                      <span>{{ nombre }}:</span>
                      <span class="fw-bold">
                        {{ metodo.montoUSD > 0 ? '$' + metodo.montoUSD.toFixed(2) : metodo.montoVES.toLocaleString() + ' Bs' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Cierre de Caja -->
  <div class="modal fade" id="modalCierreCaja" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="bi bi-calculator"></i> Cierre de Caja</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <label class="form-label">Seleccionar Fecha</label>
              <input type="date" class="form-control" v-model="fechaCierreCaja">
            </div>
            <div class="col-md-6 d-flex align-items-end">
              <button class="btn btn-primary" @click="procesarCierreCaja">
                <i class="bi bi-calculator"></i> Generar Cierre
              </button>
            </div>
          </div>
          
          <div v-if="reporteCierreCaja" class="mt-4">
            <div class="row mb-3">
              <div class="col-12">
                <h5 class="text-primary mb-3">
                  <i class="bi bi-calculator"></i> Resumen del {{ formatFecha(fechaCierreCaja) }}
                </h5>
              </div>
            </div>
            
            <!-- Resumen Ejecutivo -->
            <div class="row mb-4">
              <div class="col-md-4">
                <div class="card bg-success text-white">
                  <div class="card-body text-center py-3">
                    <h4 class="mb-1">${{ reporteCierreCaja.totales.totalGeneralUSD.toFixed(2) }}</h4>
                    <small>Total en Dólares</small>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card bg-info text-white">
                  <div class="card-body text-center py-3">
                    <h4 class="mb-1">{{ reporteCierreCaja.totales.totalGeneralVES.toLocaleString() }} Bs</h4>
                    <small>Total en Bolívares</small>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card bg-warning text-white">
                  <div class="card-body text-center py-3">
                    <h4 class="mb-1">{{ reporteCierreCaja.ingresosDetallados.length }}</h4>
                    <small>Transacciones</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tabla Detallada Mejorada -->
            <div class="card">
              <div class="card-header bg-primary text-white">
                <h6 class="mb-0">
                  <i class="bi bi-list-check"></i> Detalle de Transacciones
                </h6>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead class="table-dark">
                      <tr>
                        <th class="text-center">#</th>
                        <th>Cliente</th>
                        <th>Tipo de Pago</th>
                        <th class="text-end">Monto USD</th>
                        <th class="text-end">Monto VES</th>
                        <th>Método de Pago</th>
                        <th>Referencia</th>
                        <th>Transacción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(ingreso, index) in reporteCierreCaja.ingresosDetallados" :key="ingreso.id" 
                          :class="ingreso.montoUSD > 0 ? 'table-success-light' : 'table-info-light'">
                        <td class="text-center">
                          <span class="badge bg-secondary">{{ index + 1 }}</span>
                        </td>
                        <td>
                          <strong>{{ ingreso.cliente }}</strong>
                        </td>
                        <td>
                          <span :class="getTipoBadgeClass(ingreso.tipoIngreso)" class="badge">
                            {{ ingreso.tipoIngreso }}
                          </span>
                        </td>
                        <td class="text-end">
                          <span v-if="ingreso.montoUSD > 0" class="text-success fw-bold">
                            ${{ ingreso.montoUSD.toFixed(2) }}
                          </span>
                          <span v-else class="text-muted">-</span>
                        </td>
                        <td class="text-end">
                          <span v-if="ingreso.montoVES > 0" class="text-info fw-bold">
                            {{ ingreso.montoVES.toLocaleString() }} Bs
                          </span>
                          <span v-else class="text-muted">-</span>
                        </td>
                        <td>
                          <span :class="getMetodoBadgeClass(ingreso.metodoPago)" class="badge">
                            {{ ingreso.metodoPago }}
                          </span>
                        </td>
                        <td>
                          <span v-if="ingreso.referencia" class="text-primary fw-bold">
                            {{ ingreso.referencia }}
                          </span>
                          <span v-else class="text-muted">Sin referencia</span>
                        </td>
                        <td>
                          <small class="text-muted">{{ ingreso.idVenta }}</small>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <!-- Desglose por Método de Pago -->
            <div class="row mt-4">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header bg-secondary text-white">
                    <h6 class="mb-0">
                      <i class="bi bi-credit-card"></i> Desglose por Método de Pago
                    </h6>
                  </div>
                  <div class="card-body">
                    <div v-for="(monto, metodo) in reporteCierreCaja.desgloseMetodo" :key="metodo" 
                         class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                      <div>
                        <span class="fw-bold">{{ metodo }}</span>
                        <br>
                        <small class="text-muted">{{ monto.cantidad }} transacción(es)</small>
                      </div>
                      <div class="text-end">
                        <div v-if="monto.montoUSD > 0" class="text-success fw-bold">
                          ${{ monto.montoUSD.toFixed(2) }}
                        </div>
                        <div v-if="monto.montoVES > 0" class="text-info fw-bold">
                          {{ monto.montoVES.toLocaleString() }} Bs
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header bg-success text-white">
                    <h6 class="mb-0">
                      <i class="bi bi-calculator"></i> Resumen Final
                    </h6>
                  </div>
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3 p-3 bg-success bg-opacity-10 rounded">
                      <div>
                        <span class="fw-bold text-success">Total en Dólares</span>
                        <br>
                        <small class="text-muted">USD</small>
                      </div>
                      <div class="text-success fw-bold fs-4">
                        ${{ reporteCierreCaja.totales.totalGeneralUSD.toFixed(2) }}
                      </div>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center mb-3 p-3 bg-info bg-opacity-10 rounded">
                      <div>
                        <span class="fw-bold text-info">Total en Bolívares</span>
                        <br>
                        <small class="text-muted">VES</small>
                      </div>
                      <div class="text-info fw-bold fs-4">
                        {{ reporteCierreCaja.totales.totalGeneralVES.toLocaleString() }} Bs
                      </div>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center p-3 bg-warning bg-opacity-10 rounded">
                      <div>
                        <span class="fw-bold text-warning">Total Transacciones</span>
                        <br>
                        <small class="text-muted">Movimientos</small>
                      </div>
                      <div class="text-warning fw-bold fs-4">
                        {{ reporteCierreCaja.ingresosDetallados.length }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          <button v-if="reporteCierreCaja" type="button" class="btn btn-success" @click="imprimirCierreCaja">
            <i class="bi bi-printer"></i> Imprimir
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Reporte por Rango -->
  <div class="modal fade" id="modalReporteRango" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="bi bi-graph-up"></i> Reporte de Ingresos por Rango</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="row mb-3">
            <div class="col-md-4">
              <label class="form-label">Fecha Inicio</label>
              <input type="date" class="form-control" v-model="fechaInicioReporte">
            </div>
            <div class="col-md-4">
              <label class="form-label">Fecha Fin</label>
              <input type="date" class="form-control" v-model="fechaFinReporte">
            </div>
            <div class="col-md-4 d-flex align-items-end">
              <button class="btn btn-primary" @click="procesarReporteRango">
                <i class="bi bi-graph-up"></i> Generar Reporte
              </button>
            </div>
          </div>
          
          <div v-if="reporteRango" class="mt-4">
            <h6>Reporte del {{ formatFecha(fechaInicioReporte) }} al {{ formatFecha(fechaFinReporte) }}</h6>
            
            <!-- Resumen Ejecutivo -->
            <div class="row mb-4">
              <div class="col-md-3">
                <div class="card bg-primary text-white">
                  <div class="card-body text-center">
                    <h5>${{ reporteRango.totales.totalGeneralUSD.toFixed(2) }}</h5>
                    <small>Total USD</small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-info text-white">
                  <div class="card-body text-center">
                    <h5>{{ reporteRango.totales.totalGeneralVES.toLocaleString() }} Bs</h5>
                    <small>Total VES</small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-success text-white">
                  <div class="card-body text-center">
                    <h5>{{ reporteRango.ingresosDetallados.length }}</h5>
                    <small>Transacciones</small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-warning text-white">
                  <div class="card-body text-center">
                    <h5>${{ reporteRango.totales.abonosADeudasUSD.toFixed(2) }}</h5>
                    <small>Abonos a Deudas</small>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Tabla Detallada -->
            <div class="table-responsive">
              <table class="table table-sm">
                <thead class="table-dark">
                  <tr>
                    <th>Fecha</th>
                    <th>Transacción</th>
                    <th>Cliente</th>
                    <th>Monto USD</th>
                    <th>Monto VES</th>
                    <th>Método</th>
                    <th>Referencia</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ingreso in reporteRango.ingresosDetallados" :key="ingreso.id">
                    <td>{{ formatFecha(ingreso.fecha) }}</td>
                    <td>{{ ingreso.idVenta }} ({{ ingreso.tipoIngreso }})</td>
                    <td>{{ ingreso.cliente }}</td>
                    <td>{{ ingreso.montoUSD > 0 ? '$' + ingreso.montoUSD.toFixed(2) : '-' }}</td>
                    <td>{{ ingreso.montoVES > 0 ? ingreso.montoVES.toLocaleString() + ' Bs' : '-' }}</td>
                    <td>{{ ingreso.metodoPago }}</td>
                    <td>{{ ingreso.referencia || '-' }}</td>
                    <td>
                      <span :class="getTipoBadgeClass(ingreso.tipoIngreso)" class="badge">
                        {{ ingreso.tipoIngreso }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Desgloses -->
            <div class="row mt-4">
              <div class="col-md-6">
                <h6>Desglose por Método de Pago</h6>
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Método</th>
                        <th>Monto</th>
                        <th>Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(metodo, nombre) in reporteRango.desgloseMetodo" :key="nombre">
                        <td>{{ nombre }}</td>
                        <td>
                          {{ metodo.montoUSD > 0 ? '$' + metodo.montoUSD.toFixed(2) : metodo.montoVES.toLocaleString() + ' Bs' }}
                        </td>
                        <td>{{ metodo.cantidad }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="col-md-6">
                <h6>Desglose por Tipo de Ingreso</h6>
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Monto USD</th>
                        <th>Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(tipo, nombre) in reporteRango.desgloseTipo" :key="nombre">
                        <td>{{ nombre }}</td>
                        <td>${{ tipo.montoUSD.toFixed(2) }}</td>
                        <td>{{ tipo.cantidad }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          <button v-if="reporteRango" type="button" class="btn btn-success" @click="imprimirReporteRango">
            <i class="bi bi-printer"></i> Imprimir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  getIngresos, 
  getEstadisticasIngresos, 
  filtrarIngresos, 
  calcularTotalesIngresos,
  getDesglosePorMetodo,
  generarCierreDeCaja,
  generarReportePorRango
} from '../services/ingresosService.js'
import Swal from 'sweetalert2'

// Estado reactivo
const ingresos = ref([])
const estadisticas = ref({
  hoy: { totalGeneralUSD: 0, totalGeneralVES: 0 },
  semana: { totalGeneralUSD: 0, totalGeneralVES: 0 },
  mes: { totalGeneralUSD: 0, totalGeneralVES: 0 },
  totalIngresos: 0
})
const filtros = ref({
  fechaInicio: '',
  fechaFin: '',
  metodoPago: '',
  tipoIngreso: '',
  cliente: '',
  referencia: ''
})

// Modales
const fechaCierreCaja = ref('')
const reporteCierreCaja = ref(null)
const fechaInicioReporte = ref('')
const fechaFinReporte = ref('')
const reporteRango = ref(null)

// Computed properties
const ingresosFiltrados = computed(() => {
  return filtrarIngresos(filtros.value)
})

const totalesFiltrados = computed(() => {
  return calcularTotalesIngresos(ingresosFiltrados.value)
})

const desgloseMetodo = computed(() => {
  return getDesglosePorMetodo(ingresosFiltrados.value)
})

const totalesGenerales = computed(() => {
  const totales = calcularTotalesIngresos(ingresos.value)
  return {
    totalUSD: totales.totalGeneralUSD,
    totalVES: totales.totalGeneralVES
  }
})

// Funciones
async function cargarDatos() {
  try {
    console.log('📊 Cargando datos de ingresos...')
    
    // Cargar ingresos y estadísticas de forma asíncrona
    const ingresosData = await getIngresos()
    const estadisticasData = await getEstadisticasIngresos()
    
    ingresos.value = ingresosData
    estadisticas.value = estadisticasData
    
    console.log('✅ Datos de ingresos cargados:', {
      ingresos: ingresos.value.length,
      estadisticas: estadisticas.value
    })
    
  } catch (error) {
    console.error('Error cargando datos de ingresos:', error)
    
    // Usar datos por defecto en caso de error
    ingresos.value = []
    estadisticas.value = {
      hoy: { totalGeneralUSD: 0, totalGeneralVES: 0 },
      semana: { totalGeneralUSD: 0, totalGeneralVES: 0 },
      mes: { totalGeneralUSD: 0, totalGeneralVES: 0 },
      totalIngresos: 0
    }
    
    Swal.fire({
      title: 'Error',
      text: 'No se pudieron cargar los datos de ingresos',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
  }
}

function aplicarFiltros() {
  // Los filtros se aplican automáticamente por el computed
}

function limpiarFiltros() {
  filtros.value = {
    fechaInicio: '',
    fechaFin: '',
    metodoPago: '',
    tipoIngreso: '',
    cliente: '',
    referencia: ''
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

function generarCierreCaja() {
  fechaCierreCaja.value = new Date().toISOString().split('T')[0]
  const modal = new bootstrap.Modal(document.getElementById('modalCierreCaja'))
  modal.show()
}

function procesarCierreCaja() {
  if (!fechaCierreCaja.value) {
    Swal.fire('Error', 'Por favor selecciona una fecha', 'error')
    return
  }
  
  reporteCierreCaja.value = generarCierreDeCaja(fechaCierreCaja.value)
  
  if (reporteCierreCaja.value.ingresosDetallados.length === 0) {
    Swal.fire('Sin datos', 'No se encontraron ingresos para la fecha seleccionada', 'info')
  }
}

function generarReporteRango() {
  const hoy = new Date()
  const hace7Dias = new Date()
  hace7Dias.setDate(hoy.getDate() - 7)
  
  fechaInicioReporte.value = hace7Dias.toISOString().split('T')[0]
  fechaFinReporte.value = hoy.toISOString().split('T')[0]
  
  const modal = new bootstrap.Modal(document.getElementById('modalReporteRango'))
  modal.show()
}

function procesarReporteRango() {
  if (!fechaInicioReporte.value || !fechaFinReporte.value) {
    Swal.fire('Error', 'Por favor selecciona ambas fechas', 'error')
    return
  }
  
  reporteRango.value = generarReportePorRango(fechaInicioReporte.value, fechaFinReporte.value)
  
  if (reporteRango.value.ingresosDetallados.length === 0) {
    Swal.fire('Sin datos', 'No se encontraron ingresos para el período seleccionado', 'info')
  }
}

function exportarDatos() {
  // Crear CSV
  const headers = ['ID', 'Fecha', 'Cliente', 'Monto USD', 'Monto VES', 'Método de Pago', 'Referencia', 'Tipo de Ingreso', 'Descripción']
  const csvContent = [
    headers.join(','),
    ...ingresosFiltrados.value.map(ingreso => [
      ingreso.id,
      formatFecha(ingreso.fecha),
      `"${ingreso.cliente}"`,
      ingreso.montoUSD,
      ingreso.montoVES,
      `"${ingreso.metodoPago}"`,
      `"${ingreso.referencia || ''}"`,
      `"${ingreso.tipoIngreso}"`,
      `"${ingreso.descripcion}"`
    ].join(','))
  ].join('\n')
  
  // Descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `ingresos_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  Swal.fire('¡Exportado!', 'Los datos han sido exportados correctamente', 'success')
}

function imprimirCierreCaja() {
  window.print()
}

function imprimirReporteRango() {
  window.print()
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function getMetodoBadgeClass(metodo) {
  const clases = {
    'Efectivo (USD)': 'bg-success',
    'Zelle (USD)': 'bg-primary',
    'Punto de Venta (VES)': 'bg-info',
    'Pago Móvil (VES)': 'bg-warning',
    'Transferencia (VES)': 'bg-secondary'
  }
  return clases[metodo] || 'bg-dark'
}

function getTipoBadgeClass(tipo) {
  const clases = {
    'Pago Completo de Contado': 'bg-success',
    'Abono Inicial': 'bg-primary',
    'Abono a Deuda': 'bg-warning',
    'Delivery': 'bg-info'
  }
  return clases[tipo] || 'bg-dark'
}

// Lifecycle
onMounted(() => {
  cargarDatos()
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

/* Estilos para KPI cards más compactas */
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

/* Estilos para tabla de cierre de caja */
.table-success-light {
  background-color: rgba(25, 135, 84, 0.05) !important;
}

.table-info-light {
  background-color: rgba(13, 202, 240, 0.05) !important;
}

.table-success-light:hover {
  background-color: rgba(25, 135, 84, 0.1) !important;
}

.table-info-light:hover {
  background-color: rgba(13, 202, 240, 0.1) !important;
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
