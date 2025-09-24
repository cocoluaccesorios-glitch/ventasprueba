import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';

test.describe('Verificar Datos en Base de Datos', () => {
  let testHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
  });

  test('Verificar qué datos existen en la base de datos', async ({ page }) => {
    console.log('🧪 Verificando qué datos existen en la base de datos...');
    
    // Navegar a la página de ventas
    await testHelper.navigateTo(TEST_CONFIG.URLS.VENTAS);
    
    // Esperar a que se carguen los datos
    await page.waitForTimeout(5000);
    
    console.log('🔍 Probando diferentes términos de búsqueda...');
    
    // Probar diferentes términos de búsqueda para clientes
    const clienteTerms = ['Luis', 'Ana', 'María', 'Juan', 'Carlos', 'Silva', 'Pérez', 'García'];
    const clienteInput = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_INPUT).first();
    
    console.log('\n📋 BÚSQUEDA DE CLIENTES:');
    for (const term of clienteTerms) {
      await clienteInput.clear();
      await clienteInput.fill(term);
      await page.waitForTimeout(2000);
      
      const results = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_RESULT).count();
      console.log(`   - "${term}": ${results} resultados`);
      
      if (results > 0) {
        // Mostrar los primeros resultados
        for (let i = 0; i < Math.min(results, 2); i++) {
          const result = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_RESULT).nth(i);
          const text = await result.textContent();
          console.log(`     * ${text?.trim()}`);
        }
      }
    }
    
    // Probar diferentes términos de búsqueda para productos
    const productoTerms = ['Coca', 'Pepsi', 'Agua', 'Producto', 'Bebida', 'Lata', 'Botella'];
    const productoInput = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_INPUT).first();
    
    console.log('\n📦 BÚSQUEDA DE PRODUCTOS:');
    for (const term of productoTerms) {
      await productoInput.clear();
      await productoInput.fill(term);
      await page.waitForTimeout(2000);
      
      const results = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_RESULT).count();
      console.log(`   - "${term}": ${results} resultados`);
      
      if (results > 0) {
        // Mostrar los primeros resultados
        for (let i = 0; i < Math.min(results, 2); i++) {
          const result = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_RESULT).nth(i);
          const text = await result.textContent();
          console.log(`     * ${text?.trim()}`);
        }
      }
    }
    
    // Verificar si hay mensajes de "no hay datos" o similares
    console.log('\n🔍 VERIFICANDO MENSAJES DE ESTADO:');
    
    // Buscar mensajes que indiquen que no hay datos
    const noDataMessages = await page.locator('text=No hay, text=Sin datos, text=Vacío, text=No se encontraron').count();
    if (noDataMessages > 0) {
      console.log('   - Mensajes de "no hay datos" encontrados:');
      for (let i = 0; i < noDataMessages; i++) {
        const message = await page.locator('text=No hay, text=Sin datos, text=Vacío, text=No se encontraron').nth(i);
        const text = await message.textContent();
        console.log(`     * ${text?.trim()}`);
      }
    } else {
      console.log('   - No se encontraron mensajes de "no hay datos"');
    }
    
    // Verificar el estado de los botones
    console.log('\n🔘 ESTADO DE LOS BOTONES:');
    const addButton = await page.locator(TEST_CONFIG.SELECTORS.ADD_BUTTON).first();
    const submitButton = await page.locator(TEST_CONFIG.SELECTORS.SUBMIT_BUTTON).first();
    
    const addButtonEnabled = await addButton.isEnabled();
    const submitButtonEnabled = await submitButton.isEnabled();
    
    console.log(`   - Botón Añadir: ${addButtonEnabled ? 'habilitado' : 'deshabilitado'}`);
    console.log(`   - Botón Registrar: ${submitButtonEnabled ? 'habilitado' : 'deshabilitado'}`);
    
    // Verificar si hay elementos que indiquen que se están cargando datos
    const loadingElements = await page.locator('text=Cargando, text=Loading, .spinner, .loading').count();
    if (loadingElements > 0) {
      console.log('   - Elementos de carga encontrados:');
      for (let i = 0; i < loadingElements; i++) {
        const element = await page.locator('text=Cargando, text=Loading, .spinner, .loading').nth(i);
        const text = await element.textContent();
        console.log(`     * ${text?.trim()}`);
      }
    } else {
      console.log('   - No se encontraron elementos de carga');
    }
    
    // Tomar screenshot
    await page.screenshot({ path: 'test-results/database-data-check.png', fullPage: true });
    console.log('\n📸 Screenshot guardado en: test-results/database-data-check.png');
    
    console.log('\n✅ Verificación de datos completada');
  });

  test('Verificar conexión a Supabase', async ({ page }) => {
    console.log('🧪 Verificando conexión a Supabase...');
    
    // Navegar a la página de ventas
    await testHelper.navigateTo(TEST_CONFIG.URLS.VENTAS);
    
    // Esperar a que se carguen los datos
    await page.waitForTimeout(5000);
    
    // Verificar que no hay errores de conexión
    const connectionErrors = await page.locator('text=Error de conexión, text=Connection error, text=Failed to fetch').count();
    if (connectionErrors > 0) {
      console.log('❌ Errores de conexión encontrados:');
      for (let i = 0; i < connectionErrors; i++) {
        const error = await page.locator('text=Error de conexión, text=Connection error, text=Failed to fetch').nth(i);
        const text = await error.textContent();
        console.log(`   - ${text?.trim()}`);
      }
    } else {
      console.log('✅ No se encontraron errores de conexión');
    }
    
    // Verificar que la página se carga correctamente
    const pageTitle = await page.title();
    console.log(`📄 Título de la página: ${pageTitle}`);
    
    // Verificar que los elementos principales están presentes
    const clienteInput = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_INPUT).first();
    const productoInput = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_INPUT).first();
    
    const elementsFound = {
      clienteInput: await clienteInput.isVisible(),
      productoInput: await productoInput.isVisible()
    };
    
    console.log('📋 Elementos encontrados:');
    Object.entries(elementsFound).forEach(([element, found]) => {
      console.log(`   - ${element}: ${found ? '✅' : '❌'}`);
    });
    
    // Verificar que al menos los elementos básicos están presentes
    expect(elementsFound.clienteInput).toBe(true);
    expect(elementsFound.productoInput).toBe(true);
    
    console.log('✅ Verificación de conexión completada');
  });
});
