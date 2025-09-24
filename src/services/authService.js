// Servicio de autenticación con Supabase
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient.js'
import Swal from 'sweetalert2'

// Estado global de autenticación
const usuario = ref(null)
const cargando = ref(false)

// Función para iniciar sesión
export async function iniciarSesion(email, password) {
  cargando.value = true
  
  try {
    console.log('🔐 Iniciando sesión...')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (error) {
      console.error('Error de autenticación:', error)
      throw new Error(error.message)
    }

    if (data.user) {
      usuario.value = {
        id: data.user.id,
        email: data.user.email,
        nombre: data.user.user_metadata?.nombre || data.user.email.split('@')[0],
        rol: data.user.user_metadata?.rol || 'usuario',
        ultimoAcceso: new Date().toISOString()
      }
      
      console.log('✅ Sesión iniciada:', usuario.value.email)
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('usuario', JSON.stringify(usuario.value))
      
      return usuario.value
    }
    
    throw new Error('No se pudo obtener información del usuario')
    
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
    
    // Mostrar error específico
    let mensajeError = 'Error al iniciar sesión'
    
    if (error.message.includes('Invalid login credentials')) {
      mensajeError = 'Email o contraseña incorrectos'
    } else if (error.message.includes('Email not confirmed')) {
      mensajeError = 'Debes confirmar tu email antes de iniciar sesión'
    } else if (error.message.includes('Too many requests')) {
      mensajeError = 'Demasiados intentos. Intenta más tarde'
    } else if (error.message.includes('fetch failed')) {
      mensajeError = 'Error de conexión. Verifica tu internet'
    }
    
    Swal.fire({
      title: 'Error de autenticación',
      text: mensajeError,
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    
    throw error
  } finally {
    cargando.value = false
  }
}

// Función para cerrar sesión
export async function cerrarSesion() {
  try {
    console.log('🚪 Cerrando sesión...')
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error al cerrar sesión:', error)
    }
    
    // Limpiar estado local
    usuario.value = null
    localStorage.removeItem('usuario')
    
    console.log('✅ Sesión cerrada')
    
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    // Limpiar estado local aunque haya error
    usuario.value = null
    localStorage.removeItem('usuario')
  }
}

// Función para registrar nuevo usuario
export async function registrarUsuario(email, password, datosAdicionales = {}) {
  cargando.value = true
  
  try {
    console.log('📝 Registrando nuevo usuario...')
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          nombre: datosAdicionales.nombre || email.split('@')[0],
          rol: datosAdicionales.rol || 'usuario',
          telefono: datosAdicionales.telefono || '',
          empresa: datosAdicionales.empresa || ''
        }
      }
    })

    if (error) {
      console.error('Error al registrar usuario:', error)
      throw new Error(error.message)
    }

    if (data.user) {
      console.log('✅ Usuario registrado:', data.user.email)
      
      Swal.fire({
        title: 'Registro exitoso',
        text: 'Se ha enviado un email de confirmación a tu correo',
        icon: 'success',
        confirmButtonText: 'Entendido'
      })
      
      return data.user
    }
    
    throw new Error('No se pudo registrar el usuario')
    
  } catch (error) {
    console.error('Error al registrar usuario:', error)
    
    let mensajeError = 'Error al registrar usuario'
    
    if (error.message.includes('User already registered')) {
      mensajeError = 'Este email ya está registrado'
    } else if (error.message.includes('Password should be at least')) {
      mensajeError = 'La contraseña debe tener al menos 6 caracteres'
    } else if (error.message.includes('Invalid email')) {
      mensajeError = 'Email inválido'
    }
    
    Swal.fire({
      title: 'Error de registro',
      text: mensajeError,
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    
    throw error
  } finally {
    cargando.value = false
  }
}

// Función para verificar sesión actual
export async function verificarSesion() {
  try {
    console.log('🔍 Verificando sesión actual...')
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error al verificar sesión:', error)
      return null
    }
    
    if (session?.user) {
      usuario.value = {
        id: session.user.id,
        email: session.user.email,
        nombre: session.user.user_metadata?.nombre || session.user.email.split('@')[0],
        rol: session.user.user_metadata?.rol || 'usuario',
        ultimoAcceso: new Date().toISOString()
      }
      
      console.log('✅ Sesión verificada:', usuario.value.email)
      return usuario.value
    }
    
    return null
    
  } catch (error) {
    console.error('Error al verificar sesión:', error)
    return null
  }
}

