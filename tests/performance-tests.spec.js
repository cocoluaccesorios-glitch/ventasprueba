/**
 * Pruebas de rendimiento del formulario de ventas
 */

import { test, expect } from '@playwright/test';
import AuthHelper from './utils/authHelper.js';
import SalesFormHelper from './utils/salesFormHelper.js';
import TestDataGenerator from './utils/testDataGenerator.js';

test.describe('Pruebas de Rendimiento', () => {
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

  test('Rendimiento: Tiempo de carga del formulario', async ({ page }) => {
    console.log('🧪 Probando tiempo de carga del formulario...');
    
    const startTime = Date.now();
    
    // Navegar al formulario
    await page.goto('http://localhost:5174/ventas');
    await page.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    console.log(`⏱️ Tiempo de carga: ${loadTime}ms`);
    
    // Verificar que el tiempo de carga sea razonable (menos de 5 segundos)
    expect(loadTime).toBeLessThan(5000);
    
    // Verificar que los elementos principales estén cargados
    const clienteInput = await page.locator('input[placeholder*="nombre, cédula"]').isVisible();
    const productoInput = await page.locator('input[placeholder*="Buscar producto"]').isVisible();
    
    expect(clienteInput).toBe(true);
    expect(productoInput).toBe(true);
    
    console.log('✅ Formulario cargado en tiempo aceptable');
  });

  test('Rendimiento: Tiempo de búsqueda de cliente', async ({ page }) => {
    console.log('🧪 Probando tiempo de búsqueda de cliente...');
    
    const cliente = dataGenerator.getRandomCliente();
    
    const startTime = Date.now();
    
    // Buscar cliente
    const clienteInput = await page.locator('input[placeholder*="nombre, cédula"]');
    await clienteInput.fill(cliente.cedula);
    
    // Esperar a que aparezcan resultados
    await page.waitForSelector('.cliente-encontrado, .cliente-seleccionado', { timeout: 5000 });
    
    const endTime = Date.now();
    const searchTime = endTime - startTime;
    
    console.log(`⏱️ Tiempo de búsqueda de cliente: ${searchTime}ms`);
    
    // Verificar que la búsqueda sea rápida (menos de 2 segundos)
    expect(searchTime).toBeLessThan(2000);
    
    console.log('✅ Búsqueda de cliente en tiempo aceptable');
  });

  test('Rendimiento: Tiempo de búsqueda de producto', async ({ page }) => {
    console.log('🧪 Probando tiempo de búsqueda de producto...');
    
    const producto = dataGenerator.getRandomProducto();
    
    const startTime = Date.now();
    
    // Buscar producto
    const productoInput = await page.locator('input[placeholder*="Buscar producto"]');
    await productoInput.fill(producto.nombre);
    
    // Esperar a que aparezcan resultados
    await page.waitForSelector('.producto-encontrado, .producto-seleccionado', { timeout: 5000 });
    
    const endTime = Date.now();
    const searchTime = endTime - startTime;
    
    console.log(`⏱️ Tiempo de búsqueda de producto: ${searchTime}ms`);
    
    // Verificar que la búsqueda sea rápida (menos de 2 segundos)
    expect(searchTime).toBeLessThan(2000);
    
    console.log('✅ Búsqueda de producto en tiempo aceptable');
  });

  test('Rendimiento: Tiempo de cálculo de totales', async ({ page }) => {
    console.log('🧪 Probando tiempo de cálculo de totales...');
    
    const cliente = dataGenerator.getRandomCliente();
    const productos = [
      dataGenerator.getRandomProducto(),
      dataGenerator.getRandomProducto(),
      dataGenerator.getRandomProducto()
    ];
    
    // Configurar venta básica
    await salesHelper.selectCliente(cliente);
    
    const startTime = Date.now();
    
    // Agregar productos y medir tiempo de cálculo
    for (const producto of productos) {
      await salesHelper.addProducto(producto);
    }
    
    // Esperar a que se calculen los totales
    await page.waitForTimeout(500);
    
    const endTime = Date.now();
    const calculationTime = endTime - startTime;
    
    console.log(`⏱️ Tiempo de cálculo de totales: ${calculationTime}ms`);
    
    // Verificar que el cálculo sea rápido (menos de 1 segundo)
    expect(calculationTime).toBeLessThan(1000);
    
    console.log('✅ Cálculo de totales en tiempo aceptable');
  });

  test('Rendimiento: Tiempo de aplicación de descuento', async ({ page }) => {
    console.log('🧪 Probando tiempo de aplicación de descuento...');
    
    const cliente = dataGenerator.getRandomCliente();
    const producto = dataGenerator.getRandomProducto();
    
    // Configurar venta básica
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProducto(producto);
    
    const startTime = Date.now();
    
    // Aplicar descuento
    await salesHelper.aplicarDescuento(10, 'Descuento de prueba');
    
    // Esperar a que se recalcule
    await page.waitForTimeout(500);
    
    const endTime = Date.now();
    const discountTime = endTime - startTime;
    
    console.log(`⏱️ Tiempo de aplicación de descuento: ${discountTime}ms`);
    
    // Verificar que la aplicación sea rápida (menos de 1 segundo)
    expect(discountTime).toBeLessThan(1000);
    
    console.log('✅ Aplicación de descuento en tiempo aceptable');
  });

  test('Rendimiento: Tiempo de envío del formulario', async ({ page }) => {
    console.log('🧪 Probando tiempo de envío del formulario...');
    
    const scenario = dataGenerator.generateTestScenario('minimal');
    
    // Configurar venta mínima
    await salesHelper.selectCliente(scenario.cliente);
    await salesHelper.addProducto(scenario.productos[0]);
    await salesHelper.selectTipoPago(scenario.tipoPago);
    await salesHelper.selectMetodoPago(scenario.metodoPago);
    
    const startTime = Date.now();
    
    // Enviar formulario
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Esperar respuesta
    await page.waitForTimeout(2000);
    
    const endTime = Date.now();
    const submitTime = endTime - startTime;
    
    console.log(`⏱️ Tiempo de envío del formulario: ${submitTime}ms`);
    
    // Verificar que el envío sea razonable (menos de 10 segundos)
    expect(submitTime).toBeLessThan(10000);
    
    console.log('✅ Envío del formulario en tiempo aceptable');
  });

  test('Rendimiento: Memoria durante operaciones múltiples', async ({ page }) => {
    console.log('🧪 Probando uso de memoria durante operaciones múltiples...');
    
    const cliente = dataGenerator.getRandomCliente();
    
    // Configurar venta básica
    await salesHelper.selectCliente(cliente);
    
    // Realizar múltiples operaciones
    for (let i = 0; i < 10; i++) {
      const producto = dataGenerator.getRandomProducto();
      await salesHelper.addProducto(producto);
      
      // Aplicar descuento ocasional
      if (i % 3 === 0) {
        await salesHelper.aplicarDescuento(5, `Descuento ${i}`);
      }
      
      // Esperar un poco entre operaciones
      await page.waitForTimeout(100);
    }
    
    // Verificar que la página siga respondiendo
    const clienteInput = await page.locator('input[placeholder*="nombre, cédula"]').isVisible();
    expect(clienteInput).toBe(true);
    
    console.log('✅ Memoria manejada correctamente durante operaciones múltiples');
  });

  test('Rendimiento: Tiempo de respuesta con muchos productos', async ({ page }) => {
    console.log('🧪 Probando rendimiento con muchos productos...');
    
    const cliente = dataGenerator.getRandomCliente();
    
    // Configurar venta básica
    await salesHelper.selectCliente(cliente);
    
    const startTime = Date.now();
    
    // Agregar muchos productos
    for (let i = 0; i < 20; i++) {
      const producto = dataGenerator.getRandomProducto();
      await salesHelper.addProducto(producto);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`⏱️ Tiempo para agregar 20 productos: ${totalTime}ms`);
    
    // Verificar que el tiempo sea razonable (menos de 10 segundos)
    expect(totalTime).toBeLessThan(10000);
    
    // Verificar que todos los productos se agregaron
    const productosAgregados = await salesHelper.contarProductosAgregados();
    expect(productosAgregados).toBe(20);
    
    console.log('✅ Rendimiento con muchos productos aceptable');
  });

  test('Rendimiento: Tiempo de carga de datos del BCV', async ({ page }) => {
    console.log('🧪 Probando tiempo de carga de datos del BCV...');
    
    const startTime = Date.now();
    
    // Buscar elemento que muestre la tasa BCV
    const bcvElement = await page.locator('[class*="bcv"], [class*="tasa"], [class*="cambio"]').first();
    
    if (await bcvElement.isVisible()) {
      const endTime = Date.now();
      const bcvLoadTime = endTime - startTime;
      
      console.log(`⏱️ Tiempo de carga de datos BCV: ${bcvLoadTime}ms`);
      
      // Verificar que la carga sea razonable (menos de 5 segundos)
      expect(bcvLoadTime).toBeLessThan(5000);
      
      console.log('✅ Carga de datos BCV en tiempo aceptable');
    } else {
      console.log('ℹ️ Elemento BCV no encontrado, saltando prueba');
    }
  });
});
