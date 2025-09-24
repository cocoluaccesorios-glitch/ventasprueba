import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';

test.describe('Inspección del DOM de Ventas', () => {
  let testHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
    await testHelper.navigateTo(TEST_CONFIG.URLS.VENTAS);
  });

  test('Inspeccionar DOM completo de la página de ventas', async ({ page }) => {
    console.log('🧪 Inspeccionando DOM completo de la página de ventas...');
    
    console.log('\n📋 INFORMACIÓN GENERAL:\n');
    console.log(`📄 Título: ${await page.title()}`);
    console.log(`🌐 URL: ${page.url()}`);
    console.log(`📝 Número de inputs: ${await page.locator('input').count()}`);
    console.log(`🔘 Número de botones: ${await page.locator('button').count()}`);
    console.log(`📋 Número de divs: ${await page.locator('div').count()}`);
    console.log(`📝 Número de spans: ${await page.locator('span').count()}`);
    
    console.log('\n📋 TODOS LOS INPUTS:\n');
    const inputs = await page.locator('input').all();
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');
      const className = await input.getAttribute('class');
      const value = await input.inputValue();
      console.log(`   ${i}: type="${type}", placeholder="${placeholder}", id="${id}", name="${name}", class="${className}", value="${value}"`);
    }
    
    console.log('\n📋 TODOS LOS BOTONES:\n');
    const buttons = await page.locator('button').all();
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const className = await button.getAttribute('class');
      const id = await button.getAttribute('id');
      const disabled = await button.getAttribute('disabled');
      console.log(`   ${i}: text="${text?.trim()}", class="${className}", id="${id}", disabled="${disabled}"`);
    }
    
    console.log('\n📋 ELEMENTOS CON TEXTO "PRODUCTO":\n');
    const productElements = await page.locator('text=Producto').all();
    for (let i = 0; i < productElements.length; i++) {
      const el = productElements[i];
      const text = await el.textContent();
      console.log(`   ${i}: "${text?.trim()}" (${await el.evaluate(e => e.tagName)}, class="${await el.getAttribute('class')}", id="${await el.getAttribute('id')}")`);
    }
    
    console.log('\n📋 ELEMENTOS CON TEXTO "CLIENTE":\n');
    const clientElements = await page.locator('text=Cliente').all();
    for (let i = 0; i < clientElements.length; i++) {
      const el = clientElements[i];
      const text = await el.textContent();
      console.log(`   ${i}: "${text?.trim()}" (${await el.evaluate(e => e.tagName)}, class="${await el.getAttribute('class')}", id="${await el.getAttribute('id')}")`);
    }
    
    console.log('\n📋 ELEMENTOS CON TEXTO "AÑADIR":\n');
    const addElements = await page.locator('text=Añadir').all();
    for (let i = 0; i < addElements.length; i++) {
      const el = addElements[i];
      const text = await el.textContent();
      console.log(`   ${i}: "${text?.trim()}" (${await el.evaluate(e => e.tagName)}, class="${await el.getAttribute('class')}", id="${await el.getAttribute('id')}")`);
    }
    
    console.log('\n📋 ELEMENTOS CON TEXTO "REGISTRAR":\n');
    const registerElements = await page.locator('text=Registrar').all();
    for (let i = 0; i < registerElements.length; i++) {
      const el = registerElements[i];
      const text = await el.textContent();
      console.log(`   ${i}: "${text?.trim()}" (${await el.evaluate(e => e.tagName)}, class="${await el.getAttribute('class')}", id="${await el.getAttribute('id')}")`);
    }
    
    // Buscar elementos que podrían ser resultados de búsqueda
    console.log('\n📋 ELEMENTOS QUE PODRÍAN SER RESULTADOS DE BÚSQUEDA:\n');
    const possibleResults = await page.locator('li, .result, .item, .option, .suggestion').all();
    for (let i = 0; i < Math.min(possibleResults.length, 10); i++) {
      const el = possibleResults[i];
      const text = await el.textContent();
      console.log(`   ${i}: "${text?.trim()}" (${await el.evaluate(e => e.tagName)}, class="${await el.getAttribute('class')}", id="${await el.getAttribute('id')}")`);
    }
    
    await page.screenshot({ path: 'test-results/ventas-dom-inspection.png', fullPage: true });
    console.log('📸 Screenshot de inspección del DOM guardado');
  });
});