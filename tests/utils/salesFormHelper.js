import AuthHelper from './authHelper.js';

/**
 * Utilidades para automatizar el formulario de ventas
 * Contiene funciones helper para interactuar con los elementos del formulario
 */

export class SalesFormHelper {
  constructor(page) {
    this.page = page;
    this.authHelper = new AuthHelper(page);
  }

  /**
   * Navega a la página de crear venta
   */
  async navigateToCreateSale() {
    await this.authHelper.navigateTo('/ventas');
    await this.authHelper.waitForAppReady();
    await this.authHelper.handleAuthModal();
  }

  /**
   * Busca y selecciona un cliente
   */
  async selectCliente(cliente) {
    try {
      // Buscar cliente
      const clienteInput = await this.page.locator('input[placeholder*="nombre, cédula"], input[placeholder*="cliente"]').first();
      await clienteInput.fill(cliente.nombre);
      
      // Esperar a que aparezcan resultados
      await this.page.waitForSelector('.cliente-item, .search-result, [data-testid="cliente-item"]', { timeout: 5000 });
      
      // Seleccionar cliente de la lista
      const clienteOption = await this.page.locator(`text=${cliente.nombre}`).first();
      await clienteOption.click();
      
      // Esperar a que se seleccione
      await this.page.waitForSelector('.cliente-seleccionado, .selected-client', { timeout: 3000 });
    } catch (error) {
      console.log('Error seleccionando cliente:', error.message);
      throw error;
    }
  }

  /**
   * Busca y selecciona un producto
   */
  async selectProducto(producto) {
    try {
      // Buscar producto
      const productoInput = await this.page.locator('input[placeholder*="Buscar producto"], input[placeholder*="producto"]').first();
      await productoInput.fill(producto.nombre);
      
      // Esperar a que aparezcan resultados
      await this.page.waitForSelector('.producto-item, .search-result, [data-testid="producto-item"]', { timeout: 5000 });
      
      // Seleccionar producto de la lista
      const productoOption = await this.page.locator(`text=${producto.nombre}`).first();
      await productoOption.click();
      
      // Esperar a que aparezca el formulario de cantidad
      await this.page.waitForSelector('input[type="number"][min="1"], input[name="cantidad"]', { timeout: 3000 });
      
      // Establecer cantidad
      const cantidadInput = await this.page.locator('input[type="number"][min="1"], input[name="cantidad"]').first();
      await cantidadInput.fill(producto.cantidad.toString());
      
      // Hacer clic en "Añadir"
      const addButton = await this.page.locator('button:has-text("Añadir"), button:has-text("Agregar")').first();
      await addButton.click();
      
      // Esperar a que se agregue el producto
      await this.page.waitForSelector('.producto-agregado, .producto-encontrado, [data-testid="producto-agregado"]', { timeout: 3000 });
    } catch (error) {
      console.log('Error seleccionando producto:', error.message);
      throw error;
    }
  }

  /**
   * Agrega un producto manual
   */
  async addProductoManual(productoManual) {
    // Hacer clic en botón "Manual"
    await this.page.click('button:has-text("Manual")');
    
    // Esperar que aparezca el modal
    await this.page.waitForSelector('.modal-content');
    
    // Llenar datos del producto manual
    await this.page.fill('textarea[placeholder*="Servicio"]', productoManual.descripcion);
    await this.page.fill('input[type="number"][min="1"]', productoManual.cantidad.toString());
    await this.page.fill('input[type="number"][step="0.01"]', productoManual.precio);
    
    // Confirmar
    await this.page.click('button:has-text("Añadir al Pedido")');
    await this.page.waitForTimeout(300);
  }

  /**
   * Configura las opciones de pago y entrega
   */
  async configurePaymentAndDelivery(scenario) {
    // Delivery
    if (scenario.delivery) {
      await this.page.check('input[id="quiere-delivery"]');
      await this.page.fill('input[placeholder=""][type="number"]', scenario.delivery);
    }

    // IVA
    if (scenario.aplicarIVA) {
      await this.page.check('input[id="aplicar-iva"]');
    }

    // Descuento
    if (scenario.descuento) {
      await this.page.fill('input[placeholder="0.00"][type="number"]', scenario.descuento);
    }

    // Tipo de pago
    if (scenario.tipoPago) {
      await this.page.click(`text=${scenario.tipoPago}`);
    }

    // Método de pago
    if (scenario.metodoPago) {
      await this.page.selectOption('select', scenario.metodoPago);
    }

    // Referencia de pago
    if (scenario.referenciaPago) {
      await this.page.fill('input[placeholder="Número de referencia"]', scenario.referenciaPago);
    }

    // Tasa de cambio BCV
    if (scenario.tasaCambioBCV) {
      await this.page.fill('input[placeholder="0.00"][type="number"]', scenario.tasaCambioBCV.toString());
    }

    // Entrega inmediata
    if (scenario.entregaInmediata) {
      await this.page.check('input[id="entrega-inmediata"]');
    }
  }

