/**
 * Pruebas específicas para diferentes tipos de pago
 */

import { test, expect } from '@playwright/test';
import AuthHelper from './utils/authHelper.js';
import SalesFormHelper from './utils/salesFormHelper.js';
import TestDataGenerator from './utils/testDataGenerator.js';

test.describe('Pruebas de Tipos de Pago', () => {
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

  test('Pago en efectivo', async ({ page }) => {
    console.log('🧪 Probando pago en efectivo...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta en efectivo
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Contado');
    await salesHelper.selectMetodoPago('Efectivo');
    
    // Verificar que no se requiera referencia
    const referenciaRequired = await salesHelper.verificarReferenciaRequerida();
    expect(referenciaRequired).toBe(false);
    
    // Verificar formulario válido
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    console.log('✅ Pago en efectivo configurado correctamente');
  });

  test('Pago por transferencia', async ({ page }) => {
    console.log('🧪 Probando pago por transferencia...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta por transferencia
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Contado');
    await salesHelper.selectMetodoPago('Transferencia');
    
    // Verificar que se requiera referencia
    const referenciaRequired = await salesHelper.verificarReferenciaRequerida();
    expect(referenciaRequired).toBe(true);
    
    // Agregar referencia
    await salesHelper.agregarReferenciaPago('TRANSFER123456');
    
    // Verificar formulario válido
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    console.log('✅ Pago por transferencia configurado correctamente');
  });

  test('Pago móvil', async ({ page }) => {
    console.log('🧪 Probando pago móvil...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta por pago móvil
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Contado');
    await salesHelper.selectMetodoPago('Pago Móvil');
    
    // Verificar que se requiera referencia
    const referenciaRequired = await salesHelper.verificarReferenciaRequerida();
    expect(referenciaRequired).toBe(true);
    
    // Agregar referencia
    await salesHelper.agregarReferenciaPago('PM123456');
    
    // Verificar formulario válido
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    console.log('✅ Pago móvil configurado correctamente');
  });

  test('Pago por Zelle', async ({ page }) => {
    console.log('🧪 Probando pago por Zelle...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta por Zelle
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Contado');
    await salesHelper.selectMetodoPago('Zelle');
    
    // Verificar que se requiera referencia
    const referenciaRequired = await salesHelper.verificarReferenciaRequerida();
    expect(referenciaRequired).toBe(true);
    
    // Agregar referencia
    await salesHelper.agregarReferenciaPago('ZELLE789012');
    
    // Verificar formulario válido
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    console.log('✅ Pago por Zelle configurado correctamente');
  });

  test('Pago por PayPal', async ({ page }) => {
    console.log('🧪 Probando pago por PayPal...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta por PayPal
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Contado');
    await salesHelper.selectMetodoPago('PayPal');
    
    // Verificar que se requiera referencia
    const referenciaRequired = await salesHelper.verificarReferenciaRequerida();
    expect(referenciaRequired).toBe(true);
    
    // Agregar referencia
    await salesHelper.agregarReferenciaPago('PAYPAL345678');
    
    // Verificar formulario válido
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    console.log('✅ Pago por PayPal configurado correctamente');
  });

  test('Pago por Binance', async ({ page }) => {
    console.log('🧪 Probando pago por Binance...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta por Binance
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Contado');
    await salesHelper.selectMetodoPago('Binance');
    
    // Verificar que se requiera referencia
    const referenciaRequired = await salesHelper.verificarReferenciaRequerida();
    expect(referenciaRequired).toBe(true);
    
    // Agregar referencia
    await salesHelper.agregarReferenciaPago('BINANCE901234');
    
    // Verificar formulario válido
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    console.log('✅ Pago por Binance configurado correctamente');
  });

  test('Pago mixto USD/VES', async ({ page }) => {
    console.log('🧪 Probando pago mixto USD/VES...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta mixta
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Mixto');
    
    // Configurar montos mixtos
    await salesHelper.configurarPagoMixto(50, 1800, 'Efectivo', 'Pago Móvil');
    
    // Agregar referencias para ambos métodos
    await salesHelper.agregarReferenciaPago('PM123456');
    
    // Verificar formulario válido
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    console.log('✅ Pago mixto USD/VES configurado correctamente');
  });

  test('Pago a crédito simple', async ({ page }) => {
    console.log('🧪 Probando pago a crédito simple...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta a crédito
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Abono');
    await salesHelper.selectMetodoPago('Transferencia');
    
    // Configurar fecha de vencimiento
    const fechaVencimiento = dataGenerator.getFutureDate(30);
    await salesHelper.configurarFechaVencimiento(fechaVencimiento);
    
    // Agregar referencia
    await salesHelper.agregarReferenciaPago('TRANSFER789012');
    
    // Verificar formulario válido
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    console.log('✅ Pago a crédito simple configurado correctamente');
  });

  test('Pago a crédito mixto', async ({ page }) => {
    console.log('🧪 Probando pago a crédito mixto...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta a crédito mixto
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Abono');
    await salesHelper.selectMetodoPago('Mixto');
    
    // Configurar montos mixtos para abono
    await salesHelper.configurarAbonoMixto(25, 900, 'Efectivo', 'Transferencia');
    
    // Configurar fecha de vencimiento
    const fechaVencimiento = dataGenerator.getFutureDate(15);
    await salesHelper.configurarFechaVencimiento(fechaVencimiento);
    
    // Agregar referencias
    await salesHelper.agregarReferenciaPago('PM345678');
    
    // Verificar formulario válido
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    console.log('✅ Pago a crédito mixto configurado correctamente');
  });

  test('Cambio de método de pago', async ({ page }) => {
    console.log('🧪 Probando cambio de método de pago...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta inicial
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Contado');
    await salesHelper.selectMetodoPago('Efectivo');
    
    // Cambiar a método que requiere referencia
    await salesHelper.selectMetodoPago('Transferencia');
    
    // Verificar que ahora se requiera referencia
    const referenciaRequired = await salesHelper.verificarReferenciaRequerida();
    expect(referenciaRequired).toBe(true);
    
    // Agregar referencia
    await salesHelper.agregarReferenciaPago('TRANSFER456789');
    
    // Verificar formulario válido
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    console.log('✅ Cambio de método de pago funciona correctamente');
  });

  test('Validación de referencias por método', async ({ page }) => {
    console.log('🧪 Probando validación de referencias por método...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    await salesHelper.selectTipoPago('Contado');
    
    // Probar diferentes métodos que requieren referencia
    const metodosConReferencia = ['Transferencia', 'Pago Móvil', 'Zelle', 'PayPal', 'Binance'];
    
    for (const metodo of metodosConReferencia) {
      await salesHelper.selectMetodoPago(metodo);
      
      // Verificar que se requiera referencia
      const referenciaRequired = await salesHelper.verificarReferenciaRequerida();
      expect(referenciaRequired).toBe(true);
      
      console.log(`✅ ${metodo} requiere referencia correctamente`);
    }
    
    // Probar método que no requiere referencia
    await salesHelper.selectMetodoPago('Efectivo');
    const referenciaRequired = await salesHelper.verificarReferenciaRequerida();
    expect(referenciaRequired).toBe(false);
    
    console.log('✅ Efectivo no requiere referencia correctamente');
  });
});
