/**
 * Test simple para verificar la búsqueda de clientes y productos
 */

import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';

test.describe('Test de Búsqueda de Clientes y Productos', () => {
  let testHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
  });

  test('Verificar búsqueda de cliente', async ({ page }) => {
    console.log('🧪 Verificando búsqueda de cliente...');
    
    // Hacer login y navegar a ventas
    await testHelper.login();
    await testHelper.navigateTo('/ventas');
    
    // Esperar a que la página cargue completamente
    await page.waitForTimeout(3000);
    
    // Buscar cliente
    console.log('🔍 Buscando cliente...');
    const clienteInput = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_INPUT).first();
    await clienteInput.fill('Ana');
    
    // Esperar resultados
    await page.waitForTimeout(2000);
    
    // Verificar si aparecen resultados
    const results = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_RESULT).count();
    console.log(`📋 Resultados de cliente encontrados: ${results}`);
    
    if (results > 0) {
      console.log('✅ Búsqueda de cliente funciona');
      
      // Intentar seleccionar el primer resultado
      const firstResult = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_RESULT).first();
      await firstResult.click();
      
      // Esperar SweetAlert
      await page.waitForTimeout(2000);
      
      // Verificar SweetAlert
      const sweetAlert = await page.locator(TEST_CONFIG.SELECTORS.SWEET_ALERT);
      const isVisible = await sweetAlert.isVisible();
      console.log(`🔔 SweetAlert visible: ${isVisible}`);
      
      if (isVisible) {
        const alertText = await sweetAlert.textContent();
        console.log(`📄 Contenido del SweetAlert: ${alertText}`);
      }
    } else {
      console.log('❌ No se encontraron resultados de cliente');
    }
    
    // Tomar screenshot
    await page.screenshot({ path: 'test-results/cliente-search-test.png', fullPage: true });
    console.log('📸 Screenshot de búsqueda de cliente guardado');
  });

  test('Verificar búsqueda de producto', async ({ page }) => {
    console.log('🧪 Verificando búsqueda de producto...');
    
    // Hacer login y navegar a ventas
    await testHelper.login();
    await testHelper.navigateTo('/ventas');
    
    // Esperar a que la página cargue completamente
    await page.waitForTimeout(3000);
    
    // Buscar producto
    console.log('🔍 Buscando producto...');
    const productoInput = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_INPUT).first();
    await productoInput.fill('Producto');
    
    // Esperar resultados
    await page.waitForTimeout(2000);
    
    // Verificar si aparecen resultados
    const results = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_RESULT).count();
    console.log(`📋 Resultados de producto encontrados: ${results}`);
    
    if (results > 0) {
      console.log('✅ Búsqueda de producto funciona');
      
      // Intentar seleccionar el primer resultado
      const firstResult = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_RESULT).first();
      await firstResult.click();
      
      // Esperar a que se actualice la interfaz
      await page.waitForTimeout(2000);
      
      // Verificar que se haya seleccionado
      const cantidadInput = await page.locator(TEST_CONFIG.SELECTORS.CANTIDAD_INPUT).first();
      const isVisible = await cantidadInput.isVisible();
      console.log(`📦 Campo de cantidad visible: ${isVisible}`);
    } else {
      console.log('❌ No se encontraron resultados de producto');
    }
    
    // Tomar screenshot
    await page.screenshot({ path: 'test-results/producto-search-test.png', fullPage: true });
    console.log('📸 Screenshot de búsqueda de producto guardado');
  });
});
