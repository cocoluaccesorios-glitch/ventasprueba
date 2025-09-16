// Servicio para gestión de clientes
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient.js'
import Swal from 'sweetalert2'

// Estado global de clientes
const clientes = ref([])

// Modo de desarrollo - usar datos de prueba si no hay conexión
const USE_MOCK_DATA = true; // Cambiar a true para usar datos de prueba

// Datos mock para desarrollo
const mockClientes = [
  {
    id: 1,
    cedula_rif: 'V12345678',
    nombre: 'Ana',
    apellido: 'Pérez',
    email: 'ana.perez@email.com'
  },
  {
    id: 2,
    cedula_rif: '26899386',
    nombre: 'Luis',
    apellido: 'Silva',
    email: 'luisxsilva56@gmail.com'
  }
]

// Funciones del servicio
export async function getClientes() {
  if (USE_MOCK_DATA) {
    console.log('🔧 Usando datos de prueba para clientes');
    clientes.value = mockClientes;
    return clientes.value;
  }
  
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error('Error al cargar clientes:', error);
      
      // Si hay problemas de permisos, columnas faltantes o la tabla no existe, usar datos mock
      if (error.message.includes('401') || error.message.includes('42501') || error.message.includes('relation') || error.message.includes('42703')) {
        console.warn('Problemas con tabla clientes, usando datos mock');
        clientes.value = mockClientes;
        return clientes.value;
      }
      
      throw error;
    }
    
    clientes.value = data || [];
    return clientes.value;
  } catch (err) {
    console.error('Error de conexión:', err);
    clientes.value = mockClientes;
    return clientes.value;
  }
}

export function getClientePorCedula(cedula) {
  return clientes.value.find(c => c.cedula_rif === cedula)
}

export function buscarClientePorCriterio(criterio) {
  return clientes.value.find(c => 
    c.cedula_rif.toLowerCase().includes(criterio.toLowerCase()) ||
    c.nombre.toLowerCase().includes(criterio.toLowerCase()) ||
    c.apellido.toLowerCase().includes(criterio.toLowerCase()) ||
    (c.telefono && c.telefono.includes(criterio))
  )
}

export async function agregarCliente(cliente) {
  if (USE_MOCK_DATA) {
    const nuevoCliente = {
      ...cliente,
      id: Date.now(),
      fecha_creacion: new Date().toISOString()
    }
    clientes.value.push(nuevoCliente)
    return nuevoCliente
  }
  
  try {
    const { data, error } = await supabase
      .from('clientes')
      .insert([{
        cedula_rif: cliente.cedula,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error al agregar cliente:', error);
      throw error;
    }
    
    // Agregar al estado local
    clientes.value.unshift(data);
    return data;
  } catch (err) {
    console.error('Error al agregar cliente:', err);
    
    // Fallback a datos mock
    const nuevoCliente = {
      ...cliente,
      id: Date.now(),
      fecha_creacion: new Date().toISOString()
    }
    clientes.value.push(nuevoCliente)
    return nuevoCliente
  }
}

export async function actualizarCliente(clienteActualizado) {
  if (USE_MOCK_DATA) {
    const index = clientes.value.findIndex(c => c.id === clienteActualizado.id)
    if (index !== -1) {
      clientes.value[index] = {
        ...clienteActualizado,
        fecha_creacion: clientes.value[index].fecha_creacion
      }
      return clientes.value[index]
    }
    return null
  }
  
  try {
    const { data, error } = await supabase
      .from('clientes')
      .update({
        cedula_rif: clienteActualizado.cedula,
        nombre: clienteActualizado.nombre,
        apellido: clienteActualizado.apellido,
        email: clienteActualizado.email
      })
      .eq('id', clienteActualizado.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error al actualizar cliente:', error);
      throw error;
    }
    
    // Actualizar en el estado local
    const index = clientes.value.findIndex(c => c.id === clienteActualizado.id)
    if (index !== -1) {
      clientes.value[index] = data;
    }
    
    return data;
  } catch (err) {
    console.error('Error al actualizar cliente:', err);
    
    // Fallback a datos mock
    const index = clientes.value.findIndex(c => c.id === clienteActualizado.id)
    if (index !== -1) {
      clientes.value[index] = {
        ...clienteActualizado,
        fecha_creacion: clientes.value[index].fecha_creacion
      }
      return clientes.value[index]
    }
    return null
  }
}

export async function eliminarCliente(id) {
  if (USE_MOCK_DATA) {
    const index = clientes.value.findIndex(c => c.id === id)
    if (index !== -1) {
      clientes.value.splice(index, 1)
      return true
    }
    return false
  }
  
  try {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error al eliminar cliente:', error);
      throw error;
    }
    
    // Eliminar del estado local
    const index = clientes.value.findIndex(c => c.id === id)
    if (index !== -1) {
      clientes.value.splice(index, 1)
    }
    
    return true;
  } catch (err) {
    console.error('Error al eliminar cliente:', err);
    
    // Fallback a datos mock
    const index = clientes.value.findIndex(c => c.id === id)
    if (index !== -1) {
      clientes.value.splice(index, 1)
      return true
    }
    return false
  }
}

export function getEstadisticasClientes() {
  return {
    total: clientes.value.length,
    conEmail: clientes.value.filter(c => c.email && c.email.trim()).length,
    recientes: clientes.value.length // Simplificado ya que no tenemos fecha_creacion en la estructura actual
  }
}
