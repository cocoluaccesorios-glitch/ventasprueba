/**
 * Helper Comprehensivo para el Formulario de Ventas
 * Maneja TODAS las variantes posibles de formularios de pedidos
 */

export class ComprehensiveSalesFormHelper {
  constructor(page) {
    this.page = page;
  }

  // ===== SELECCIÓN DE CLIENTE =====
  async selectCliente(cliente) {
    console.log(`👤 Seleccionando cliente: ${cliente.nombre} ${cliente.apellido}`);
    
    // Buscar cliente
    await this.page.fill('input[placeholder*="nombre, cédula"]', cliente.cedula);
    await this.page.waitForTimeout(1000);
    
    // Seleccionar de la lista desplegable
    await this.page.click(`text=${cliente.nombre} ${cliente.apellido}`);
    await this.page.waitForTimeout(500);
  }

  async createNewCliente(cliente) {
    console.log(`👤 Creando nuevo cliente: ${cliente.nombre} ${cliente.apellido}`);
    
    // Hacer clic en "Nuevo Cliente"
    await this.page.click('button:has-text("Nuevo Cliente")');
    await this.page.waitForTimeout(1000);
    
    // Llenar formulario de cliente
    await this.page.fill('input[name="cedula"]', cliente.cedula);
    await this.page.fill('input[name="nombre"]', cliente.nombre);
    await this.page.fill('input[name="apellido"]', cliente.apellido);
    if (cliente.telefono) {
      await this.page.fill('input[name="telefono"]', cliente.telefono);
    }
    if (cliente.email) {
      await this.page.fill('input[name="email"]', cliente.email);
    }
    if (cliente.direccion) {
      await this.page.fill('input[name="direccion"]', cliente.direccion);
    }
    
    // Guardar cliente
    await this.page.click('button:has-text("Guardar")');
    await this.page.waitForTimeout(1000);
  }

  // ===== SELECCIÓN DE PRODUCTOS =====
  async addProductoInventario(producto) {
    console.log(`📦 Agregando producto inventario: ${producto.nombre}`);
    
    // Buscar producto
    await this.page.fill('input[placeholder*="Buscar producto"]', producto.nombre);
    await this.page.waitForTimeout(1000);
    
    // Seleccionar producto
    await this.page.click(`text=${producto.nombre}`);
    await this.page.waitForTimeout(500);
    
    // Configurar cantidad
    await this.page.fill('input[type="number"][min="1"]', producto.cantidad.toString());
    
    // Agregar producto
    await this.page.click('button:has-text("Añadir")');
    await this.page.waitForTimeout(500);
  }

  async addProductoManual(productoManual) {
    console.log(`✏️ Agregando producto manual: ${productoManual.descripcion}`);
    
    // Abrir modal de producto manual
    await this.page.click('button:has-text("Manual")');
    await this.page.waitForTimeout(500);
    
    // Llenar datos del producto manual
    await this.page.fill('input[placeholder*="descripción"]', productoManual.descripcion);
    await this.page.fill('input[placeholder*="precio"]', productoManual.precio.toString());
    await this.page.fill('input[placeholder*="cantidad"]', productoManual.cantidad.toString());
    
    // Guardar producto manual
    await this.page.click('button:has-text("Agregar")');
    await this.page.waitForTimeout(500);
  }

  async removeProducto(index) {
    console.log(`🗑️ Eliminando producto en índice: ${index}`);
    
    // Hacer clic en el botón de eliminar del producto
    const deleteButton = this.page.locator(`.product-item:nth-child(${index + 1}) button[title*="eliminar"]`);
    await deleteButton.click();
    
    // Confirmar eliminación
    await this.page.click('button:has-text("Sí, eliminar")');
    await this.page.waitForTimeout(500);
  }

  // ===== CONFIGURACIÓN DE PAGO =====
  async selectTipoPago(tipoPago) {
    console.log(`💳 Seleccionando tipo de pago: ${tipoPago}`);
    
    await this.page.selectOption('select[name="tipo_pago"]', tipoPago);
    await this.page.waitForTimeout(500);
  }

