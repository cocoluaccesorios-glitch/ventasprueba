// Servicio de notificaciones con Supabase
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient.js'
import Swal from 'sweetalert2'

// Estado global de notificaciones
const notificaciones = ref([])
const notificacionesNoLeidas = ref(0)
const cargando = ref(false)

// Función para obtener todas las notificaciones
export async function obtenerNotificaciones() {
  cargando.value = true
  
  try {
    console.log('🔔 Obteniendo notificaciones...')
    
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .order('fecha_creacion', { ascending: false })
      .limit(50)
    
    if (error) {
      console.error('Error al cargar notificaciones:', error)
      return []
    }
    
    notificaciones.value = data || []
    notificacionesNoLeidas.value = notificaciones.value.filter(n => !n.leida).length
    
    console.log('✅ Notificaciones cargadas:', notificaciones.value.length)
    return notificaciones.value
    
  } catch (error) {
    console.error('Error al obtener notificaciones:', error)
    return []
  } finally {
    cargando.value = false
  }
}

// Función para crear una nueva notificación
export async function crearNotificacion(datosNotificacion) {
  try {
    console.log('📝 Creando notificación...')
    
    const { data, error } = await supabase
      .from('notificaciones')
      .insert([
        {
          titulo: datosNotificacion.titulo,
          mensaje: datosNotificacion.mensaje,
          tipo: datosNotificacion.tipo || 'info',
          usuario_id: datosNotificacion.usuario_id,
          relacion_id: datosNotificacion.relacion_id,
          relacion_tipo: datosNotificacion.relacion_tipo,
          leida: false,
          fecha_creacion: new Date().toISOString()
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Error al crear notificación:', error)
      throw new Error(`Error al crear notificación: ${error.message}`)
    }
    
    // Agregar al estado local
    notificaciones.value.unshift(data)
    notificacionesNoLeidas.value++
    
    console.log('✅ Notificación creada:', data.id)
    return data
    
  } catch (error) {
    console.error('Error al crear notificación:', error)
    throw error
  }
}

// Función para marcar notificación como leída
export async function marcarComoLeida(id) {
  try {
    console.log('👁️ Marcando notificación como leída:', id)
    
    const { error } = await supabase
      .from('notificaciones')
      .update({ 
        leida: true,
        fecha_lectura: new Date().toISOString()
      })
      .eq('id', id)
    
    if (error) {
      console.error('Error al marcar notificación:', error)
      throw new Error(`Error al marcar notificación: ${error.message}`)
    }
    
    // Actualizar estado local
    const notificacion = notificaciones.value.find(n => n.id === id)
    if (notificacion && !notificacion.leida) {
      notificacion.leida = true
      notificacion.fecha_lectura = new Date().toISOString()
      notificacionesNoLeidas.value--
    }
    
    console.log('✅ Notificación marcada como leída:', id)
    
  } catch (error) {
    console.error('Error al marcar notificación:', error)
    throw error
  }
}

// Función para marcar todas las notificaciones como leídas
export async function marcarTodasComoLeidas() {
  try {
    console.log('👁️ Marcando todas las notificaciones como leídas...')
    
    const { error } = await supabase
      .from('notificaciones')
      .update({ 
        leida: true,
        fecha_lectura: new Date().toISOString()
      })
      .eq('leida', false)
    
    if (error) {
      console.error('Error al marcar notificaciones:', error)
      throw new Error(`Error al marcar notificaciones: ${error.message}`)
    }
    
    // Actualizar estado local
    notificaciones.value.forEach(notificacion => {
      if (!notificacion.leida) {
        notificacion.leida = true
        notificacion.fecha_lectura = new Date().toISOString()
      }
    })
    
    notificacionesNoLeidas.value = 0
    console.log('✅ Todas las notificaciones marcadas como leídas')
    
  } catch (error) {
    console.error('Error al marcar notificaciones:', error)
    throw error
  }
}

// Función para eliminar una notificación
export async function eliminarNotificacion(id) {
  try {
    console.log('🗑️ Eliminando notificación:', id)
    
    const { error } = await supabase
      .from('notificaciones')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error al eliminar notificación:', error)
      throw new Error(`Error al eliminar notificación: ${error.message}`)
    }
    
    // Remover del estado local
    const index = notificaciones.value.findIndex(n => n.id === id)
    if (index !== -1) {
      const notificacion = notificaciones.value[index]
      if (!notificacion.leida) {
        notificacionesNoLeidas.value--
      }
      notificaciones.value.splice(index, 1)
    }
    
    console.log('✅ Notificación eliminada:', id)
    
  } catch (error) {
    console.error('Error al eliminar notificación:', error)
    throw error
  }
}

// Función para mostrar notificación toast
export function mostrarNotificacionToast(titulo, mensaje, tipo = 'info') {
  const configuracion = {
    title: titulo,
    text: mensaje,
    timer: 5000,
    showConfirmButton: false,
    toast: true,
    position: 'top-end'
  }
  
  switch (tipo) {
    case 'success':
      Swal.fire({
        ...configuracion,
        icon: 'success',
        timerProgressBar: true
      })
      break
    case 'error':
      Swal.fire({
        ...configuracion,
        icon: 'error',
        timer: 7000
      })
      break
    case 'warning':
      Swal.fire({
        ...configuracion,
        icon: 'warning',
        timer: 6000
      })
      break
    case 'info':
    default:
      Swal.fire({
        ...configuracion,
        icon: 'info',
        timer: 5000
      })
      break
  }
}

// Función para mostrar notificación de confirmación
export async function mostrarConfirmacion(titulo, mensaje, tipo = 'warning') {
  const resultado = await Swal.fire({
    title: titulo,
    text: mensaje,
    icon: tipo,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
  })
  
  return resultado.isConfirmed
}

// Función para mostrar notificación de éxito
export function mostrarExito(titulo, mensaje) {
  Swal.fire({
    title: titulo,
    text: mensaje,
    icon: 'success',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#28a745'
  })
}

// Función para mostrar notificación de error
export function mostrarError(titulo, mensaje) {
  Swal.fire({
    title: titulo,
    text: mensaje,
    icon: 'error',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#dc3545'
  })
}

// Función para mostrar notificación de advertencia
export function mostrarAdvertencia(titulo, mensaje) {
  Swal.fire({
    title: titulo,
    text: mensaje,
    icon: 'warning',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#ffc107'
  })
}

// Función para mostrar notificación de información
export function mostrarInformacion(titulo, mensaje) {
  Swal.fire({
    title: titulo,
    text: mensaje,
    icon: 'info',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#17a2b8'
  })
}

// Función para crear notificaciones automáticas del sistema
export async function crearNotificacionSistema(tipo, datos) {
  const notificacionesSistema = {
    stock_bajo: {
      titulo: 'Stock Bajo',
      mensaje: `El producto "${datos.producto}" tiene stock bajo (${datos.stock} unidades)`,
      tipo: 'warning'
    },
    venta_completada: {
      titulo: 'Venta Completada',
      mensaje: `Se completó la venta #${datos.numero} por $${datos.total}`,
      tipo: 'success'
    },
    cliente_nuevo: {
      titulo: 'Cliente Nuevo',
      mensaje: `Se registró un nuevo cliente: ${datos.nombre}`,
      tipo: 'info'
    },
    pago_recibido: {
      titulo: 'Pago Recibido',
      mensaje: `Se recibió un pago de $${datos.monto} de ${datos.cliente}`,
      tipo: 'success'
    },
    abono_realizado: {
      titulo: 'Abono Realizado',
      mensaje: `${datos.cliente} realizó un abono de $${datos.monto}`,
      tipo: 'info'
    },
    error_sistema: {
      titulo: 'Error del Sistema',
      mensaje: datos.mensaje || 'Ocurrió un error en el sistema',
      tipo: 'error'
    }
  }
  
  const configuracion = notificacionesSistema[tipo]
  if (configuracion) {
    await crearNotificacion({
      ...configuracion,
      usuario_id: datos.usuario_id,
      relacion_id: datos.relacion_id,
      relacion_tipo: datos.relacion_tipo
    })
  }
}

// Función para obtener notificaciones no leídas
export function obtenerNotificacionesNoLeidas() {
  return notificaciones.value.filter(n => !n.leida)
}

// Función para obtener notificaciones por tipo
export function obtenerNotificacionesPorTipo(tipo) {
  return notificaciones.value.filter(n => n.tipo === tipo)
}

// Función para limpiar notificaciones antiguas
export async function limpiarNotificacionesAntiguas(dias = 30) {
  try {
    console.log('🧹 Limpiando notificaciones antiguas...')
    
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - dias)
    
    const { error } = await supabase
      .from('notificaciones')
      .delete()
      .lt('fecha_creacion', fechaLimite.toISOString())
    
    if (error) {
      console.error('Error al limpiar notificaciones:', error)
      throw new Error(`Error al limpiar notificaciones: ${error.message}`)
    }
    
    // Actualizar estado local
    notificaciones.value = notificaciones.value.filter(n => 
      new Date(n.fecha_creacion) >= fechaLimite
    )
    
    console.log('✅ Notificaciones antiguas eliminadas')
    
  } catch (error) {
    console.error('Error al limpiar notificaciones:', error)
    throw error
  }
}

// Getters para el estado
export function getNotificaciones() {
  return notificaciones.value
}

export function getNotificacionesNoLeidas() {
  return notificacionesNoLeidas.value
}

export function getCargando() {
  return cargando.value
}

// Función para suscribirse a notificaciones en tiempo real
export function suscribirseANotificaciones() {
  const subscription = supabase
    .channel('notificaciones')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notificaciones' 
      }, 
      (payload) => {
        console.log('🔔 Nueva notificación recibida:', payload.new)
        notificaciones.value.unshift(payload.new)
        notificacionesNoLeidas.value++
        
        // Mostrar toast de notificación
        mostrarNotificacionToast(
          payload.new.titulo,
          payload.new.mensaje,
          payload.new.tipo
        )
      }
    )
    .subscribe()
  
  return subscription
}
