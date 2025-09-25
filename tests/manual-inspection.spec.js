/**
 * Prueba de Inspección Manual
 * Para entender la estructura real de la página
 */

import { test, expect } from '@playwright/test';

test.describe('Inspección Manual de la Página', () => {
  test('Inspeccionar página de login', async ({ page }) => {
    console.log('🔍 Inspeccionando página de login...');
    
    // Ir a la página principal
    await page.goto('http://localhost:5174/');
    await page.waitForLoadState('networkidle');
    
    // Esperar un poco para que cargue completamente
    await page.waitForTimeout(3000);
    
    // Tomar screenshot
    await page.screenshot({ path: 'test-results/login-page-inspection.png', fullPage: true });
    
    // Obtener todos los elementos de input
    const inputs = await page.locator('input').all();
    console.log(`📝 Encontrados ${inputs.length} elementos input`);
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');
      const className = await input.getAttribute('class');
      
      console.log(`Input ${i + 1}:`, {
        type,
        placeholder,
        id,
        name,
        className
      });
    }
    
    // Obtener todos los botones
    const buttons = await page.locator('button').all();
    console.log(`🔘 Encontrados ${buttons.length} elementos button`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      const className = await button.getAttribute('class');
      
      console.log(`Button ${i + 1}:`, {
        text: text?.trim(),
        type,
        className
      });
    }
    
    // Intentar hacer login con diferentes métodos
    console.log('🔐 Intentando login con método 1...');
    try {
      // Método 1: Por posición
      const firstInput = await page.locator('input').first();
      await firstInput.fill('admin');
      
      const secondInput = await page.locator('input').nth(1);
      await secondInput.fill('admin123');
      
      const loginButton = await page.locator('button').first();
      await loginButton.click();
      
      await page.waitForTimeout(3000);
      
      // Verificar si funcionó
      const currentUrl = page.url();
      console.log('URL después del login:', currentUrl);
      
      if (!currentUrl.includes('/login') && !currentUrl.includes('auth')) {
        console.log('✅ Login exitoso con método 1');
        
        // Tomar screenshot de la página después del login
        await page.screenshot({ path: 'test-results/after-login.png', fullPage: true });
        
        // Navegar a ventas
        await page.goto('http://localhost:5174/ventas');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Tomar screenshot de la página de ventas
        await page.screenshot({ path: 'test-results/ventas-page.png', fullPage: true });
        
        console.log('✅ Navegación a ventas exitosa');
      } else {
        console.log('❌ Login falló con método 1');
      }
      
    } catch (error) {
      console.log('❌ Error en método 1:', error.message);
    }
    
    console.log('🎉 Inspección completada');
  });
});
