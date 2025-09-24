import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';
import TestDataGenerator from './utils/testDataGenerator.js';

test.describe('Simulación de Búsqueda', () => {
  let testHelper;
  let dataGenerator;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
    dataGenerator = new TestDataGenerator();
    await testHelper.navigateTo(TEST_CONFIG.URLS.VENTAS);
  });

  test('Simular búsqueda de cliente y producto', async ({ page }) => {
    console.log('🧪 Simulando búsqueda de cliente y producto...');
    
    // Buscar cliente
    console.log('\n🔍 BUSCANDO CLIENTE...');
    const cliente = dataGenerator.getRandomCliente();
    console.log(`👤 Buscando cliente: ${cliente.nombre}`);
    
    const clienteInput = await page.locator('input.client-search-input').first();
    await clienteInput.fill(cliente.nombre);
    await page.waitForTimeout(3000);
    
    // Verificar si aparecen resultados de cliente
    const clienteResults = await page.locator('.search-result-item, .cliente-item, .search-result, li').all();
    console.log(`📊 Resultados de cliente encontrados: ${clienteResults.length}`);
    
    for (let i = 0; i < Math.min(clienteResults.length, 5); i++) {
      const el = clienteResults[i];
      const text = await el.textContent();
      const className = await el.getAttribute('class');
      console.log(`   ${i}: "${text?.trim()}" (class="${className}")`);
    }
    
    // Buscar producto
    console.log('\n🔍 BUSCANDO PRODUCTO...');
    const producto = dataGenerator.getRandomProducto();
    console.log(`📦 Buscando producto: ${producto.nombre}`);
    
    const productoInput = await page.locator('input.form-control').first();
    await productoInput.fill(producto.nombre);
    await page.waitForTimeout(3000);
    
    // Verificar si aparecen resultados de producto
    const productoResults = await page.locator('.search-result-item, .producto-item, .search-result, li').all();
    console.log(`📊 Resultados de producto encontrados: ${productoResults.length}`);
    
    for (let i = 0; i < Math.min(productoResults.length, 10); i++) {
      const el = productoResults[i];
      const text = await el.textContent();
      const tagName = await el.evaluate(e => e.tagName);
      const className = await el.getAttribute('class');
      console.log(`   ${i}: "${text?.trim()}" (${tagName}, class="${className}")`);
    }
    
    // Verificar estado de los botones
    console.log('\n🔘 ESTADO DE LOS BOTONES:\n');
    const addButton = await page.locator('button.add-btn').first();
    const registerButton = await page.locator('button.submit-btn').first();
    
    console.log(`   Botón Añadir: disabled="${await addButton.getAttribute('disabled')}"`);
    console.log(`   Botón Registrar: disabled="${await registerButton.getAttribute('disabled')}"`);
    
    await page.screenshot({ path: 'test-results/search-simulation.png', fullPage: true });
    console.log('📸 Screenshot de simulación de búsqueda guardado');
  });
});