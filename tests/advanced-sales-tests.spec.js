/**
 * Pruebas avanzadas para diferentes tipos de ventas
 */

import { test, expect } from '@playwright/test';
import AuthHelper from './utils/authHelper.js';
import SalesFormHelper from './utils/salesFormHelper.js';
import TestDataGenerator from './utils/testDataGenerator.js';

test.describe('Pruebas Avanzadas de Ventas', () => {
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

  test('Venta al contado completa', async ({ page }) => {
    console.log('🧪 Probando venta al contado completa...');
    
    const scenario = dataGenerator.generateTestScenario('contado_completo');
    
    // Llenar datos del cliente
    await salesHelper.selectCliente(scenario.cliente);
    
    // Agregar productos
    for (const producto of scenario.productos) {
      await salesHelper.addProducto(producto);
    }
    
    // Seleccionar tipo de pago
    await salesHelper.selectTipoPago('Contado');
    
    // Seleccionar método de pago
    await salesHelper.selectMetodoPago(scenario.metodoPago);
    
    // Aplicar descuento si existe
    if (scenario.descuento) {
      await salesHelper.aplicarDescuento(scenario.descuento, scenario.comentariosDescuento);
    }
    
    // Aplicar delivery si existe
    if (scenario.delivery) {
      await salesHelper.aplicarDelivery(scenario.delivery, scenario.comentariosDelivery);
    }
    
    // Aplicar IVA
    if (scenario.aplicarIVA) {
      await salesHelper.aplicarIVA();
    }
    
    // Marcar entrega inmediata
    if (scenario.entregaInmediata) {
      await salesHelper.marcarEntregaInmediata();
    }
    
    // Agregar referencia de pago
    await salesHelper.agregarReferenciaPago(scenario.referenciaPago);
    
    // Verificar que el formulario esté completo
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    console.log('✅ Venta al contado completa configurada');
  });

  test('Venta a crédito simple', async ({ page }) => {
    console.log('🧪 Probando venta a crédito simple...');
    
    const scenario = dataGenerator.generateTestScenario('abono_simple');
    
    // Llenar datos del cliente
    await salesHelper.selectCliente(scenario.cliente);
    
    // Agregar productos
    for (const producto of scenario.productos) {
      await salesHelper.addProducto(producto);
    }
    
    // Seleccionar tipo de pago a crédito
    await salesHelper.selectTipoPago('Abono');
    
    // Seleccionar método de pago
    await salesHelper.selectMetodoPago(scenario.metodoPago);
    
    // Agregar referencia de pago
    await salesHelper.agregarReferenciaPago(scenario.referenciaPago);
    
    // Configurar fecha de vencimiento
    await salesHelper.configurarFechaVencimiento(scenario.fechaVencimiento);
    
    // Verificar que el formulario esté completo
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    console.log('✅ Venta a crédito simple configurada');
  });

  test('Venta mixta (contado + crédito)', async ({ page }) => {
    console.log('🧪 Probando venta mixta...');
    
    const scenario = dataGenerator.generateTestScenario('pago_mixto');
    
    // Llenar datos del cliente
    await salesHelper.selectCliente(scenario.cliente);
    
    // Agregar productos
    for (const producto of scenario.productos) {
      await salesHelper.addProducto(producto);
    }
    
    // Seleccionar tipo de pago mixto
    await salesHelper.selectTipoPago('Mixto');
    
    // Configurar montos mixtos
    await salesHelper.configurarPagoMixto(
      scenario.montoMixtoUSD,
      scenario.montoMixtoVES,
      'Efectivo',
      'Transferencia'
    );
    
    // Verificar que el formulario esté completo
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    console.log('✅ Venta mixta configurada');
  });

  test('Venta con descuento', async ({ page }) => {
    console.log('🧪 Probando venta con descuento...');
    
    const scenario = dataGenerator.generateTestScenario('con_descuento');
    
    // Llenar datos del cliente
    await salesHelper.selectCliente(scenario.cliente);
    
    // Agregar productos
    for (const producto of scenario.productos) {
      await salesHelper.addProducto(producto);
    }
    
    // Seleccionar tipo de pago
    await salesHelper.selectTipoPago(scenario.tipoPago);
    
    // Aplicar descuento
    await salesHelper.aplicarDescuento(scenario.descuento, scenario.comentariosDescuento);
    
    // Verificar que el descuento se aplicó correctamente
    const descuentoAplicado = await salesHelper.verificarDescuentoAplicado(scenario.descuento);
    expect(descuentoAplicado).toBe(true);
    
    console.log('✅ Venta con descuento configurada');
  });

  test('Venta con delivery', async ({ page }) => {
    console.log('🧪 Probando venta con delivery...');
    
    const scenario = dataGenerator.generateTestScenario('con_delivery');
    
    // Llenar datos del cliente
    await salesHelper.selectCliente(scenario.cliente);
    
    // Agregar productos
    for (const producto of scenario.productos) {
      await salesHelper.addProducto(producto);
    }
    
    // Seleccionar tipo de pago
    await salesHelper.selectTipoPago(scenario.tipoPago);
    
    // Aplicar delivery
    await salesHelper.aplicarDelivery(scenario.delivery, scenario.comentariosDelivery);
    
    // Verificar que el delivery se aplicó correctamente
    const deliveryAplicado = await salesHelper.verificarDeliveryAplicado(scenario.delivery);
    expect(deliveryAplicado).toBe(true);
    
    console.log('✅ Venta con delivery configurada');
  });

  test('Venta con productos múltiples', async ({ page }) => {
    console.log('🧪 Probando venta con múltiples productos...');
    
    const scenario = dataGenerator.generateTestScenario('random');
    
    // Llenar datos del cliente
    await salesHelper.selectCliente(scenario.cliente);
    
    // Agregar múltiples productos
    const productos = [
      dataGenerator.getRandomProducto(),
      dataGenerator.getRandomProducto(),
      dataGenerator.getRandomProducto()
    ];
    
    for (const producto of productos) {
      await salesHelper.addProducto(producto);
    }
    
    // Seleccionar tipo de pago
    await salesHelper.selectTipoPago(scenario.tipoPago);
    
    // Verificar que todos los productos se agregaron
    const productosAgregados = await salesHelper.contarProductosAgregados();
    expect(productosAgregados).toBe(productos.length);
    
    console.log('✅ Venta con múltiples productos configurada');
  });

  test('Venta con producto manual', async ({ page }) => {
    console.log('🧪 Probando venta con producto manual...');
    
    const scenario = dataGenerator.generateTestScenario('minimal');
    const productoManual = dataGenerator.generateProductoManual();
    
    // Llenar datos del cliente
    await salesHelper.selectCliente(scenario.cliente);
    
    // Agregar producto manual
    await salesHelper.addProductoManual(productoManual);
    
    // Seleccionar tipo de pago
    await salesHelper.selectTipoPago(scenario.tipoPago);
    
    // Verificar que el producto manual se agregó
    const productoAgregado = await salesHelper.verificarProductoManual(productoManual);
    expect(productoAgregado).toBe(true);
    
    console.log('✅ Venta con producto manual configurada');
  });

  test('Venta mínima (solo campos obligatorios)', async ({ page }) => {
    console.log('🧪 Probando venta mínima...');
    
    const scenario = dataGenerator.generateTestScenario('minimal');
    
    // Llenar solo datos obligatorios
    await salesHelper.selectCliente(scenario.cliente);
    await salesHelper.addProducto(scenario.productos[0]);
    await salesHelper.selectTipoPago(scenario.tipoPago);
    await salesHelper.selectMetodoPago(scenario.metodoPago);
    
    // Verificar que el formulario mínimo es válido
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    console.log('✅ Venta mínima configurada');
  });
});
