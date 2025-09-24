/**
 * Pruebas de manejo de errores del formulario de ventas
 */

import { test, expect } from '@playwright/test';
import AuthHelper from './utils/authHelper.js';
import SalesFormHelper from './utils/salesFormHelper.js';
import TestDataGenerator from './utils/testDataGenerator.js';

test.describe('Pruebas de Manejo de Errores', () => {
  let authHelper;
  let salesHelper;
  let dataGenerator;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    salesHelper = new SalesFormHelper(page);
    dataGenerator = new TestDataGenerator();
    
    // Login y navegar al formulario
    await page.goto('http://localhost:5174/');
    await page.waitForLoadState('networkidle');
    await authHelper.login('admin', 'admin123');
    await page.goto('http://localhost:5174/ventas');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Manejo de error: Cliente no encontrado', async ({ page }) => {
    console.log('🧪 Probando manejo de error cuando cliente no se encuentra...');
    
    // Buscar cliente que no existe
    const clienteInput = await page.locator('input[placeholder*="nombre, cédula"]');
    await clienteInput.fill('99999999'); // Cédula que no existe
    
    await page.waitForTimeout(2000);
    
    // Verificar que aparezca mensaje apropiado
    const noResultsMessage = await page.locator('.no-results, .cliente-no-encontrado').isVisible();
    expect(noResultsMessage).toBe(true);
    
    console.log('✅ Error de cliente no encontrado manejado correctamente');
  });

  test('Manejo de error: Producto no encontrado', async ({ page }) => {
    console.log('🧪 Probando manejo de error cuando producto no se encuentra...');
    
    // Buscar producto que no existe
    const productoInput = await page.locator('input[placeholder*="Buscar producto"]');
    await productoInput.fill('ProductoInexistente123');
    
    await page.waitForTimeout(2000);
    
    // Verificar que aparezca mensaje apropiado
    const noResultsMessage = await page.locator('.no-results, .producto-no-encontrado').isVisible();
    expect(noResultsMessage).toBe(true);
    
    console.log('✅ Error de producto no encontrado manejado correctamente');
  });

  test('Manejo de error: Formulario incompleto', async ({ page }) => {
    console.log('🧪 Probando manejo de error con formulario incompleto...');
    
    // Intentar enviar formulario vacío
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificar que aparezcan mensajes de error específicos
    const errorMessages = await page.locator('.alert-danger, .error-message, .invalid-feedback').count();
    expect(errorMessages).toBeGreaterThan(0);
    
    console.log('✅ Error de formulario incompleto manejado correctamente');
  });

  test('Manejo de error: Descuento excesivo', async ({ page }) => {
    console.log('🧪 Probando manejo de error con descuento excesivo...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta básica
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    
    // Intentar aplicar descuento excesivo
    await salesHelper.aplicarDescuento(999999, 'Descuento excesivo');
    
    // Verificar que el descuento se limite o se muestre error
    const errorMessage = await page.locator('.alert-danger, .error-message').isVisible();
    expect(errorMessage).toBe(true);
    
    console.log('✅ Error de descuento excesivo manejado correctamente');
  });

  test('Manejo de error: Cantidad inválida', async ({ page }) => {
    console.log('🧪 Probando manejo de error con cantidad inválida...');
    
    const cliente = dataGenerator.getRandomCliente();
    
    await salesHelper.selectCliente(cliente);
    
    // Intentar agregar producto con cantidad inválida
    const productoInvalido = {
      nombre: 'Producto Test',
      precio: 100,
      cantidad: -5 // Cantidad negativa
    };
    
    await salesHelper.addProducto(productoInvalido);
    
    // Verificar que aparezca error o se corrija la cantidad
    const errorMessage = await page.locator('.alert-danger, .error-message').isVisible();
    expect(errorMessage).toBe(true);
    
    console.log('✅ Error de cantidad inválida manejado correctamente');
  });

  test('Manejo de error: Precio inválido', async ({ page }) => {
    console.log('🧪 Probando manejo de error con precio inválido...');
    
    const cliente = dataGenerator.getRandomCliente();
    
    await salesHelper.selectCliente(cliente);
    
    // Intentar agregar producto con precio inválido
    const productoInvalido = {
      nombre: 'Producto Test',
      precio: -50, // Precio negativo
      cantidad: 1
    };
    
    await salesHelper.addProducto(productoInvalido);
    
    // Verificar que aparezca error
    const errorMessage = await page.locator('.alert-danger, .error-message').isVisible();
    expect(errorMessage).toBe(true);
    
    console.log('✅ Error de precio inválido manejado correctamente');
  });

  test('Manejo de error: Fecha de vencimiento inválida', async ({ page }) => {
    console.log('🧪 Probando manejo de error con fecha de vencimiento inválida...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta a crédito
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Abono');
    
    // Intentar configurar fecha de vencimiento en el pasado
    await salesHelper.configurarFechaVencimiento('2020-01-01');
    
    // Verificar que aparezca error
    const errorMessage = await page.locator('.alert-danger, .error-message').isVisible();
    expect(errorMessage).toBe(true);
    
    console.log('✅ Error de fecha de vencimiento inválida manejado correctamente');
  });

  test('Manejo de error: Montos mixtos inválidos', async ({ page }) => {
    console.log('🧪 Probando manejo de error con montos mixtos inválidos...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta mixta
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Mixto');
    
    // Intentar configurar montos inválidos
    await salesHelper.configurarPagoMixto(-100, -2000, 'Efectivo', 'Transferencia');
    
    // Verificar que aparezca error
    const errorMessage = await page.locator('.alert-danger, .error-message').isVisible();
    expect(errorMessage).toBe(true);
    
    console.log('✅ Error de montos mixtos inválidos manejado correctamente');
  });

  test('Manejo de error: Referencia de pago faltante', async ({ page }) => {
    console.log('🧪 Probando manejo de error con referencia de pago faltante...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta con método que requiere referencia
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Contado');
    await salesHelper.selectMetodoPago('Transferencia');
    
    // Intentar enviar sin referencia
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificar que aparezca error
    const errorMessage = await page.locator('.alert-danger, .error-message').isVisible();
    expect(errorMessage).toBe(true);
    
    console.log('✅ Error de referencia de pago faltante manejado correctamente');
  });

  test('Manejo de error: Comentarios de descuento faltantes', async ({ page }) => {
    console.log('🧪 Probando manejo de error con comentarios de descuento faltantes...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta básica
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Contado');
    await salesHelper.selectMetodoPago('Efectivo');
    
    // Aplicar descuento sin comentarios
    await salesHelper.aplicarDescuento(10, ''); // Sin comentarios
    
    // Intentar enviar
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificar que aparezca error
    const errorMessage = await page.locator('.alert-danger, .error-message').isVisible();
    expect(errorMessage).toBe(true);
    
    console.log('✅ Error de comentarios de descuento faltantes manejado correctamente');
  });

  test('Manejo de error: Recuperación después de error', async ({ page }) => {
    console.log('🧪 Probando recuperación después de error...');
    
    // Intentar enviar formulario vacío (generar error)
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificar que aparezca error
    const errorMessage = await page.locator('.alert-danger, .error-message').isVisible();
    expect(errorMessage).toBe(true);
    
    // Corregir el error llenando el formulario correctamente
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Contado');
    await salesHelper.selectMetodoPago('Efectivo');
    
    // Verificar que el formulario se pueda enviar después de corregir
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    console.log('✅ Recuperación después de error funciona correctamente');
  });

  test('Manejo de error: Validación en tiempo real', async ({ page }) => {
    console.log('🧪 Probando validación en tiempo real...');
    
    const cliente = dataGenerator.getRandomCliente();
    
    await salesHelper.selectCliente(cliente);
    
    // Intentar agregar producto con datos inválidos
    const productoInput = await page.locator('input[placeholder*="Buscar producto"]');
    await productoInput.fill(''); // Campo vacío
    
    // Verificar que aparezca validación en tiempo real
    await page.waitForTimeout(1000);
    
    const validationMessage = await page.locator('.invalid-feedback, .error-message').isVisible();
    expect(validationMessage).toBe(true);
    
    console.log('✅ Validación en tiempo real funciona correctamente');
  });
});
