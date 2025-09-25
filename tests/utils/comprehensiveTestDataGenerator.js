/**
 * Generador de Datos de Prueba Comprehensivo
 * Genera datos para TODAS las variantes posibles de formularios de pedidos
 */

export class ComprehensiveTestDataGenerator {
  constructor() {
    this.clientes = [
      { cedula: '12345678', nombre: 'Juan', apellido: 'Pérez', telefono: '123-456-7890', email: 'juan.perez@email.com', direccion: 'Av. Principal 123' },
      { cedula: '87654321', nombre: 'María', apellido: 'García', telefono: '987-654-3210', email: 'maria.garcia@email.com', direccion: 'Calle Secundaria 456' },
      { cedula: '11223344', nombre: 'Carlos', apellido: 'Rodríguez', telefono: '555-123-4567', email: 'carlos.rodriguez@email.com', direccion: 'Plaza Central 789' },
      { cedula: '55667788', nombre: 'Ana', apellido: 'López', telefono: '444-555-6666', email: 'ana.lopez@email.com', direccion: 'Urbanización Los Pinos' },
      { cedula: '99887766', nombre: 'Luis', apellido: 'Silva', telefono: '777-888-9999', email: 'luis.silva@email.com', direccion: 'Residencia El Paraíso' }
    ];

    this.productosInventario = [
      { id: 1, nombre: 'Coca-Cola 2L', sku: 'COCA-2L', precio: 2.50, stock: 50 },
      { id: 2, nombre: 'Pepsi 2L', sku: 'PEPSI-2L', precio: 2.30, stock: 30 },
      { id: 3, nombre: 'Galletas Oreo', sku: 'OREO-001', precio: 3.50, stock: 25 },
      { id: 4, nombre: 'Leche Parmalat 1L', sku: 'LECHE-1L', precio: 1.80, stock: 40 },
      { id: 5, nombre: 'Pan Bimbo', sku: 'PAN-BIMBO', precio: 1.20, stock: 60 },
      { id: 6, nombre: 'Café Fama de América', sku: 'CAFE-FAMA', precio: 4.50, stock: 20 },
      { id: 7, nombre: 'Aceite Mazola', sku: 'ACEITE-MAZ', precio: 2.80, stock: 35 },
      { id: 8, nombre: 'Arroz Primor', sku: 'ARROZ-PRI', precio: 1.50, stock: 80 },
      { id: 9, nombre: 'Azúcar Refinada', sku: 'AZUCAR-REF', precio: 1.00, stock: 100 },
      { id: 10, nombre: 'Sal Marina', sku: 'SAL-MAR', precio: 0.80, stock: 75 }
    ];

    this.productosManuales = [
      'Servicio de instalación',
      'Mantenimiento técnico',
      'Consultoría especializada',
      'Producto personalizado',
      'Servicio de envío express',
      'Reparación de equipos',
      'Asesoría técnica',
      'Servicio de limpieza',
      'Instalación de software',
      'Capacitación personalizada'
    ];

    // Métodos de pago actualizados según la aplicación
    this.metodosPagoUSD = [
      'Efectivo (USD)',
      'Zelle (USD)'
    ];

    this.metodosPagoVES = [
      'Punto de Venta (VES)',
      'Pago Móvil (VES)',
      'Transferencia (VES)'
    ];

    this.todosMetodosPago = [
      ...this.metodosPagoUSD,
      ...this.metodosPagoVES
    ];

    this.tiposPago = ['Contado', 'Abono', 'Mixto'];
    this.tiposAbono = ['simple', 'mixto'];

    this.referencias = [
      'REF001', 'REF002', 'REF003', 'PM123456', 'ZELLE789', 'TRANSFER456',
      'PM987654', 'ZELLE321', 'TRANSFER789', 'POS001', 'POS002', 'POS003'
    ];

    this.comentariosDescuento = [
      'Descuento por cliente frecuente',
      'Descuento por volumen',
      'Descuento promocional',
      'Descuento por pago anticipado',
      'Descuento por cliente VIP'
    ];

    this.comentariosDelivery = [
      'Delivery a domicilio',
      'Envío express',
      'Entrega programada',
      'Delivery urgente',
      'Entrega en oficina'
    ];

    this.comentariosGenerales = [
      'Cliente preferencial',
      'Venta especial',
      'Producto con garantía extendida',
      'Entrega coordinada',
      'Facturación especial'
    ];
  }

  /**
   * Genera datos de cliente aleatorios
   */
  getRandomCliente() {
    return this.clientes[Math.floor(Math.random() * this.clientes.length)];
  }

