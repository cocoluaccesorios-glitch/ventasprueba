import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';

test.describe('Verificación de Carga de Datos en Frontend', () => {
  let testHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
    await testHelper.navigateTo(TEST_CONFIG.URLS.VENTAS);
  });

  test('Verificar carga de datos desde Supabase', async ({ page }) => {
    console.log('🧪 Verificando carga de datos desde Supabase...');
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // Verificar si hay datos cargados en el contexto de Vue
    console.log('\n🔍 VERIFICANDO DATOS EN VUE...');
    const vueData = await page.evaluate(() => {
      // Buscar la instancia de Vue
      const app = document.querySelector('#app');
      if (app && app.__vue_app__) {
        console.log('Vue app encontrada');
        
        // Intentar acceder a los datos de la aplicación
        const vueInstance = app.__vue_app__;
        console.log('Vue instance:', vueInstance);
        
        return {
          vueAppFound: true,
          vueInstance: !!vueInstance
        };
      }
      return {
        vueAppFound: false,
        vueInstance: false
      };
    });
    
    console.log(`📊 ¿Vue app encontrada? ${vueData.vueAppFound}`);
    console.log(`📊 ¿Vue instance disponible? ${vueData.vueInstance}`);
    
    // Verificar si hay errores en la consola
    console.log('\n🔍 VERIFICANDO ERRORES EN CONSOLA...');
    const consoleErrors = await page.evaluate(() => {
      const errors = [];
      const originalError = console.error;
      const originalWarn = console.warn;
      
      console.error = (...args) => {
        const message = args.join(' ');
        errors.push({ type: 'error', message });
        originalError.apply(console, args);
      };
      
      console.warn = (...args) => {
        const message = args.join(' ');
        errors.push({ type: 'warn', message });
        originalWarn.apply(console, args);
      };
      
      return errors;
    });
    
    console.log(`📊 Errores en consola: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('❌ Errores encontrados:');
      consoleErrors.forEach((error, i) => {
        console.log(`   ${i + 1}: [${error.type}] ${error.message}`);
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
      const value = await input.getAttribute('value');
      console.log(`   ${i + 1}: placeholder="${placeholder}", class="${className}", value="${value}"`);
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
    const specificTexts = ['cliente', 'producto', 'buscar', 'resultado', 'Ana', 'Luis', 'PRODUCTO'];
    for (const text of specificTexts) {
      const elements = await page.evaluate((searchText) => {
        const elements = document.querySelectorAll(`*`);
        let count = 0;
        elements.forEach(el => {
          if (el.textContent && el.textContent.toLowerCase().includes(searchText.toLowerCase())) {
            count++;
          }
        });
        return count;
      }, text);
      console.log(`   "${text}": ${elements} elementos encontrados`);
    }
    
    // Verificar si hay elementos de búsqueda funcionando
    console.log('\n🔍 VERIFICANDO FUNCIONALIDAD DE BÚSQUEDA...');
    const searchFunctionality = await page.evaluate(() => {
      // Buscar inputs de búsqueda
      const searchInputs = document.querySelectorAll('input[placeholder*="cliente"], input[placeholder*="producto"]');
      return searchInputs.length > 0;
    });
    
    console.log(`📊 ¿Búsqueda disponible? ${searchFunctionality}`);
    
    // Verificar si hay elementos de resultados
    console.log('\n🔍 VERIFICANDO ELEMENTOS DE RESULTADOS...');
    const resultElements2 = await page.evaluate(() => {
      // Buscar elementos que podrían mostrar resultados
      const resultElements = document.querySelectorAll('.search-result, .result, .item, .option, .dropdown, .menu');
      return resultElements.length > 0;
    });
    
    console.log(`📊 ¿Elementos de resultados disponibles? ${resultElements2}`);
    
    await page.screenshot({ path: 'test-results/frontend-data-loading-verification.png', fullPage: true });
    console.log('📸 Screenshot de verificación de carga de datos en frontend guardado');
  });
});