  async selectMetodoPago(metodoPago) {
    console.log(`💰 Seleccionando método de pago: ${metodoPago}`);
    
    await this.page.selectOption('select[name="metodo_pago"]', metodoPago);
    await this.page.waitForTimeout(500);
  }

  async selectTipoAbono(tipoAbono) {
    console.log(`📅 Seleccionando tipo de abono: ${tipoAbono}`);
    
    if (tipoAbono === 'simple') {
      await this.page.click('div[class*="payment-type-option"]:has-text("Pago Simple")');
    } else if (tipoAbono === 'mixto') {
      await this.page.click('div[class*="payment-type-option"]:has-text("Pago Mixto")');
    }
    await this.page.waitForTimeout(500);
  }

  async selectMetodoPagoAbono(metodoPago) {
    console.log(`💳 Seleccionando método de pago abono: ${metodoPago}`);
    
    await this.page.selectOption('select[name="metodo_pago_abono"]', metodoPago);
    await this.page.waitForTimeout(500);
  }

  async configurarMontoAbonoSimple(monto) {
    console.log(`💵 Configurando monto abono simple: ${monto}`);
    
    await this.page.fill('input[name="monto_abono_simple"]', monto.toString());
    await this.page.waitForTimeout(500);
  }

  async configurarAbonoMixto(montoUSD, montoVES, metodoUSD, metodoVES) {
    console.log(`💱 Configurando abono mixto: ${montoUSD} USD + ${montoVES} VES`);
    
    if (montoUSD > 0) {
      await this.page.fill('input[name="monto_abono_usd"]', montoUSD.toString());
      if (metodoUSD) {
        await this.page.selectOption('select[name="metodo_pago_abono_usd"]', metodoUSD);
      }
    }
    
    if (montoVES > 0) {
      await this.page.fill('input[name="monto_abono_ves"]', montoVES.toString());
      if (metodoVES) {
        await this.page.selectOption('select[name="metodo_pago_abono_ves"]', metodoVES);
      }
    }
    
    await this.page.waitForTimeout(500);
  }

  async configurarPagoMixto(montoUSD, montoVES, metodoUSD, metodoVES) {
    console.log(`💱 Configurando pago mixto: ${montoUSD} USD + ${montoVES} VES`);
    
    if (montoUSD > 0) {
      await this.page.fill('input[name="monto_mixto_usd"]', montoUSD.toString());
      if (metodoUSD) {
        await this.page.selectOption('select[name="metodo_pago_mixto_usd"]', metodoUSD);
      }
    }
    
    if (montoVES > 0) {
      await this.page.fill('input[name="monto_mixto_ves"]', montoVES.toString());
      if (metodoVES) {
        await this.page.selectOption('select[name="metodo_pago_mixto_ves"]', metodoVES);
      }
    }
    
    await this.page.waitForTimeout(500);
  }

  // ===== CONFIGURACIÓN DE REFERENCIAS =====
  async agregarReferenciaPago(referencia) {
    console.log(`🔗 Agregando referencia de pago: ${referencia}`);
    
    await this.page.fill('input[name="referencia_pago"]', referencia);
    await this.page.waitForTimeout(500);
  }

  async agregarReferenciaAbonoUSD(referencia) {
    console.log(`🔗 Agregando referencia abono USD: ${referencia}`);
    
    await this.page.fill('input[name="referencia_abono_usd"]', referencia);
    await this.page.waitForTimeout(500);
  }

  async agregarReferenciaAbonoVES(referencia) {
    console.log(`🔗 Agregando referencia abono VES: ${referencia}`);
    
    await this.page.fill('input[name="referencia_abono_ves"]', referencia);
    await this.page.waitForTimeout(500);
  }

  // ===== CONFIGURACIÓN DE DESCUENTOS Y DELIVERY =====
  async aplicarDescuento(monto, comentarios) {
    console.log(`💰 Aplicando descuento: ${monto} USD`);
    
    await this.page.fill('input[name="monto_descuento_usd"]', monto.toString());
    if (comentarios) {
      await this.page.fill('textarea[name="comentarios_descuento"]', comentarios);
    }
    await this.page.waitForTimeout(500);
  }

