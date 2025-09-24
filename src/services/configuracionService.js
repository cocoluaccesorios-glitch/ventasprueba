// Servicio de configuración del sistema
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient.js'
import Swal from 'sweetalert2'

// Estado global de configuración
const configuracion = ref({
  empresa: {
    nombre: 'Cocolu',
    rif: '',
    direccion: '',
    telefono: '',
    email: '',
    logo: ''
  },
  sistema: {
    monedaPrincipal: 'USD',
    tasaBCVAuto: true,
    tasaBCVManual: 36.0,
    formatoFecha: 'DD/MM/YYYY',
    zonaHoraria: 'America/Caracas',
    idioma: 'es',
    tema: 'light'
  },
  ventas: {
    numeroPedidoInicial: 1,
    prefijoPedido: 'PED',
    requiereCliente: true,
    permiteDescuentos: true,
    maxDescuento: 50,
    imprimirAutomatico: false,
    enviarEmail: false
  },
  inventario: {
    alertaStockBajo: true,
    stockMinimoDefault: 5,
    permiteStockNegativo: false,
    actualizarStockAutomatico: true,
    mostrarCodigoBarras: true
  },
  clientes: {
    requiereCedula: true,
    validarEmail: true,
    permitirDuplicados: false,
    mostrarHistorial: true,
    limiteCredito: 1000
  },
  abonos: {
    permitirAbonos: true,
    diasGracia: 0,
    calcularIntereses: false,
    tasaInteres: 0,
    recordatorios: true,
    diasRecordatorio: 7
  },
  notificaciones: {
    email: true,
    push: true,
    stockBajo: true,
    ventasCompletadas: true,
    pagosRecibidos: true,
    erroresSistema: true
  },
  backup: {
    automatico: true,
    frecuencia: 'daily',
    hora: '02:00',
    diasRetencion: 30,
    incluirImagenes: true
  }
})

const cargando = ref(false)

