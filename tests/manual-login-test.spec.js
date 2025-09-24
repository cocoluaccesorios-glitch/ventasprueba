/**
 * Test para verificar el login manual y entender el problema
 */

import { test, expect } from '@playwright/test';

test.describe('Verificación de Login Manual', () => {
  test('Probar login manual paso a paso', async ({ page }) => {
    console.log('🧪 Probando login manual paso a paso...');
    
    // Navegar a la aplicación
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    console.log(`🌐 URL inicial: ${page.url()}`);
    
    // Verificar que estamos en la página de login
    const isLoginPage = page.url().includes('/login');
    console.log(`🔍 ¿Estamos en página de login? ${isLoginPage}`);
    
    if (!isLoginPage) {
      console.log('✅ Ya estamos logueados, navegando al dashboard');
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForLoadState('networkidle');
      console.log(`🌐 URL del dashboard: ${page.url()}`);
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
    
    // Verificar estado del botón antes del clic
    const loginButton = await page.locator('button[type="submit"]');
    const isButtonEnabledBefore = await loginButton.isEnabled();
    const buttonTextBefore = await loginButton.textContent();
    console.log(`🔘 Botón antes del clic: enabled=${isButtonEnabledBefore}, text="${buttonTextBefore}"`);
    
    // Hacer clic en el botón de login
    console.log('🖱️ Haciendo clic en login...');
    await loginButton.click();
    
    // Esperar un poco para ver el cambio de estado
    await page.waitForTimeout(1000);
    
    // Verificar estado del botón después del clic
    const isButtonEnabledAfter = await loginButton.isEnabled();
    const buttonTextAfter = await loginButton.textContent();
    console.log(`🔘 Botón después del clic: enabled=${isButtonEnabledAfter}, text="${buttonTextAfter}"`);
    
    // Esperar respuesta del servidor
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
        
        // Esperar a que se cierre automáticamente
        await page.waitForTimeout(3000);
        
        // Verificar si aún está visible
        const isStillVisible = await sweetAlert.isVisible();
        console.log(`🔔 ¿SweetAlert aún visible? ${isStillVisible}`);
        
        if (isStillVisible) {
          // Intentar hacer clic en confirmar
          const confirmBtn = await page.locator('.swal2-confirm');
          const isConfirmVisible = await confirmBtn.isVisible();
          console.log(`✅ ¿Botón confirmar visible? ${isConfirmVisible}`);
          
          if (isConfirmVisible) {
            await confirmBtn.click();
            await page.waitForTimeout(2000);
            console.log('✅ SweetAlert cerrado manualmente');
          }
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
    
    // Verificar si hay mensajes de error
    const errorMessages = await page.locator('.alert-danger, .error-message, .invalid-feedback').all();
    console.log(`❌ Mensajes de error encontrados: ${errorMessages.length}`);
    
    for (let i = 0; i < errorMessages.length; i++) {
      const errorText = await errorMessages[i].textContent();
      console.log(`   Error ${i + 1}: ${errorText}`);
    }
    
    // Verificar el estado final del botón
    const finalButtonState = await loginButton.isEnabled();
    const finalButtonText = await loginButton.textContent();
    console.log(`🔘 Estado final del botón: enabled=${finalButtonState}, text="${finalButtonText}"`);
    
    // Tomar screenshot final
    await page.screenshot({ path: 'test-results/manual-login-test.png', fullPage: true });
    console.log('📸 Screenshot guardado');
    
    // Si el login fue exitoso, verificar que podemos navegar
    if (!stillOnLogin) {
      console.log('✅ Login exitoso, probando navegación...');
      
      // Intentar navegar a ventas
      await page.goto('http://localhost:5173/ventas');
      await page.waitForLoadState('networkidle');
      
      const ventasUrl = page.url();
      console.log(`🌐 URL de ventas: ${ventasUrl}`);
      
      if (ventasUrl.includes('/ventas')) {
        console.log('✅ Navegación a ventas exitosa');
        
        // Verificar elementos de la página de ventas
        const hasClientSearch = await page.locator('input.client-search-input').isVisible();
        console.log(`🔍 ¿Campo de búsqueda de cliente visible? ${hasClientSearch}`);
        
        // Tomar screenshot de ventas
        await page.screenshot({ path: 'test-results/ventas-page-after-login.png', fullPage: true });
        console.log('📸 Screenshot de ventas guardado');
      } else {
        console.log('❌ No se pudo navegar a ventas');
      }
    }
    
    console.log('✅ Test de login manual completado');
  });
});
