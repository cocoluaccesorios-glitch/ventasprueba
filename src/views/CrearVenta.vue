<template>
  <div class="card shadow-sm">
    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
      <h4 class="mb-0">Registrar Nueva Venta</h4>
      <div class="d-flex gap-2">
        <button type="button" class="btn btn-outline-light btn-sm" @click="buscarCliente">
          <i class="bi bi-search"></i> Buscar Cliente
        </button>
        <button type="button" class="btn btn-outline-light btn-sm" @click="nuevoCliente">
          <i class="bi bi-person-plus"></i> Nuevo Cliente
        </button>
      </div>
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <!-- Datos del Cliente -->
        <fieldset class="mb-4 p-3 border rounded">
          <legend class="float-none w-auto px-2 h6">Datos del Cliente</legend>
          <div class="row">
            <div class="col-md-3 mb-3">
              <label for="cliente-cedula" class="form-label">Cédula/RIF *</label>
              <input type="text" id="cliente-cedula" class="form-control" v-model="venta.cliente_cedula" 
                     @blur="buscarClientePorCedula" required>
            </div>
            <div class="col-md-3 mb-3">
              <label for="cliente-nombre" class="form-label">Nombre *</label>
              <input type="text" id="cliente-nombre" class="form-control" v-model="venta.cliente_nombre" required>
            </div>
            <div class="col-md-3 mb-3">
              <label for="cliente-apellido" class="form-label">Apellido</label>
              <input type="text" id="cliente-apellido" class="form-control" v-model="venta.cliente_apellido">
            </div>
            <div class="col-md-3 mb-3">
              <label for="cliente-telefono" class="form-label">Teléfono</label>
              <input type="tel" id="cliente-telefono" class="form-control" v-model="venta.cliente_telefono">
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="cliente-email" class="form-label">Email</label>
              <input type="email" id="cliente-email" class="form-control" v-model="venta.cliente_email">
            </div>
            <div class="col-md-6 mb-3">
              <label for="cliente-direccion" class="form-label">Dirección</label>
              <input type="text" id="cliente-direccion" class="form-control" v-model="venta.cliente_direccion">
            </div>
          </div>
        </fieldset>
        <!-- Añadir Productos -->
        <fieldset class="mb-4 p-3 border rounded">
          <legend class="float-none w-auto px-2 h6">Añadir Productos</legend>
          <div class="row align-items-end">
            <div class="col-md-6 mb-3">
              <label for="producto-select" class="form-label">Producto</label>
              <select id="producto-select" class="form-select" v-model="productoSeleccionado">
                <option :value="null" disabled>-- Seleccione --</option>
                <option v-for="p in productos" :key="p.id" :value="p">
                  {{ p.nombre }} 
                  <span v-if="p.sku">({{ p.sku }})</span>
                  - Stock: {{ p.stock_actual }} - ${{ p.precio_usd }}
                  <span v-if="p.categorias_producto">[{{ p.categorias_producto.nombre }}]</span>
                </option>
              </select>
            </div>
            <div class="col-md-2 mb-3">
              <label for="producto-cantidad" class="form-label">Cantidad</label>
              <input type="number" id="producto-cantidad" class="form-control" 
                     v-model.number="cantidadSeleccionada" min="1" max="999">
            </div>
            <div class="col-md-2 mb-3">
              <label for="producto-precio" class="form-label">Precio Unit.</label>
              <input type="number" id="producto-precio" class="form-control" 
                     v-model.number="precioSeleccionado" step="0.01" min="0">
            </div>
            <div class="col-md-2 mb-3">
              <button type="button" class="btn btn-secondary w-100" @click="agregarProducto" 
                      :disabled="!productoSeleccionado || cantidadSeleccionada < 1">
                <i class="bi bi-plus-circle"></i> Añadir
              </button>
            </div>
          </div>
          
          <!-- Producto Manual -->
          <div class="row align-items-end">
            <div class="col-md-4 mb-3">
              <label for="producto-manual" class="form-label">Producto Manual</label>
              <input type="text" id="producto-manual" class="form-control" 
                     v-model="productoManual.descripcion" placeholder="Descripción del producto">
            </div>
            <div class="col-md-2 mb-3">
              <label for="cantidad-manual" class="form-label">Cantidad</label>
              <input type="number" id="cantidad-manual" class="form-control" 
                     v-model.number="productoManual.cantidad" min="1">
            </div>
            <div class="col-md-2 mb-3">
              <label for="precio-manual" class="form-label">Precio Unit.</label>
              <input type="number" id="precio-manual" class="form-control" 
                     v-model.number="productoManual.precio" step="0.01" min="0">
            </div>
            <div class="col-md-2 mb-3">
              <button type="button" class="btn btn-outline-secondary w-100" @click="agregarProductoManual">
                <i class="bi bi-plus-circle"></i> Añadir Manual
              </button>
            </div>
          </div>
        </fieldset>
        <!-- Detalles del Pedido -->
        <div v-if="detallesPedido.length > 0" class="mt-4">
          <h5>Detalles del Pedido</h5>
          <div class="table-responsive">
            <table class="table table-bordered table-striped table-hover">
              <thead class="table-dark">
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio U.</th>
                  <th>Subtotal</th>
                  <th>Tipo</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in detallesPedido" :key="item.id">
                  <td>
                    <div>
                      <strong>{{ item.nombre }}</strong>
                      <small v-if="item.sku && item.sku !== 'MANUAL'" class="text-muted d-block">
                        SKU: {{ item.sku }}
                      </small>
                    </div>
                  </td>
                  <td>
                    <div class="input-group input-group-sm" style="width: 100px;">
                      <button class="btn btn-outline-secondary" type="button" 
                              @click="modificarCantidad(index, -1)" :disabled="item.cantidad <= 1">-</button>
                      <input type="number" class="form-control text-center" 
                             v-model.number="item.cantidad" min="1" 
                             @change="validarCantidad(index)">
                      <button class="btn btn-outline-secondary" type="button" 
                              @click="modificarCantidad(index, 1)">+</button>
                    </div>
                  </td>
                  <td>
                    <input type="number" class="form-control form-control-sm" 
                           v-model.number="item.precio_unitario" step="0.01" min="0"
                           @change="validarPrecio(index)" style="width: 100px;">
                  </td>
                  <td class="text-end">
                    <strong>${{ (item.cantidad * item.precio_unitario).toFixed(2) }}</strong>
                  </td>
                  <td>
                    <span class="badge" :class="item.es_manual ? 'bg-warning' : 'bg-primary'">
                      {{ item.es_manual ? 'Manual' : 'Inventario' }}
                    </span>
                  </td>
                  <td>
                    <button type="button" class="btn btn-danger btn-sm" 
                            @click="eliminarProducto(index)" title="Eliminar">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="alert alert-info text-center">Aún no has añadido productos al pedido.</div>
        <!-- Configuración de Pago y Entrega -->
        <fieldset class="mb-4 p-3 border rounded">
          <legend class="float-none w-auto px-2 h6">Configuración de Pago y Entrega</legend>
          <div class="row">
            <div class="col-md-4 mb-3">
              <label for="metodo-pago" class="form-label">Método de Pago *</label>
              <select id="metodo-pago" class="form-select" v-model="venta.metodo_pago" required>
                <option value="">-- Seleccione --</option>
                <option value="Efectivo (USD)">Efectivo (USD)</option>
                <option value="Zelle (USD)">Zelle (USD)</option>
                <option value="Punto de Venta (VES)">Punto de Venta (VES)</option>
                <option value="Pago Móvil (VES)">Pago Móvil (VES)</option>
                <option value="Transferencia (VES)">Transferencia (VES)</option>
              </select>
            </div>
            <div class="col-md-4 mb-3">
              <label for="referencia-pago" class="form-label">Referencia</label>
              <input type="text" id="referencia-pago" class="form-control" 
                     v-model="venta.referencia_pago" placeholder="Número de referencia">
            </div>
            <div class="col-md-4 mb-3">
              <label for="tasa-bcv" class="form-label">Tasa BCV</label>
              <input type="number" id="tasa-bcv" class="form-control" 
                     v-model.number="venta.tasa_bcv" step="0.01" min="0" required>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="entrega-inmediata" v-model="venta.entrega_inmediata">
                <label class="form-check-label" for="entrega-inmediata">
                  Entrega Inmediata
                </label>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="aplica-iva" v-model="venta.aplica_iva">
                <label class="form-check-label" for="aplica-iva">
                  Aplicar IVA (16%)
                </label>
              </div>
            </div>
          </div>
        </fieldset>

        <!-- Resumen de Totales -->
        <div class="row justify-content-end mt-4">
          <div class="col-md-6">
            <ul class="list-group">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <strong>Subtotal:</strong>
                <span class="badge bg-light text-dark fs-6">${{ subtotal.toFixed(2) }}</span>
              </li>
              
              <li class="list-group-item">
                <div class="input-group">
                  <span class="input-group-text">Descuento ($)</span>
                  <input type="number" class="form-control" v-model.number="venta.monto_descuento_usd" 
                         min="0" :max="subtotal" step="0.01">
                </div>
                <input v-if="venta.monto_descuento_usd > 0" type="text" class="form-control mt-2" 
                       v-model="venta.comentarios_descuento" placeholder="Motivo del descuento" required>
              </li>
              
              <li class="list-group-item">
                <div class="input-group">
                  <span class="input-group-text">Delivery ($)</span>
                  <input type="number" class="form-control" v-model.number="venta.monto_delivery_usd" 
                         min="0" step="0.01">
                </div>
              </li>
              
              <li v-if="venta.aplica_iva" class="list-group-item d-flex justify-content-between align-items-center">
                <strong>IVA (16%):</strong>
                <span class="badge bg-warning text-dark fs-6">${{ ivaCalculado.toFixed(2) }}</span>
              </li>
              
              <li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white">
                <strong class="fs-5">TOTAL:</strong>
                <span class="badge bg-success fs-5">${{ total.toFixed(2) }}</span>
              </li>
              
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <strong>Total en VES:</strong>
                <span class="badge bg-info text-dark fs-6">Bs. {{ totalVES.toFixed(2) }}</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="d-grid gap-2 mt-4"><button type="submit" class="btn btn-primary btn-lg" :disabled="isSubmitting || detallesPedido.length === 0"><span v-if="isSubmitting" class="spinner-border spinner-border-sm"></span> {{ isSubmitting ? 'Procesando...' : 'Registrar Venta' }}</button></div>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { getProducts, createSale, getTasaCambio } from '../services/apiService.js';
