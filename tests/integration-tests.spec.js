/**
 * Pruebas de integración completa del flujo de ventas
 */

import { test, expect } from '@playwright/test';
import AuthHelper from './utils/authHelper.js';
import SalesFormHelper from './utils/salesFormHelper.js';
import TestDataGenerator from './utils/testDataGenerator.js';

test.describe('Pruebas de Integración Completa', () => {
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

  test('Flujo completo: Venta al contado exitosa', async ({ page }) => {
    console.log('🧪 Probando flujo completo de venta al contado...');
    
    const scenario = dataGenerator.generateTestScenario('contado_completo');
    
    // Paso 1: Seleccionar cliente
    await salesHelper.selectCliente(scenario.cliente);
    console.log('✅ Cliente seleccionado');
    
    // Paso 2: Agregar productos
    for (const producto of scenario.productos) {
      await salesHelper.addProducto(producto);
    }
    console.log('✅ Productos agregados');
    
    // Paso 3: Configurar pago
    await salesHelper.selectTipoPago(scenario.tipoPago);
    await salesHelper.selectMetodoPago(scenario.metodoPago);
    await salesHelper.agregarReferenciaPago(scenario.referenciaPago);
    console.log('✅ Pago configurado');
    
    // Paso 4: Aplicar opciones adicionales
    if (scenario.descuento) {
      await salesHelper.aplicarDescuento(scenario.descuento, scenario.comentariosDescuento);
      console.log('✅ Descuento aplicado');
    }
    
    if (scenario.delivery) {
      await salesHelper.aplicarDelivery(scenario.delivery, scenario.comentariosDelivery);
      console.log('✅ Delivery configurado');
    }
    
    if (scenario.aplicarIVA) {
      await salesHelper.aplicarIVA();
      console.log('✅ IVA aplicado');
    }
    
    // Paso 5: Verificar formulario completo
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    console.log('✅ Formulario válido');
    
    // Paso 6: Enviar formulario
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Paso 7: Verificar éxito
    await page.waitForTimeout(2000);
    const successMessage = await page.locator('.alert-success, .success-message').isVisible();
    expect(successMessage).toBe(true);
    console.log('✅ Venta procesada exitosamente');
  });

  test('Flujo completo: Venta a crédito con entrega diferida', async ({ page }) => {
    console.log('🧪 Probando flujo completo de venta a crédito...');
    
    const scenario = dataGenerator.generateTestScenario('abono_simple');
    
    // Configurar venta a crédito
    await salesHelper.selectCliente(scenario.cliente);
    await salesHelper.addProducto(scenario.productos[0]);
    await salesHelper.selectTipoPago('Abono');
    await salesHelper.selectMetodoPago(scenario.metodoPago);
    await salesHelper.agregarReferenciaPago(scenario.referenciaPago);
    await salesHelper.configurarFechaVencimiento(scenario.fechaVencimiento);
    
    // Marcar como entrega diferida
    await salesHelper.marcarEntregaDiferida();
    
    // Verificar y enviar
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    await page.waitForTimeout(2000);
    const successMessage = await page.locator('.alert-success, .success-message').isVisible();
    expect(successMessage).toBe(true);
    
    console.log('✅ Venta a crédito procesada exitosamente');
  });

  test('Flujo completo: Venta mixta con múltiples productos', async ({ page }) => {
    console.log('🧪 Probando flujo completo de venta mixta...');
    
    const cliente = dataGenerator.getRandomCliente();
    const productos = [
      dataGenerator.getRandomProducto(),
      dataGenerator.getRandomProducto(),
      dataGenerator.getRandomProducto()
    ];
    
    // Configurar venta mixta
    await salesHelper.selectCliente(cliente);
    
    for (const producto of productos) {
      await salesHelper.addProducto(producto);
    }
    
    await salesHelper.selectTipoPago('Mixto');
    await salesHelper.configurarPagoMixto(100, 3600, 'Efectivo', 'Transferencia');
    
    // Verificar y enviar
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    await page.waitForTimeout(2000);
    const successMessage = await page.locator('.alert-success, .success-message').isVisible();
    expect(successMessage).toBe(true);
    
    console.log('✅ Venta mixta procesada exitosamente');
  });

  test('Flujo completo: Crear cliente nuevo durante la venta', async ({ page }) => {
    console.log('🧪 Probando creación de cliente nuevo durante venta...');
    
    const nuevoCliente = {
      nombre: 'Cliente Nuevo',
      cedula: '12345678',
      telefono: '0412-1234567',
      email: 'nuevo@email.com'
    };
    
    const producto = dataGenerator.getRandomProducto();
    
    // Buscar cliente que no existe
    const clienteInput = await page.locator('input[placeholder*="nombre, cédula"]');
    await clienteInput.fill(nuevoCliente.cedula);
    await page.waitForTimeout(1000);
    
    // Crear cliente nuevo
    await salesHelper.crearClienteNuevo(nuevoCliente);
    
    // Continuar con la venta
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Contado');
    await salesHelper.selectMetodoPago('Efectivo');
    
    // Verificar y enviar
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    await page.waitForTimeout(2000);
    const successMessage = await page.locator('.alert-success, .success-message').isVisible();
    expect(successMessage).toBe(true);
    
    console.log('✅ Cliente nuevo creado y venta procesada exitosamente');
  });

  test('Flujo completo: Venta con producto manual y servicios', async ({ page }) => {
    console.log('🧪 Probando venta con productos manuales...');
    
    const cliente = dataGenerator.getRandomCliente();
    const productoManual = dataGenerator.generateProductoManual();
    
    // Configurar venta con producto manual
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProductoManual(productoManual);
    await salesHelper.selectTipoPago('Contado');
    await salesHelper.selectMetodoPago('Transferencia');
    await salesHelper.agregarReferenciaPago('REF123456');
    
    // Verificar y enviar
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    await page.waitForTimeout(2000);
    const successMessage = await page.locator('.alert-success, .success-message').isVisible();
    expect(successMessage).toBe(true);
    
    console.log('✅ Venta con producto manual procesada exitosamente');
  });

  test('Flujo completo: Venta con descuento y delivery', async ({ page }) => {
    console.log('🧪 Probando venta con descuento y delivery...');
    
    const scenario = dataGenerator.generateTestScenario('con_descuento');
    
    // Configurar venta con descuento y delivery
    await salesHelper.selectCliente(scenario.cliente);
    await salesHelper.addProducto(scenario.productos[0]);
    await salesHelper.selectTipoPago(scenario.tipoPago);
    await salesHelper.selectMetodoPago(scenario.metodoPago);
    
    // Aplicar descuento
    await salesHelper.aplicarDescuento(scenario.descuento, scenario.comentariosDescuento);
    
    // Aplicar delivery
    const delivery = dataGenerator.getRandomDelivery();
    await salesHelper.aplicarDelivery(delivery, 'Delivery a domicilio');
    
    // Verificar y enviar
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    await page.waitForTimeout(2000);
    const successMessage = await page.locator('.alert-success, .success-message').isVisible();
    expect(successMessage).toBe(true);
    
    console.log('✅ Venta con descuento y delivery procesada exitosamente');
  });

  test('Flujo completo: Venta con IVA y entrega inmediata', async ({ page }) => {
    console.log('🧪 Probando venta con IVA y entrega inmediata...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta con IVA y entrega inmediata
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Contado');
    await salesHelper.selectMetodoPago('Efectivo');
    
    // Aplicar IVA
    await salesHelper.aplicarIVA();
    
    // Marcar entrega inmediata
    await salesHelper.marcarEntregaInmediata();
    
    // Verificar y enviar
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    await page.waitForTimeout(2000);
    const successMessage = await page.locator('.alert-success, .success-message').isVisible();
    expect(successMessage).toBe(true);
    
    console.log('✅ Venta con IVA y entrega inmediata procesada exitosamente');
  });

  test('Flujo completo: Venta con múltiples métodos de pago', async ({ page }) => {
    console.log('🧪 Probando venta con múltiples métodos de pago...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta mixta con diferentes métodos
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Mixto');
    
    // Configurar pago mixto con diferentes métodos
    await salesHelper.configurarPagoMixto(50, 1800, 'Efectivo', 'Pago Móvil');
    
    // Agregar referencias para ambos métodos
    await salesHelper.agregarReferenciaPago('PM123456');
    
    // Verificar y enviar
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    await page.waitForTimeout(2000);
    const successMessage = await page.locator('.alert-success, .success-message').isVisible();
    expect(successMessage).toBe(true);
    
    console.log('✅ Venta con múltiples métodos de pago procesada exitosamente');
  });
});