  /**
   * Configura un abono simple
   */
  async configureAbonoSimple(scenario) {
    if (scenario.tipoPago === 'Abono') {
      // Seleccionar tipo de abono simple
      await this.page.click('input[value="simple"]');
      
      // Método de pago del abono
      if (scenario.metodoPagoAbono) {
        await this.page.selectOption('select[name="metodoPagoAbono"]', scenario.metodoPagoAbono);
      }
      
      // Monto del abono
      if (scenario.montoAbonoSimple) {
        await this.page.fill('input[name="montoAbonoSimple"]', scenario.montoAbonoSimple);
      }
      
      // Fecha de vencimiento
      if (scenario.fechaVencimiento) {
        await this.page.fill('input[type="date"]', scenario.fechaVencimiento);
      }
    }
  }

  /**
   * Configura un abono mixto
   */
  async configureAbonoMixto(scenario) {
    if (scenario.tipoPago === 'Abono' && scenario.montoAbonoUSD) {
      // Seleccionar tipo de abono mixto
      await this.page.click('input[value="mixto"]');
      
      // Monto USD
      await this.page.fill('input[name="montoAbonoUSD"]', scenario.montoAbonoUSD);
      
      // Monto VES
      if (scenario.montoAbonoVES) {
        await this.page.fill('input[name="montoAbonoVES"]', scenario.montoAbonoVES);
      }
      
      // Fecha de vencimiento
      if (scenario.fechaVencimiento) {
        await this.page.fill('input[type="date"]', scenario.fechaVencimiento);
      }
    }
  }

  /**
   * Configura pago mixto independiente
   */
  async configurePagoMixto(scenario) {
    if (scenario.tipoPago === 'Mixto') {
      // Monto USD
      if (scenario.montoMixtoUSD) {
        await this.page.fill('input[name="montoMixtoUSD"]', scenario.montoMixtoUSD);
      }
      
      // Monto VES
      if (scenario.montoMixtoVES) {
        await this.page.fill('input[name="montoMixtoVES"]', scenario.montoMixtoVES);
      }
    }
  }

  /**
   * Envía el formulario
   */
  async submitForm() {
    // Hacer clic en el botón de envío
    await this.page.click('button[type="submit"]:has-text("Registrar Venta")');
    
    // Esperar respuesta
    await this.page.waitForTimeout(2000);
  }

  /**
   * Verifica si el formulario se envió exitosamente
   */
  async verifySuccessSubmission() {
    // Verificar que aparezca el mensaje de éxito
    await this.page.waitForSelector('text=¡Venta Registrada!', { timeout: 10000 });
    
    // Verificar que el formulario se haya limpiado
    const clienteInput = await this.page.locator('input[placeholder*="nombre, cédula"]').inputValue();
    return clienteInput === '';
  }

  /**
   * Verifica si hay errores de validación
   */
  async verifyValidationErrors() {
    const errorMessages = await this.page.locator('.swal2-popup .swal2-content').allTextContents();
    return errorMessages.length > 0;
  }

  /**
   * Ejecuta un escenario completo de prueba
   */
  async executeTestScenario(scenario) {
    try {
      console.log(`🧪 Ejecutando escenario: ${scenario.name}`);
      
      // Navegar a la página
      await this.navigateToCreateSale();
      
      // Seleccionar cliente
      await this.selectCliente(scenario.cliente);
      
      // Agregar productos
      for (const producto of scenario.productos) {
        await this.selectProducto(producto);
      }
      
      // Agregar producto manual si existe
      if (scenario.productoManual) {
        await this.addProductoManual(scenario.productoManual);
      }
      
      // Configurar pago y entrega
      await this.configurePaymentAndDelivery(scenario);
      
      // Configurar abono si aplica
      await this.configureAbonoSimple(scenario);
      await this.configureAbonoMixto(scenario);
      await this.configurePagoMixto(scenario);
      
      // Enviar formulario
      await this.submitForm();
      
      // Verificar resultado
      const success = await this.verifySuccessSubmission();
      
      if (success) {
        console.log(`✅ Escenario ${scenario.name} completado exitosamente`);
        return { success: true, scenario: scenario.name };
      } else {
        console.log(`❌ Escenario ${scenario.name} falló`);
        return { success: false, scenario: scenario.name, error: 'Submission failed' };
      }
      
    } catch (error) {
      console.log(`❌ Error en escenario ${scenario.name}:`, error.message);
      return { success: false, scenario: scenario.name, error: error.message };
    }
  }

