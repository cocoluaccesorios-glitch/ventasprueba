/**
 * Test para verificar que el login y navegación funcionan correctamente
 */

import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';

test.describe('Verificación de Login y Navegación', () => {
  let testHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
  });

  test('Login y navegación a ventas', async ({ page }) => {
    console.log('🧪 Probando login y navegación a ventas...');
    
    // Hacer login
    const loginSuccess = await testHelper.login();
    expect(loginSuccess).toBe(true);
    
    // Navegar a ventas
    const navigationSuccess = await testHelper.navigateTo('/ventas');
    expect(navigationSuccess).toBe(true);
    
    // Verificar que estamos en la página de ventas
    const currentUrl = page.url();
    expect(currentUrl).toContain('/ventas');
    
    console.log('✅ Login y navegación exitosos');
  });

  test('Login y navegación a dashboard', async ({ page }) => {
    console.log('🧪 Probando login y navegación a dashboard...');
    
    // Hacer login
    const loginSuccess = await testHelper.login();
    expect(loginSuccess).toBe(true);
    
    // Navegar a dashboard
    const navigationSuccess = await testHelper.navigateTo('/dashboard');
    expect(navigationSuccess).toBe(true);
    
    // Verificar que estamos en el dashboard
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dashboard');
    
    console.log('✅ Login y navegación a dashboard exitosos');
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
      'Campo de búsqueda de cliente': 'input.client-search-input',
      'Título de la página': 'h1.brand-title',
      'Botón de nuevo cliente': 'button:has-text("Nuevo Cliente")',
      'Sección de productos': '.products-section, .productos-section',
      'Sección de pago': '.payment-section, .pago-section'
    };
    
    for (const [name, selector] of Object.entries(elements)) {
      try {
        const element = await page.locator(selector).first();
        const isVisible = await element.isVisible();
        console.log(`${isVisible ? '✅' : '❌'} ${name}: ${isVisible ? 'encontrado' : 'no encontrado'}`);
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
    await page.screenshot({ path: 'test-results/ventas-page-elements.png', fullPage: true });
    console.log('📸 Screenshot de elementos guardado');
  });
});
