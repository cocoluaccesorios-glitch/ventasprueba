import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';

test.describe('Inspección del DOM de Búsqueda', () => {
  let testHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
    await testHelper.navigateTo(TEST_CONFIG.URLS.VENTAS);
  });

  test('Inspeccionar DOM después de búsqueda', async ({ page }) => {
    console.log('🧪 Inspeccionando DOM después de búsqueda...');
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // Buscar cliente
    console.log('\n🔍 BUSCANDO CLIENTE...');
    const clienteInput = await page.locator('input.client-search-input').first();
    await clienteInput.fill('Ana');
    await page.waitForTimeout(3000);
    
    // Inspeccionar todos los elementos que aparecen después de la búsqueda
    console.log('\n📋 ELEMENTOS DESPUÉS DE BÚSQUEDA DE CLIENTE:');
    const allElements = await page.locator('*').all();
    console.log(`📊 Total de elementos en la página: ${allElements.length}`);
    
    // Buscar elementos que podrían ser resultados de búsqueda
    const possibleResults = await page.locator('div, span, li, ul, ol, p, h1, h2, h3, h4, h5, h6').all();
    console.log(`📊 Elementos potenciales de resultados: ${possibleResults.length}`);
    
    // Filtrar elementos que contienen texto relacionado con la búsqueda
    const relevantElements = [];
    for (let i = 0; i < Math.min(possibleResults.length, 50); i++) {
      const el = possibleResults[i];
      const text = await el.textContent();
      const className = await el.getAttribute('class');
      const id = await el.getAttribute('id');
      const tagName = await el.evaluate(e => e.tagName);
      
      if (text && text.trim().length > 0 && text.trim().length < 100) {
        relevantElements.push({
          tagName,
          text: text.trim(),
          className,
          id
        });
      }
    }
    
    console.log(`📊 Elementos relevantes encontrados: ${relevantElements.length}`);
    for (let i = 0; i < Math.min(relevantElements.length, 20); i++) {
      const el = relevantElements[i];
      console.log(`   ${i}: "${el.text}" (${el.tagName}, class="${el.className}", id="${el.id}")`);
    }
    
    // Buscar producto
    console.log('\n🔍 BUSCANDO PRODUCTO...');
    const productoInput = await page.locator('input.form-control').first();
    await productoInput.fill('Producto');
    await page.waitForTimeout(3000);
    
    // Inspeccionar elementos después de búsqueda de producto
    console.log('\n📋 ELEMENTOS DESPUÉS DE BÚSQUEDA DE PRODUCTO:');
    const productRelevantElements = [];
    for (let i = 0; i < Math.min(possibleResults.length, 50); i++) {
      const el = possibleResults[i];
      const text = await el.textContent();
      const className = await el.getAttribute('class');
      const id = await el.getAttribute('id');
      const tagName = await el.evaluate(e => e.tagName);
      
      if (text && text.trim().length > 0 && text.trim().length < 100) {
        productRelevantElements.push({
          tagName,
          text: text.trim(),
          className,
          id
        });
      }
    }
    
    console.log(`📊 Elementos relevantes de producto: ${productRelevantElements.length}`);
    for (let i = 0; i < Math.min(productRelevantElements.length, 20); i++) {
      const el = productRelevantElements[i];
      console.log(`   ${i}: "${el.text}" (${el.tagName}, class="${el.className}", id="${el.id}")`);
    }
    
    // Verificar si hay elementos con clases específicas de resultados
    console.log('\n📋 ELEMENTOS CON CLASES DE RESULTADOS:');
    const resultClasses = ['.search-result', '.result', '.item', '.option', '.suggestion', '.dropdown', '.menu', '.list'];
    for (const className of resultClasses) {
      const elements = await page.locator(className).all();
      if (elements.length > 0) {
        console.log(`   ${className}: ${elements.length} elementos encontrados`);
        for (let i = 0; i < Math.min(elements.length, 3); i++) {
          const el = elements[i];
          const text = await el.textContent();
          console.log(`     ${i}: "${text?.trim()}"`);
        }
      }
    }
    
    await page.screenshot({ path: 'test-results/search-dom-inspection.png', fullPage: true });
    console.log('📸 Screenshot de inspección del DOM de búsqueda guardado');
  });
});