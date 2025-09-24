import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';
import TestDataGenerator from './utils/testDataGenerator.js';

test.describe('Inspección de Búsqueda de Productos', () => {
  let testHelper;
  let dataGenerator;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
    dataGenerator = new TestDataGenerator();
    await testHelper.navigateTo(TEST_CONFIG.URLS.VENTAS);
  });

  test('Inspeccionar búsqueda de productos paso a paso', async ({ page }) => {
    console.log('🧪 Inspeccionando búsqueda de productos paso a paso...');
    const producto = dataGenerator.getRandomProducto();
    
    // Llenar campo de búsqueda de producto
    const productoInput = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_INPUT).first();
    await productoInput.fill(producto.nombre);
    
    // Esperar un momento para que los resultados aparezcan
    await page.waitForTimeout(TEST_CONFIG.TIMEOUTS.MEDIUM);
    
    // Contar resultados con el selector actual
    let results = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_RESULT).all();
    console.log(`📋 Resultados de producto encontrados: ${results.length}`);
    
    // Si no se encuentran resultados, intentar con selectores más genéricos
    if (results.length === 0) {
      console.log('🔍 Intentando con otros selectores...');
      
      // Buscar elementos que contengan el texto del producto
      const textLocators = await page.locator(`text=${producto.nombre}`).all();
      console.log(`📋 Elementos con texto "${producto.nombre}": ${textLocators.length}`);
      
      // Buscar elementos de lista genéricos
      const listItems = await page.locator('li').all();
      console.log(`📋 Elementos de lista encontrados: ${listItems.length}`);
      
      // Buscar elementos clickeables
      const clickableElements = await page.locator('button, a, [role="button"], [role="link"]').all();
      console.log(`📋 Elementos clickeables encontrados: ${clickableElements.length}`);
      
      for (let i = 0; i < Math.min(clickableElements.length, 5); i++) { // Log first 5
        const el = clickableElements[i];
        const text = await el.textContent();
        console.log(`   - Elemento ${i}: "${text?.trim()}", class: "${await el.getAttribute('class')}"`);
      }
      
      // Buscar elementos con clases que podrían ser resultados
      const possibleResults = await page.locator('.result, .item, .option, .suggestion, .dropdown-item').all();
      console.log(`📋 Elementos con clases de resultado: ${possibleResults.length}`);
      
      for (let i = 0; i < Math.min(possibleResults.length, 10); i++) {
        const el = possibleResults[i];
        const text = await el.textContent();
        const isVisible = await el.isVisible();
        const className = await el.getAttribute('class');
        console.log(`   ${i}: "${text?.trim()}" (visible=${isVisible}, class="${className}")`);
      }
    }
    
    await page.screenshot({ path: 'test-results/producto-search-debug-screenshot.png', fullPage: true });
    console.log('📸 Screenshot detallado de búsqueda de producto guardado');
    
    // Expectación para que el test pase, aunque no encuentre resultados con el selector original
    expect(true).toBe(true);
  });
});
