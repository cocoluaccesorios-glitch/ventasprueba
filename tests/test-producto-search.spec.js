/**
 * Test simple para verificar la búsqueda de productos
 */

import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';

test.describe('Test de Búsqueda de Productos', () => {
  let testHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
  });

  test('Verificar búsqueda de producto paso a paso', async ({ page }) => {
    console.log('🧪 Verificando búsqueda de producto paso a paso...');
    
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
    await page.waitForTimeout(3000);
    
    // Verificar si aparecen resultados
    const results = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_RESULT).count();
    console.log(`📋 Resultados de producto encontrados: ${results}`);
    
    // Si no hay resultados, intentar con otros selectores
    if (results === 0) {
      console.log('🔍 Intentando con otros selectores...');
      
      // Buscar elementos que contengan "Producto"
      const elementsWithProducto = await page.locator('text=Producto').count();
      console.log(`📋 Elementos con texto "Producto": ${elementsWithProducto}`);
      
      // Buscar elementos de lista
      const listItems = await page.locator('li, .item, .result').count();
      console.log(`📋 Elementos de lista encontrados: ${listItems}`);
      
      // Buscar elementos clickeables
      const clickableElements = await page.locator('button, a, [role="button"]').count();
      console.log(`📋 Elementos clickeables encontrados: ${clickableElements}`);
      
      // Listar algunos elementos clickeables
      const clickableElementsList = await page.locator('button, a, [role="button"]').all();
      for (let i = 0; i < Math.min(clickableElementsList.length, 5); i++) {
        const element = clickableElementsList[i];
        const text = await element.textContent();
        const className = await element.getAttribute('class');
        console.log(`   - Elemento ${i}: "${text}", class: "${className}"`);
      }
    }
    
    // Tomar screenshot
    await page.screenshot({ path: 'test-results/producto-search-detailed.png', fullPage: true });
    console.log('📸 Screenshot detallado de búsqueda de producto guardado');
  });
});