  async aplicarDelivery(monto, comentarios) {
    console.log(`🚚 Aplicando delivery: ${monto} USD`);
    
    await this.page.fill('input[name="monto_delivery_usd"]', monto.toString());
    if (comentarios) {
      await this.page.fill('textarea[name="comentarios_delivery"]', comentarios);
    }
    await this.page.waitForTimeout(500);
  }

  async aplicarIVA() {
    console.log(`📊 Aplicando IVA`);
    
    await this.page.check('input[name="aplica_iva"]');
    await this.page.waitForTimeout(500);
  }

  async quitarIVA() {
    console.log(`📊 Quitando IVA`);
    
    await this.page.uncheck('input[name="aplica_iva"]');
    await this.page.waitForTimeout(500);
  }

  // ===== CONFIGURACIÓN DE ENTREGA =====
  async marcarEntregaInmediata() {
    console.log(`⚡ Marcando entrega inmediata`);
    
    await this.page.check('input[name="entrega_inmediata"]');
    await this.page.waitForTimeout(500);
  }

  async marcarEntregaDiferida() {
    console.log(`📅 Marcando entrega diferida`);
    
    await this.page.uncheck('input[name="entrega_inmediata"]');
    await this.page.waitForTimeout(500);
  }

  async configurarFechaVencimiento(fecha) {
    console.log(`📅 Configurando fecha de vencimiento: ${fecha}`);
    
    await this.page.fill('input[name="fecha_vencimiento"]', fecha);
    await this.page.waitForTimeout(500);
  }

  // ===== CONFIGURACIÓN DE TASA BCV =====
  async configurarTasaBCV(tasa) {
    console.log(`💱 Configurando tasa BCV: ${tasa}`);
    
    await this.page.fill('input[name="tasa_bcv"]', tasa.toString());
    await this.page.waitForTimeout(500);
  }

  // ===== COMENTARIOS GENERALES =====
  async agregarComentariosGenerales(comentarios) {
    console.log(`📝 Agregando comentarios generales`);
    
    await this.page.fill('textarea[name="comentarios"]', comentarios);
    await this.page.waitForTimeout(500);
  }

  // ===== VALIDACIONES =====
  async verificarFormularioValido() {
    console.log(`✅ Verificando formulario válido`);
    
    // Verificar que no hay errores de validación visibles
    const errores = await this.page.locator('.error-message, .invalid-feedback, .text-danger').count();
    
    // Verificar que los campos obligatorios están llenos
    const clienteSeleccionado = await this.page.locator('.selected-client-display').isVisible();
    const productosAgregados = await this.page.locator('.product-item').count();
    const tipoPagoSeleccionado = await this.page.locator('select[name="tipo_pago"]').inputValue();
    
    return errores === 0 && clienteSeleccionado && productosAgregados > 0 && tipoPagoSeleccionado !== '';
  }

  async verificarDescuentoAplicado(montoEsperado) {
    console.log(`✅ Verificando descuento aplicado: ${montoEsperado}`);
    
    const montoDescuento = await this.page.locator('input[name="monto_descuento_usd"]').inputValue();
    return parseFloat(montoDescuento) === parseFloat(montoEsperado);
  }

  async verificarDeliveryAplicado(montoEsperado) {
    console.log(`✅ Verificando delivery aplicado: ${montoEsperado}`);
    
    const montoDelivery = await this.page.locator('input[name="monto_delivery_usd"]').inputValue();
    return parseFloat(montoDelivery) === parseFloat(montoEsperado);
  }

  async verificarProductoManual(productoManual) {
    console.log(`✅ Verificando producto manual: ${productoManual.descripcion}`);
    
    const productoEncontrado = await this.page.locator(`text=${productoManual.descripcion}`).isVisible();
    return productoEncontrado;
  }

