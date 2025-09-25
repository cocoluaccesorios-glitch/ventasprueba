/**
 * Validación adicional para prevenir cantidades duplicadas
 * Se puede agregar al composable useSalesForm.js
 */

// Función de validación que se puede agregar al composable
export function validarSubtotal(detallesPedido, subtotalCalculado) {
  // Verificar que el subtotal calculado sea razonable
  const subtotalEsperado = detallesPedido.reduce((sum, item) => {
    return sum + (item.cantidad * item.precio_unitario);
  }, 0);
  
  // Detectar si hay una división por 2 incorrecta
  const diferencia = Math.abs(subtotalCalculado - subtotalEsperado);
  const esDuplicado = Math.abs(subtotalCalculado - subtotalEsperado * 2) < 0.01;
  
  if (esDuplicado) {
    console.warn('⚠️ PROBLEMA DETECTADO: Subtotal parece estar dividido por 2');
    console.log('Subtotal calculado:', subtotalCalculado);
    console.log('Subtotal esperado:', subtotalEsperado);
    console.log('Diferencia:', diferencia);
    
    return {
      esValido: false,
      subtotalCorrecto: subtotalEsperado,
      mensaje: 'El subtotal parece estar dividido por 2. Se ha corregido automáticamente.'
    };
  }
  
  return {
    esValido: true,
    subtotalCorrecto: subtotalCalculado,
    mensaje: 'Subtotal correcto'
  };
}

// Función para corregir automáticamente el subtotal
export function corregirSubtotalAutomaticamente(detallesPedido, subtotalActual) {
  const validacion = validarSubtotal(detallesPedido, subtotalActual);
  
  if (!validacion.esValido) {
    console.log('🔧 Corrigiendo subtotal automáticamente...');
    console.log('Subtotal anterior:', subtotalActual);
    console.log('Subtotal corregido:', validacion.subtotalCorrecto);
    
    return validacion.subtotalCorrecto;
  }
  
  return subtotalActual;
}

// Función para agregar al composable useSalesForm.js
export function agregarValidacionSubtotal() {
  return {
    // Validar subtotal antes de enviar
    validarAntesDeEnviar() {
      const validacion = validarSubtotal(this.detallesPedido.value, this.subtotal.value);
      
      if (!validacion.esValido) {
        console.warn('⚠️ Subtotal inválido detectado, corrigiendo...');
        // Aquí se podría mostrar una notificación al usuario
        return validacion.subtotalCorrecto;
      }
      
      return this.subtotal.value;
    },
    
    // Validar en tiempo real
    validarEnTiempoReal() {
      const validacion = validarSubtotal(this.detallesPedido.value, this.subtotal.value);
      
      if (!validacion.esValido) {
        console.warn('⚠️ Subtotal inválido en tiempo real:', validacion.mensaje);
        // Aquí se podría actualizar automáticamente el subtotal
        return validacion.subtotalCorrecto;
      }
      
      return this.subtotal.value;
    }
  };
}
