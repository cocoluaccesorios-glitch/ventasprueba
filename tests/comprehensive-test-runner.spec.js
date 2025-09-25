/**
 * Ejecutor de Pruebas Comprehensivas
 * Ejecuta todas las pruebas de ventas de manera sistemática
 */

import { test, expect } from '@playwright/test';
import AuthHelper from './utils/authHelper.js';
import ComprehensiveSalesFormHelper from './utils/comprehensiveSalesFormHelper.js';
import ComprehensiveTestDataGenerator from './utils/comprehensiveTestDataGenerator.js';

test.describe('Ejecutor de Pruebas Comprehensivas - Todas las Variantes', () => {
  let authHelper;
  let salesHelper;
  let dataGenerator;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    salesHelper = new ComprehensiveSalesFormHelper(page);
    dataGenerator = new ComprehensiveTestDataGenerator();
    
    // Login y navegar al formulario
    await page.goto('http://localhost:5174/');
    await page.waitForLoadState('networkidle');
    await authHelper.login('admin', 'admin123');
    await page.goto('http://localhost:5174/ventas');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  // ===== PRUEBAS MASIVAS AUTOMATIZADAS =====
  test('Ejecutar Todas las Variantes de Contado', async ({ page }) => {
    console.log('🚀 Iniciando pruebas masivas de Contado...');
    
    const metodosContado = [
      'Efectivo (USD)',
      'Zelle (USD)', 
      'Punto de Venta (VES)',
      'Pago Móvil (VES)',
      'Transferencia (VES)'
    ];

    const variantes = ['basic', 'with_iva', 'with_discount', 'with_delivery', 'complete'];

    for (const metodo of metodosContado) {
      for (const variante of variantes) {
        console.log(`🧪 Probando Contado - ${metodo} - ${variante}`);
        
        // Generar escenario
        const scenario = dataGenerator.generateContadoScenario(variante);
        scenario.metodoPago = metodo;
        
        // Configurar formulario
        await salesHelper.selectCliente(scenario.cliente);
        await salesHelper.addProductoInventario(scenario.productos[0]);
        await salesHelper.selectTipoPago(scenario.tipoPago);
        await salesHelper.selectMetodoPago(scenario.metodoPago);
        
        // Aplicar configuraciones según variante
        if (scenario.aplicaIVA) {
          await salesHelper.aplicarIVA();
        }
        if (scenario.montoDescuento > 0) {
          await salesHelper.aplicarDescuento(scenario.montoDescuento, scenario.comentariosDescuento);
        }
        if (scenario.montoDelivery > 0) {
          await salesHelper.aplicarDelivery(scenario.montoDelivery, scenario.comentariosDelivery);
        }
        if (scenario.referenciaPago) {
          await salesHelper.agregarReferenciaPago(scenario.referenciaPago);
        }
        
        // Verificar formulario
        const isFormValid = await salesHelper.verificarFormularioValido();
        expect(isFormValid).toBe(true);
        
        // Resetear para siguiente prueba
        await salesHelper.resetFormulario();
        await page.waitForTimeout(1000);
        
        console.log(`✅ Contado - ${metodo} - ${variante} - OK`);
      }
    }
    
    console.log('🎉 Todas las pruebas de Contado completadas');
  });

  test('Ejecutar Todas las Variantes de Abono Simple', async ({ page }) => {
    console.log('🚀 Iniciando pruebas masivas de Abono Simple...');
    
    const metodosAbono = [
      'Efectivo (USD)',
      'Zelle (USD)', 
      'Punto de Venta (VES)',
      'Pago Móvil (VES)',
      'Transferencia (VES)'
    ];

    const variantes = ['basic', 'with_iva', 'with_discount', 'with_delivery', 'complete'];

    for (const metodo of metodosAbono) {
      for (const variante of variantes) {
        console.log(`🧪 Probando Abono Simple - ${metodo} - ${variante}`);
        
        // Generar escenario
        const scenario = dataGenerator.generateAbonoSimpleScenario(variante);
        scenario.metodoPagoAbono = metodo;
        
        // Configurar formulario
        await salesHelper.selectCliente(scenario.cliente);
        await salesHelper.addProductoInventario(scenario.productos[0]);
        await salesHelper.selectTipoPago(scenario.tipoPago);
        await salesHelper.selectTipoAbono(scenario.tipoAbono);
        await salesHelper.selectMetodoPagoAbono(scenario.metodoPagoAbono);
        await salesHelper.configurarMontoAbonoSimple(scenario.montoAbonoSimple);
        await salesHelper.configurarFechaVencimiento(scenario.fechaVencimiento);
        
        // Aplicar configuraciones según variante
        if (scenario.aplicaIVA) {
          await salesHelper.aplicarIVA();
        }
        if (scenario.montoDescuento > 0) {
          await salesHelper.aplicarDescuento(scenario.montoDescuento, scenario.comentariosDescuento);
        }
        if (scenario.montoDelivery > 0) {
          await salesHelper.aplicarDelivery(scenario.montoDelivery, scenario.comentariosDelivery);
        }
        if (scenario.referenciaPago) {
          await salesHelper.agregarReferenciaPago(scenario.referenciaPago);
        }
        
        // Verificar formulario
        const isFormValid = await salesHelper.verificarFormularioValido();
        expect(isFormValid).toBe(true);
        
        // Resetear para siguiente prueba
        await salesHelper.resetFormulario();
        await page.waitForTimeout(1000);
        
        console.log(`✅ Abono Simple - ${metodo} - ${variante} - OK`);
      }
    }
    
    console.log('🎉 Todas las pruebas de Abono Simple completadas');
  });

  test('Ejecutar Todas las Variantes de Abono Mixto', async ({ page }) => {
    console.log('🚀 Iniciando pruebas masivas de Abono Mixto...');
    
    const variantes = ['basic', 'usd_only', 'ves_only', 'with_iva', 'complete'];

    for (const variante of variantes) {
      console.log(`🧪 Probando Abono Mixto - ${variante}`);
      
      // Generar escenario
      const scenario = dataGenerator.generateAbonoMixtoScenario(variante);
      
      // Configurar formulario
      await salesHelper.selectCliente(scenario.cliente);
      await salesHelper.addProductoInventario(scenario.productos[0]);
      await salesHelper.selectTipoPago(scenario.tipoPago);
      await salesHelper.selectTipoAbono(scenario.tipoAbono);
      await salesHelper.configurarAbonoMixto(
        scenario.montoAbonoUSD,
        scenario.montoAbonoVES,
        scenario.metodoPagoAbonoUSD,
        scenario.metodoPagoAbonoVES
      );
      await salesHelper.configurarFechaVencimiento(scenario.fechaVencimiento);
      
      // Aplicar configuraciones según variante
      if (scenario.aplicaIVA) {
        await salesHelper.aplicarIVA();
      }
      if (scenario.montoDescuento > 0) {
        await salesHelper.aplicarDescuento(scenario.montoDescuento, scenario.comentariosDescuento);
      }
      if (scenario.montoDelivery > 0) {
        await salesHelper.aplicarDelivery(scenario.montoDelivery, scenario.comentariosDelivery);
      }
      
      // Verificar formulario
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      // Resetear para siguiente prueba
      await salesHelper.resetFormulario();
      await page.waitForTimeout(1000);
      
      console.log(`✅ Abono Mixto - ${variante} - OK`);
    }
    
    console.log('🎉 Todas las pruebas de Abono Mixto completadas');
  });

  test('Ejecutar Todas las Variantes de Pago Mixto', async ({ page }) => {
    console.log('🚀 Iniciando pruebas masivas de Pago Mixto...');
    
    const variantes = ['basic', 'usd_only', 'ves_only', 'with_iva', 'complete'];

    for (const variante of variantes) {
      console.log(`🧪 Probando Pago Mixto - ${variante}`);
      
      // Generar escenario
      const scenario = dataGenerator.generateMixtoScenario(variante);
      
      // Configurar formulario
      await salesHelper.selectCliente(scenario.cliente);
      await salesHelper.addProductoInventario(scenario.productos[0]);
      await salesHelper.selectTipoPago(scenario.tipoPago);
      await salesHelper.configurarPagoMixto(
        scenario.montoMixtoUSD,
        scenario.montoMixtoVES,
        scenario.metodoPagoMixtoUSD,
        scenario.metodoPagoMixtoVES
      );
      
      // Aplicar configuraciones según variante
      if (scenario.aplicaIVA) {
        await salesHelper.aplicarIVA();
      }
      if (scenario.montoDescuento > 0) {
        await salesHelper.aplicarDescuento(scenario.montoDescuento, scenario.comentariosDescuento);
      }
      if (scenario.montoDelivery > 0) {
        await salesHelper.aplicarDelivery(scenario.montoDelivery, scenario.comentariosDelivery);
      }
      
      // Verificar formulario
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      // Resetear para siguiente prueba
      await salesHelper.resetFormulario();
      await page.waitForTimeout(1000);
      
      console.log(`✅ Pago Mixto - ${variante} - OK`);
    }
    
    console.log('🎉 Todas las pruebas de Pago Mixto completadas');
  });

  test('Ejecutar Combinaciones de Productos', async ({ page }) => {
    console.log('🚀 Iniciando pruebas de combinaciones de productos...');
    
    // Productos inventario + manuales
    console.log('🧪 Probando Productos Inventario + Manuales');
    const cliente = dataGenerator.getRandomCliente();
    const productoInventario = dataGenerator.getRandomProductoInventario();
    const productoManual = dataGenerator.generateProductoManual();
    
    await salesHelper.selectCliente(cliente);
    await salesHelper.addProductoInventario(productoInventario);
    await salesHelper.addProductoManual(productoManual);
    await salesHelper.selectTipoPago('Contado');
    await salesHelper.selectMetodoPago('Efectivo (USD)');
    
    const isFormValid = await salesHelper.verificarFormularioValido();
    expect(isFormValid).toBe(true);
    
    await salesHelper.resetFormulario();
    await page.waitForTimeout(1000);
    
    // Múltiples productos inventario
    console.log('🧪 Probando Múltiples Productos Inventario');
    const productosInventario = [
      dataGenerator.getRandomProductoInventario(),
      dataGenerator.getRandomProductoInventario(),
      dataGenerator.getRandomProductoInventario()
    ];
    
    await salesHelper.selectCliente(cliente);
    for (const producto of productosInventario) {
      await salesHelper.addProductoInventario(producto);
    }
    await salesHelper.selectTipoPago('Contado');
    await salesHelper.selectMetodoPago('Efectivo (USD)');
    
    const productosAgregados = await salesHelper.contarProductosAgregados();
    expect(productosAgregados).toBe(productosInventario.length);
    
    const isFormValid2 = await salesHelper.verificarFormularioValido();
    expect(isFormValid2).toBe(true);
    
    await salesHelper.resetFormulario();
    await page.waitForTimeout(1000);
    
    // Múltiples productos manuales
    console.log('🧪 Probando Múltiples Productos Manuales');
    const productosManuales = [
      dataGenerator.generateProductoManual(),
      dataGenerator.generateProductoManual(),
      dataGenerator.generateProductoManual()
    ];
    
    await salesHelper.selectCliente(cliente);
    for (const producto of productosManuales) {
      await salesHelper.addProductoManual(producto);
    }
    await salesHelper.selectTipoPago('Contado');
    await salesHelper.selectMetodoPago('Efectivo (USD)');
    
    const productosAgregados2 = await salesHelper.contarProductosAgregados();
    expect(productosAgregados2).toBe(productosManuales.length);
    
    const isFormValid3 = await salesHelper.verificarFormularioValido();
    expect(isFormValid3).toBe(true);
    
    console.log('🎉 Todas las pruebas de combinaciones de productos completadas');
  });

  test('Ejecutar Pruebas de Registro Real', async ({ page }) => {
    console.log('🚀 Iniciando pruebas de registro real...');
    
    // Registrar venta contado completa
    console.log('🧪 Registrando Venta Contado Completa');
    const scenarioContado = dataGenerator.generateContadoScenario('complete');
    
    await salesHelper.selectCliente(scenarioContado.cliente);
    await salesHelper.addProductoInventario(scenarioContado.productos[0]);
    await salesHelper.selectTipoPago(scenarioContado.tipoPago);
    await salesHelper.selectMetodoPago(scenarioContado.metodoPago);
    await salesHelper.aplicarIVA();
    await salesHelper.aplicarDescuento(scenarioContado.montoDescuento, scenarioContado.comentariosDescuento);
    await salesHelper.aplicarDelivery(scenarioContado.montoDelivery, scenarioContado.comentariosDelivery);
    
    const isFormValid1 = await salesHelper.verificarFormularioValido();
    expect(isFormValid1).toBe(true);
    
    await salesHelper.registrarVenta();
    
    // Verificar que se registró correctamente
    await page.waitForTimeout(2000);
    const successMessage1 = await page.locator('.swal2-title').textContent();
    expect(successMessage1).toContain('Venta Registrada');
    
    console.log('✅ Venta Contado Completa registrada exitosamente');
    
    // Navegar de nuevo al formulario
    await page.goto('http://localhost:5174/ventas');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Registrar venta abono simple
    console.log('🧪 Registrando Venta Abono Simple');
    const scenarioAbono = dataGenerator.generateAbonoSimpleScenario('complete');
    
    await salesHelper.selectCliente(scenarioAbono.cliente);
    await salesHelper.addProductoInventario(scenarioAbono.productos[0]);
    await salesHelper.selectTipoPago(scenarioAbono.tipoPago);
    await salesHelper.selectTipoAbono(scenarioAbono.tipoAbono);
    await salesHelper.selectMetodoPagoAbono(scenarioAbono.metodoPagoAbono);
    await salesHelper.configurarMontoAbonoSimple(scenarioAbono.montoAbonoSimple);
    await salesHelper.configurarFechaVencimiento(scenarioAbono.fechaVencimiento);
    await salesHelper.aplicarIVA();
    
    const isFormValid2 = await salesHelper.verificarFormularioValido();
    expect(isFormValid2).toBe(true);
    
    await salesHelper.registrarVenta();
    
    // Verificar que se registró correctamente
    await page.waitForTimeout(2000);
    const successMessage2 = await page.locator('.swal2-title').textContent();
    expect(successMessage2).toContain('Venta Registrada');
    
    console.log('✅ Venta Abono Simple registrada exitosamente');
    
    // Navegar de nuevo al formulario
    await page.goto('http://localhost:5174/ventas');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Registrar venta mixta
    console.log('🧪 Registrando Venta Mixta');
    const scenarioMixto = dataGenerator.generateMixtoScenario('complete');
    
    await salesHelper.selectCliente(scenarioMixto.cliente);
    await salesHelper.addProductoInventario(scenarioMixto.productos[0]);
    await salesHelper.selectTipoPago(scenarioMixto.tipoPago);
    await salesHelper.configurarPagoMixto(
      scenarioMixto.montoMixtoUSD,
      scenarioMixto.montoMixtoVES,
      scenarioMixto.metodoPagoMixtoUSD,
      scenarioMixto.metodoPagoMixtoVES
    );
    await salesHelper.aplicarIVA();
    
    const isFormValid3 = await salesHelper.verificarFormularioValido();
    expect(isFormValid3).toBe(true);
    
    await salesHelper.registrarVenta();
    
    // Verificar que se registró correctamente
    await page.waitForTimeout(2000);
    const successMessage3 = await page.locator('.swal2-title').textContent();
    expect(successMessage3).toContain('Venta Registrada');
    
    console.log('✅ Venta Mixta registrada exitosamente');
    console.log('🎉 Todas las pruebas de registro real completadas');
  });

  test('Ejecutar Pruebas de Validación de Errores', async ({ page }) => {
    console.log('🚀 Iniciando pruebas de validación de errores...');
    
    const errorScenarios = dataGenerator.generateErrorScenarios();
    
    for (const scenario of errorScenarios) {
      console.log(`🧪 Probando escenario de error: ${scenario.name}`);
      
      // Configurar escenario que debería generar error
      if (scenario.cliente.cedula) {
        await salesHelper.selectCliente(scenario.cliente);
      }
      
      for (const producto of scenario.productos) {
        await salesHelper.addProductoInventario(producto);
      }
      
      if (scenario.tipoPago) {
        await salesHelper.selectTipoPago(scenario.tipoPago);
      }
      
      if (scenario.metodoPago) {
        await salesHelper.selectMetodoPago(scenario.metodoPago);
      }
      
      if (scenario.referenciaPago !== undefined) {
        await salesHelper.agregarReferenciaPago(scenario.referenciaPago);
      }
      
      // Intentar registrar (debería fallar)
      await salesHelper.registrarVenta();
      
      // Verificar que aparece mensaje de error
      await page.waitForTimeout(1000);
      const errorMessage = await page.locator('.swal2-title').textContent();
      expect(errorMessage).toContain('Error');
      
      // Cerrar modal de error
      await page.click('.swal2-confirm');
      
      // Resetear formulario
      await salesHelper.resetFormulario();
      await page.waitForTimeout(1000);
      
      console.log(`✅ Escenario de error: ${scenario.name} - OK`);
    }
    
    console.log('🎉 Todas las pruebas de validación de errores completadas');
  });
});
