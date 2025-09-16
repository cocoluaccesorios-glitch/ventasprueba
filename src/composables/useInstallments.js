import { ref, computed } from 'vue'

export function useInstallments() {
  // Variables para manejo de abonos
  const tipoPagoAbono = ref('simple') // 'simple' o 'mixto'
  
  // Variables para pago simple
  const metodoPagoAbono = ref('')
  const montoAbonoSimple = ref(0)
  
  // Variables para pago mixto
  const montoAbonoUSD = ref(0)
  const montoAbonoVES = ref(0)

  // Computed properties
  const fechaMinima = computed(() => {
    const hoy = new Date()
    hoy.setDate(hoy.getDate() + 1) // Mínimo mañana
    return hoy.toISOString().split('T')[0]
  })

  // Cálculos para pago simple
  const conversionAbonoSimple = computed(() => {
    if (!montoAbonoSimple.value || montoAbonoSimple.value <= 0) return ''
    
    const tasaBCV = 36.0 // Esto debería venir como parámetro
    
    if (metodoPagoAbono.value.includes('USD')) {
      const montoVES = montoAbonoSimple.value * tasaBCV
      return `Equivale a Bs. ${montoVES.toFixed(2)}`
    } else {
      const montoUSD = montoAbonoSimple.value / tasaBCV
      return `Equivale a $${montoUSD.toFixed(2)}`
    }
  })

  // Cálculos para pago mixto
  const totalAbonoMixto = computed(() => {
    const montoUSD = montoAbonoUSD.value || 0
    const montoVESEnUSD = 36.0 > 0 ? (montoAbonoVES.value || 0) / 36.0 : 0 // Tasa BCV hardcoded
    return montoUSD + montoVESEnUSD
  })

  // Total del abono calculado (para ambos tipos)
  const totalAbonoCalculado = computed(() => {
    if (tipoPagoAbono.value === 'simple') {
      if (metodoPagoAbono.value.includes('USD')) {
        return montoAbonoSimple.value || 0
      } else {
        return 36.0 > 0 ? (montoAbonoSimple.value || 0) / 36.0 : 0 // Tasa BCV hardcoded
      }
    } else {
      return totalAbonoMixto.value
    }
  })

  // Validación de abono
  const esAbonoValido = computed(() => {
    const fechaVencimiento = '' // Esto debería venir como parámetro
    const fechaValida = fechaVencimiento && fechaVencimiento >= fechaMinima.value
    
    if (tipoPagoAbono.value === 'simple') {
      const montoValido = montoAbonoSimple.value > 0
      const metodoValido = metodoPagoAbono.value !== ''
      return montoValido && metodoValido && fechaValida
    } else {
      const montoValido = (montoAbonoUSD.value > 0 || montoAbonoVES.value > 0)
      return montoValido && fechaValida
    }
  })

  // Funciones
  function resetInstallments() {
    tipoPagoAbono.value = 'simple'
    metodoPagoAbono.value = ''
    montoAbonoSimple.value = 0
    montoAbonoUSD.value = 0
    montoAbonoVES.value = 0
  }

  function calcularSaldoPendiente(totalVenta) {
    return Math.max(0, totalVenta - totalAbonoCalculado.value)
  }

  function validarAbono(totalVenta) {
    const errores = []
    
    if (tipoPagoAbono.value === 'simple') {
      if (!metodoPagoAbono.value) {
        errores.push('Debe seleccionar un método de pago')
      }
      if (montoAbonoSimple.value <= 0) {
        errores.push('El monto del abono debe ser mayor a 0')
      }
    } else {
      if (montoAbonoUSD.value <= 0 && montoAbonoVES.value <= 0) {
        errores.push('Debe ingresar al menos un monto (USD o VES)')
      }
    }
    
    if (totalAbonoCalculado.value > totalVenta) {
      errores.push(`El total del abono ($${totalAbonoCalculado.value.toFixed(2)}) no puede exceder el total de la venta ($${totalVenta.toFixed(2)})`)
    }
    
    return errores
  }

  function obtenerDatosAbono() {
    return {
      tipo_pago_abono: tipoPagoAbono.value,
      metodo_pago_abono: metodoPagoAbono.value,
      monto_abono_simple: montoAbonoSimple.value,
      monto_abono_usd: montoAbonoUSD.value,
      monto_abono_ves: montoAbonoVES.value,
      total_abono_usd: totalAbonoCalculado.value
    }
  }

  return {
    // Estado
    tipoPagoAbono,
    metodoPagoAbono,
    montoAbonoSimple,
    montoAbonoUSD,
    montoAbonoVES,

    // Computed
    fechaMinima,
    conversionAbonoSimple,
    totalAbonoMixto,
    totalAbonoCalculado,
    esAbonoValido,

    // Funciones
    resetInstallments,
    calcularSaldoPendiente,
    validarAbono,
    obtenerDatosAbono
  }
}