// Función para cargar configuración desde Supabase
export async function cargarConfiguracion() {
  cargando.value = true
  
  try {
    console.log('⚙️ Cargando configuración del sistema...')
    
    const { data, error } = await supabase
      .from('configuracion_sistema')
      .select('*')
      .single()
    
    if (error) {
      console.error('Error al cargar configuración:', error)
      
      // Si no existe configuración, crear una por defecto
      if (error.message.includes('No rows found')) {
        console.log('No existe configuración, creando por defecto...')
        await crearConfiguracionPorDefecto()
        return configuracion.value
      }
      
      throw new Error(`Error al cargar configuración: ${error.message}`)
    }
    
    // Parsear configuración JSON
    if (data.configuracion) {
      configuracion.value = {
        ...configuracion.value,
        ...JSON.parse(data.configuracion)
      }
    }
    
    console.log('✅ Configuración cargada')
    return configuracion.value
    
  } catch (error) {
    console.error('Error al cargar configuración:', error)
    
    Swal.fire({
      title: 'Error',
      text: 'No se pudo cargar la configuración del sistema',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    
    return configuracion.value
  } finally {
    cargando.value = false
  }
}

// Función para guardar configuración
export async function guardarConfiguracion(nuevaConfiguracion) {
  cargando.value = true
  
  try {
    console.log('💾 Guardando configuración del sistema...')
    
    const { data, error } = await supabase
      .from('configuracion_sistema')
      .upsert([
        {
          id: 1,
          configuracion: JSON.stringify(nuevaConfiguracion),
          fecha_actualizacion: new Date().toISOString()
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Error al guardar configuración:', error)
      throw new Error(`Error al guardar configuración: ${error.message}`)
    }
    
    // Actualizar estado local
    configuracion.value = nuevaConfiguracion
    
    console.log('✅ Configuración guardada')
    
    Swal.fire({
      title: 'Configuración guardada',
      text: 'Los cambios se han guardado exitosamente',
      icon: 'success',
      confirmButtonText: 'Entendido'
    })
    
    return data
    
  } catch (error) {
    console.error('Error al guardar configuración:', error)
    
    Swal.fire({
      title: 'Error',
      text: 'No se pudo guardar la configuración',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    
    throw error
  } finally {
    cargando.value = false
  }
}

// Función para crear configuración por defecto
async function crearConfiguracionPorDefecto() {
  try {
    console.log('🔧 Creando configuración por defecto...')
    
    const { data, error } = await supabase
      .from('configuracion_sistema')
      .insert([
        {
          id: 1,
          configuracion: JSON.stringify(configuracion.value),
          fecha_creacion: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString()
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Error al crear configuración por defecto:', error)
      throw new Error(`Error al crear configuración: ${error.message}`)
    }
    
    console.log('✅ Configuración por defecto creada')
    return data
    
  } catch (error) {
    console.error('Error al crear configuración por defecto:', error)
    throw error
  }
}

// Función para actualizar configuración específica
export async function actualizarConfiguracion(seccion, valores) {
  try {
    console.log(`⚙️ Actualizando configuración de ${seccion}...`)
    
    const nuevaConfiguracion = {
      ...configuracion.value,
      [seccion]: {
        ...configuracion.value[seccion],
        ...valores
      }
    }
    
    await guardarConfiguracion(nuevaConfiguracion)
    
  } catch (error) {
    console.error('Error al actualizar configuración:', error)
    throw error
  }
}

// Función para obtener configuración de empresa
export function getConfiguracionEmpresa() {
  return configuracion.value.empresa
}

// Función para obtener configuración del sistema
export function getConfiguracionSistema() {
  return configuracion.value.sistema
}

// Función para obtener configuración de ventas
export function getConfiguracionVentas() {
  return configuracion.value.ventas
}

// Función para obtener configuración de inventario
export function getConfiguracionInventario() {
  return configuracion.value.inventario
}

// Función para obtener configuración de clientes
export function getConfiguracionClientes() {
  return configuracion.value.clientes
}

// Función para obtener configuración de abonos
export function getConfiguracionAbonos() {
  return configuracion.value.abonos
}

// Función para obtener configuración de notificaciones
export function getConfiguracionNotificaciones() {
  return configuracion.value.notificaciones
}

// Función para obtener configuración de backup
export function getConfiguracionBackup() {
  return configuracion.value.backup
}

// Función para validar configuración
export function validarConfiguracion(config) {
  const errores = []
  
  // Validar empresa
  if (!config.empresa.nombre) {
    errores.push('El nombre de la empresa es obligatorio')
  }
  
  if (!config.empresa.email) {
    errores.push('El email de la empresa es obligatorio')
  }
  
  // Validar sistema
  if (!config.sistema.monedaPrincipal) {
    errores.push('La moneda principal es obligatoria')
  }
  
  if (config.sistema.tasaBCVManual <= 0) {
    errores.push('La tasa BCV manual debe ser mayor a 0')
  }
  
  // Validar ventas
  if (config.ventas.numeroPedidoInicial < 1) {
    errores.push('El número de pedido inicial debe ser mayor a 0')
  }
  
  if (config.ventas.maxDescuento < 0 || config.ventas.maxDescuento > 100) {
    errores.push('El descuento máximo debe estar entre 0 y 100')
  }
  
  // Validar inventario
  if (config.inventario.stockMinimoDefault < 0) {
    errores.push('El stock mínimo por defecto no puede ser negativo')
  }
  
  // Validar clientes
  if (config.clientes.limiteCredito < 0) {
    errores.push('El límite de crédito no puede ser negativo')
  }
  
  // Validar abonos
  if (config.abonos.diasGracia < 0) {
    errores.push('Los días de gracia no pueden ser negativos')
  }
  
  if (config.abonos.tasaInteres < 0 || config.abonos.tasaInteres > 100) {
    errores.push('La tasa de interés debe estar entre 0 y 100')
  }
  
  return errores
}

// Función para resetear configuración a valores por defecto
export async function resetearConfiguracion() {
  try {
    console.log('🔄 Reseteando configuración a valores por defecto...')
    
    const confirmacion = await Swal.fire({
      title: 'Resetear configuración',
      text: '¿Estás seguro de que quieres resetear toda la configuración a los valores por defecto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, resetear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    })
    
    if (confirmacion.isConfirmed) {
      await crearConfiguracionPorDefecto()
      
      Swal.fire({
        title: 'Configuración reseteada',
        text: 'La configuración se ha reseteado a los valores por defecto',
        icon: 'success',
        confirmButtonText: 'Entendido'
      })
    }
    
  } catch (error) {
    console.error('Error al resetear configuración:', error)
    
    Swal.fire({
      title: 'Error',
      text: 'No se pudo resetear la configuración',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    
    throw error
  }
}

// Función para exportar configuración
export function exportarConfiguracion() {
  try {
    const configuracionExport = {
      ...configuracion.value,
      fechaExportacion: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(configuracionExport, null, 2)], { 
      type: 'application/json' 
    })
    
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `configuracion_cocolu_${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    Swal.fire({
      title: 'Configuración exportada',
      text: 'La configuración se ha exportado exitosamente',
      icon: 'success',
      confirmButtonText: 'Entendido'
    })
    
  } catch (error) {
    console.error('Error al exportar configuración:', error)
    
    Swal.fire({
      title: 'Error',
      text: 'No se pudo exportar la configuración',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
  }
}

// Función para importar configuración
export async function importarConfiguracion(archivo) {
  try {
    console.log('📥 Importando configuración...')
    
    const texto = await archivo.text()
    const configuracionImportada = JSON.parse(texto)
    
    // Validar configuración importada
    const errores = validarConfiguracion(configuracionImportada)
    
    if (errores.length > 0) {
      Swal.fire({
        title: 'Error de validación',
        text: `La configuración importada tiene errores:\n${errores.join('\n')}`,
        icon: 'error',
        confirmButtonText: 'Entendido'
      })
      return
    }
    
    // Confirmar importación
    const confirmacion = await Swal.fire({
      title: 'Importar configuración',
      text: '¿Estás seguro de que quieres importar esta configuración? Se sobrescribirá la configuración actual.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, importar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    })
    
    if (confirmacion.isConfirmed) {
      await guardarConfiguracion(configuracionImportada)
      
      Swal.fire({
        title: 'Configuración importada',
        text: 'La configuración se ha importado exitosamente',
        icon: 'success',
        confirmButtonText: 'Entendido'
      })
    }
    
  } catch (error) {
    console.error('Error al importar configuración:', error)
    
    Swal.fire({
      title: 'Error',
      text: 'No se pudo importar la configuración. Verifica que el archivo sea válido.',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
  }
}

// Getters para el estado
export function getConfiguracion() {
  return configuracion.value
}

export function getCargando() {
  return cargando.value
}

// Función para obtener configuración específica
export function obtenerConfiguracion(seccion, clave) {
  if (seccion && clave) {
    return configuracion.value[seccion]?.[clave]
  } else if (seccion) {
    return configuracion.value[seccion]
  }
  return configuracion.value
}
