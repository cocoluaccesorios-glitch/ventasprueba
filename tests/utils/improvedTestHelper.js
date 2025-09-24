/**
 * Helper mejorado para tests con configuraciones optimizadas
 */

import TEST_CONFIG from '../config/testConfigurations.js';

export class ImprovedTestHelper {
  constructor(page) {
    this.page = page;
    this.config = TEST_CONFIG;
  }

  /**
   * Espera inteligente por un elemento
   */
  async waitForElement(selector, timeout = this.config.TIMEOUTS.MEDIUM) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      console.log(`Elemento no encontrado: ${selector}`);
      return false;
    }
  }

  /**
   * Espera por múltiples elementos (cualquiera de ellos)
   */
  async waitForAnyElement(selectors, timeout = this.config.TIMEOUTS.MEDIUM) {
    for (const selector of selectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 2000 });
        return selector;
      } catch (error) {
        continue;
      }
    }
    throw new Error(`Ninguno de los elementos encontrado: ${selectors.join(', ')}`);
  }

  /**
   * Login mejorado con mejor manejo de errores
   */
  async login(username = this.config.CREDENTIALS.USERNAME, password = this.config.CREDENTIALS.PASSWORD) {
    console.log('🔐 Iniciando login mejorado...');
    
    try {
      // Verificar si ya estamos logueados
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/login') && !currentUrl.includes('auth')) {
        console.log('✅ Ya estamos logueados');
        return true;
      }

      // Navegar a login si es necesario
      if (!currentUrl.includes('/login')) {
        await this.page.goto(this.config.URLS.LOGIN);
        await this.page.waitForLoadState('networkidle', { timeout: this.config.TIMEOUTS.NAVIGATION });
      }

      // Esperar formulario de login
      const loginFormFound = await this.waitForElement(this.config.SELECTORS.USERNAME_INPUT, this.config.TIMEOUTS.LONG);
      if (!loginFormFound) {
        throw new Error('Formulario de login no encontrado');
      }

      // Llenar credenciales
      await this.page.fill(this.config.SELECTORS.USERNAME_INPUT, username);
      await this.page.fill(this.config.SELECTORS.PASSWORD_INPUT, password);
      
      // Hacer clic en login
      await this.page.click(this.config.SELECTORS.LOGIN_BUTTON);
      
      // Esperar respuesta del servidor
      await this.page.waitForLoadState('networkidle', { timeout: this.config.TIMEOUTS.LONG });
      
      // Manejar SweetAlert si aparece
      await this.handleSweetAlert();
      
      // Esperar a que se complete la redirección
      await this.page.waitForLoadState('networkidle', { timeout: this.config.TIMEOUTS.LONG });
      
      // Esperar un poco más para que se complete la redirección
      await this.page.waitForTimeout(3000);
      
      // Verificar que el login fue exitoso (debería estar en dashboard)
      let currentUrlAfterLogin = this.page.url();
      let stillOnLogin = currentUrlAfterLogin.includes('/login');
      
      // Si aún estamos en login, esperar más tiempo
      if (stillOnLogin) {
        console.log('⏳ Esperando más tiempo para la redirección...');
        await this.page.waitForTimeout(5000);
        
        currentUrlAfterLogin = this.page.url();
        stillOnLogin = currentUrlAfterLogin.includes('/login');
      }
      
      if (stillOnLogin) {
        throw new Error('Login falló - aún en página de login');
      }
      
      console.log(`✅ Login exitoso - redirigido a: ${currentUrlAfterLogin}`);
      return true;
      
    } catch (error) {
      console.log('❌ Error en login:', error.message);
      return false;
    }
  }

  /**
   * Maneja SweetAlert automáticamente
   */
  async handleSweetAlert() {
    try {
      const sweetAlert = await this.page.locator(this.config.SELECTORS.SWEET_ALERT);
      if (await sweetAlert.isVisible()) {
        console.log('🔔 SweetAlert detectado');
        
        // Esperar un poco para que se muestre completamente
        await this.page.waitForTimeout(1000);
        
        // Intentar hacer clic en confirmar
        const confirmBtn = await this.page.locator(this.config.SELECTORS.SWEET_CONFIRM);
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
          await this.page.waitForTimeout(1000);
        }
      }
    } catch (error) {
      // No hay SweetAlert, continuar
    }
  }

  /**
   * Navega a una página con manejo de autenticación
   */
  async navigateTo(path) {
    console.log(`🧭 Navegando a: ${path}`);
    
    try {
      // Primero intentar navegar directamente
      await this.page.goto(path);
      await this.page.waitForLoadState('networkidle', { timeout: this.config.TIMEOUTS.NAVIGATION });
      
      // Si estamos en login, intentar loguearnos
      if (this.page.url().includes('/login')) {
        console.log('🔐 Redirigido a login, iniciando sesión...');
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('No se pudo completar el login');
        }
        
        // Navegar nuevamente después del login
        await this.page.goto(path);
        await this.page.waitForLoadState('networkidle', { timeout: this.config.TIMEOUTS.NAVIGATION });
      }
      
      console.log(`✅ Navegación exitosa a: ${this.page.url()}`);
      return true;
      
    } catch (error) {
      console.log('❌ Error en navegación:', error.message);
      return false;
    }
  }

  /**
   * Selecciona cliente con esperas inteligentes
   */
  async selectCliente(cliente) {
    try {
      console.log(`👤 Seleccionando cliente: ${cliente.nombre}`);
      
      // Buscar cliente
      const clienteInput = await this.page.locator(this.config.SELECTORS.CLIENTE_INPUT).first();
      await clienteInput.fill(cliente.nombre);
      
      // Esperar resultados con timeout más largo
      await this.page.waitForTimeout(3000);
      
      // Verificar si hay resultados
      const resultCount = await this.page.locator(this.config.SELECTORS.CLIENTE_RESULT).count();
      console.log(`📊 Resultados de cliente encontrados: ${resultCount}`);
      if (resultCount === 0) {
        throw new Error('No se encontraron resultados de cliente');
      }
      
      // Seleccionar cliente
      const clienteOption = await this.page.locator(this.config.SELECTORS.CLIENTE_RESULT).first();
      await clienteOption.click();
      
      // Esperar confirmación (SweetAlert)
      await this.page.waitForTimeout(2000);
      
      // Verificar SweetAlert
      const sweetAlert = await this.page.locator(this.config.SELECTORS.SWEET_ALERT);
      if (await sweetAlert.isVisible()) {
        console.log('🔔 SweetAlert de cliente detectado');
        // El SweetAlert se cierra automáticamente
      }
      
      console.log('✅ Cliente seleccionado');
      return true;
      
    } catch (error) {
      console.log('❌ Error seleccionando cliente:', error.message);
      throw error;
    }
  }

  /**
   * Selecciona producto con esperas inteligentes
   */
  async selectProducto(producto) {
    try {
      console.log(`📦 Seleccionando producto: ${producto.nombre}`);
      
      // Buscar producto
      const productoInput = await this.page.locator(this.config.SELECTORS.PRODUCTO_INPUT).first();
      await productoInput.fill(producto.nombre);
      
      // Esperar resultados con timeout más largo
      await this.page.waitForTimeout(3000);
      
      // Verificar si hay resultados
      const resultCount = await this.page.locator(this.config.SELECTORS.PRODUCTO_RESULT).count();
      console.log(`📊 Resultados de producto encontrados: ${resultCount}`);
      if (resultCount === 0) {
        throw new Error('No se encontraron resultados de producto');
      }
      
      // Seleccionar producto
      const productoOption = await this.page.locator(this.config.SELECTORS.PRODUCTO_RESULT).first();
      await productoOption.click();
      
      // Esperar formulario de cantidad
      await this.page.waitForTimeout(1000);
      
      // Establecer cantidad
      const cantidadInput = await this.page.locator(this.config.SELECTORS.CANTIDAD_INPUT).first();
      await cantidadInput.fill(producto.cantidad.toString());
      
      // Agregar producto
      const addButton = await this.page.locator(this.config.SELECTORS.ADD_BUTTON).first();
      await addButton.click();
      
      // Esperar confirmación de agregado
      await this.page.waitForTimeout(1000);
      
      console.log('✅ Producto agregado');
      return true;
      
    } catch (error) {
      console.log('❌ Error seleccionando producto:', error.message);
      throw error;
    }
  }

  /**
   * Configura tipo de pago
   */
  async selectTipoPago(tipo) {
    try {
      console.log(`💰 Configurando tipo de pago: ${tipo}`);
      
      const tipoPagoSelect = await this.page.locator(this.config.SELECTORS.TIPO_PAGO_SELECT).first();
      await tipoPagoSelect.selectOption(tipo);
      
      // Esperar a que se actualice la interfaz
      await this.page.waitForTimeout(500);
      
      console.log('✅ Tipo de pago configurado');
      return true;
      
    } catch (error) {
      console.log('❌ Error configurando tipo de pago:', error.message);
      throw error;
    }
  }

  /**
   * Configura método de pago
   */
  async selectMetodoPago(metodo) {
    try {
      console.log(`💳 Configurando método de pago: ${metodo}`);
      
      const metodoPagoSelect = await this.page.locator(this.config.SELECTORS.METODO_PAGO_SELECT).first();
      await metodoPagoSelect.selectOption(metodo);
      
      // Esperar a que se actualice la interfaz
      await this.page.waitForTimeout(500);
      
      console.log('✅ Método de pago configurado');
      return true;
      
    } catch (error) {
      console.log('❌ Error configurando método de pago:', error.message);
      throw error;
    }
  }

  /**
   * Agrega referencia de pago
   */
  async agregarReferenciaPago(referencia) {
    try {
      console.log(`🔗 Agregando referencia: ${referencia}`);
      
      const referenciaInput = await this.page.locator(this.config.SELECTORS.REFERENCIA_INPUT).first();
      await referenciaInput.fill(referencia);
      
      console.log('✅ Referencia agregada');
      return true;
      
    } catch (error) {
      console.log('❌ Error agregando referencia:', error.message);
      throw error;
    }
  }

  /**
   * Envía el formulario
   */
  async submitForm() {
    try {
      console.log('📤 Enviando formulario...');
      
      const submitButton = await this.page.locator(this.config.SELECTORS.SUBMIT_BUTTON).first();
      await submitButton.click();
      
      // Esperar respuesta
      await this.page.waitForLoadState('networkidle', { timeout: this.config.TIMEOUTS.LONG });
      
      console.log('✅ Formulario enviado');
      return true;
      
    } catch (error) {
      console.log('❌ Error enviando formulario:', error.message);
      throw error;
    }
  }

  /**
   * Verifica si el envío fue exitoso
   */
  async verifySuccessSubmission() {
    try {
      // Esperar mensaje de éxito
      const successFound = await this.waitForElement(this.config.SELECTORS.SUCCESS_MESSAGE, this.config.TIMEOUTS.MEDIUM);
      
      if (successFound) {
        console.log('✅ Envío exitoso verificado');
        return true;
      }
      
      // Verificar si hay errores
      const errorFound = await this.waitForElement(this.config.SELECTORS.ERROR_MESSAGE, this.config.TIMEOUTS.SHORT);
      if (errorFound) {
        console.log('❌ Se encontraron errores en el envío');
        return false;
      }
      
      console.log('⚠️ No se pudo verificar el resultado del envío');
      return false;
      
    } catch (error) {
      console.log('❌ Error verificando envío:', error.message);
      return false;
    }
  }

  /**
   * Ejecuta un escenario completo de prueba
   */
  async executeTestScenario(scenario) {
    try {
      console.log(`🧪 Ejecutando escenario: ${scenario.name}`);
      
      // Navegar a la página
      await this.navigateTo(this.config.URLS.VENTAS);
      
      // Seleccionar cliente
      await this.selectCliente(scenario.cliente);
      
      // Agregar productos
      for (const producto of scenario.productos) {
        await this.selectProducto(producto);
      }
      
      // Configurar pago
      if (scenario.tipoPago) {
        await this.selectTipoPago(scenario.tipoPago);
      }
      
      if (scenario.metodoPago) {
        await this.selectMetodoPago(scenario.metodoPago);
      }
      
      if (scenario.referenciaPago) {
        await this.agregarReferenciaPago(scenario.referenciaPago);
      }
      
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
   * Toma screenshot con nombre descriptivo
   */
  async takeScreenshot(name) {
    try {
      await this.page.screenshot({ 
        path: `tests/screenshots/${name}-${Date.now()}.png`,
        fullPage: true 
      });
      console.log(`📸 Screenshot guardado: ${name}`);
    } catch (error) {
      console.log('❌ Error tomando screenshot:', error.message);
    }
  }
}

export default ImprovedTestHelper;
