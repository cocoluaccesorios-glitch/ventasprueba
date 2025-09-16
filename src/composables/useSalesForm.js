import { ref, computed, reactive } from 'vue'

export function useSalesForm() {
  
  // Estado principal de la venta
  const venta = reactive({
    cliente_cedula: '',
    cliente_nombre: '',
    cliente_apellido: '',
    cliente_telefono: '',
    cliente_email: '',
    cliente_direccion: '',
    metodo_pago: '',
    referencia_pago: '',
    tasa_bcv: 36.0,
    entrega_inmediata: true,
    aplica_iva: false,
    monto_descuento_usd: 0,
    monto_delivery_usd: 0,
    comentarios_descuento: '',
    comentarios: '',
    fecha_vencimiento: '',
    monto_abono: 0
  })

  // Estado de productos
  const detallesPedido = ref([])
  const productoSeleccionado = ref(null)
  const cantidadSeleccionada = ref(1)
  const precioSeleccionado = ref(0)

  // Estado de cliente
  const clienteSeleccionado = ref(null)
  const clienteSearchQuery = ref('')
  const resultadosBusqueda = ref([])
  const mostrarResultados = ref(false)

  // Estado de productos manuales
  const productoManual = reactive({
    nombre: '',
    precio: 0,
    cantidad: 1
  })

  // Computed properties
  const subtotal = computed(() => {
    return detallesPedido.value.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0)
  })

  const total = computed(() => {
    let total = subtotal.value - venta.monto_descuento_usd
    if (venta.aplica_iva) {
      total += total * 0.16
    }
    total += venta.monto_delivery_usd
    return total
  })

  const requiereReferencia = computed(() => {
    return ['Zelle (USD)', 'Pago Móvil (VES)', 'Transferencia (VES)', 'Punto de Venta (VES)'].includes(venta.metodo_pago)
  })

  const requiereComentariosDescuento = computed(() => {
    return venta.monto_descuento_usd > 0
  })

  // Funciones de cliente
  function seleccionarCliente(cliente) {
    clienteSeleccionado.value = cliente
    venta.cliente_cedula = cliente.cedula_rif
    venta.cliente_nombre = cliente.nombre
    venta.cliente_apellido = cliente.apellido
    venta.cliente_telefono = cliente.telefono || ''
    venta.cliente_email = cliente.email || ''
    venta.cliente_direccion = cliente.direccion || ''
    
    clienteSearchQuery.value = ''
    resultadosBusqueda.value = []
    mostrarResultados.value = false
  }

  function quitarClienteSeleccionado() {
    clienteSeleccionado.value = null
    venta.cliente_cedula = ''
    venta.cliente_nombre = ''
    venta.cliente_apellido = ''
    venta.cliente_telefono = ''
    venta.cliente_email = ''
    venta.cliente_direccion = ''
    
    clienteSearchQuery.value = ''
    resultadosBusqueda.value = []
    mostrarResultados.value = false
  }

  // Funciones de productos
  function onProductSelected(producto) {
    productoSeleccionado.value = producto
    precioSeleccionado.value = producto.precio
    cantidadSeleccionada.value = 1
  }

  function onProductCleared() {
    productoSeleccionado.value = null
    precioSeleccionado.value = 0
    cantidadSeleccionada.value = 1
  }

  function agregarProducto() {
    if (!productoSeleccionado.value || cantidadSeleccionada.value < 1) {
      return false
    }

    const nuevoItem = {
      id: productoSeleccionado.value.id,
      nombre: productoSeleccionado.value.nombre,
      sku: productoSeleccionado.value.sku || '',
      cantidad: cantidadSeleccionada.value,
      precio_unitario: precioSeleccionado.value,
      es_manual: false
    }

    detallesPedido.value.push(nuevoItem)
    limpiarSeleccionProducto()
    return true
  }

  function agregarProductoManual() {
    if (!productoManual.nombre.trim() || productoManual.precio <= 0 || productoManual.cantidad < 1) {
      return false
    }

    const nuevoItem = {
      id: 'MANUAL',
      nombre: productoManual.nombre.trim(),
      sku: 'MANUAL',
      cantidad: productoManual.cantidad,
      precio_unitario: productoManual.precio,
      es_manual: true
    }

    detallesPedido.value.push(nuevoItem)
    limpiarProductoManual()
    return true
  }

  function eliminarProducto(index) {
    const producto = detallesPedido.value[index]
    detallesPedido.value.splice(index, 1)
    return producto
  }

  function validarCantidad(index) {
    const item = detallesPedido.value[index]
    if (item.cantidad < 1) {
      item.cantidad = 1
    }
  }

  function validarPrecio(index) {
    const item = detallesPedido.value[index]
    if (item.precio_unitario < 0) {
      item.precio_unitario = 0
    }
  }

  function limpiarSeleccionProducto() {
    productoSeleccionado.value = null
    cantidadSeleccionada.value = 1
    precioSeleccionado.value = 0
  }

  function limpiarProductoManual() {
    productoManual.nombre = ''
    productoManual.precio = 0
    productoManual.cantidad = 1
  }

  // Funciones de validación
  function validarFormulario() {
    const errores = []

    if (detallesPedido.value.length === 0) {
      errores.push('Debes añadir al menos un producto')
    }

    if (!venta.cliente_cedula.trim() || !venta.cliente_nombre.trim()) {
      errores.push('Cédula y nombre del cliente son obligatorios')
    }

    if (!venta.metodo_pago) {
      errores.push('Debes seleccionar un método de pago')
    }

    if (requiereReferencia.value && !venta.referencia_pago.trim()) {
      errores.push('La referencia es obligatoria para este método de pago')
    }

    if (requiereComentariosDescuento.value && !venta.comentarios_descuento.trim()) {
      errores.push('Los comentarios son obligatorios cuando se aplica descuento')
    }

    if (venta.tasa_bcv <= 0) {
      errores.push('La tasa BCV debe ser mayor a 0')
    }

    return errores
  }

  // Función de reset
  function resetForm() {
    // Reset venta
    Object.assign(venta, {
      cliente_cedula: '',
      cliente_nombre: '',
      cliente_apellido: '',
      cliente_telefono: '',
      cliente_email: '',
      cliente_direccion: '',
      metodo_pago: '',
      referencia_pago: '',
      tasa_bcv: 36.0,
      entrega_inmediata: true,
      aplica_iva: false,
      monto_descuento_usd: 0,
      monto_delivery_usd: 0,
      comentarios_descuento: '',
      comentarios: '',
      fecha_vencimiento: '',
      monto_abono: 0
    })

    // Reset otros estados
    detallesPedido.value = []
    clienteSeleccionado.value = null
    clienteSearchQuery.value = ''
    resultadosBusqueda.value = []
    mostrarResultados.value = false
    limpiarSeleccionProducto()
    limpiarProductoManual()
  }

  return {
    // Estado
    venta,
    detallesPedido,
    productoSeleccionado,
    cantidadSeleccionada,
    precioSeleccionado,
    clienteSeleccionado,
    clienteSearchQuery,
    resultadosBusqueda,
    mostrarResultados,
    productoManual,

    // Computed
    subtotal,
    total,
    requiereReferencia,
    requiereComentariosDescuento,

    // Funciones de cliente
    seleccionarCliente,
    quitarClienteSeleccionado,

    // Funciones de productos
    onProductSelected,
    onProductCleared,
    agregarProducto,
    agregarProductoManual,
    eliminarProducto,
    validarCantidad,
    validarPrecio,
    limpiarSeleccionProducto,
    limpiarProductoManual,

    // Funciones de validación
    validarFormulario,
    resetForm
  }
}
