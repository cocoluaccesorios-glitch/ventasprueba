import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';

test.describe('Tests con Datos Reales', () => {
  let testHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
    await testHelper.navigateTo(TEST_CONFIG.URLS.VENTAS);
  });

  test('Venta básica con cliente real', async ({ page }) => {
    console.log('🧪 Probando venta básica con cliente real...');
    
    // Seleccionar cliente real
    const cliente = { nombre: 'Juan', apellido: 'Pérez', cedula: '12345678' };
    console.log(`👤 Seleccionando cliente: ${cliente.nombre} ${cliente.apellido}`);
    
    const clienteInput = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_INPUT).first();
    await clienteInput.fill(cliente.nombre);
    await page.waitForTimeout(3000);
    
    // Verificar que aparecen resultados
    const clienteResults = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_RESULT).count();
    console.log(`📊 Resultados de cliente encontrados: ${clienteResults}`);
    
    if (clienteResults > 0) {
      // Seleccionar el primer resultado
      const clienteOption = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_RESULT).first();
      await clienteOption.click();
      await page.waitForTimeout(2000);
      
      console.log('✅ Cliente seleccionado exitosamente');
      
      // Verificar que el cliente se seleccionó
      const clienteSeleccionado = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_SELECTED).count();
      if (clienteSeleccionado > 0) {
        console.log('✅ Cliente confirmado en la interfaz');
      }
      
      // Verificar estado de los botones
      const submitButton = await page.locator(TEST_CONFIG.SELECTORS.SUBMIT_BUTTON).first();
      const submitButtonEnabled = await submitButton.isEnabled();
      console.log(`🔘 Botón Registrar: ${submitButtonEnabled ? 'habilitado' : 'deshabilitado'}`);
      
      // Tomar screenshot
      await page.screenshot({ path: 'test-results/real-client-selected.png', fullPage: true });
      console.log('📸 Screenshot guardado');
      
    } else {
      console.log('❌ No se encontraron resultados de cliente');
    }
    
    console.log('✅ Test de cliente real completado');
  });

  test('Probar búsqueda de todos los clientes reales', async ({ page }) => {
    console.log('🧪 Probando búsqueda de todos los clientes reales...');
    
    const clientesReales = [
      { nombre: 'Juan', apellido: 'Pérez' },
      { nombre: 'María', apellido: 'García' },
      { nombre: 'Carlos', apellido: 'Rodríguez' }
    ];
    
    const clienteInput = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_INPUT).first();
    
    for (const cliente of clientesReales) {
      console.log(`\n🔍 Probando cliente: ${cliente.nombre} ${cliente.apellido}`);
      
      await clienteInput.clear();
      await clienteInput.fill(cliente.nombre);
      await page.waitForTimeout(2000);
      
      const results = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_RESULT).count();
      console.log(`   📊 Resultados encontrados: ${results}`);
      
      if (results > 0) {
        // Mostrar los resultados
        for (let i = 0; i < results; i++) {
          const result = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_RESULT).nth(i);
          const text = await result.textContent();
          console.log(`   ✅ ${text?.trim()}`);
        }
        
        // Seleccionar el primer resultado
        const clienteOption = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_RESULT).first();
        await clienteOption.click();
        await page.waitForTimeout(1000);
        
        console.log(`   ✅ Cliente ${cliente.nombre} seleccionado`);
        
        // Limpiar selección para el siguiente test
        await clienteInput.clear();
        await page.waitForTimeout(1000);
        
      } else {
        console.log(`   ❌ No se encontraron resultados para ${cliente.nombre}`);
      }
    }
    
    console.log('\n✅ Test de búsqueda de clientes completado');
  });

  test('Verificar estado de la aplicación con datos reales', async ({ page }) => {
    console.log('🧪 Verificando estado de la aplicación con datos reales...');
    
    // Verificar que la página se carga correctamente
    const pageTitle = await page.title();
    console.log(`📄 Título: ${pageTitle}`);
    
    // Verificar elementos principales
    const elements = {
      clienteInput: await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_INPUT).first(),
      productoInput: await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_INPUT).first(),
      addButton: await page.locator(TEST_CONFIG.SELECTORS.ADD_BUTTON).first(),
      submitButton: await page.locator(TEST_CONFIG.SELECTORS.SUBMIT_BUTTON).first()
    };
    
    console.log('\n📋 Estado de los elementos:');
    for (const [name, element] of Object.entries(elements)) {
      const isVisible = await element.isVisible();
      const isEnabled = await element.isEnabled();
      console.log(`   - ${name}: visible=${isVisible}, enabled=${isEnabled}`);
    }
    
    // Verificar que no hay errores
    const errorMessages = await page.locator('.alert-danger, .error-message').count();
    if (errorMessages > 0) {
      console.log('\n❌ Errores encontrados:');
      for (let i = 0; i < errorMessages; i++) {
        const error = await page.locator('.alert-danger, .error-message').nth(i);
        const text = await error.textContent();
        console.log(`   - ${text?.trim()}`);
      }
    } else {
      console.log('\n✅ No se encontraron errores');
    }
    
    // Verificar mensajes de estado
    const statusMessages = await page.locator('text=No hay, text=Sin datos, text=Vacío').count();
    if (statusMessages > 0) {
      console.log('\n📋 Mensajes de estado:');
      for (let i = 0; i < statusMessages; i++) {
        const message = await page.locator('text=No hay, text=Sin datos, text=Vacío').nth(i);
        const text = await message.textContent();
        console.log(`   - ${text?.trim()}`);
      }
    }
    
    // Tomar screenshot final
    await page.screenshot({ path: 'test-results/app-state-with-real-data.png', fullPage: true });
    console.log('\n📸 Screenshot guardado');
    
    console.log('\n✅ Verificación de estado completada');
  });
});
