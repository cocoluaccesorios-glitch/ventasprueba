/**
 * Test para inspeccionar el DOM de productos y encontrar los selectores correctos
 */

import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';

test.describe('Inspección del DOM de Productos', () => {
  let testHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
  });

  test('Inspeccionar DOM de productos paso a paso', async ({ page }) => {
    console.log('🧪 Inspeccionando DOM de productos paso a paso...');
    
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
    
    // Inspeccionar elementos de resultado de producto
    console.log('\n📋 ELEMENTOS DE RESULTADO DE PRODUCTO:');
    const productoResults = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_RESULT).all();
    console.log(`📊 Total de resultados encontrados: ${productoResults.length}`);
    
    for (let i = 0; i < Math.min(productoResults.length, 5); i++) {
      const elemento = productoResults[i];
      const text = await elemento.textContent();
      const tagName = await elemento.evaluate(el => el.tagName);
      const className = await elemento.getAttribute('class');
      const id = await elemento.getAttribute('id');
      const parentTag = await elemento.evaluate(el => el.parentElement?.tagName);
      const parentClass = await elemento.evaluate(el => el.parentElement?.className);
      
      console.log(`   ${i}: "${text}" (${tagName}, class="${className}", id="${id}", parent=${parentTag}.${parentClass})`);
    }
    
    // Si no hay resultados, buscar elementos alternativos
    if (productoResults.length === 0) {
      console.log('\n🔍 Buscando elementos alternativos...');
      
      // Buscar elementos que contengan "Producto"
      const elementosConProducto = await page.locator('text=Producto').all();
      console.log(`📊 Elementos con "Producto": ${elementosConProducto.length}`);
      
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
      
      // Buscar elementos clickeables
      console.log('\n🔍 Buscando elementos clickeables...');
      const elementosClickeables = await page.locator('button, a, [role="button"], .clickable, .selectable').all();
      console.log(`📊 Elementos clickeables encontrados: ${elementosClickeables.length}`);
      
      for (let i = 0; i < Math.min(elementosClickeables.length, 10); i++) {
        const elemento = elementosClickeables[i];
        const text = await elemento.textContent();
        const tagName = await elemento.evaluate(el => el.tagName);
        const className = await elemento.getAttribute('class');
        const id = await elemento.getAttribute('id');
        
        console.log(`   ${i}: "${text}" (${tagName}, class="${className}", id="${id}")`);
      }
    }
    
    // Tomar screenshot
    await page.screenshot({ path: 'test-results/producto-dom-inspection.png', fullPage: true });
    console.log('📸 Screenshot de inspección del DOM guardado');
  });
});
