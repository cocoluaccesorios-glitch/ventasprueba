/**
 * Pruebas Comprehensivas de Ventas - Todas las Variantes
 * Este archivo contiene pruebas que cubren TODAS las combinaciones posibles
 * de formularios de pedidos para detectar bugs en el registro
 */

import { test, expect } from '@playwright/test';
import AuthHelper from './utils/authHelper.js';
import SalesFormHelper from './utils/salesFormHelper.js';
import TestDataGenerator from './utils/testDataGenerator.js';

test.describe('Pruebas Comprehensivas de Ventas - Todas las Variantes', () => {
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

  // ===== GRUPO 1: VENTAS AL CONTADO =====
  test.describe('Ventas al Contado - Todos los Métodos', () => {
    const metodosContado = [
      'Efectivo (USD)',
      'Zelle (USD)', 
      'Punto de Venta (VES)',
      'Pago Móvil (VES)',
      'Transferencia (VES)'
    ];

    metodosContado.forEach(metodo => {
      test(`Contado - ${metodo} - Básico`, async ({ page }) => {
        console.log(`🧪 Probando Contado - ${metodo} - Básico`);
        
        const cliente = dataGenerator.getRandomCliente();
        const producto = dataGenerator.getRandomProducto();
        
        await salesHelper.selectCliente(cliente);
        await salesHelper.addProducto(producto);
        await salesHelper.selectTipoPago('Contado');
        await salesHelper.selectMetodoPago(metodo);
        
        // Agregar referencia si es requerida
        if (['Zelle (USD)', 'Pago Móvil (VES)', 'Transferencia (VES)', 'Punto de Venta (VES)'].includes(metodo)) {
          await salesHelper.agregarReferenciaPago(dataGenerator.getRandomReferencia());
        }
        
        const isFormValid = await salesHelper.verificarFormularioValido();
        expect(isFormValid).toBe(true);
        
        console.log(`✅ Contado - ${metodo} - Básico configurado`);
      });

      test(`Contado - ${metodo} - Con IVA`, async ({ page }) => {
        console.log(`🧪 Probando Contado - ${metodo} - Con IVA`);
        
        const cliente = dataGenerator.getRandomCliente();
        const producto = dataGenerator.getRandomProducto();
        
        await salesHelper.selectCliente(cliente);
        await salesHelper.addProducto(producto);
        await salesHelper.selectTipoPago('Contado');
        await salesHelper.selectMetodoPago(metodo);
        await salesHelper.aplicarIVA();
        
        if (['Zelle (USD)', 'Pago Móvil (VES)', 'Transferencia (VES)', 'Punto de Venta (VES)'].includes(metodo)) {
          await salesHelper.agregarReferenciaPago(dataGenerator.getRandomReferencia());
        }
        
        const isFormValid = await salesHelper.verificarFormularioValido();
        expect(isFormValid).toBe(true);
        
        console.log(`✅ Contado - ${metodo} - Con IVA configurado`);
      });

      test(`Contado - ${metodo} - Con Descuento`, async ({ page }) => {
        console.log(`🧪 Probando Contado - ${metodo} - Con Descuento`);
        
        const cliente = dataGenerator.getRandomCliente();
        const producto = dataGenerator.getRandomProducto();
        
        await salesHelper.selectCliente(cliente);
        await salesHelper.addProducto(producto);
        await salesHelper.selectTipoPago('Contado');
        await salesHelper.selectMetodoPago(metodo);
        await salesHelper.aplicarDescuento(dataGenerator.getRandomDescuento(), 'Descuento por cliente frecuente');
        
        if (['Zelle (USD)', 'Pago Móvil (VES)', 'Transferencia (VES)', 'Punto de Venta (VES)'].includes(metodo)) {
          await salesHelper.agregarReferenciaPago(dataGenerator.getRandomReferencia());
        }
        
        const isFormValid = await salesHelper.verificarFormularioValido();
        expect(isFormValid).toBe(true);
        
        console.log(`✅ Contado - ${metodo} - Con Descuento configurado`);
      });

      test(`Contado - ${metodo} - Con Delivery`, async ({ page }) => {
        console.log(`🧪 Probando Contado - ${metodo} - Con Delivery`);
        
        const cliente = dataGenerator.getRandomCliente();
        const producto = dataGenerator.getRandomProducto();
        
        await salesHelper.selectCliente(cliente);
        await salesHelper.addProducto(producto);
        await salesHelper.selectTipoPago('Contado');
        await salesHelper.selectMetodoPago(metodo);
        await salesHelper.aplicarDelivery(dataGenerator.getRandomDelivery(), 'Delivery a domicilio');
        
        if (['Zelle (USD)', 'Pago Móvil (VES)', 'Transferencia (VES)', 'Punto de Venta (VES)'].includes(metodo)) {
          await salesHelper.agregarReferenciaPago(dataGenerator.getRandomReferencia());
        }
        
        const isFormValid = await salesHelper.verificarFormularioValido();
        expect(isFormValid).toBe(true);
        
        console.log(`✅ Contado - ${metodo} - Con Delivery configurado`);
      });

      test(`Contado - ${metodo} - Completo (IVA + Descuento + Delivery)`, async ({ page }) => {
        console.log(`🧪 Probando Contado - ${metodo} - Completo`);
        
        const cliente = dataGenerator.getRandomCliente();
        const producto = dataGenerator.getRandomProducto();
        
        await salesHelper.selectCliente(cliente);
        await salesHelper.addProducto(producto);
        await salesHelper.selectTipoPago('Contado');
        await salesHelper.selectMetodoPago(metodo);
        await salesHelper.aplicarIVA();
        await salesHelper.aplicarDescuento(dataGenerator.getRandomDescuento(), 'Descuento por cliente frecuente');
        await salesHelper.aplicarDelivery(dataGenerator.getRandomDelivery(), 'Delivery a domicilio');
        
        if (['Zelle (USD)', 'Pago Móvil (VES)', 'Transferencia (VES)', 'Punto de Venta (VES)'].includes(metodo)) {
          await salesHelper.agregarReferenciaPago(dataGenerator.getRandomReferencia());
        }
        
        const isFormValid = await salesHelper.verificarFormularioValido();
        expect(isFormValid).toBe(true);
        
        console.log(`✅ Contado - ${metodo} - Completo configurado`);
      });
    });
  });

  // ===== GRUPO 2: VENTAS A ABONO SIMPLE =====
  test.describe('Ventas a Abono Simple - Todos los Métodos', () => {
    const metodosAbono = [
      'Efectivo (USD)',
      'Zelle (USD)', 
      'Punto de Venta (VES)',
      'Pago Móvil (VES)',
      'Transferencia (VES)'
    ];

    metodosAbono.forEach(metodo => {
      test(`Abono Simple - ${metodo} - Básico`, async ({ page }) => {
        console.log(`🧪 Probando Abono Simple - ${metodo} - Básico`);
        
        const cliente = dataGenerator.getRandomCliente();
        const producto = dataGenerator.getRandomProducto();
        
        await salesHelper.selectCliente(cliente);
        await salesHelper.addProducto(producto);
        await salesHelper.selectTipoPago('Abono');
        await salesHelper.selectTipoAbono('simple');
        await salesHelper.selectMetodoPagoAbono(metodo);
        await salesHelper.configurarMontoAbonoSimple(50.00);
        await salesHelper.configurarFechaVencimiento(dataGenerator.getFutureDate(30));
        
        if (['Zelle (USD)', 'Pago Móvil (VES)', 'Transferencia (VES)', 'Punto de Venta (VES)'].includes(metodo)) {
          await salesHelper.agregarReferenciaPago(dataGenerator.getRandomReferencia());
        }
        
        const isFormValid = await salesHelper.verificarFormularioValido();
        expect(isFormValid).toBe(true);
        
        console.log(`✅ Abono Simple - ${metodo} - Básico configurado`);
      });

      test(`Abono Simple - ${metodo} - Con IVA`, async ({ page }) => {
        console.log(`🧪 Probando Abono Simple - ${metodo} - Con IVA`);
        
        const cliente = dataGenerator.getRandomCliente();
        const producto = dataGenerator.getRandomProducto();
        
        await salesHelper.selectCliente(cliente);
        await salesHelper.addProducto(producto);
        await salesHelper.selectTipoPago('Abono');
        await salesHelper.selectTipoAbono('simple');
        await salesHelper.selectMetodoPagoAbono(metodo);
        await salesHelper.configurarMontoAbonoSimple(75.00);
        await salesHelper.configurarFechaVencimiento(dataGenerator.getFutureDate(30));
        await salesHelper.aplicarIVA();
        
        if (['Zelle (USD)', 'Pago Móvil (VES)', 'Transferencia (VES)', 'Punto de Venta (VES)'].includes(metodo)) {
          await salesHelper.agregarReferenciaPago(dataGenerator.getRandomReferencia());
        }
        
        const isFormValid = await salesHelper.verificarFormularioValido();
        expect(isFormValid).toBe(true);
        
        console.log(`✅ Abono Simple - ${metodo} - Con IVA configurado`);
      });
    });
  });

  // ===== GRUPO 3: VENTAS A ABONO MIXTO =====
  test.describe('Ventas a Abono Mixto', () => {
    test('Abono Mixto - USD + VES - Básico', async ({ page }) => {
      console.log('🧪 Probando Abono Mixto - USD + VES - Básico');
      
      const cliente = dataGenerator.getRandomCliente();
      const producto = dataGenerator.getRandomProducto();
      
      await salesHelper.selectCliente(cliente);
      await salesHelper.addProducto(producto);
      await salesHelper.selectTipoPago('Abono');
      await salesHelper.selectTipoAbono('mixto');
      await salesHelper.configurarAbonoMixto(50.00, 1500.00, 'Efectivo (USD)', 'Pago Móvil (VES)');
      await salesHelper.configurarFechaVencimiento(dataGenerator.getFutureDate(30));
      
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      console.log('✅ Abono Mixto - USD + VES - Básico configurado');
    });

    test('Abono Mixto - Solo USD', async ({ page }) => {
      console.log('🧪 Probando Abono Mixto - Solo USD');
      
      const cliente = dataGenerator.getRandomCliente();
      const producto = dataGenerator.getRandomProducto();
      
      await salesHelper.selectCliente(cliente);
      await salesHelper.addProducto(producto);
      await salesHelper.selectTipoPago('Abono');
      await salesHelper.selectTipoAbono('mixto');
      await salesHelper.configurarAbonoMixto(100.00, 0, 'Zelle (USD)', null);
      await salesHelper.configurarFechaVencimiento(dataGenerator.getFutureDate(30));
      
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      console.log('✅ Abono Mixto - Solo USD configurado');
    });

    test('Abono Mixto - Solo VES', async ({ page }) => {
      console.log('🧪 Probando Abono Mixto - Solo VES');
      
      const cliente = dataGenerator.getRandomCliente();
      const producto = dataGenerator.getRandomProducto();
      
      await salesHelper.selectCliente(cliente);
      await salesHelper.addProducto(producto);
      await salesHelper.selectTipoPago('Abono');
      await salesHelper.selectTipoAbono('mixto');
      await salesHelper.configurarAbonoMixto(0, 3000.00, null, 'Transferencia (VES)');
      await salesHelper.configurarFechaVencimiento(dataGenerator.getFutureDate(30));
      
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      console.log('✅ Abono Mixto - Solo VES configurado');
    });
  });

  // ===== GRUPO 4: VENTAS MIXTAS (CONTADO + CRÉDITO) =====
  test.describe('Ventas Mixtas - Contado + Crédito', () => {
    test('Mixto - USD + VES - Básico', async ({ page }) => {
      console.log('🧪 Probando Mixto - USD + VES - Básico');
      
      const cliente = dataGenerator.getRandomCliente();
      const producto = dataGenerator.getRandomProducto();
      
      await salesHelper.selectCliente(cliente);
      await salesHelper.addProducto(producto);
      await salesHelper.selectTipoPago('Mixto');
      await salesHelper.configurarPagoMixto(100.00, 2000.00, 'Efectivo (USD)', 'Pago Móvil (VES)');
      
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      console.log('✅ Mixto - USD + VES - Básico configurado');
    });

    test('Mixto - Solo USD', async ({ page }) => {
      console.log('🧪 Probando Mixto - Solo USD');
      
      const cliente = dataGenerator.getRandomCliente();
      const producto = dataGenerator.getRandomProducto();
      
      await salesHelper.selectCliente(cliente);
      await salesHelper.addProducto(producto);
      await salesHelper.selectTipoPago('Mixto');
      await salesHelper.configurarPagoMixto(150.00, 0, 'Zelle (USD)', null);
      
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      console.log('✅ Mixto - Solo USD configurado');
    });

    test('Mixto - Solo VES', async ({ page }) => {
      console.log('🧪 Probando Mixto - Solo VES');
      
      const cliente = dataGenerator.getRandomCliente();
      const producto = dataGenerator.getRandomProducto();
      
      await salesHelper.selectCliente(cliente);
      await salesHelper.addProducto(producto);
      await salesHelper.selectTipoPago('Mixto');
      await salesHelper.configurarPagoMixto(0, 4000.00, null, 'Transferencia (VES)');
      
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      console.log('✅ Mixto - Solo VES configurado');
    });
  });

  // ===== GRUPO 5: COMBINACIONES DE PRODUCTOS =====
  test.describe('Combinaciones de Productos', () => {
    test('Producto Inventario + Producto Manual', async ({ page }) => {
      console.log('🧪 Probando Producto Inventario + Producto Manual');
      
      const cliente = dataGenerator.getRandomCliente();
      const productoInventario = dataGenerator.getRandomProducto();
      const productoManual = dataGenerator.generateProductoManual();
      
      await salesHelper.selectCliente(cliente);
      await salesHelper.addProducto(productoInventario);
      await salesHelper.addProductoManual(productoManual);
      await salesHelper.selectTipoPago('Contado');
      await salesHelper.selectMetodoPago('Efectivo (USD)');
      
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      console.log('✅ Producto Inventario + Producto Manual configurado');
    });

    test('Múltiples Productos Inventario', async ({ page }) => {
      console.log('🧪 Probando Múltiples Productos Inventario');
      
      const cliente = dataGenerator.getRandomCliente();
      const productos = [
        dataGenerator.getRandomProducto(),
        dataGenerator.getRandomProducto(),
        dataGenerator.getRandomProducto()
      ];
      
      await salesHelper.selectCliente(cliente);
      for (const producto of productos) {
        await salesHelper.addProducto(producto);
      }
      await salesHelper.selectTipoPago('Contado');
      await salesHelper.selectMetodoPago('Efectivo (USD)');
      
      const productosAgregados = await salesHelper.contarProductosAgregados();
      expect(productosAgregados).toBe(productos.length);
      
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      console.log('✅ Múltiples Productos Inventario configurado');
    });

    test('Múltiples Productos Manuales', async ({ page }) => {
      console.log('🧪 Probando Múltiples Productos Manuales');
      
      const cliente = dataGenerator.getRandomCliente();
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
      
      const productosAgregados = await salesHelper.contarProductosAgregados();
      expect(productosAgregados).toBe(productosManuales.length);
      
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      console.log('✅ Múltiples Productos Manuales configurado');
    });
  });

  // ===== GRUPO 6: ESCENARIOS DE ENTREGA =====
  test.describe('Escenarios de Entrega', () => {
    test('Entrega Inmediata', async ({ page }) => {
      console.log('🧪 Probando Entrega Inmediata');
      
      const cliente = dataGenerator.getRandomCliente();
      const producto = dataGenerator.getRandomProducto();
      
      await salesHelper.selectCliente(cliente);
      await salesHelper.addProducto(producto);
      await salesHelper.selectTipoPago('Contado');
      await salesHelper.selectMetodoPago('Efectivo (USD)');
      await salesHelper.marcarEntregaInmediata();
      
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      console.log('✅ Entrega Inmediata configurado');
    });

    test('Entrega Diferida', async ({ page }) => {
      console.log('🧪 Probando Entrega Diferida');
      
      const cliente = dataGenerator.getRandomCliente();
      const producto = dataGenerator.getRandomProducto();
      
      await salesHelper.selectCliente(cliente);
      await salesHelper.addProducto(producto);
      await salesHelper.selectTipoPago('Contado');
      await salesHelper.selectMetodoPago('Efectivo (USD)');
      await salesHelper.marcarEntregaDiferida();
      
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      console.log('✅ Entrega Diferida configurado');
    });
  });

  // ===== GRUPO 7: ESCENARIOS DE VALIDACIÓN =====
  test.describe('Escenarios de Validación', () => {
    test('Formulario Mínimo Válido', async ({ page }) => {
      console.log('🧪 Probando Formulario Mínimo Válido');
      
      const cliente = dataGenerator.getRandomCliente();
      const producto = dataGenerator.getRandomProducto();
      
      await salesHelper.selectCliente(cliente);
      await salesHelper.addProducto(producto);
      await salesHelper.selectTipoPago('Contado');
      await salesHelper.selectMetodoPago('Efectivo (USD)');
      
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      console.log('✅ Formulario Mínimo Válido configurado');
    });

    test('Formulario Completo Máximo', async ({ page }) => {
      console.log('🧪 Probando Formulario Completo Máximo');
      
      const cliente = dataGenerator.getRandomCliente();
      const productos = [
        dataGenerator.getRandomProducto(),
        dataGenerator.generateProductoManual()
      ];
      
      await salesHelper.selectCliente(cliente);
      for (const producto of productos) {
        if (producto.descripcion) {
          await salesHelper.addProductoManual(producto);
        } else {
          await salesHelper.addProducto(producto);
        }
      }
      
      await salesHelper.selectTipoPago('Contado');
      await salesHelper.selectMetodoPago('Zelle (USD)');
      await salesHelper.agregarReferenciaPago(dataGenerator.getRandomReferencia());
      await salesHelper.aplicarIVA();
      await salesHelper.aplicarDescuento(dataGenerator.getRandomDescuento(), 'Descuento por cliente frecuente');
      await salesHelper.aplicarDelivery(dataGenerator.getRandomDelivery(), 'Delivery a domicilio');
      await salesHelper.marcarEntregaInmediata();
      
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      console.log('✅ Formulario Completo Máximo configurado');
    });
  });

  // ===== GRUPO 8: PRUEBAS DE REGISTRO REAL =====
  test.describe('Pruebas de Registro Real', () => {
    test('Registrar Venta Contado Completa', async ({ page }) => {
      console.log('🧪 Registrando Venta Contado Completa');
      
      const cliente = dataGenerator.getRandomCliente();
      const producto = dataGenerator.getRandomProducto();
      
      await salesHelper.selectCliente(cliente);
      await salesHelper.addProducto(producto);
      await salesHelper.selectTipoPago('Contado');
      await salesHelper.selectMetodoPago('Efectivo (USD)');
      await salesHelper.aplicarIVA();
      
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      // Intentar registrar la venta
      await salesHelper.registrarVenta();
      
      // Verificar que se registró correctamente
      await page.waitForTimeout(2000);
      const successMessage = await page.locator('.swal2-title').textContent();
      expect(successMessage).toContain('Venta Registrada');
      
      console.log('✅ Venta Contado Completa registrada exitosamente');
    });

    test('Registrar Venta Abono Simple', async ({ page }) => {
      console.log('🧪 Registrando Venta Abono Simple');
      
      const cliente = dataGenerator.getRandomCliente();
      const producto = dataGenerator.getRandomProducto();
      
      await salesHelper.selectCliente(cliente);
      await salesHelper.addProducto(producto);
      await salesHelper.selectTipoPago('Abono');
      await salesHelper.selectTipoAbono('simple');
      await salesHelper.selectMetodoPagoAbono('Efectivo (USD)');
      await salesHelper.configurarMontoAbonoSimple(50.00);
      await salesHelper.configurarFechaVencimiento(dataGenerator.getFutureDate(30));
      
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      // Intentar registrar la venta
      await salesHelper.registrarVenta();
      
      // Verificar que se registró correctamente
      await page.waitForTimeout(2000);
      const successMessage = await page.locator('.swal2-title').textContent();
      expect(successMessage).toContain('Venta Registrada');
      
      console.log('✅ Venta Abono Simple registrada exitosamente');
    });

    test('Registrar Venta Mixta', async ({ page }) => {
      console.log('🧪 Registrando Venta Mixta');
      
      const cliente = dataGenerator.getRandomCliente();
      const producto = dataGenerator.getRandomProducto();
      
      await salesHelper.selectCliente(cliente);
      await salesHelper.addProducto(producto);
      await salesHelper.selectTipoPago('Mixto');
      await salesHelper.configurarPagoMixto(100.00, 2000.00, 'Efectivo (USD)', 'Pago Móvil (VES)');
      
      const isFormValid = await salesHelper.verificarFormularioValido();
      expect(isFormValid).toBe(true);
      
      // Intentar registrar la venta
      await salesHelper.registrarVenta();
      
      // Verificar que se registró correctamente
      await page.waitForTimeout(2000);
      const successMessage = await page.locator('.swal2-title').textContent();
      expect(successMessage).toContain('Venta Registrada');
      
      console.log('✅ Venta Mixta registrada exitosamente');
    });
  });
});
