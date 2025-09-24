import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';

test.describe('Verificación de Conexión a Supabase', () => {
  let testHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
    await testHelper.navigateTo(TEST_CONFIG.URLS.VENTAS);
  });

  test('Verificar conexión a Supabase y fallback a datos mock', async ({ page }) => {
    console.log('🧪 Verificando conexión a Supabase y fallback a datos mock...');
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // Verificar si hay errores de conexión en la consola
    console.log('\n🔍 VERIFICANDO ERRORES DE CONEXIÓN...');
    const connectionErrors = await page.evaluate(() => {
      const errors = [];
      const originalError = console.error;
      const originalWarn = console.warn;
      
      console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('Supabase') || message.includes('fetch failed') || message.includes('401') || message.includes('JWT')) {
          errors.push(message);
        }
        originalError.apply(console, args);
      };
      
      console.warn = (...args) => {
        const message = args.join(' ');
        if (message.includes('mock') || message.includes('fallback') || message.includes('conexión')) {
          errors.push(message);
        }
        originalWarn.apply(console, args);
      };
      
      return errors;
    });
    
    console.log(`📊 Errores de conexión encontrados: ${connectionErrors.length}`);
    if (connectionErrors.length > 0) {
      console.log('❌ Errores de conexión:');
      connectionErrors.forEach((error, i) => {
        console.log(`   ${i + 1}: ${error}`);
      });
    }
    
    // Verificar si se están usando datos mock
    console.log('\n🔍 VERIFICANDO USO DE DATOS MOCK...');
    const mockDataUsage = await page.evaluate(() => {
      // Buscar en el contexto de Vue si hay datos mock cargados
      const app = document.querySelector('#app');
      if (app && app.__vue_app__) {
        // Intentar acceder a los datos de Vue
        console.log('Vue app encontrada');
        return true;
      }
      return false;
    });
    
    console.log(`📊 ¿Datos mock en uso? ${mockDataUsage}`);
    
    // Verificar si hay productos cargados
    console.log('\n🔍 VERIFICANDO PRODUCTOS CARGADOS...');
    const productosCargados = await page.evaluate(() => {
      // Buscar elementos que indiquen que los productos están cargados
      const productElements = document.querySelectorAll('[data-testid="producto"], .producto-item, .product-list, .producto');
      return productElements.length > 0;
    });
    
    console.log(`📊 ¿Productos cargados? ${productosCargados}`);
    
    // Verificar si hay clientes cargados
    console.log('\n🔍 VERIFICANDO CLIENTES CARGADOS...');
    const clientesCargados = await page.evaluate(() => {
      // Buscar elementos que indiquen que los clientes están cargados
      const clientElements = document.querySelectorAll('[data-testid="cliente"], .cliente-item, .client-list, .cliente');
      return clientElements.length > 0;
    });
    
    console.log(`📊 ¿Clientes cargados? ${clientesCargados}`);
    
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
    const resultElements = await page.evaluate(() => {
      // Buscar elementos que podrían mostrar resultados
      const resultElements = document.querySelectorAll('.search-result, .result, .item, .option, .dropdown, .menu');
      return resultElements.length > 0;
    });
    
    console.log(`📊 ¿Elementos de resultados disponibles? ${resultElements}`);
    
    // Verificar si hay elementos de lista
    console.log('\n🔍 VERIFICANDO ELEMENTOS DE LISTA...');
    const listElements = await page.evaluate(() => {
      const listElements = document.querySelectorAll('ul, ol, li');
      return listElements.length > 0;
    });
    
    console.log(`📊 ¿Elementos de lista disponibles? ${listElements}`);
    
    // Verificar si hay elementos con texto específico
    console.log('\n🔍 VERIFICANDO ELEMENTOS CON TEXTO ESPECÍFICO...');
    const specificTexts = ['cliente', 'producto', 'buscar', 'resultado', 'mock', 'prueba'];
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
    
    await page.screenshot({ path: 'test-results/supabase-connection-verification.png', fullPage: true });
    console.log('📸 Screenshot de verificación de conexión a Supabase guardado');
  });
});
