/**
 * Test simple para verificar que los selectores funcionan
 */

import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';

test.describe('Test de Selectores Actualizados', () => {
  let testHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
  });

  test('Verificar elementos de la página de ventas', async ({ page }) => {
    console.log('🧪 Verificando elementos de la página de ventas...');
    
    // Hacer login y navegar a ventas
    await testHelper.login();
    await testHelper.navigateTo('/ventas');
    
    // Esperar a que la página cargue completamente
    await page.waitForTimeout(3000);
    
    // Verificar elementos básicos
    const elements = {
      'Campo de búsqueda de cliente': TEST_CONFIG.SELECTORS.CLIENTE_INPUT,
      'Campo de búsqueda de producto': TEST_CONFIG.SELECTORS.PRODUCTO_INPUT,
      'Botón de añadir': TEST_CONFIG.SELECTORS.ADD_BUTTON,
      'Botón de registrar venta': TEST_CONFIG.SELECTORS.SUBMIT_BUTTON,
      'Select de tipo de pago': TEST_CONFIG.SELECTORS.TIPO_PAGO_SELECT,
      'Select de método de pago': TEST_CONFIG.SELECTORS.METODO_PAGO_SELECT
    };
    
    for (const [name, selector] of Object.entries(elements)) {
      try {
        const element = await page.locator(selector).first();
        const isVisible = await element.isVisible();
        console.log(`${isVisible ? '✅' : '❌'} ${name}: ${isVisible ? 'encontrado' : 'no encontrado'}`);
        
        if (isVisible) {
          const tagName = await element.evaluate(el => el.tagName);
          const className = await element.getAttribute('class');
          console.log(`   - Tag: ${tagName}, Class: ${className}`);
        }
      } catch (error) {
        console.log(`❌ ${name}: error - ${error.message}`);
      }
    }
    
    // Obtener información del DOM
    const title = await page.title();
    console.log(`📄 Título de la página: ${title}`);
    
    const url = page.url();
    console.log(`🌐 URL actual: ${url}`);
    
    // Contar elementos de input
    const inputCount = await page.locator('input').count();
    console.log(`📝 Número de inputs encontrados: ${inputCount}`);
    
    // Contar elementos de button
    const buttonCount = await page.locator('button').count();
    console.log(`🔘 Número de botones encontrados: ${buttonCount}`);
    
    // Listar todos los inputs con sus atributos
    console.log('\n📋 DETALLES DE INPUTS:');
    const inputs = await page.locator('input').all();
    for (let i = 0; i < Math.min(inputs.length, 10); i++) {
      const input = inputs[i];
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');
      const className = await input.getAttribute('class');
      const type = await input.getAttribute('type');
      
      console.log(`Input ${i}: type="${type}", placeholder="${placeholder}", id="${id}", name="${name}", class="${className}"`);
    }
    
    // Tomar screenshot
    await page.screenshot({ path: 'test-results/ventas-selectors-test.png', fullPage: true });
    console.log('📸 Screenshot de selectores guardado');
  });
});