  async contarProductosAgregados() {
    console.log(`📊 Contando productos agregados`);
    
    const cantidad = await this.page.locator('.product-item').count();
    return cantidad;
  }

  async verificarCalculosCorrectos() {
    console.log(`🧮 Verificando cálculos correctos`);
    
    // Obtener subtotal mostrado
    const subtotalText = await this.page.locator('.subtotal-amount').textContent();
    const subtotal = parseFloat(subtotalText.replace('$', '').replace(',', ''));
    
    // Obtener total mostrado
    const totalText = await this.page.locator('.total-amount').textContent();
    const total = parseFloat(totalText.replace('$', '').replace(',', ''));
    
    // Verificar que el total es mayor o igual al subtotal
    return total >= subtotal;
  }

  // ===== REGISTRO DE VENTA =====
  async registrarVenta() {
    console.log(`💾 Registrando venta`);
    
    // Hacer clic en el botón de registrar venta
    await this.page.click('button:has-text("Registrar Venta")');
    
    // Esperar a que aparezca el modal de confirmación
    await this.page.waitForSelector('.swal2-popup', { timeout: 10000 });
    
    // Confirmar la venta
    await this.page.click('.swal2-confirm');
    
    // Esperar a que se procese
    await this.page.waitForTimeout(2000);
  }

  async cancelarVenta() {
    console.log(`❌ Cancelando venta`);
    
    // Hacer clic en el botón de cancelar
    await this.page.click('button:has-text("Cancelar")');
    
    // Confirmar cancelación si aparece modal
    const modalVisible = await this.page.locator('.swal2-popup').isVisible();
    if (modalVisible) {
      await this.page.click('.swal2-confirm');
    }
    
    await this.page.waitForTimeout(1000);
  }

  // ===== RESET DEL FORMULARIO =====
  async resetFormulario() {
    console.log(`🔄 Reseteando formulario`);
    
    // Limpiar cliente
    const clienteVisible = await this.page.locator('.selected-client-display').isVisible();
    if (clienteVisible) {
      await this.page.click('.remove-selected-client-btn');
    }
    
    // Limpiar productos
    const productosCount = await this.page.locator('.product-item').count();
    for (let i = productosCount - 1; i >= 0; i--) {
      await this.removeProducto(i);
    }
    
    // Resetear tipo de pago
    await this.page.selectOption('select[name="tipo_pago"]', '');
    
    // Limpiar campos de texto
    await this.page.fill('input[name="referencia_pago"]', '');
    await this.page.fill('input[name="monto_descuento_usd"]', '');
    await this.page.fill('input[name="monto_delivery_usd"]', '');
    await this.page.fill('textarea[name="comentarios"]', '');
    
    // Desmarcar checkboxes
    await this.page.uncheck('input[name="aplica_iva"]');
    await this.page.uncheck('input[name="entrega_inmediata"]');
    
    await this.page.waitForTimeout(1000);
  }

  // ===== UTILIDADES =====
  async esperarCargaCompleta() {
    console.log(`⏳ Esperando carga completa`);
    
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  async tomarScreenshot(nombre) {
    console.log(`📸 Tomando screenshot: ${nombre}`);
    
    await this.page.screenshot({ 
      path: `tests/screenshots/${nombre}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  async obtenerResumenVenta() {
    console.log(`📋 Obteniendo resumen de venta`);
    
    const resumen = {
      cliente: await this.page.locator('.selected-client-name').textContent(),
      productos: await this.page.locator('.product-item').count(),
      subtotal: await this.page.locator('.subtotal-amount').textContent(),
      total: await this.page.locator('.total-amount').textContent(),
      tipoPago: await this.page.locator('select[name="tipo_pago"]').inputValue(),
      metodoPago: await this.page.locator('select[name="metodo_pago"]').inputValue(),
      aplicaIVA: await this.page.locator('input[name="aplica_iva"]').isChecked(),
      entregaInmediata: await this.page.locator('input[name="entrega_inmediata"]').isChecked()
    };
    
    return resumen;
  }
}

export default ComprehensiveSalesFormHelper;