  /**
   * Toma screenshot del formulario
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `tests/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  /**
   * Verifica que el formulario esté completo y válido
   */
  async verificarFormularioValido() {
    // Verificar que existan elementos básicos
    const hasCliente = await this.page.locator('.cliente-seleccionado, .cliente-encontrado').isVisible();
    const hasProductos = await this.page.locator('.producto-agregado, .producto-encontrado').isVisible();
    const hasTipoPago = await this.page.locator('select[name="tipo_pago"], input[name="tipo_pago"]').isVisible();
    
    return hasCliente && hasProductos && hasTipoPago;
  }

  /**
   * Selecciona tipo de pago
   */
  async selectTipoPago(tipo) {
    try {
      const tipoPagoSelect = await this.page.locator('select[name="tipo_pago"], select[name="tipoPago"], input[name="tipo_pago"]').first();
      await tipoPagoSelect.selectOption(tipo);
      
      // Esperar a que se actualice la interfaz
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.log('Error seleccionando tipo de pago:', error.message);
      throw error;
    }
  }

  /**
   * Selecciona método de pago
   */
  async selectMetodoPago(metodo) {
    try {
      const metodoPagoSelect = await this.page.locator('select[name="metodo_pago"], select[name="metodoPago"], input[name="metodo_pago"]').first();
      await metodoPagoSelect.selectOption(metodo);
      
      // Esperar a que se actualice la interfaz
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.log('Error seleccionando método de pago:', error.message);
      throw error;
    }
  }

  /**
   * Agrega referencia de pago
   */
  async agregarReferenciaPago(referencia) {
    const referenciaInput = await this.page.locator('input[name="referencia_pago"], input[placeholder*="referencia"]');
    await referenciaInput.fill(referencia);
  }

  /**
   * Aplica descuento
   */
  async aplicarDescuento(monto, comentarios = '') {
    const descuentoInput = await this.page.locator('input[name="descuento"], input[placeholder*="descuento"]');
    await descuentoInput.fill(monto.toString());
    
    if (comentarios) {
      const comentariosInput = await this.page.locator('input[name="comentarios_descuento"], textarea[name="comentarios_descuento"]');
      await comentariosInput.fill(comentarios);
    }
  }

  /**
   * Aplica delivery
   */
  async aplicarDelivery(monto, comentarios = '') {
    const deliveryInput = await this.page.locator('input[name="delivery"], input[placeholder*="delivery"]');
    await deliveryInput.fill(monto.toString());
    
    if (comentarios) {
      const comentariosInput = await this.page.locator('input[name="comentarios_delivery"], textarea[name="comentarios_delivery"]');
      await comentariosInput.fill(comentarios);
    }
  }

  /**
   * Aplica IVA
   */
  async aplicarIVA() {
    const ivaCheckbox = await this.page.locator('input[name="aplicar_iva"], input[type="checkbox"]');
    await ivaCheckbox.check();
  }

  /**
   * Marca entrega inmediata
   */
  async marcarEntregaInmediata() {
    const entregaCheckbox = await this.page.locator('input[name="entrega_inmediata"], input[type="checkbox"]');
    await entregaCheckbox.check();
  }

  /**
   * Marca entrega diferida
   */
  async marcarEntregaDiferida() {
    const entregaCheckbox = await this.page.locator('input[name="entrega_diferida"], input[type="checkbox"]');
    await entregaCheckbox.check();
  }

  /**
   * Configura fecha de vencimiento
   */
  async configurarFechaVencimiento(fecha) {
    const fechaInput = await this.page.locator('input[name="fecha_vencimiento"], input[type="date"]');
    await fechaInput.fill(fecha);
  }

