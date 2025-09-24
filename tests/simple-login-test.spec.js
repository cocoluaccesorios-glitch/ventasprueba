/**
 * Test simple para verificar que el login funciona
 */

import { test, expect } from '@playwright/test';

test.describe('Test Simple de Login', () => {
  test('Login básico', async ({ page }) => {
    console.log('🧪 Probando login básico...');
    
    // Navegar a la aplicación
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    console.log(`🌐 URL inicial: ${page.url()}`);
    
    // Verificar que estamos en la página de login
    const isLoginPage = page.url().includes('/login');
    console.log(`🔍 ¿Estamos en página de login? ${isLoginPage}`);
    
    if (!isLoginPage) {
      console.log('✅ Ya estamos logueados');
      return;
    }
    
    // Llenar credenciales
    console.log('📝 Llenando credenciales...');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'admin123');
    
    // Hacer clic en login
    console.log('🖱️ Haciendo clic en login...');
    await page.click('button[type="submit"]');
    
    // Esperar respuesta del servidor
    console.log('⏳ Esperando respuesta del servidor...');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Manejar SweetAlert
    try {
      const sweetAlert = await page.locator('.swal2-popup');
      if (await sweetAlert.isVisible()) {
        console.log('🔔 SweetAlert detectado, esperando que se cierre...');
        await page.waitForTimeout(3000);
        
        // Verificar si aún está visible y cerrarlo manualmente
        const isStillVisible = await sweetAlert.isVisible();
        if (isStillVisible) {
          console.log('🔔 SweetAlert aún visible, cerrando manualmente...');
          const confirmBtn = await page.locator('.swal2-confirm');
          if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
            await page.waitForTimeout(1000);
          }
        }
      }
    } catch (e) {
      // No hay SweetAlert
    }
    
    // Esperar a que se complete la redirección
    await page.waitForTimeout(3000);
    
    // Verificar estado final
    const finalUrl = page.url();
    console.log(`🌐 URL final: ${finalUrl}`);
    
    const stillOnLogin = finalUrl.includes('/login');
    console.log(`🔍 ¿Aún en login? ${stillOnLogin}`);
    
    // Si estamos en login, esperar un poco más
    if (stillOnLogin) {
      console.log('⏳ Esperando más tiempo para la redirección...');
      await page.waitForTimeout(5000);
      
      const finalUrlAfterWait = page.url();
      console.log(`🌐 URL después de esperar: ${finalUrlAfterWait}`);
      
      const stillOnLoginAfterWait = finalUrlAfterWait.includes('/login');
      console.log(`🔍 ¿Aún en login después de esperar? ${stillOnLoginAfterWait}`);
      
      // El test debería pasar si no estamos en login
      expect(stillOnLoginAfterWait).toBe(false);
    } else {
      // El test debería pasar si no estamos en login
      expect(stillOnLogin).toBe(false);
    }
    
    console.log('✅ Login exitoso');
  });
});