import Swal from 'sweetalert2';

const productos = ref([]);
const productoSeleccionado = ref(null);
const cantidadSeleccionada = ref(1);
const precioSeleccionado = ref(0);
const detallesPedido = ref([]);
const isSubmitting = ref(false);

const productoManual = ref({
  descripcion: '',
  cantidad: 1,
  precio: 0
});

const venta = ref({
  cliente_cedula: '',
  cliente_nombre: '',
  cliente_apellido: '',
  cliente_telefono: '',
  cliente_email: '',
  cliente_direccion: '',
  metodo_pago: '',
  referencia_pago: '',
  tasa_bcv: 36.0,
  entrega_inmediata: false,
  aplica_iva: false,
  monto_descuento_usd: 0,
  monto_delivery_usd: 0,
  comentarios_descuento: '',
  comentarios: ''
});

onMounted(async () => {
  productos.value = await getProducts();
  // Cargar tasa de cambio actual
  const tasa = await getTasaCambio();
  if (tasa) {
    venta.value.tasa_bcv = tasa;
  }
});

// Watchers para actualizar precios automáticamente
watch(productoSeleccionado, (nuevoProducto) => {
  if (nuevoProducto) {
    precioSeleccionado.value = nuevoProducto.precio_usd;
  }
});

const subtotal = computed(() => 
  detallesPedido.value.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0)
);