  /**
   * Genera datos de producto de inventario aleatorios
   */
  getRandomProductoInventario() {
    return this.productosInventario[Math.floor(Math.random() * this.productosInventario.length)];
  }

  /**
   * Genera datos de producto manual aleatorios
   */
  generateProductoManual() {
    return {
      descripcion: this.productosManuales[Math.floor(Math.random() * this.productosManuales.length)],
      cantidad: Math.floor(Math.random() * 5) + 1,
      precio: parseFloat((Math.random() * 100 + 25).toFixed(2))
    };
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
    return this.todosMetodosPago[Math.floor(Math.random() * this.todosMetodosPago.length)];
  }

  /**
   * Genera un método de pago USD aleatorio
   */
  getRandomMetodoPagoUSD() {
    return this.metodosPagoUSD[Math.floor(Math.random() * this.metodosPagoUSD.length)];
  }

  /**
   * Genera un método de pago VES aleatorio
   */
  getRandomMetodoPagoVES() {
    return this.metodosPagoVES[Math.floor(Math.random() * this.metodosPagoVES.length)];
  }

  /**
   * Genera un tipo de pago aleatorio
   */
  getRandomTipoPago() {
    return this.tiposPago[Math.floor(Math.random() * this.tiposPago.length)];
  }

  /**
   * Genera un tipo de abono aleatorio
   */
  getRandomTipoAbono() {
    return this.tiposAbono[Math.floor(Math.random() * this.tiposAbono.length)];
  }

  /**
   * Genera una tasa de cambio BCV realista
   */
  getRandomTasaBCV() {
    return parseFloat((Math.random() * 10 + 35).toFixed(2)); // Entre 35 y 45 Bs/USD
  }

  /**
   * Genera un monto de descuento aleatorio
   */
  getRandomDescuento() {
    return parseFloat((Math.random() * 50).toFixed(2)); // Entre 0 y 50 USD
  }

  /**
   * Genera un monto de delivery aleatorio
   */
  getRandomDelivery() {
    return parseFloat((Math.random() * 20 + 5).toFixed(2)); // Entre 5 y 25 USD
  }

  /**
   * Genera un monto de abono aleatorio
   */
  getRandomMontoAbono() {
    return parseFloat((Math.random() * 200 + 50).toFixed(2)); // Entre 50 y 250 USD
  }

  /**
   * Genera un monto en VES aleatorio
   */
  getRandomMontoVES() {
    return parseFloat((Math.random() * 5000 + 1000).toFixed(2)); // Entre 1000 y 6000 VES
  }

  /**
   * Genera comentarios aleatorios
   */
  getRandomComentariosDescuento() {
    return this.comentariosDescuento[Math.floor(Math.random() * this.comentariosDescuento.length)];
  }

  getRandomComentariosDelivery() {
    return this.comentariosDelivery[Math.floor(Math.random() * this.comentariosDelivery.length)];
  }