// Función para restaurar sesión desde localStorage
export function restaurarSesion() {
  try {
    const usuarioGuardado = localStorage.getItem('usuario')
    
    if (usuarioGuardado) {
      usuario.value = JSON.parse(usuarioGuardado)
      console.log('✅ Sesión restaurada desde localStorage')
      return usuario.value
    }
    
    return null
    
  } catch (error) {
    console.error('Error al restaurar sesión:', error)
    localStorage.removeItem('usuario')
    return null
  }
}

// Función para cambiar contraseña
export async function cambiarContraseña(email) {
  try {
    console.log('🔄 Enviando email para cambio de contraseña...')
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      console.error('Error al enviar email:', error)
      throw new Error(error.message)
    }

    Swal.fire({
      title: 'Email enviado',
      text: 'Se ha enviado un email con instrucciones para cambiar tu contraseña',
      icon: 'success',
      confirmButtonText: 'Entendido'
    })
    
    console.log('✅ Email de cambio de contraseña enviado')
    
  } catch (error) {
    console.error('Error al cambiar contraseña:', error)
    
    Swal.fire({
      title: 'Error',
      text: 'No se pudo enviar el email de cambio de contraseña',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    
    throw error
  }
}

// Función para actualizar perfil
export async function actualizarPerfil(datosPerfil) {
  try {
    console.log('👤 Actualizando perfil...')
    
    const { data, error } = await supabase.auth.updateUser({
      data: {
        nombre: datosPerfil.nombre,
        telefono: datosPerfil.telefono,
        empresa: datosPerfil.empresa
      }
    })

    if (error) {
      console.error('Error al actualizar perfil:', error)
      throw new Error(error.message)
    }

    if (data.user) {
      usuario.value = {
        ...usuario.value,
        nombre: data.user.user_metadata?.nombre || usuario.value.nombre,
        telefono: data.user.user_metadata?.telefono || datosPerfil.telefono,
        empresa: data.user.user_metadata?.empresa || datosPerfil.empresa
      }
      
      localStorage.setItem('usuario', JSON.stringify(usuario.value))
      
      console.log('✅ Perfil actualizado')
      return usuario.value
    }
    
    throw new Error('No se pudo actualizar el perfil')
    
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    throw error
  }
}

// Getters para el estado
export function getUsuario() {
  return usuario.value
}

export function getCargando() {
  return cargando.value
}

export function estaAutenticado() {
  return usuario.value !== null
}

export function esAdmin() {
  return usuario.value?.rol === 'admin'
}

// Función para verificar permisos
export function tienePermiso(permiso) {
  if (!usuario.value) return false
  
  const permisos = {
    admin: ['*'], // Admin tiene todos los permisos
    usuario: ['ver_pedidos', 'crear_pedidos', 'ver_clientes'],
    vendedor: ['ver_pedidos', 'crear_pedidos', 'ver_clientes', 'ver_inventario']
  }
  
  const rolPermisos = permisos[usuario.value.rol] || []
  return rolPermisos.includes('*') || rolPermisos.includes(permiso)
}

// Función para obtener información del usuario actual
export function obtenerInfoUsuario() {
  return {
    usuario: usuario.value,
    cargando: cargando.value,
    autenticado: estaAutenticado(),
    esAdmin: esAdmin()
  }
}
