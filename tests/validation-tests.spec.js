/**
 * Pruebas de validación del formulario de ventas
 */

import { test, expect } from '@playwright/test';
import AuthHelper from './utils/authHelper.js';
import SalesFormHelper from './utils/salesFormHelper.js';
import TestDataGenerator from './utils/testDataGenerator.js';

test.describe('Pruebas de Validación del Formulario', () => {
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

  test('Validación: Cliente obligatorio', async ({ page }) => {
    console.log('🧪 Probando validación de cliente obligatorio...');
    
    // Intentar enviar formulario sin cliente
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificar que aparezca mensaje de error
    const errorMessage = await page.locator('.alert-danger, .error-message').isVisible();
    expect(errorMessage).toBe(true);
    
    console.log('✅ Validación de cliente obligatorio funciona');
  });

  test('Validación: Producto obligatorio', async ({ page }) => {
    console.log('🧪 Probando validación de producto obligatorio...');
    
    // Llenar cliente pero no productos
    const cliente = dataGenerator.getRandomCliente();
    await salesHelper.selectCliente(cliente);
    
    // Intentar enviar formulario
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificar que aparezca mensaje de error
    const errorMessage = await page.locator('.alert-danger, .error-message').isVisible();
    expect(errorMessage).toBe(true);
    
    console.log('✅ Validación de producto obligatorio funciona');
  });

  test('Validación: Método de pago obligatorio', async ({ page }) => {
    console.log('🧪 Probando validación de método de pago obligatorio...');
    
    // Llenar cliente y producto pero no método de pago
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    
    // Intentar enviar formulario
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificar que aparezca mensaje de error
    const errorMessage = await page.locator('.alert-danger, .error-message').isVisible();
    expect(errorMessage).toBe(true);
    
    console.log('✅ Validación de método de pago obligatorio funciona');
  });

  test('Validación: Referencia de pago para métodos específicos', async ({ page }) => {
    console.log('🧪 Probando validación de referencia de pago...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    
    // Seleccionar método que requiere referencia
    await salesHelper.selectMetodoPago('Transferencia');
    
    // Intentar enviar sin referencia
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificar que aparezca mensaje de error
    const errorMessage = await page.locator('.alert-danger, .error-message').isVisible();
    expect(errorMessage).toBe(true);
    
    console.log('✅ Validación de referencia de pago funciona');
  });

  test('Validación: Descuento máximo', async ({ page }) => {
    console.log('🧪 Probando validación de descuento máximo...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    
    // Intentar aplicar descuento muy alto (más del 100%)
    const descuentoExcesivo = 999999;
    await salesHelper.aplicarDescuento(descuentoExcesivo, 'Descuento excesivo');
    
    // Verificar que el descuento se limite
    const descuentoAplicado = await salesHelper.verificarDescuentoAplicado(descuentoExcesivo);
    expect(descuentoAplicado).toBe(false);
    
    console.log('✅ Validación de descuento máximo funciona');
  });

  test('Validación: Cantidad de producto mínima', async ({ page }) => {
    console.log('🧪 Probando validación de cantidad mínima...');
    
    const cliente = dataGenerator.getRandomCliente();
    
    await salesHelper.selectCliente(cliente);
    
    // Intentar agregar producto con cantidad 0
    const productoInvalido = {
      nombre: 'Producto Test',
      precio: 100,
      cantidad: 0
    };
    
    await salesHelper.addProducto(productoInvalido);
    
    // Verificar que el producto no se agregue o se corrija la cantidad
    const productosAgregados = await salesHelper.contarProductosAgregados();
    expect(productosAgregados).toBe(0);
    
    console.log('✅ Validación de cantidad mínima funciona');
  });

  test('Validación: Precio de producto positivo', async ({ page }) => {
    console.log('🧪 Probando validación de precio positivo...');
    
    const cliente = dataGenerator.getRandomCliente();
    
    await salesHelper.selectCliente(cliente);
    
    // Intentar agregar producto con precio negativo
    const productoInvalido = {
      nombre: 'Producto Test',
      precio: -50,
      cantidad: 1
    };
    
    await salesHelper.addProducto(productoInvalido);
    
    // Verificar que el producto no se agregue
    const productosAgregados = await salesHelper.contarProductosAgregados();
    expect(productosAgregados).toBe(0);
    
    console.log('✅ Validación de precio positivo funciona');
  });

  test('Validación: Cédula de cliente válida', async ({ page }) => {
    console.log('🧪 Probando validación de cédula válida...');
    
    // Intentar buscar cliente con cédula inválida
    const cedulaInvalida = '123'; // Cédula muy corta
    
    const clienteInput = await page.locator('input[placeholder*="nombre, cédula"]');
    await clienteInput.fill(cedulaInvalida);
    
    // Esperar a que se procese la búsqueda
    await page.waitForTimeout(1000);
    
    // Verificar que no se encuentre cliente
    const clienteEncontrado = await page.locator('.cliente-encontrado, .cliente-seleccionado').isVisible();
    expect(clienteEncontrado).toBe(false);
    
    console.log('✅ Validación de cédula válida funciona');
  });

  test('Validación: Fecha de vencimiento futura', async ({ page }) => {
    console.log('🧪 Probando validación de fecha de vencimiento...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    
    // Seleccionar tipo de pago a crédito
    await salesHelper.selectTipoPago('Abono');
    
    // Intentar configurar fecha de vencimiento en el pasado
    const fechaPasada = '2020-01-01';
    await salesHelper.configurarFechaVencimiento(fechaPasada);
    
    // Verificar que la fecha se corrija o se muestre error
    const fechaValida = await salesHelper.verificarFechaVencimientoValida();
    expect(fechaValida).toBe(false);
    
    console.log('✅ Validación de fecha de vencimiento funciona');
  });

  test('Validación: Montos mixtos válidos', async ({ page }) => {
    console.log('🧪 Probando validación de montos mixtos...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    
    // Seleccionar tipo de pago mixto
    await salesHelper.selectTipoPago('Mixto');
    
    // Intentar configurar montos inválidos (negativos)
    await salesHelper.configurarPagoMixto(-100, -2000, 'Efectivo', 'Transferencia');
    
    // Verificar que los montos se corrijan o se muestre error
    const montosValidos = await salesHelper.verificarMontosMixtosValidos();
    expect(montosValidos).toBe(false);
    
    console.log('✅ Validación de montos mixtos funciona');
  });

  test('Validación: Comentarios de descuento obligatorios', async ({ page }) => {
    console.log('🧪 Probando validación de comentarios de descuento...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    
    // Aplicar descuento sin comentarios
    await salesHelper.aplicarDescuento(10, ''); // Sin comentarios
    
    // Intentar enviar formulario
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificar que aparezca mensaje de error
    const errorMessage = await page.locator('.alert-danger, .error-message').isVisible();
    expect(errorMessage).toBe(true);
    
    console.log('✅ Validación de comentarios de descuento funciona');
  });
});

