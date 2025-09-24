import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';
import TestDataGenerator from './utils/testDataGenerator.js';

test.describe('Inspección de Resultados de Búsqueda', () => {
  let testHelper;
  let dataGenerator;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
    dataGenerator = new TestDataGenerator();
    await testHelper.navigateTo(TEST_CONFIG.URLS.VENTAS);
  });

  test('Inspeccionar resultados de búsqueda de clientes', async ({ page }) => {
    console.log('🧪 Inspeccionando resultados de búsqueda de clientes...');
    const cliente = dataGenerator.getRandomCliente();
    
    await page.fill(TEST_CONFIG.SELECTORS.CLIENTE_INPUT, cliente.nombre);
    await page.waitForTimeout(TEST_CONFIG.TIMEOUTS.MEDIUM);
    
    console.log('\n📋 ELEMENTOS DE RESULTADO DE CLIENTE:\n');
    const results = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_RESULT).all();
    console.log(`📊 Total de resultados encontrados: ${results.length}`);
    
    for (let i = 0; i < results.length; i++) {
      const el = results[i];
      const text = await el.textContent();
      const isVisible = await el.isVisible();
      const isEnabled = await el.isEnabled();
      const className = await el.getAttribute('class');
      const id = await el.getAttribute('id');
      const parent = await el.evaluate(e => e.parentElement?.tagName + (e.parentElement?.className ? '.' + e.parentElement.className : ''));
      console.log(`   ${i}: "${text?.trim()}" (visible=${isVisible}, enabled=${isEnabled}, class="${className}", id="${id}", parent=${parent})`);
    }
    
    await page.screenshot({ path: 'test-results/inspect-cliente-results.png', fullPage: true });
    console.log('📸 Screenshot de resultados de cliente guardado');
  });

  test('Inspeccionar resultados de búsqueda de productos', async ({ page }) => {
    console.log('🧪 Inspeccionando resultados de búsqueda de productos...');
    const producto = dataGenerator.getRandomProducto();
    
    await page.fill(TEST_CONFIG.SELECTORS.PRODUCTO_INPUT, producto.nombre);
    await page.waitForTimeout(TEST_CONFIG.TIMEOUTS.MEDIUM);
    
    console.log('\n📋 ELEMENTOS DE RESULTADO DE PRODUCTO:\n');
    const results = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_RESULT).all();
    console.log(`📊 Total de resultados encontrados: ${results.length}`);
    
    for (let i = 0; i < results.length; i++) {
      const el = results[i];
      const text = await el.textContent();
      const isVisible = await el.isVisible();
      const isEnabled = await el.isEnabled();
      const className = await el.getAttribute('class');
      const id = await el.getAttribute('id');
      const parent = await el.evaluate(e => e.parentElement?.tagName + (e.parentElement?.className ? '.' + e.parentElement.className : ''));
      console.log(`   ${i}: "${text?.trim()}" (visible=${isVisible}, enabled=${isEnabled}, class="${className}", id="${id}", parent=${parent})`);
    }
    
    await page.screenshot({ path: 'test-results/inspect-producto-results.png', fullPage: true });
    console.log('📸 Screenshot de resultados de producto guardado');
  });
});