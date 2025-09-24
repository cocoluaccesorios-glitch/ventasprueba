/**
 * Test de login paso a paso para debugging
 */

import { test, expect } from '@playwright/test';

test.describe('Debug de Login', () => {
  test('Login paso a paso', async ({ page }) => {
    console.log('🧪 Debugging login paso a paso...');
    
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
    
    // Esperar a que aparezcan los campos de login
    console.log('⏳ Esperando campos de login...');
    await page.waitForSelector('input[id="username"]', { timeout: 10000 });
    await page.waitForSelector('input[id="password"]', { timeout: 10000 });
    
    console.log('✅ Campos de login encontrados');
    
    // Llenar credenciales
    console.log('📝 Llenando credenciales...');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'admin123');
    
    // Verificar que los campos se llenaron
    const usernameValue = await page.inputValue('input[id="username"]');
    const passwordValue = await page.inputValue('input[id="password"]');
    console.log(`👤 Usuario: ${usernameValue}`);
    console.log(`🔐 Contraseña: ${passwordValue ? '[LLENO]' : '[VACÍO]'}`);
    
    // Hacer clic en el botón de login
    console.log('🖱️ Haciendo clic en login...');
    await page.click('button[type="submit"]');
    
    // Esperar respuesta
    console.log('⏳ Esperando respuesta del servidor...');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    console.log(`🌐 URL después del login: ${page.url()}`);
    
    // Verificar SweetAlert
    try {
      const sweetAlert = await page.locator('.swal2-popup');
      const isSweetAlertVisible = await sweetAlert.isVisible();
      console.log(`🔔 ¿SweetAlert visible? ${isSweetAlertVisible}`);
      
      if (isSweetAlertVisible) {
        const sweetAlertText = await sweetAlert.textContent();
        console.log(`📄 Contenido del SweetAlert: ${sweetAlertText}`);
        
        // Intentar hacer clic en confirmar
        const confirmBtn = await page.locator('.swal2-confirm');
        const isConfirmVisible = await confirmBtn.isVisible();
        console.log(`✅ ¿Botón confirmar visible? ${isConfirmVisible}`);
        
        if (isConfirmVisible) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);
          console.log('✅ SweetAlert cerrado');
        }
      }
    } catch (e) {
      console.log('ℹ️ No hay SweetAlert');
    }
    
    // Verificar estado final
    const finalUrl = page.url();
    console.log(`🌐 URL final: ${finalUrl}`);
    
    const stillOnLogin = finalUrl.includes('/login');
    console.log(`🔍 ¿Aún en login? ${stillOnLogin}`);
    
    // Tomar screenshot final
    await page.screenshot({ path: 'test-results/login-debug.png', fullPage: true });
    console.log('📸 Screenshot guardado');
    
    // Si aún estamos en login, mostrar información adicional
    if (stillOnLogin) {
      console.log('\n🔍 INFORMACIÓN ADICIONAL:');
      
      // Verificar si hay mensajes de error
      const errorMessages = await page.locator('.alert-danger, .error-message, .invalid-feedback').all();
      console.log(`❌ Mensajes de error encontrados: ${errorMessages.length}`);
      
      for (let i = 0; i < errorMessages.length; i++) {
        const errorText = await errorMessages[i].textContent();
        console.log(`   Error ${i + 1}: ${errorText}`);
      }
      
      // Verificar el estado del botón de login
      const loginButton = await page.locator('button[type="submit"]');
      const isButtonEnabled = await loginButton.isEnabled();
      const buttonText = await loginButton.textContent();
      console.log(`🔘 Botón de login: enabled=${isButtonEnabled}, text="${buttonText}"`);
      
      // Verificar si hay algún mensaje en la página
      const pageText = await page.textContent('body');
      console.log(`📄 Contenido de la página: ${pageText.substring(0, 200)}...`);
    }
    
    // No hacer expect para que el test no falle y podamos ver toda la información
    console.log('✅ Debug completado');
  });
});
