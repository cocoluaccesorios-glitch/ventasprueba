/**
 * Pruebas automatizadas del formulario de ventas
 * Ejecuta múltiples escenarios de prueba con diferentes combinaciones
 */

import { test, expect } from '@playwright/test';
import TestDataGenerator from './utils/testDataGenerator.js';
import SalesFormHelper from './utils/salesFormHelper.js';

test.describe('Formulario de Ventas - Pruebas Automatizadas', () => {
  let testDataGenerator;
  let salesFormHelper;

  test.beforeEach(async ({ page }) => {
    testDataGenerator = new TestDataGenerator();
    salesFormHelper = new SalesFormHelper(page);
  });

  test('Escenario: Venta de Contado Completa', async ({ page }) => {
    const scenario = testDataGenerator.generateTestScenario('contado_completo');
    const result = await salesFormHelper.executeTestScenario(scenario);
    
    expect(result.success).toBe(true);
  });

  test('Escenario: Abono Simple', async ({ page }) => {
    const scenario = testDataGenerator.generateTestScenario('abono_simple');
    const result = await salesFormHelper.executeTestScenario(scenario);
    
    expect(result.success).toBe(true);
  });

  test('Escenario: Abono Mixto', async ({ page }) => {
    const scenario = testDataGenerator.generateTestScenario('abono_mixto');
    const result = await salesFormHelper.executeTestScenario(scenario);
    
    expect(result.success).toBe(true);
  });

  test('Escenario: Pago Mixto', async ({ page }) => {
    const scenario = testDataGenerator.generateTestScenario('pago_mixto');
    const result = await salesFormHelper.executeTestScenario(scenario);
    
    expect(result.success).toBe(true);
  });

  test('Escenario: Con Descuento', async ({ page }) => {
    const scenario = testDataGenerator.generateTestScenario('con_descuento');
    const result = await salesFormHelper.executeTestScenario(scenario);
    
    expect(result.success).toBe(true);
  });

  test('Escenario: Con Delivery', async ({ page }) => {
    const scenario = testDataGenerator.generateTestScenario('con_delivery');
    const result = await salesFormHelper.executeTestScenario(scenario);
    
    expect(result.success).toBe(true);
  });

  test('Escenario: Mínimo', async ({ page }) => {
    const scenario = testDataGenerator.generateTestScenario('minimal');
    const result = await salesFormHelper.executeTestScenario(scenario);
    
    expect(result.success).toBe(true);
  });

  test('Múltiples Escenarios Aleatorios', async ({ page }) => {
    const scenarios = testDataGenerator.generateMultipleScenarios(5);
    const results = [];

    for (const scenario of scenarios) {
      const result = await salesFormHelper.executeTestScenario(scenario);
      results.push(result);
      
      // Esperar un poco entre pruebas
      await page.waitForTimeout(1000);
    }

    // Verificar que al menos el 80% de las pruebas pasen
    const successCount = results.filter(r => r.success).length;
    const successRate = successCount / results.length;
    
    expect(successRate).toBeGreaterThanOrEqual(0.8);
  });

  test('Validación de Campos Obligatorios', async ({ page }) => {
    await salesFormHelper.navigateToCreateSale();
    
    // Intentar enviar formulario vacío
    await salesFormHelper.submitForm();
    
    // Verificar que aparezca error de validación
    const hasErrors = await salesFormHelper.verifyValidationErrors();
    expect(hasErrors).toBe(true);
  });

  test('Búsqueda de Clientes', async ({ page }) => {
    await salesFormHelper.navigateToCreateSale();
    
    const cliente = testDataGenerator.getRandomCliente();
    
    // Buscar cliente por nombre
    await page.fill('input[placeholder*="nombre, cédula o teléfono"]', cliente.nombre);
    await page.waitForTimeout(500);
    
    // Verificar que aparezcan resultados
    const results = await page.locator('.search-result-item').count();
    expect(results).toBeGreaterThan(0);
  });

  test('Búsqueda de Productos', async ({ page }) => {
    await salesFormHelper.navigateToCreateSale();
    
    const producto = testDataGenerator.getRandomProducto();
    
    // Buscar producto
    await page.fill('input[placeholder*="Buscar producto"]', producto.nombre);
    await page.waitForTimeout(500);
    
    // Verificar que aparezcan resultados
    const results = await page.locator('.search-result-item').count();
    expect(results).toBeGreaterThan(0);
  });
});
