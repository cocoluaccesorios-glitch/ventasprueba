/**
 * Prueba simple para verificar que la aplicación funciona
 */

import { test, expect } from '@playwright/test';
import AuthHelper from './utils/authHelper.js';

test.describe('Pruebas Básicas de la Aplicación', () => {
  
  test('Verificar que la aplicación carga correctamente', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    
    console.log('🧪 Iniciando prueba básica...');
    
    // Navegar a la página principal
    await authHelper.navigateTo('/');
    await authHelper.waitForAppReady();
    
    // Verificar que no estemos en login
    const isOnLogin = await authHelper.isOnLoginPage();
    expect(isOnLogin).toBe(false);
    
    // Verificar que la página tenga contenido
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBe(true);
    
    console.log('✅ Prueba básica completada');
  });

  test('Verificar navegación a crear venta', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    
    console.log('🧪 Probando navegación a crear venta...');
    
    // Navegar a crear venta
    await authHelper.navigateTo('/crear-venta');
    await authHelper.waitForAppReady();
    
    // Verificar que estemos en la página correcta
    const url = page.url();
    expect(url).toContain('crear-venta');
    
    // Verificar que haya elementos del formulario
    const hasForm = await page.locator('form, .sales-form').isVisible();
    expect(hasForm).toBe(true);
    
    console.log('✅ Navegación a crear venta exitosa');
  });

  test('Verificar elementos básicos del formulario', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    
    console.log('🧪 Verificando elementos del formulario...');
    
    await authHelper.navigateTo('/crear-venta');
    await authHelper.waitForAppReady();
    
    // Verificar que existan elementos básicos
    const searchInput = await page.locator('input[placeholder*="nombre, cédula"]').isVisible();
    const productSearch = await page.locator('input[placeholder*="Buscar producto"]').isVisible();
    const submitButton = await page.locator('button[type="submit"]').isVisible();
    
    expect(searchInput).toBe(true);
    expect(productSearch).toBe(true);
    expect(submitButton).toBe(true);
    
    console.log('✅ Elementos del formulario verificados');
  });
});
