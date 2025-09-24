/**
 * Generador de datos de prueba para el formulario de ventas
 * Genera diferentes combinaciones de datos para probar todos los escenarios
 */

export class TestDataGenerator {
  constructor() {
    this.clientes = [
      { cedula: '12345678', nombre: 'Juan', apellido: 'Pérez', telefono: '123-456-7890', email: 'juan.perez@email.com' },
      { cedula: '87654321', nombre: 'María', apellido: 'García', telefono: '987-654-3210', email: 'maria.garcia@email.com' },
      { cedula: '11223344', nombre: 'Carlos', apellido: 'Rodríguez', telefono: '555-123-4567', email: 'carlos.rodriguez@email.com' }
    ];

    this.productos = [
      { nombre: 'Producto de Prueba 1', precio: 25.99, cantidad: 2 },
      { nombre: 'Producto de Prueba 2', precio: 15.50, cantidad: 1 },
      { nombre: 'Producto de Prueba 3', precio: 45.00, cantidad: 3 },
      { nombre: 'Coca-Cola 2L', precio: 2.50, cantidad: 1 },
      { nombre: 'Pepsi 2L', precio: 2.30, cantidad: 4 }
    ];

    this.metodosPago = ['Efectivo', 'Transferencia', 'Pago Móvil', 'Zelle', 'PayPal', 'Binance', 'Otro'];
    this.tiposPago = ['Contado', 'Abono'];
    this.referencias = ['REF001', 'REF002', 'REF003', 'PM123456', 'ZELLE789', 'TRANSFER456'];
  }

  /**
   * Genera datos de cliente aleatorios
   */
  getRandomCliente() {
    return this.clientes[Math.floor(Math.random() * this.clientes.length)];
  }

  /**
   * Genera datos de producto aleatorios
   */
  getRandomProducto() {
    return this.productos[Math.floor(Math.random() * this.productos.length)];
  }

  /**
   * Genera una referencia de pago aleatoria
   */
  getRandomReferencia() {
    return this.referencias[Math.floor(Math.random() * this.referencias.length)];
  }

  /**
   * Genera un método de pago aleatorio
   */
  getRandomMetodoPago() {
    return this.metodosPago[Math.floor(Math.random() * this.metodosPago.length)];
  }

  /**
   * Genera un tipo de pago aleatorio
   */
  getRandomTipoPago() {
    return this.tiposPago[Math.floor(Math.random() * this.tiposPago.length)];
  }

  /**
   * Genera una tasa de cambio BCV realista
   */
  getRandomTasaBCV() {
    return (Math.random() * 10 + 35).toFixed(2); // Entre 35 y 45 Bs/USD
  }

  /**
   * Genera un monto de descuento aleatorio
   */
  getRandomDescuento() {
    return (Math.random() * 50).toFixed(2); // Entre 0 y 50 USD
  }

  /**
   * Genera un monto de delivery aleatorio
   */
  getRandomDelivery() {
    return (Math.random() * 20 + 5).toFixed(2); // Entre 5 y 25 USD
  }

  /**
   * Genera un escenario de prueba completo
   */
  generateTestScenario(scenarioType = 'random') {
    const cliente = this.getRandomCliente();
    const producto = this.getRandomProducto();
    const metodoPago = this.getRandomMetodoPago();
    const tipoPago = this.getRandomTipoPago();
    const tasaBCV = this.getRandomTasaBCV();

    const baseScenario = {
      cliente,
      productos: [producto],
      metodoPago,
      tipoPago,
      tasaCambioBCV: parseFloat(tasaBCV),
      aplicarIVA: Math.random() > 0.5,
      entregaInmediata: Math.random() > 0.5,
      referenciaPago: this.getRandomReferencia()
    };

    switch (scenarioType) {
      case 'contado_completo':
        return {
          ...baseScenario,
          tipoPago: 'Contado',
          aplicarIVA: true,
          entregaInmediata: true,
          descuento: this.getRandomDescuento(),
          delivery: this.getRandomDelivery()
        };

      case 'abono_simple':
        return {
          ...baseScenario,
          tipoPago: 'Abono',
          metodoPago: 'Transferencia',
          aplicarIVA: false,
          entregaInmediata: false,
          fechaVencimiento: this.getFutureDate(30) // 30 días en el futuro
        };

      case 'abono_mixto':
        return {
          ...baseScenario,
          tipoPago: 'Abono',
          metodoPago: 'Mixto',
          montoAbonoUSD: (Math.random() * 100 + 50).toFixed(2),
          montoAbonoVES: (Math.random() * 2000 + 1000).toFixed(2),
          fechaVencimiento: this.getFutureDate(15)
        };

      case 'pago_mixto':
        return {
          ...baseScenario,
          tipoPago: 'Mixto',
          montoMixtoUSD: (Math.random() * 200 + 100).toFixed(2),
          montoMixtoVES: (Math.random() * 5000 + 2000).toFixed(2)
        };

      case 'con_descuento':
        return {
          ...baseScenario,
          descuento: this.getRandomDescuento(),
          comentariosDescuento: 'Descuento por cliente frecuente'
        };

      case 'con_delivery':
        return {
          ...baseScenario,
          delivery: this.getRandomDelivery(),
          comentariosDelivery: 'Delivery a domicilio'
        };

      case 'minimal':
        return {
          cliente: this.getRandomCliente(),
          productos: [this.getRandomProducto()],
          metodoPago: 'Efectivo',
          tipoPago: 'Contado',
          tasaCambioBCV: 36.50,
          aplicarIVA: false,
          entregaInmediata: true
        };

      default:
        return baseScenario;
    }
  }

  /**
   * Genera múltiples escenarios de prueba
   */
  generateMultipleScenarios(count = 10) {
    const scenarioTypes = [
      'contado_completo',
      'abono_simple', 
      'abono_mixto',
      'pago_mixto',
      'con_descuento',
      'con_delivery',
      'minimal',
      'random'
    ];

    const scenarios = [];
    for (let i = 0; i < count; i++) {
      const scenarioType = scenarioTypes[i % scenarioTypes.length];
      scenarios.push({
        id: i + 1,
        name: `Escenario ${i + 1} - ${scenarioType}`,
        ...this.generateTestScenario(scenarioType)
      });
    }

    return scenarios;
  }

  /**
   * Genera una fecha futura
   */
  getFutureDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Genera datos de producto manual
   */
  generateProductoManual() {
    const productosManuales = [
      'Servicio de instalación',
      'Mantenimiento técnico',
      'Consultoría especializada',
      'Producto personalizado',
      'Servicio de envío express'
    ];

    return {
      descripcion: productosManuales[Math.floor(Math.random() * productosManuales.length)],
      cantidad: Math.floor(Math.random() * 5) + 1,
      precio: (Math.random() * 100 + 25).toFixed(2)
    };
  }
}

export default TestDataGenerator;