const ivaCalculado = computed(() => {
  if (!venta.value.aplica_iva) return 0;
  const baseImponible = subtotal.value - (venta.value.monto_descuento_usd || 0);
  return baseImponible * 0.16;
});

const total = computed(() => {
  const baseImponible = subtotal.value - (venta.value.monto_descuento_usd || 0);
  const iva = venta.value.aplica_iva ? baseImponible * 0.16 : 0;
  const delivery = venta.value.monto_delivery_usd || 0;
  const totalCalculado = baseImponible + iva + delivery;
  return totalCalculado < 0 ? 0 : totalCalculado;
});

const totalVES = computed(() => {
  return total.value * (venta.value.tasa_bcv || 36.0);
});

function agregarProducto() {
  if (!productoSeleccionado.value || cantidadSeleccionada.value < 1) {
    Swal.fire('Atención', 'Selecciona un producto y una cantidad válida.', 'warning');
    return;
  }
  
  if (cantidadSeleccionada.value > productoSeleccionado.value.stock_actual) {
    Swal.fire('Stock Insuficiente', `Solo quedan ${productoSeleccionado.value.stock_actual} unidades.`, 'error');
    return;
  }
  
  if (precioSeleccionado.value <= 0) {
    Swal.fire('Error', 'El precio debe ser mayor a 0.', 'error');
    return;
  }
  
  const productoExistente = detallesPedido.value.find(item => item.id === productoSeleccionado.value.id);
  
  if (productoExistente) {
    productoExistente.cantidad += cantidadSeleccionada.value;
    productoExistente.precio_unitario = precioSeleccionado.value;
  } else {
    detallesPedido.value.push({
      id: productoSeleccionado.value.id,
      nombre: productoSeleccionado.value.nombre,
      sku: productoSeleccionado.value.sku,
      cantidad: cantidadSeleccionada.value,
      precio_unitario: precioSeleccionado.value,
      es_manual: false
    });
  }
  
  limpiarSeleccionProducto();
}