  /**
   * Configura pago mixto
   */
  async configurarPagoMixto(montoUSD, montoVES, metodoUSD, metodoVES) {
    const montoUSDInput = await this.page.locator('input[name="monto_mixto_usd"], input[placeholder*="USD"]');
    await montoUSDInput.fill(montoUSD.toString());
    
    const montoVESInput = await this.page.locator('input[name="monto_mixto_ves"], input[placeholder*="VES"]');
    await montoVESInput.fill(montoVES.toString());
    
    const metodoUSDSelect = await this.page.locator('select[name="metodo_mixto_usd"]');
    await metodoUSDSelect.selectOption(metodoUSD);
    
    const metodoVESSelect = await this.page.locator('select[name="metodo_mixto_ves"]');
    await metodoVESSelect.selectOption(metodoVES);
  }

  /**
   * Configura abono mixto
   */
  async configurarAbonoMixto(montoUSD, montoVES, metodoUSD, metodoVES) {
    const montoUSDInput = await this.page.locator('input[name="monto_abono_usd"]');
    await montoUSDInput.fill(montoUSD.toString());
    
    const montoVESInput = await this.page.locator('input[name="monto_abono_ves"]');
    await montoVESInput.fill(montoVES.toString());
    
    const metodoUSDSelect = await this.page.locator('select[name="metodo_abono_usd"]');
    await metodoUSDSelect.selectOption(metodoUSD);
    
    const metodoVESSelect = await this.page.locator('select[name="metodo_abono_ves"]');
    await metodoVESSelect.selectOption(metodoVES);
  }

  /**
   * Crea cliente nuevo
   */
  async crearClienteNuevo(cliente) {
    const crearClienteBtn = await this.page.locator('button:has-text("Crear"), button:has-text("Nuevo")');
    await crearClienteBtn.click();
    
    const nombreInput = await this.page.locator('input[name="nombre"]');
    await nombreInput.fill(cliente.nombre);
    
    const cedulaInput = await this.page.locator('input[name="cedula"]');
    await cedulaInput.fill(cliente.cedula);
    
    const telefonoInput = await this.page.locator('input[name="telefono"]');
    await telefonoInput.fill(cliente.telefono);
    
    const guardarBtn = await this.page.locator('button:has-text("Guardar"), button:has-text("Crear")');
    await guardarBtn.click();
  }

  /**
   * Agrega producto
   */
  async addProducto(producto) {
    await this.selectProducto(producto);
  }

  /**
   * Verifica si se requiere referencia de pago
   */
  async verificarReferenciaRequerida() {
    const referenciaInput = await this.page.locator('input[name="referencia_pago"]');
    const isRequired = await referenciaInput.getAttribute('required');
    return isRequired !== null;
  }

  /**
   * Verifica que el descuento se aplicó correctamente
   */
  async verificarDescuentoAplicado(monto) {
    const descuentoDisplay = await this.page.locator('.descuento-aplicado, .monto-descuento');
    const descuentoText = await descuentoDisplay.textContent();
    return descuentoText.includes(monto.toString());
  }

  /**
   * Verifica que el delivery se aplicó correctamente
   */
  async verificarDeliveryAplicado(monto) {
    const deliveryDisplay = await this.page.locator('.delivery-aplicado, .monto-delivery');
    const deliveryText = await deliveryDisplay.textContent();
    return deliveryText.includes(monto.toString());
  }

  /**
   * Cuenta productos agregados
   */
  async contarProductosAgregados() {
    const productos = await this.page.locator('.producto-agregado, .producto-encontrado').count();
    return productos;
  }

  /**
   * Verifica producto manual agregado
   */
  async verificarProductoManual(producto) {
    const productoDisplay = await this.page.locator('.producto-agregado');
    const productoText = await productoDisplay.textContent();
    return productoText.includes(producto.descripcion);
  }

  /**
   * Verifica fecha de vencimiento válida
   */
  async verificarFechaVencimientoValida() {
    const fechaInput = await this.page.locator('input[name="fecha_vencimiento"]');
    const fechaValue = await fechaInput.inputValue();
    const fecha = new Date(fechaValue);
    const hoy = new Date();
    return fecha > hoy;
  }

  /**
   * Verifica montos mixtos válidos
   */
  async verificarMontosMixtosValidos() {
    const montoUSDInput = await this.page.locator('input[name="monto_mixto_usd"]');
    const montoVESInput = await this.page.locator('input[name="monto_mixto_ves"]');
    
    const montoUSD = parseFloat(await montoUSDInput.inputValue());
    const montoVES = parseFloat(await montoVESInput.inputValue());
    
    return montoUSD > 0 && montoVES > 0;
  }
}

export default SalesFormHelper;
