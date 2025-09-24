import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';

test.describe('Test de Búsqueda con Datos Mock', () => {
  let testHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
    await testHelper.navigateTo(TEST_CONFIG.URLS.VENTAS);
  });

  test('Simular búsqueda con datos mock', async ({ page }) => {
    console.log('🧪 Simulando búsqueda con datos mock...');
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // Verificar si hay datos mock disponibles
    console.log('\n🔍 VERIFICANDO DATOS MOCK DISPONIBLES...');
    const mockDataAvailable = await page.evaluate(() => {
      // Buscar en el contexto de Vue si hay datos mock
      const app = document.querySelector('#app');
      if (app && app.__vue_app__) {
        // Intentar acceder a los datos de Vue
        console.log('Vue app encontrada');
        return true;
      }
      return false;
    });
    
    console.log(`📊 ¿Datos mock disponibles? ${mockDataAvailable}`);
    
    // Intentar buscar un cliente
    console.log('\n🔍 BUSCANDO CLIENTE...');
    const clienteInput = await page.locator('input.client-search-input').first();
    await clienteInput.fill('Ana');
    await page.waitForTimeout(3000);
    
    // Verificar si aparecen resultados
    const clienteResults = await page.locator('.search-result-item, .cliente-item, .search-result, li').all();
    console.log(`📊 Resultados de cliente encontrados: ${clienteResults.length}`);
    
    if (clienteResults.length > 0) {
      console.log('✅ Resultados de cliente encontrados:');
      for (let i = 0; i < Math.min(clienteResults.length, 5); i++) {
        const el = clienteResults[i];
        const text = await el.textContent();
        const className = await el.getAttribute('class');
        console.log(`   ${i}: "${text?.trim()}" (class="${className}")`);
      }
    } else {
      console.log('❌ No se encontraron resultados de cliente');
    }
    
    // Intentar buscar un producto
    console.log('\n🔍 BUSCANDO PRODUCTO...');
    const productoInput = await page.locator('input.form-control').first();
    await productoInput.fill('Producto');
    await page.waitForTimeout(3000);
    
    // Verificar si aparecen resultados
    const productoResults = await page.locator('.search-result-item, .producto-item, .search-result, li, strong').all();
    console.log(`📊 Resultados de producto encontrados: ${productoResults.length}`);
    
    if (productoResults.length > 0) {
      console.log('✅ Resultados de producto encontrados:');
      for (let i = 0; i < Math.min(productoResults.length, 5); i++) {
        const el = productoResults[i];
        const text = await el.textContent();
        const className = await el.getAttribute('class');
        const tagName = await el.evaluate(e => e.tagName);
        console.log(`   ${i}: "${text?.trim()}" (${tagName}, class="${className}")`);
      }
    } else {
      console.log('❌ No se encontraron resultados de producto');
    }
    
    // Verificar si hay elementos de búsqueda funcionando
    console.log('\n🔍 VERIFICANDO FUNCIONALIDAD DE BÚSQUEDA...');
    const searchInputs = await page.locator('input[placeholder*="cliente"], input[placeholder*="producto"]').all();
    console.log(`📊 Inputs de búsqueda encontrados: ${searchInputs.length}`);
    
    for (let i = 0; i < searchInputs.length; i++) {
      const input = searchInputs[i];
      const placeholder = await input.getAttribute('placeholder');
      const className = await input.getAttribute('class');
      const value = await input.getAttribute('value');
      console.log(`   ${i + 1}: placeholder="${placeholder}", class="${className}", value="${value}"`);
    }
    
    // Verificar si hay elementos de resultados
    console.log('\n🔍 VERIFICANDO ELEMENTOS DE RESULTADOS...');
    const resultElements = await page.locator('.search-result, .result, .item, .option, .dropdown, .menu').all();
    console.log(`📊 Elementos de resultados encontrados: ${resultElements.length}`);
    
    if (resultElements.length > 0) {
      console.log('✅ Elementos de resultados encontrados:');
      for (let i = 0; i < Math.min(resultElements.length, 5); i++) {
        const el = resultElements[i];
        const text = await el.textContent();
        const className = await el.getAttribute('class');
        console.log(`   ${i}: "${text?.trim()}" (class="${className}")`);
      }
    }
    
    // Verificar si hay elementos de lista
    console.log('\n🔍 VERIFICANDO ELEMENTOS DE LISTA...');
    const listElements = await page.locator('ul, ol, li').all();
    console.log(`📊 Elementos de lista encontrados: ${listElements.length}`);
    
    if (listElements.length > 0) {
      console.log('✅ Elementos de lista encontrados:');
      for (let i = 0; i < Math.min(listElements.length, 10); i++) {
        const el = listElements[i];
        const text = await el.textContent();
        const className = await el.getAttribute('class');
        console.log(`   ${i}: "${text?.trim()}" (class="${className}")`);
      }
    }
    
    await page.screenshot({ path: 'test-results/search-with-mock-data.png', fullPage: true });
    console.log('📸 Screenshot de búsqueda con datos mock guardado');
  });
});
