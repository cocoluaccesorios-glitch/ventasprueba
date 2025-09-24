/**
 * Test básico para verificar login y navegación
 */

import { test, expect } from '@playwright/test';

test.describe('Test Básico de Login y Navegación', () => {
  test('Login y navegación básica', async ({ page }) => {
    console.log('🧪 Probando login y navegación básica...');
    
    // Navegar a la aplicación
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Verificar que estamos en la página de login
    const isLoginPage = page.url().includes('/login') || page.url().includes('auth');
    if (!isLoginPage) {
      console.log('✅ Ya estamos logueados, navegando directamente a ventas');
      await page.goto('http://localhost:5173/ventas');
      await page.waitForLoadState('networkidle');
      
      // Verificar que estamos en la página de ventas
      expect(page.url()).toContain('/ventas');
      console.log('✅ Navegación a ventas exitosa');
      return;
    }
    
    // Hacer login
    console.log('🔐 Realizando login...');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Esperar respuesta del servidor
    await page.waitForLoadState('networkidle');
    
    // Manejar SweetAlert si aparece
    try {
      const sweetAlert = await page.locator('.swal2-popup');
      if (await sweetAlert.isVisible()) {
        console.log('🔔 SweetAlert detectado');
        await page.waitForTimeout(2000);
        const confirmBtn = await page.locator('.swal2-confirm');
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    } catch (e) {
      // No hay SweetAlert
    }
    
    // Verificar que no estemos en la página de login
    const stillOnLogin = page.url().includes('/login');
    expect(stillOnLogin).toBe(false);
    console.log('✅ Login exitoso');
    
    // Navegar a ventas
    console.log('🧭 Navegando a ventas...');
    await page.goto('http://localhost:5173/ventas');
    await page.waitForLoadState('networkidle');
    
    // Verificar que estamos en la página de ventas
    expect(page.url()).toContain('/ventas');
    console.log('✅ Navegación a ventas exitosa');
    
    // Verificar que la página tiene elementos básicos
    const hasClientSearch = await page.locator('input.client-search-input').isVisible();
    expect(hasClientSearch).toBe(true);
    console.log('✅ Campo de búsqueda de cliente encontrado');
    
    // Tomar screenshot para verificar
    await page.screenshot({ path: 'test-results/basic-navigation.png', fullPage: true });
    console.log('📸 Screenshot guardado');
  });
  
  test('Verificar elementos de la página de ventas', async ({ page }) => {
    console.log('🧪 Verificando elementos de la página de ventas...');
    
    // Navegar directamente a ventas (asumiendo que ya estamos logueados)
    await page.goto('http://localhost:5173/ventas');
    await page.waitForLoadState('networkidle');
    
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
