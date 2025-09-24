/**
 * Prueba simple para verificar el login
 */

import { test, expect } from '@playwright/test';
import AuthHelper from './utils/authHelper.js';

test.describe('Pruebas de Login', () => {
  
  test('Login con credenciales válidas', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    
    console.log('🧪 Iniciando prueba de login...');
    
    // Navegar a la página principal (debería redirigir al login)
    await page.goto('http://localhost:5174/');
    await page.waitForLoadState('networkidle');
    
    // Verificar que estemos en la página de login
    const isOnLogin = await authHelper.isOnLoginPage();
    expect(isOnLogin).toBe(true);
    
    console.log('✅ Redirigido al login correctamente');
    
    // Intentar hacer login
    const loginSuccess = await authHelper.login('admin', 'admin123');
    expect(loginSuccess).toBe(true);
    
    // Verificar que ya no estemos en login
    const stillOnLogin = await authHelper.isOnLoginPage();
    expect(stillOnLogin).toBe(false);
    
    console.log('✅ Login exitoso');
  });

  test('Login con credenciales inválidas', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    
    console.log('🧪 Probando login con credenciales inválidas...');
    
    // Navegar al login
    await page.goto('http://localhost:5174/login');
    await page.waitForLoadState('networkidle');
    
    // Intentar login con credenciales incorrectas
    const loginSuccess = await authHelper.login('usuario', 'password');
    expect(loginSuccess).toBe(false);
    
    // Verificar que sigamos en login
    const stillOnLogin = await authHelper.isOnLoginPage();
    expect(stillOnLogin).toBe(true);
    
    console.log('✅ Login falló correctamente con credenciales inválidas');
  });
});

