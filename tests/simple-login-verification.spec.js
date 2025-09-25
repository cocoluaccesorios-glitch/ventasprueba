/**
 * Prueba Simple de Login y Navegación
 * Para verificar que los selectores corregidos funcionan
 */

import { test, expect } from '@playwright/test';
import AuthHelper from './utils/authHelper.js';
import SalesFormHelper from './utils/salesFormHelper.js';

test.describe('Prueba Simple de Login y Navegación', () => {
  let authHelper;
  let salesHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    salesHelper = new SalesFormHelper(page);
  });

  test('Login y navegación básica', async ({ page }) => {
    console.log('🧪 Iniciando prueba simple de login...');
    
    // Ir a la página principal
    await page.goto('http://localhost:5174/');
    await page.waitForLoadState('networkidle');
    
    // Intentar hacer login
    const loginSuccess = await authHelper.login('admin', 'admin123');
    expect(loginSuccess).toBe(true);
    
    console.log('✅ Login exitoso');
    
    // Navegar a ventas
    await page.goto('http://localhost:5174/ventas');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verificar que estamos en la página de ventas
    const url = page.url();
    expect(url).toContain('/ventas');
    
    console.log('✅ Navegación a ventas exitosa');
    
    // Tomar screenshot para verificar
    await page.screenshot({ path: 'test-results/simple-login-test.png' });
    
    console.log('🎉 Prueba simple completada exitosamente');
  });

  test('Verificar elementos del formulario de ventas', async ({ page }) => {
    console.log('🧪 Verificando elementos del formulario...');
    
    // Login y navegación
    await page.goto('http://localhost:5174/');
    await page.waitForLoadState('networkidle');
    
    const loginSuccess = await authHelper.login('admin', 'admin123');
    expect(loginSuccess).toBe(true);
    
    await page.goto('http://localhost:5174/ventas');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Verificar que existen los elementos principales
    const clienteInput = await page.locator('input[placeholder*="nombre, cédula"], input[placeholder*="cliente"], .client-search-input').first();
    await expect(clienteInput).toBeVisible();
    
    console.log('✅ Campo de búsqueda de cliente encontrado');
    
    // Verificar que hay productos disponibles
    const productoInput = await page.locator('input[placeholder*="producto"], input[placeholder*="buscar"]').first();
    await expect(productoInput).toBeVisible();
    
    console.log('✅ Campo de búsqueda de producto encontrado');
    
    // Verificar selectores de tipo de pago
    const tipoPagoSelect = await page.locator('select[name="tipo_pago"], select').first();
    await expect(tipoPagoSelect).toBeVisible();
    
    console.log('✅ Selector de tipo de pago encontrado');
    
    // Tomar screenshot final
    await page.screenshot({ path: 'test-results/form-elements-verification.png' });
    
    console.log('🎉 Verificación de elementos completada');
  });
});
