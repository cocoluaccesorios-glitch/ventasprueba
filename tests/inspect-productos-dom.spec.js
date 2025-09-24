/**
 * Test para inspeccionar el DOM y encontrar los selectores correctos
 */

import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';

test.describe('Inspección del DOM para Productos', () => {
  let testHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
  });

  test('Inspeccionar DOM de productos', async ({ page }) => {
    console.log('🧪 Inspeccionando DOM de productos...');
    
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
    
    // Inspeccionar elementos con texto "Producto"
    console.log('\n📋 ELEMENTOS CON TEXTO "PRODUCTO":');
    const elementosConProducto = await page.locator('text=Producto').all();
    for (let i = 0; i < Math.min(elementosConProducto.length, 10); i++) {
      const elemento = elementosConProducto[i];
      const text = await elemento.textContent();
      const tagName = await elemento.evaluate(el => el.tagName);
      const className = await elemento.getAttribute('class');
      const id = await elemento.getAttribute('id');
      const parentTag = await elemento.evaluate(el => el.parentElement?.tagName);
      const parentClass = await elemento.evaluate(el => el.parentElement?.className);
      
      console.log(`   ${i}: "${text}" (${tagName}, class="${className}", id="${id}", parent=${parentTag}.${parentClass})`);
    }
    
    // Inspeccionar elementos de lista
    console.log('\n📋 ELEMENTOS DE LISTA:');
    const elementosLista = await page.locator('li, .item, .result, .search-result, .producto-item').all();
    for (let i = 0; i < Math.min(elementosLista.length, 10); i++) {
      const elemento = elementosLista[i];
      const text = await elemento.textContent();
      const tagName = await elemento.evaluate(el => el.tagName);
      const className = await elemento.getAttribute('class');
      const id = await elemento.getAttribute('id');
      
      console.log(`   ${i}: "${text}" (${tagName}, class="${className}", id="${id}")`);
    }
    
    // Inspeccionar elementos clickeables
    console.log('\n📋 ELEMENTOS CLICKEABLES:');
    const elementosClickeables = await page.locator('button, a, [role="button"], .clickable, .selectable').all();
    for (let i = 0; i < Math.min(elementosClickeables.length, 10); i++) {
      const elemento = elementosClickeables[i];
      const text = await elemento.textContent();
      const tagName = await elemento.evaluate(el => el.tagName);
      const className = await elemento.getAttribute('class');
      const id = await elemento.getAttribute('id');
      
      console.log(`   ${i}: "${text}" (${tagName}, class="${className}", id="${id}")`);
    }
    
    // Inspeccionar elementos con atributos específicos
    console.log('\n📋 ELEMENTOS CON ATRIBUTOS ESPECÍFICOS:');
    const elementosEspecificos = await page.locator('[data-testid], [data-producto], [data-item], .producto, .item').all();
    for (let i = 0; i < Math.min(elementosEspecificos.length, 10); i++) {
      const elemento = elementosEspecificos[i];
      const text = await elemento.textContent();
      const tagName = await elemento.evaluate(el => el.tagName);
      const className = await elemento.getAttribute('class');
      const id = await elemento.getAttribute('id');
      const dataTestId = await elemento.getAttribute('data-testid');
      const dataProducto = await elemento.getAttribute('data-producto');
      
      console.log(`   ${i}: "${text}" (${tagName}, class="${className}", id="${id}", data-testid="${dataTestId}", data-producto="${dataProducto}")`);
    }
    
    // Tomar screenshot
    await page.screenshot({ path: 'test-results/dom-inspection-productos.png', fullPage: true });
    console.log('📸 Screenshot de inspección del DOM guardado');
  });
});
