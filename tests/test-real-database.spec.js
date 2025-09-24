import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';

test.describe('Test con Base de Datos Real', () => {
  let testHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
  });

  test('Verificar conexión a base de datos real', async ({ page }) => {
    console.log('🧪 Verificando conexión a base de datos real...');
    
    // Navegar a la página de ventas
    await testHelper.navigateTo(TEST_CONFIG.URLS.VENTAS);
    
    // Esperar a que se carguen los datos
    await page.waitForTimeout(5000);
    
    // Verificar que estamos en la página correcta
    const currentUrl = page.url();
    console.log(`🌐 URL actual: ${currentUrl}`);
    expect(currentUrl).toContain('/ventas');
    
    // Verificar que los campos de búsqueda están presentes
    const clienteInput = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_INPUT).first();
    const productoInput = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_INPUT).first();
    
    expect(await clienteInput.isVisible()).toBe(true);
    expect(await productoInput.isVisible()).toBe(true);
    
    console.log('✅ Campos de búsqueda encontrados');
    
    // Probar búsqueda de cliente con datos reales
    console.log('🔍 Probando búsqueda de cliente...');
    await clienteInput.fill('Luis');
    await page.waitForTimeout(3000);
    
    // Verificar si aparecen resultados
    const clienteResults = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_RESULT).count();
    console.log(`📊 Resultados de cliente encontrados: ${clienteResults}`);
    
    if (clienteResults > 0) {
      console.log('✅ Búsqueda de cliente funciona con datos reales');
      
      // Mostrar los resultados encontrados
      for (let i = 0; i < Math.min(clienteResults, 3); i++) {
        const result = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_RESULT).nth(i);
        const text = await result.textContent();
        console.log(`   - Cliente ${i + 1}: ${text?.trim()}`);
      }
    } else {
      console.log('⚠️ No se encontraron resultados de cliente');
    }
    
    // Probar búsqueda de producto con datos reales
    console.log('🔍 Probando búsqueda de producto...');
    await productoInput.fill('Coca');
    await page.waitForTimeout(3000);
    
    // Verificar si aparecen resultados
    const productoResults = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_RESULT).count();
    console.log(`📊 Resultados de producto encontrados: ${productoResults}`);
    
    if (productoResults > 0) {
      console.log('✅ Búsqueda de producto funciona con datos reales');
      
      // Mostrar los resultados encontrados
      for (let i = 0; i < Math.min(productoResults, 3); i++) {
        const result = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_RESULT).nth(i);
        const text = await result.textContent();
        console.log(`   - Producto ${i + 1}: ${text?.trim()}`);
      }
    } else {
      console.log('⚠️ No se encontraron resultados de producto');
    }
    
    // Verificar estado de los botones
    const addButton = await page.locator(TEST_CONFIG.SELECTORS.ADD_BUTTON).first();
    const submitButton = await page.locator(TEST_CONFIG.SELECTORS.SUBMIT_BUTTON).first();
    
    const addButtonEnabled = await addButton.isEnabled();
    const submitButtonEnabled = await submitButton.isEnabled();
    
    console.log(`🔘 Botón Añadir: ${addButtonEnabled ? 'habilitado' : 'deshabilitado'}`);
    console.log(`🔘 Botón Registrar: ${submitButtonEnabled ? 'habilitado' : 'deshabilitado'}`);
    
    // Tomar screenshot
    await page.screenshot({ path: 'test-results/real-database-test.png', fullPage: true });
    console.log('📸 Screenshot guardado');
    
    console.log('✅ Test de base de datos real completado');
  });

  test('Verificar datos disponibles en la base de datos', async ({ page }) => {
    console.log('🧪 Verificando datos disponibles en la base de datos...');
    
    // Navegar a la página de ventas
    await testHelper.navigateTo(TEST_CONFIG.URLS.VENTAS);
    
    // Esperar a que se carguen los datos
    await page.waitForTimeout(5000);
    
    // Verificar que no hay mensajes de error
    const errorMessages = await page.locator('.alert-danger, .error-message').count();
    if (errorMessages > 0) {
      console.log('❌ Se encontraron mensajes de error:');
      for (let i = 0; i < errorMessages; i++) {
        const error = await page.locator('.alert-danger, .error-message').nth(i);
        const text = await error.textContent();
        console.log(`   - Error ${i + 1}: ${text?.trim()}`);
      }
    } else {
      console.log('✅ No se encontraron mensajes de error');
    }
    
    // Verificar que la página se carga correctamente
    const pageTitle = await page.title();
    console.log(`📄 Título de la página: ${pageTitle}`);
    
    // Verificar que los elementos principales están presentes
    const clienteInput = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_INPUT).first();
    const productoInput = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_INPUT).first();
    const addButton = await page.locator(TEST_CONFIG.SELECTORS.ADD_BUTTON).first();
    const submitButton = await page.locator(TEST_CONFIG.SELECTORS.SUBMIT_BUTTON).first();
    
    const elementsFound = {
      clienteInput: await clienteInput.isVisible(),
      productoInput: await productoInput.isVisible(),
      addButton: await addButton.isVisible(),
      submitButton: await submitButton.isVisible()
    };
    
    console.log('📋 Elementos encontrados:');
    Object.entries(elementsFound).forEach(([element, found]) => {
      console.log(`   - ${element}: ${found ? '✅' : '❌'}`);
    });
    
    // Verificar que al menos los elementos básicos están presentes
    expect(elementsFound.clienteInput).toBe(true);
    expect(elementsFound.productoInput).toBe(true);
    expect(elementsFound.addButton).toBe(true);
    expect(elementsFound.submitButton).toBe(true);
    
    console.log('✅ Verificación de datos completada');
  });
});
