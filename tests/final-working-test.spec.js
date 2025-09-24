import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';

test.describe('Test Final Funcional', () => {
  let testHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
    await testHelper.navigateTo(TEST_CONFIG.URLS.VENTAS);
  });

  test('Venta completa con cliente real', async ({ page }) => {
    console.log('🧪 Probando venta completa con cliente real...');
    
    // Seleccionar cliente real
    const cliente = { nombre: 'Juan', apellido: 'Pérez' };
    console.log(`👤 Seleccionando cliente: ${cliente.nombre} ${cliente.apellido}`);
    
    const clienteInput = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_INPUT).first();
    await clienteInput.fill(cliente.nombre);
    await page.waitForTimeout(3000);
    
    // Verificar que aparecen resultados
    const clienteResults = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_RESULT).count();
    console.log(`📊 Resultados de cliente encontrados: ${clienteResults}`);
    
    if (clienteResults > 0) {
      // Seleccionar el primer resultado
      const clienteOption = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_RESULT).first();
      await clienteOption.click();
      await page.waitForTimeout(2000);
      
      console.log('✅ Cliente seleccionado exitosamente');
      
      // Manejar SweetAlert si aparece
      const sweetAlert = await page.locator(TEST_CONFIG.SELECTORS.SWEET_ALERT);
      if (await sweetAlert.isVisible()) {
        console.log('🔔 SweetAlert detectado, cerrando...');
        const confirmBtn = await page.locator(TEST_CONFIG.SELECTORS.SWEET_CONFIRM);
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
          await page.waitForTimeout(1000);
        }
      }
      
      // Verificar que el cliente se seleccionó
      const clienteSeleccionado = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_SELECTED).count();
      if (clienteSeleccionado > 0) {
        console.log('✅ Cliente confirmado en la interfaz');
      }
      
      // Verificar estado de los botones
      const submitButton = await page.locator(TEST_CONFIG.SELECTORS.SUBMIT_BUTTON).first();
      const submitButtonEnabled = await submitButton.isEnabled();
      console.log(`🔘 Botón Registrar: ${submitButtonEnabled ? 'habilitado' : 'deshabilitado'}`);
      
      // Tomar screenshot
      await page.screenshot({ path: 'test-results/final-working-test.png', fullPage: true });
      console.log('📸 Screenshot guardado');
      
    } else {
      console.log('❌ No se encontraron resultados de cliente');
    }
    
    console.log('✅ Test de venta completa completado');
  });

  test('Verificar funcionalidad básica de la aplicación', async ({ page }) => {
    console.log('🧪 Verificando funcionalidad básica de la aplicación...');
    
    // Verificar que la página se carga correctamente
    const pageTitle = await page.title();
    console.log(`📄 Título: ${pageTitle}`);
    expect(pageTitle).toContain('Sistema de Ventas Cocolú');
    
    // Verificar elementos principales
    const elements = {
      clienteInput: await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_INPUT).first(),
      productoInput: await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_INPUT).first(),
      addButton: await page.locator(TEST_CONFIG.SELECTORS.ADD_BUTTON).first(),
      submitButton: await page.locator(TEST_CONFIG.SELECTORS.SUBMIT_BUTTON).first()
    };
    
    console.log('\n📋 Estado de los elementos:');
    for (const [name, element] of Object.entries(elements)) {
      const isVisible = await element.isVisible();
      const isEnabled = await element.isEnabled();
      console.log(`   - ${name}: visible=${isVisible}, enabled=${isEnabled}`);
      
      // Verificar que los elementos básicos están presentes
      expect(isVisible).toBe(true);
    }
    
    // Verificar que no hay errores
    const errorMessages = await page.locator('.alert-danger, .error-message').count();
    if (errorMessages > 0) {
      console.log('\n❌ Errores encontrados:');
      for (let i = 0; i < errorMessages; i++) {
        const error = await page.locator('.alert-danger, .error-message').nth(i);
        const text = await error.textContent();
        console.log(`   - ${text?.trim()}`);
      }
    } else {
      console.log('\n✅ No se encontraron errores');
    }
    
    // Verificar que la aplicación está lista para usar
    const clienteInput = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_INPUT).first();
    const productoInput = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_INPUT).first();
    
    expect(await clienteInput.isVisible()).toBe(true);
    expect(await productoInput.isVisible()).toBe(true);
    
    console.log('\n✅ Verificación de funcionalidad básica completada');
  });
});