function agregarProductoManual() {
  if (!productoManual.value.descripcion.trim() || productoManual.value.cantidad < 1 || productoManual.value.precio <= 0) {
    Swal.fire('Error', 'Completa todos los campos del producto manual.', 'error');
    return;
  }
  
  const idManual = `MANUAL-${Date.now()}`;
  detallesPedido.value.push({
    id: idManual,
    nombre: productoManual.value.descripcion,
    sku: 'MANUAL',
    cantidad: productoManual.value.cantidad,
    precio_unitario: productoManual.value.precio,
    es_manual: true
  });
  
  limpiarProductoManual();
}

function limpiarSeleccionProducto() {
  productoSeleccionado.value = null;
  cantidadSeleccionada.value = 1;
  precioSeleccionado.value = 0;
}

function limpiarProductoManual() {
  productoManual.value = {
    descripcion: '',
    cantidad: 1,
    precio: 0
  };
}

function eliminarProducto(index) {
  Swal.fire({
    title: '¿Eliminar producto?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      detallesPedido.value.splice(index, 1);
    }
  });
}

function modificarCantidad(index, cambio) {
  const item = detallesPedido.value[index];
  const nuevaCantidad = item.cantidad + cambio;
  
  if (nuevaCantidad < 1) return;
  
  // Validar stock para productos de inventario
  if (!item.es_manual) {
    const producto = productos.value.find(p => p.id === item.id);
    if (producto && nuevaCantidad > producto.stock_actual) {
      Swal.fire('Stock Insuficiente', `Solo quedan ${producto.stock_actual} unidades.`, 'error');
      return;
    }
  }
  
  item.cantidad = nuevaCantidad;
}

function validarCantidad(index) {
  const item = detallesPedido.value[index];
  
  if (item.cantidad < 1) {
    item.cantidad = 1;
  }
  
  // Validar stock para productos de inventario
  if (!item.es_manual) {
    const producto = productos.value.find(p => p.id === item.id);
    if (producto && item.cantidad > producto.stock_actual) {
      Swal.fire('Stock Insuficiente', `Solo quedan ${producto.stock_actual} unidades.`, 'error');
      item.cantidad = producto.stock_actual;
    }
  }
}

function validarPrecio(index) {
  const item = detallesPedido.value[index];
  
  if (item.precio_unitario < 0) {
    item.precio_unitario = 0;
  }
}

// Funciones de búsqueda de clientes
async function buscarClientePorCedula() {
  if (!venta.value.cliente_cedula.trim()) return;
  
  try {
    // Aquí implementarías la búsqueda en la base de datos
    // Por ahora simulamos con datos de prueba
    const clienteEncontrado = await buscarClienteEnBD(venta.value.cliente_cedula);
    if (clienteEncontrado) {
      venta.value.cliente_nombre = clienteEncontrado.nombre;
      venta.value.cliente_apellido = clienteEncontrado.apellido;
      venta.value.cliente_telefono = clienteEncontrado.telefono;
      venta.value.cliente_email = clienteEncontrado.email;
      venta.value.cliente_direccion = clienteEncontrado.direccion;
    }
  } catch (error) {
    console.log('Cliente no encontrado:', error);
  }
}

async function buscarClienteEnBD(cedula) {
  // Simulación de búsqueda en BD
  // En implementación real, harías una consulta a Supabase
  return null;
}

function buscarCliente() {
  Swal.fire({
    title: 'Buscar Cliente',
    input: 'text',
    inputPlaceholder: 'Ingresa cédula, nombre o teléfono',
    showCancelButton: true,
    confirmButtonText: 'Buscar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      // Implementar búsqueda real
      console.log('Buscando cliente:', result.value);
    }
  });
}

