/**
 * Configuraciones específicas para los tests
 */

export const TEST_CONFIG = {
  // Timeouts en milisegundos
  TIMEOUTS: {
    SHORT: 2000,
    MEDIUM: 5000,
    LONG: 10000,
    VERY_LONG: 15000,
    ACTION: 10000,
    NAVIGATION: 30000
  },

  // URLs
  URLS: {
    BASE: 'http://localhost:5173',
    LOGIN: '/login',
    VENTAS: '/ventas',
    DASHBOARD: '/dashboard'
  },

  // Credenciales de prueba
  CREDENTIALS: {
    USERNAME: 'admin',
    PASSWORD: 'admin123'
  },

  // Selectores comunes
  SELECTORS: {
    // Login
    USERNAME_INPUT: 'input[id="username"]',
    PASSWORD_INPUT: 'input[id="password"]',
    LOGIN_BUTTON: 'button[type="submit"]',
    
    // Cliente (basado en el DOM real)
    CLIENTE_INPUT: 'input.client-search-input, input[placeholder*="Escribe nombre, cédula o teléfono"]',
    CLIENTE_RESULT: '.search-result-item, .cliente-item, .search-result',
    CLIENTE_SELECTED: '.selected-client-state, .cliente-seleccionado',
    
    // Producto (basado en el DOM real)
    PRODUCTO_INPUT: 'input.form-control, input[placeholder*="Buscar producto por nombre, SKU o categoría"]',
    PRODUCTO_RESULT: '.search-result-item, .producto-item, .search-result, [data-testid="producto-item"]',
    PRODUCTO_ADDED: '.producto-agregado, .producto-encontrado, [data-testid="producto-agregado"]',
    CANTIDAD_INPUT: 'input.simple-input, input[type="number"][placeholder="1"], spinbutton',
    ADD_BUTTON: 'button.add-btn, button:has-text("Añadir")',
    
    // Pago (basado en el DOM real)
    TIPO_PAGO_SELECT: 'select[name="tipo_pago"], select[name="tipoPago"], input[name="tipo_pago"], combobox',
    METODO_PAGO_SELECT: 'select[name="metodo_pago"], select[name="metodoPago"], input[name="metodo_pago"], combobox',
    REFERENCIA_INPUT: 'input[name="referencia_pago"], input[placeholder*="referencia"]',
    
    // Formulario (basado en el DOM real)
    SUBMIT_BUTTON: 'button.submit-btn, button:has-text("Registrar Venta")',
    SUCCESS_MESSAGE: 'text=¡Venta Registrada!, text=Éxito, .success-message',
    ERROR_MESSAGE: '.alert-danger, .error-message, .invalid-feedback',
    
    // SweetAlert
    SWEET_ALERT: '.swal2-popup',
    SWEET_CONFIRM: '.swal2-confirm',
    SWEET_CANCEL: '.swal2-cancel'
  },

  // Datos de prueba
  TEST_DATA: {
    CLIENTES: [
      { cedula: 'V12345678', nombre: 'Ana', apellido: 'Pérez', telefono: '0412-1234567' },
      { cedula: '26899386', nombre: 'Luis', apellido: 'Silva', telefono: '0414-9876543' },
      { cedula: 'J87654321', nombre: 'María', apellido: 'González', telefono: '0424-5555555' }
    ],
    
    PRODUCTOS: [
      { nombre: 'Producto A', precio: 25.50, cantidad: 2 },
      { nombre: 'Producto B', precio: 45.00, cantidad: 1 },
      { nombre: 'Producto C', precio: 12.75, cantidad: 3 }
    ],
    
    METODOS_PAGO: ['Efectivo', 'Transferencia', 'Pago Móvil', 'Zelle', 'PayPal', 'Binance'],
    TIPOS_PAGO: ['Contado', 'Abono'],
    REFERENCIAS: ['REF001', 'PM123456', 'ZELLE789', 'TRANSFER456']
  },

  // Configuraciones de espera
  WAIT_CONFIG: {
    // Esperar elementos específicos en lugar de timeouts fijos
    WAIT_FOR_ELEMENT: true,
    // Usar waitForLoadState cuando sea apropiado
    USE_LOAD_STATE: true,
    // Retry automático en fallos
    AUTO_RETRY: true,
    // Máximo número de reintentos
    MAX_RETRIES: 3
  }
};

export default TEST_CONFIG;