  getRandomComentariosGenerales() {
    return this.comentariosGenerales[Math.floor(Math.random() * this.comentariosGenerales.length)];
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
   * Genera escenarios específicos para cada tipo de venta
   */
  generateContadoScenario(variant = 'basic') {
    const cliente = this.getRandomCliente();
    const producto = this.getRandomProductoInventario();
    const metodoPago = this.getRandomMetodoPago();

    const baseScenario = {
      cliente,
      productos: [producto],
      tipoPago: 'Contado',
      metodoPago,
      tasaBCV: this.getRandomTasaBCV(),
      entregaInmediata: true,
      aplicaIVA: false,
      montoDescuento: 0,
      montoDelivery: 0,
      comentariosDescuento: '',
      comentariosDelivery: '',
      comentariosGenerales: ''
    };

    switch (variant) {
      case 'basic':
        return baseScenario;

      case 'with_iva':
        return {
          ...baseScenario,
          aplicaIVA: true
        };

      case 'with_discount':
        return {
          ...baseScenario,
          montoDescuento: this.getRandomDescuento(),
          comentariosDescuento: this.getRandomComentariosDescuento()
        };

      case 'with_delivery':
        return {
          ...baseScenario,
          montoDelivery: this.getRandomDelivery(),
          comentariosDelivery: this.getRandomComentariosDelivery()
        };

      case 'complete':
        return {
          ...baseScenario,
          aplicaIVA: true,
          montoDescuento: this.getRandomDescuento(),
          montoDelivery: this.getRandomDelivery(),
          comentariosDescuento: this.getRandomComentariosDescuento(),
          comentariosDelivery: this.getRandomComentariosDelivery(),
          comentariosGenerales: this.getRandomComentariosGenerales()
        };

      case 'with_reference':
        return {
          ...baseScenario,
          referenciaPago: this.getRandomReferencia()
        };

      default:
        return baseScenario;
    }
  }

  generateAbonoSimpleScenario(variant = 'basic') {
    const cliente = this.getRandomCliente();
    const producto = this.getRandomProductoInventario();
    const metodoPago = this.getRandomMetodoPago();

    const baseScenario = {
      cliente,
      productos: [producto],
      tipoPago: 'Abono',
      tipoAbono: 'simple',
      metodoPagoAbono: metodoPago,
      montoAbonoSimple: this.getRandomMontoAbono(),
      fechaVencimiento: this.getFutureDate(30),
      tasaBCV: this.getRandomTasaBCV(),
      entregaInmediata: false,
      aplicaIVA: false,
      montoDescuento: 0,
      montoDelivery: 0,
      comentariosDescuento: '',
      comentariosDelivery: '',
      comentariosGenerales: ''
    };

    switch (variant) {
      case 'basic':
        return baseScenario;

      case 'with_iva':
        return {
          ...baseScenario,
          aplicaIVA: true
        };

      case 'with_discount':
        return {
          ...baseScenario,
          montoDescuento: this.getRandomDescuento(),
          comentariosDescuento: this.getRandomComentariosDescuento()
        };

      case 'with_delivery':
        return {
          ...baseScenario,
          montoDelivery: this.getRandomDelivery(),
          comentariosDelivery: this.getRandomComentariosDelivery()
        };

      case 'complete':
        return {
          ...baseScenario,
          aplicaIVA: true,
          montoDescuento: this.getRandomDescuento(),
          montoDelivery: this.getRandomDelivery(),
          comentariosDescuento: this.getRandomComentariosDescuento(),
          comentariosDelivery: this.getRandomComentariosDelivery(),
          comentariosGenerales: this.getRandomComentariosGenerales()
        };

      case 'with_reference':
        return {
          ...baseScenario,
          referenciaPago: this.getRandomReferencia()
        };

      default:
        return baseScenario;
    }
  }

  generateAbonoMixtoScenario(variant = 'basic') {
    const cliente = this.getRandomCliente();
    const producto = this.getRandomProductoInventario();

    const baseScenario = {
      cliente,
      productos: [producto],
      tipoPago: 'Abono',
      tipoAbono: 'mixto',
      montoAbonoUSD: this.getRandomMontoAbono(),
      montoAbonoVES: this.getRandomMontoVES(),
      metodoPagoAbonoUSD: this.getRandomMetodoPagoUSD(),
      metodoPagoAbonoVES: this.getRandomMetodoPagoVES(),
      fechaVencimiento: this.getFutureDate(30),
      tasaBCV: this.getRandomTasaBCV(),
      entregaInmediata: false,
      aplicaIVA: false,
      montoDescuento: 0,
      montoDelivery: 0,
      comentariosDescuento: '',
      comentariosDelivery: '',
      comentariosGenerales: ''
    };

    switch (variant) {
      case 'basic':
        return baseScenario;

      case 'usd_only':
        return {
          ...baseScenario,
          montoAbonoVES: 0,
          metodoPagoAbonoVES: null
        };

      case 'ves_only':
        return {
          ...baseScenario,
          montoAbonoUSD: 0,
          metodoPagoAbonoUSD: null
        };

      case 'with_iva':
        return {
          ...baseScenario,
          aplicaIVA: true
        };

      case 'complete':
        return {
          ...baseScenario,
          aplicaIVA: true,
          montoDescuento: this.getRandomDescuento(),
          montoDelivery: this.getRandomDelivery(),
          comentariosDescuento: this.getRandomComentariosDescuento(),
          comentariosDelivery: this.getRandomComentariosDelivery(),
          comentariosGenerales: this.getRandomComentariosGenerales()
        };

      default:
        return baseScenario;
    }
  }

  generateMixtoScenario(variant = 'basic') {
    const cliente = this.getRandomCliente();
    const producto = this.getRandomProductoInventario();

    const baseScenario = {
      cliente,
      productos: [producto],
      tipoPago: 'Mixto',
      montoMixtoUSD: this.getRandomMontoAbono(),
      montoMixtoVES: this.getRandomMontoVES(),
      metodoPagoMixtoUSD: this.getRandomMetodoPagoUSD(),
      metodoPagoMixtoVES: this.getRandomMetodoPagoVES(),
      tasaBCV: this.getRandomTasaBCV(),
      entregaInmediata: true,
      aplicaIVA: false,
      montoDescuento: 0,
      montoDelivery: 0,
      comentariosDescuento: '',
      comentariosDelivery: '',
      comentariosGenerales: ''
    };

    switch (variant) {
      case 'basic':
        return baseScenario;

      case 'usd_only':
        return {
          ...baseScenario,
          montoMixtoVES: 0,
          metodoPagoMixtoVES: null
        };

      case 'ves_only':
        return {
          ...baseScenario,
          montoMixtoUSD: 0,
          metodoPagoMixtoUSD: null
        };

      case 'with_iva':
        return {
          ...baseScenario,
          aplicaIVA: true
        };

      case 'complete':
        return {
          ...baseScenario,
          aplicaIVA: true,
          montoDescuento: this.getRandomDescuento(),
          montoDelivery: this.getRandomDelivery(),
          comentariosDescuento: this.getRandomComentariosDescuento(),
          comentariosDelivery: this.getRandomComentariosDelivery(),
          comentariosGenerales: this.getRandomComentariosGenerales()
        };

      default:
        return baseScenario;
    }
  }

  /**
   * Genera múltiples escenarios de prueba
   */
  generateMultipleScenarios(count = 50) {
    const scenarios = [];
    const scenarioTypes = [
      { type: 'contado', variants: ['basic', 'with_iva', 'with_discount', 'with_delivery', 'complete', 'with_reference'] },
      { type: 'abono_simple', variants: ['basic', 'with_iva', 'with_discount', 'with_delivery', 'complete', 'with_reference'] },
      { type: 'abono_mixto', variants: ['basic', 'usd_only', 'ves_only', 'with_iva', 'complete'] },
      { type: 'mixto', variants: ['basic', 'usd_only', 'ves_only', 'with_iva', 'complete'] }
    ];

    for (let i = 0; i < count; i++) {
      const scenarioType = scenarioTypes[i % scenarioTypes.length];
      const variant = scenarioType.variants[i % scenarioType.variants.length];
      
      let scenario;
      switch (scenarioType.type) {
        case 'contado':
          scenario = this.generateContadoScenario(variant);
          break;
        case 'abono_simple':
          scenario = this.generateAbonoSimpleScenario(variant);
          break;
        case 'abono_mixto':
          scenario = this.generateAbonoMixtoScenario(variant);
          break;
        case 'mixto':
          scenario = this.generateMixtoScenario(variant);
          break;
      }

      scenarios.push({
        id: i + 1,
        name: `Escenario ${i + 1} - ${scenarioType.type}_${variant}`,
        type: scenarioType.type,
        variant: variant,
        ...scenario
      });
    }

    return scenarios;
  }

  /**
   * Genera escenarios con productos mixtos
   */
  generateProductosMixtosScenario() {
    const cliente = this.getRandomCliente();
    const productosInventario = [
      this.getRandomProductoInventario(),
      this.getRandomProductoInventario()
    ];
    const productosManuales = [
      this.generateProductoManual(),
      this.generateProductoManual()
    ];

    return {
      cliente,
      productosInventario,
      productosManuales,
      tipoPago: 'Contado',
      metodoPago: this.getRandomMetodoPago(),
      tasaBCV: this.getRandomTasaBCV(),
      entregaInmediata: true,
      aplicaIVA: true,
      montoDescuento: this.getRandomDescuento(),
      montoDelivery: this.getRandomDelivery(),
      comentariosDescuento: this.getRandomComentariosDescuento(),
      comentariosDelivery: this.getRandomComentariosDelivery(),
      comentariosGenerales: this.getRandomComentariosGenerales()
    };
  }

  /**
   * Genera escenarios de validación de errores
   */
  generateErrorScenarios() {
    return [
      {
        name: 'Cliente sin cédula',
        cliente: { cedula: '', nombre: 'Juan', apellido: 'Pérez' },
        productos: [this.getRandomProductoInventario()],
        tipoPago: 'Contado',
        metodoPago: 'Efectivo (USD)',
        expectedError: 'Cédula del cliente es obligatoria'
      },
      {
        name: 'Sin productos',
        cliente: this.getRandomCliente(),
        productos: [],
        tipoPago: 'Contado',
        metodoPago: 'Efectivo (USD)',
        expectedError: 'Debe agregar al menos un producto'
      },
      {
        name: 'Sin método de pago',
        cliente: this.getRandomCliente(),
        productos: [this.getRandomProductoInventario()],
        tipoPago: 'Contado',
        metodoPago: '',
        expectedError: 'Método de pago es obligatorio'
      },
      {
        name: 'Referencia faltante para Zelle',
        cliente: this.getRandomCliente(),
        productos: [this.getRandomProductoInventario()],
        tipoPago: 'Contado',
        metodoPago: 'Zelle (USD)',
        referenciaPago: '',
        expectedError: 'Referencia de pago es obligatoria para Zelle'
      }
    ];
  }
}

export default ComprehensiveTestDataGenerator;
