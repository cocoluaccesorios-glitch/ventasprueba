import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';
import TestDataGenerator from './utils/testDataGenerator.js';

test.describe('Inspección del DOM de Búsqueda', () => {
  let testHelper;
  let dataGenerator;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
    dataGenerator = new TestDataGenerator();
    await testHelper.navigateTo(TEST_CONFIG.URLS.VENTAS);
  });

  test('Inspeccionar DOM después de búsqueda de cliente', async ({ page }) => {
    console.log('🧪 Inspeccionando DOM después de búsqueda de cliente...');
    const cliente = dataGenerator.getRandomCliente();
    
    // Llenar campo de búsqueda de cliente
    const clienteInput = await page.locator('input.client-search-input').first();
    await clienteInput.fill(cliente.nombre);
    
    // Esperar un momento para que los resultados aparezcan
    await page.waitForTimeout(3000);
    
    console.log('\n📋 ELEMENTOS DESPUÉS DE BÚSQUEDA DE CLIENTE:\n');
    
    // Buscar elementos que podrían ser resultados de búsqueda
    const possibleResults = await page.locator('.search-result-item, .cliente-item, .search-result, .dropdown-item, li').all();
    console.log(`📊 Total de elementos encontrados: ${possibleResults.length}`);
    
    for (let i = 0; i < possibleResults.length; i++) {
      const el = possibleResults[i];
      const text = await el.textContent();
      const isVisible = await el.isVisible();
      const className = await el.getAttribute('class');
      const id = await el.getAttribute('id');
      const parent = await el.evaluate(e => e.parentElement?.tagName + (e.parentElement?.className ? '.' + e.parentElement.className : ''));
      console.log(`   ${i}: "${text?.trim()}" (visible=${isVisible}, class="${className}", id="${id}", parent=${parent})`);
    }
    
    // Buscar elementos con texto que contenga el nombre del cliente
    console.log('\n📋 ELEMENTOS CON TEXTO DEL CLIENTE:\n');
    const clientTextElements = await page.locator(`text=${cliente.nombre}`).all();
    console.log(`📊 Elementos con texto "${cliente.nombre}": ${clientTextElements.length}`);
    
    for (let i = 0; i < clientTextElements.length; i++) {
      const el = clientTextElements[i];
      const text = await el.textContent();
      const isVisible = await el.isVisible();
      const className = await el.getAttribute('class');
      const tagName = await el.evaluate(e => e.tagName);
      console.log(`   ${i}: "${text?.trim()}" (visible=${isVisible}, ${tagName}, class="${className}")`);
    }
    
    await page.screenshot({ path: 'test-results/inspect-cliente-search-dom.png', fullPage: true });
    console.log('📸 Screenshot de DOM de búsqueda de cliente guardado');
  });

  test('Inspeccionar DOM después de búsqueda de producto', async ({ page }) => {
    console.log('🧪 Inspeccionando DOM después de búsqueda de producto...');
    const producto = dataGenerator.getRandomProducto();
    
    // Llenar campo de búsqueda de producto
    const productoInput = await page.locator('input.form-control').first();
    await productoInput.fill(producto.nombre);
    
    // Esperar un momento para que los resultados aparezcan
    await page.waitForTimeout(3000);
    
    console.log('\n📋 ELEMENTOS DESPUÉS DE BÚSQUEDA DE PRODUCTO:\n');
    
    // Buscar elementos que podrían ser resultados de búsqueda
    const possibleResults = await page.locator('.search-result-item, .producto-item, .search-result, .dropdown-item, li').all();
    console.log(`📊 Total de elementos encontrados: ${possibleResults.length}`);
    
    for (let i = 0; i < possibleResults.length; i++) {
      const el = possibleResults[i];
      const text = await el.textContent();
      const isVisible = await el.isVisible();
      const className = await el.getAttribute('class');
      const id = await el.getAttribute('id');
      const parent = await el.evaluate(e => e.parentElement?.tagName + (e.parentElement?.className ? '.' + e.parentElement.className : ''));
      console.log(`   ${i}: "${text?.trim()}" (visible=${isVisible}, class="${className}", id="${id}", parent=${parent})`);
    }
    
    // Buscar elementos con texto que contenga el nombre del producto
    console.log('\n📋 ELEMENTOS CON TEXTO DEL PRODUCTO:\n');
    const productTextElements = await page.locator(`text=${producto.nombre}`).all();
    console.log(`📊 Elementos con texto "${producto.nombre}": ${productTextElements.length}`);
    
    for (let i = 0; i < productTextElements.length; i++) {
      const el = productTextElements[i];
      const text = await el.textContent();
      const isVisible = await el.isVisible();
      const className = await el.getAttribute('class');
      const tagName = await el.evaluate(e => e.tagName);
      console.log(`   ${i}: "${text?.trim()}" (visible=${isVisible}, ${tagName}, class="${className}")`);
    }
    
    await page.screenshot({ path: 'test-results/inspect-producto-search-dom.png', fullPage: true });
    console.log('📸 Screenshot de DOM de búsqueda de producto guardado');
  });
});