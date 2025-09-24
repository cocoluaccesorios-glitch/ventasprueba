import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';

test.describe('Verificación de Carga de Datos', () => {
  let testHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
    await testHelper.navigateTo(TEST_CONFIG.URLS.VENTAS);
  });

  test('Verificar carga de clientes y productos', async ({ page }) => {
    console.log('🧪 Verificando carga de clientes y productos...');
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Dar tiempo extra para que se carguen los datos
    
    // Verificar si hay clientes cargados
    console.log('\n🔍 VERIFICANDO CLIENTES...');
    const clientesLoaded = await page.evaluate(() => {
      // Buscar en el contexto de Vue si hay clientes cargados
      const app = document.querySelector('#app');
      if (app && app.__vue_app__) {
        // Intentar acceder a los datos de Vue
        console.log('Vue app encontrada');
        return true;
      }
      return false;
    });
    
    console.log(`📊 ¿Vue app cargada? ${clientesLoaded}`);
    
    // Verificar si hay productos cargados
    console.log('\n🔍 VERIFICANDO PRODUCTOS...');
    const productosLoaded = await page.evaluate(() => {
      // Buscar elementos que indiquen que los productos están cargados
      const productElements = document.querySelectorAll('[data-testid="producto"], .producto-item, .product-list');
      return productElements.length > 0;
    });
    
    console.log(`📊 ¿Productos cargados? ${productosLoaded}`);
    
    // Verificar si hay errores en la consola
    console.log('\n🔍 VERIFICANDO ERRORES EN CONSOLA...');
    const consoleErrors = await page.evaluate(() => {
      // Capturar errores de la consola
      const errors = [];
      const originalError = console.error;
      console.error = (...args) => {
        errors.push(args.join(' '));
        originalError.apply(console, args);
      };
      return errors;
    });
    
    console.log(`📊 Errores en consola: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('❌ Errores encontrados:');
      consoleErrors.forEach((error, i) => {
        console.log(`   ${i + 1}: ${error}`);
      });
    }
    
    // Verificar si hay elementos de carga
    console.log('\n🔍 VERIFICANDO ELEMENTOS DE CARGA...');
    const loadingElements = await page.locator('.loading, .spinner, [data-loading="true"]').all();
    console.log(`📊 Elementos de carga encontrados: ${loadingElements.length}`);
    
    // Verificar si hay mensajes de error
    console.log('\n🔍 VERIFICANDO MENSAJES DE ERROR...');
    const errorMessages = await page.locator('.error, .alert-danger, .error-message').all();
    console.log(`📊 Mensajes de error encontrados: ${errorMessages.length}`);
    
    if (errorMessages.length > 0) {
      for (let i = 0; i < errorMessages.length; i++) {
        const errorText = await errorMessages[i].textContent();
        console.log(`   ${i + 1}: ${errorText}`);
      }
    }
    
    // Verificar si hay elementos de búsqueda
    console.log('\n🔍 VERIFICANDO ELEMENTOS DE BÚSQUEDA...');
    const searchInputs = await page.locator('input[placeholder*="cliente"], input[placeholder*="producto"]').all();
    console.log(`📊 Inputs de búsqueda encontrados: ${searchInputs.length}`);
    
    for (let i = 0; i < searchInputs.length; i++) {
      const input = searchInputs[i];
      const placeholder = await input.getAttribute('placeholder');
      const className = await input.getAttribute('class');
      console.log(`   ${i + 1}: placeholder="${placeholder}", class="${className}"`);
    }
    
    // Verificar si hay elementos de resultados
    console.log('\n🔍 VERIFICANDO ELEMENTOS DE RESULTADOS...');
    const resultElements = await page.locator('.search-result, .result, .item, .option').all();
    console.log(`📊 Elementos de resultados encontrados: ${resultElements.length}`);
    
    // Verificar si hay elementos de lista
    console.log('\n🔍 VERIFICANDO ELEMENTOS DE LISTA...');
    const listElements = await page.locator('ul, ol, li').all();
    console.log(`📊 Elementos de lista encontrados: ${listElements.length}`);
    
    // Verificar si hay elementos con texto específico
    console.log('\n🔍 VERIFICANDO ELEMENTOS CON TEXTO ESPECÍFICO...');
    const specificTexts = ['cliente', 'producto', 'buscar', 'resultado'];
    for (const text of specificTexts) {
      const elements = await page.locator(`text=${text}`).all();
      console.log(`   "${text}": ${elements.length} elementos encontrados`);
    }
    
    await page.screenshot({ path: 'test-results/data-loading-verification.png', fullPage: true });
    console.log('📸 Screenshot de verificación de carga de datos guardado');
  });
});