function nuevoCliente() {
  Swal.fire({
    title: 'Nuevo Cliente',
    html: `
      <div class="text-start">
        <div class="mb-3">
          <label class="form-label">Cédula/RIF *</label>
          <input type="text" class="form-control" id="nueva-cedula" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Nombre *</label>
          <input type="text" class="form-control" id="nuevo-nombre" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Apellido</label>
          <input type="text" class="form-control" id="nuevo-apellido">
        </div>
        <div class="mb-3">
          <label class="form-label">Teléfono</label>
          <input type="tel" class="form-control" id="nuevo-telefono">
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" id="nuevo-email">
        </div>
        <div class="mb-3">
          <label class="form-label">Dirección</label>
          <input type="text" class="form-control" id="nueva-direccion">
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const cedula = document.getElementById('nueva-cedula').value;
      const nombre = document.getElementById('nuevo-nombre').value;
      const apellido = document.getElementById('nuevo-apellido').value;
      const telefono = document.getElementById('nuevo-telefono').value;
      const email = document.getElementById('nuevo-email').value;
      const direccion = document.getElementById('nueva-direccion').value;
      
      if (!cedula || !nombre) {
        Swal.showValidationMessage('Cédula y nombre son obligatorios');
        return false;
      }
      
      return { cedula, nombre, apellido, telefono, email, direccion };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const cliente = result.value;
      venta.value.cliente_cedula = cliente.cedula;
      venta.value.cliente_nombre = cliente.nombre;
      venta.value.cliente_apellido = cliente.apellido;
      venta.value.cliente_telefono = cliente.telefono;
      venta.value.cliente_email = cliente.email;
      venta.value.cliente_direccion = cliente.direccion;
      
      Swal.fire('¡Éxito!', 'Cliente agregado correctamente', 'success');
    }
  });
}

function resetForm() {
  venta.value = {
    cliente_cedula: '',
    cliente_nombre: '',
    cliente_apellido: '',
    cliente_telefono: '',
    cliente_email: '',
    cliente_direccion: '',
    metodo_pago: '',
    referencia_pago: '',
    tasa_bcv: 36.0,
    entrega_inmediata: false,
    aplica_iva: false,
    monto_descuento_usd: 0,
    monto_delivery_usd: 0,
    comentarios_descuento: '',
    comentarios: ''
  };
  detallesPedido.value = [];
  limpiarSeleccionProducto();
  limpiarProductoManual();
}

async function handleSubmit() {
  // Validaciones
  if (detallesPedido.value.length === 0) {
    Swal.fire('Error', 'Debes añadir al menos un producto.', 'error');
    return;
  }
  
  if (!venta.value.cliente_cedula.trim() || !venta.value.cliente_nombre.trim()) {
    Swal.fire('Error', 'Cédula y nombre del cliente son obligatorios.', 'error');
    return;
  }
  
  if (!venta.value.metodo_pago) {
    Swal.fire('Error', 'Debes seleccionar un método de pago.', 'error');
    return;
  }
  
  if (venta.value.monto_descuento_usd > 0 && !venta.value.comentarios_descuento.trim()) {
    Swal.fire('Error', 'El motivo del descuento es obligatorio.', 'error');
    return;
  }
  
  if (venta.value.tasa_bcv <= 0) {
    Swal.fire('Error', 'La tasa BCV debe ser mayor a 0.', 'error');
    return;
  }
  
  isSubmitting.value = true;
  
  const payload = {
    // Datos del cliente
    cliente_cedula: venta.value.cliente_cedula,
    cliente_nombre: venta.value.cliente_nombre,
    cliente_apellido: venta.value.cliente_apellido,
    cliente_telefono: venta.value.cliente_telefono,
    cliente_email: venta.value.cliente_email,
    cliente_direccion: venta.value.cliente_direccion,
    
    // Configuración de la venta
    metodo_pago: venta.value.metodo_pago,
    referencia_pago: venta.value.referencia_pago,
    tasa_bcv: venta.value.tasa_bcv,
    entrega_inmediata: venta.value.entrega_inmediata,
    aplica_iva: venta.value.aplica_iva,
    
    // Totales
    monto_descuento_usd: venta.value.monto_descuento_usd || 0,
    monto_delivery_usd: venta.value.monto_delivery_usd || 0,
    comentarios_descuento: venta.value.comentarios_descuento,
    comentarios: venta.value.comentarios,
    
    // Productos
    productos: detallesPedido.value.map(item => ({
      id: item.id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      es_manual: item.es_manual || false,
      descripcion_manual: item.es_manual ? item.nombre : ''
    }))
  };
  
  try {
    const resultado = await createSale(payload);
    Swal.fire({
      title: '¡Venta Registrada!',
      text: `Venta #${resultado} procesada correctamente`,
      icon: 'success',
      confirmButtonText: 'Continuar'
    });
    resetForm();
  } catch (error) {
    console.error("Error al procesar la venta:", error);
    Swal.fire('Error', `No se pudo procesar la venta: ${error.message}`, 'error');
  } finally {
    isSubmitting.value = false;
  }
}
</script>
<style scoped>
fieldset { border: 1px solid #dee2e6 !important; }
legend { font-size: 1rem; font-weight: 600; }
</style>