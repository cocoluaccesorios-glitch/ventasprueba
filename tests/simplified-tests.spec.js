/**
 * Test simplificado usando el helper mejorado
 */

import { test, expect } from '@playwright/test';
import ImprovedTestHelper from './utils/improvedTestHelper.js';
import TEST_CONFIG from './config/testConfigurations.js';

test.describe('Pruebas Simplificadas con Helper Mejorado', () => {
  let testHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new ImprovedTestHelper(page);
    
    // Login y navegar al formulario
    await testHelper.login();
    await testHelper.navigateTo(TEST_CONFIG.URLS.VENTAS);
  });

  test('Venta básica en efectivo', async ({ page }) => {
    console.log('🧪 Probando venta básica en efectivo...');
    
    const cliente = TEST_CONFIG.TEST_DATA.CLIENTES[0];
    const producto = TEST_CONFIG.TEST_DATA.PRODUCTOS[0];
    
    // Configurar venta básica
    await testHelper.selectCliente(cliente);
    await testHelper.selectProducto(producto);
    await testHelper.selectTipoPago('Contado');
    await testHelper.selectMetodoPago('Efectivo');
    
    // Enviar formulario
    await testHelper.submitForm();
    
    // Verificar éxito
    const success = await testHelper.verifySuccessSubmission();
    expect(success).toBe(true);
    
    console.log('✅ Venta básica completada exitosamente');
  });

  test('Venta con transferencia', async ({ page }) => {
    console.log('🧪 Probando venta con transferencia...');
    
    const cliente = TEST_CONFIG.TEST_DATA.CLIENTES[1];
    const producto = TEST_CONFIG.TEST_DATA.PRODUCTOS[1];
    
    // Configurar venta con transferencia
    await testHelper.selectCliente(cliente);
    await testHelper.selectProducto(producto);
    await testHelper.selectTipoPago('Contado');
    await testHelper.selectMetodoPago('Transferencia');
    await testHelper.agregarReferenciaPago('TRANSFER123456');
    
    // Enviar formulario
    await testHelper.submitForm();
    
    // Verificar éxito
    const success = await testHelper.verifySuccessSubmission();
    expect(success).toBe(true);
    
    console.log('✅ Venta con transferencia completada exitosamente');
  });

  test('Venta a crédito simple', async ({ page }) => {
    console.log('🧪 Probando venta a crédito simple...');
    
    const cliente = TEST_CONFIG.TEST_DATA.CLIENTES[2];
    const producto = TEST_CONFIG.TEST_DATA.PRODUCTOS[2];
    
    // Configurar venta a crédito
    await testHelper.selectCliente(cliente);
    await testHelper.selectProducto(producto);
    await testHelper.selectTipoPago('Abono');
    await testHelper.selectMetodoPago('Transferencia');
    await testHelper.agregarReferenciaPago('TRANSFER789012');
    
    // Configurar fecha de vencimiento
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
    const fechaInput = await page.locator('input[type="date"]').first();
    await fechaInput.fill(fechaVencimiento.toISOString().split('T')[0]);
    
    // Enviar formulario
    await testHelper.submitForm();
    
    // Verificar éxito
    const success = await testHelper.verifySuccessSubmission();
    expect(success).toBe(true);
    
    console.log('✅ Venta a crédito completada exitosamente');
  });

  test('Validación de campos obligatorios', async ({ page }) => {
    console.log('🧪 Probando validación de campos obligatorios...');
    
    // Intentar enviar formulario vacío
    await testHelper.submitForm();
    
    // Verificar que aparezcan errores
    const errorFound = await testHelper.waitForElement(TEST_CONFIG.SELECTORS.ERROR_MESSAGE, TEST_CONFIG.TIMEOUTS.SHORT);
    expect(errorFound).toBe(true);
    
    console.log('✅ Validación de campos obligatorios funciona correctamente');
  });

  test('Búsqueda de cliente', async ({ page }) => {
    console.log('🧪 Probando búsqueda de cliente...');
    
    const cliente = TEST_CONFIG.TEST_DATA.CLIENTES[0];
    
    // Buscar cliente
    const clienteInput = await page.locator(TEST_CONFIG.SELECTORS.CLIENTE_INPUT).first();
    await clienteInput.fill(cliente.nombre);
    
    // Esperar resultados
    const resultFound = await testHelper.waitForElement(TEST_CONFIG.SELECTORS.CLIENTE_RESULT, TEST_CONFIG.TIMEOUTS.MEDIUM);
    expect(resultFound).toBe(true);
    
    console.log('✅ Búsqueda de cliente funciona correctamente');
  });

  test('Búsqueda de producto', async ({ page }) => {
    console.log('🧪 Probando búsqueda de producto...');
    
    const producto = TEST_CONFIG.TEST_DATA.PRODUCTOS[0];
    
    // Buscar producto
    const productoInput = await page.locator(TEST_CONFIG.SELECTORS.PRODUCTO_INPUT).first();
    await productoInput.fill(producto.nombre);
    
    // Esperar resultados
    const resultFound = await testHelper.waitForElement(TEST_CONFIG.SELECTORS.PRODUCTO_RESULT, TEST_CONFIG.TIMEOUTS.MEDIUM);
    expect(resultFound).toBe(true);
    
    console.log('✅ Búsqueda de producto funciona correctamente');
  });
});
