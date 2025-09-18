import { supabase } from '../lib/supabaseClient.js'
import Swal from 'sweetalert2'

// Mock data para desarrollo
const USE_MOCK_DATA = true

const mockClientes = [
  {
    id: 1,
    cedula: '12345678',
    nombre: 'Juan',
    apellido: 'Pérez',
    telefono: '123-456-7890',
    email: 'juan.perez@email.com',
    direccion: 'Av. Principal 123, Caracas',
    fecha_registro: new Date().toISOString(),
    estado: 'activo'
  },
  {
    id: 2,
    cedula: '87654321',
    nombre: 'María',
    apellido: 'García',
    telefono: '987-654-3210',
    email: 'maria.garcia@email.com',
    direccion: 'Calle Secundaria 456, Valencia',
    fecha_registro: new Date(Date.now() - 86400000).toISOString(),
    estado: 'activo'
  },
  {
    id: 3,
    cedula: '11223344',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    telefono: '555-123-4567',
    email: 'carlos.rodriguez@email.com',
    direccion: 'Plaza Central 789, Maracaibo',
    fecha_registro: new Date(Date.now() - 172800000).toISOString(),
    estado: 'inactivo'
  }
]

/**
 * Obtener todos los clientes
 */
export async function getClientes() {
  if (USE_MOCK_DATA) {
    return mockClientes
  }

  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error('Error al cargar clientes:', error)
      Swal.fire('Error', 'No se pudieron cargar los clientes', 'error')
      throw new Error(error.message)
    }

    // Mapear los campos de la base de datos a la estructura esperada
    const clientesFormateados = (data || []).map(cliente => ({
      id: cliente.id,
      cedula: cliente.cedula_rif,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      telefono: cliente.telefono,
      email: cliente.email,
      direccion: cliente.direccion,
      fecha_registro: new Date().toISOString(), // Fecha actual como fallback
      estado: 'activo' // Estado por defecto
    }));

    return clientesFormateados;
  } catch (err) {
    console.error('Error en getClientes:', err)
    if (err.message.includes('fetch failed')) {
      console.warn('Usando datos mock debido a error de conexión')
      return mockClientes
    }
    throw err
  }
}

/**
 * Buscar cliente por cédula
 */
export async function buscarClientePorCedula(cedula) {
  if (USE_MOCK_DATA) {
    return mockClientes.find(c => c.cedula === cedula) || null
  }

  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('cedula_rif', cedula)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error al buscar cliente:', error)
      throw new Error(error.message)
    }

    // Mapear el resultado si existe
    if (data) {
      return {
        id: data.id,
        cedula: data.cedula_rif,
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono,
        email: data.email,
        direccion: data.direccion,
        fecha_registro: new Date().toISOString(),
        estado: 'activo'
      };
    }

    return null;
  } catch (err) {
    console.error('Error en buscarClientePorCedula:', err)
    if (err.message.includes('fetch failed')) {
      console.warn('Usando datos mock debido a error de conexión')
      return mockClientes.find(c => c.cedula === cedula) || null
    }
    throw err
  }
}

/**
 * Buscar clientes por nombre o apellido
 */
export async function buscarClientesPorNombre(termino) {
  if (USE_MOCK_DATA) {
    const terminoLower = termino.toLowerCase()
    return mockClientes.filter(c => 
      c.nombre.toLowerCase().includes(terminoLower) ||
      c.apellido.toLowerCase().includes(terminoLower) ||
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(terminoLower)
    )
  }

  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .or(`nombre.ilike.%${termino}%,apellido.ilike.%${termino}%`)
      .order('nombre')

    if (error) {
      console.error('Error al buscar clientes:', error)
      throw new Error(error.message)
    }

    return data || []
  } catch (err) {
    console.error('Error en buscarClientesPorNombre:', err)
    if (err.message.includes('fetch failed')) {
      console.warn('Usando datos mock debido a error de conexión')
      const terminoLower = termino.toLowerCase()
      return mockClientes.filter(c => 
        c.nombre.toLowerCase().includes(terminoLower) ||
        c.apellido.toLowerCase().includes(terminoLower) ||
        `${c.nombre} ${c.apellido}`.toLowerCase().includes(terminoLower)
      )
    }
    throw err
  }
}

/**
 * Crear nuevo cliente
 */
export async function crearCliente(cliente) {
  if (USE_MOCK_DATA) {
    const nuevoCliente = {
      id: mockClientes.length + 1,
      ...cliente,
      fecha_registro: new Date().toISOString(),
      estado: 'activo'
    }
    mockClientes.push(nuevoCliente)
    return nuevoCliente
  }

  try {
    // Validar que la cédula no exista
    const clienteExistente = await buscarClientePorCedula(cliente.cedula)
    if (clienteExistente) {
      throw new Error('Ya existe un cliente con esta cédula')
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert([{
        cedula: cliente.cedula,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        telefono: cliente.telefono,
        email: cliente.email,
        direccion: cliente.direccion,
        estado: 'activo'
      }])
      .select()
      .single()

    if (error) {
      console.error('Error al crear cliente:', error)
      Swal.fire('Error', `No se pudo crear el cliente: ${error.message}`, 'error')
      throw new Error(error.message)
    }

    Swal.fire('¡Éxito!', 'Cliente creado correctamente', 'success')
    return data
  } catch (err) {
    console.error('Error en crearCliente:', err)
    if (err.message.includes('fetch failed')) {
      console.warn('Usando datos mock debido a error de conexión')
      const nuevoCliente = {
        id: mockClientes.length + 1,
        ...cliente,
        fecha_registro: new Date().toISOString(),
        estado: 'activo'
      }
      mockClientes.push(nuevoCliente)
      return nuevoCliente
    }
    throw err
  }
}

/**
 * Actualizar cliente existente
 */
export async function actualizarCliente(clienteId, cambios) {
  if (USE_MOCK_DATA) {
    const index = mockClientes.findIndex(c => c.id === clienteId)
    if (index !== -1) {
      mockClientes[index] = { ...mockClientes[index], ...cambios }
      return mockClientes[index]
    }
    throw new Error('Cliente no encontrado')
  }

  try {
    const { data, error } = await supabase
      .from('clientes')
      .update(cambios)
      .eq('id', clienteId)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar cliente:', error)
      Swal.fire('Error', `No se pudo actualizar el cliente: ${error.message}`, 'error')
      throw new Error(error.message)
    }

    Swal.fire('¡Éxito!', 'Cliente actualizado correctamente', 'success')
    return data
  } catch (err) {
    console.error('Error en actualizarCliente:', err)
    if (err.message.includes('fetch failed')) {
      console.warn('Usando datos mock debido a error de conexión')
      const index = mockClientes.findIndex(c => c.id === clienteId)
      if (index !== -1) {
        mockClientes[index] = { ...mockClientes[index], ...cambios }
        return mockClientes[index]
      }
      throw new Error('Cliente no encontrado')
    }
    throw err
  }
}

/**
 * Desactivar cliente (soft delete)
 */
export async function desactivarCliente(clienteId) {
  if (USE_MOCK_DATA) {
    const index = mockClientes.findIndex(c => c.id === clienteId)
    if (index !== -1) {
      mockClientes[index].estado = 'inactivo'
      return mockClientes[index]
    }
    throw new Error('Cliente no encontrado')
  }

  try {
    const { data, error } = await supabase
      .from('clientes')
      .update({ estado: 'inactivo' })
      .eq('id', clienteId)
      .select()
      .single()

    if (error) {
      console.error('Error al desactivar cliente:', error)
      Swal.fire('Error', `No se pudo desactivar el cliente: ${error.message}`, 'error')
      throw new Error(error.message)
    }

    Swal.fire('¡Desactivado!', 'El cliente ha sido desactivado', 'success')
    return data
  } catch (err) {
    console.error('Error en desactivarCliente:', err)
    if (err.message.includes('fetch failed')) {
      console.warn('Usando datos mock debido a error de conexión')
      const index = mockClientes.findIndex(c => c.id === clienteId)
      if (index !== -1) {
        mockClientes[index].estado = 'inactivo'
        return mockClientes[index]
      }
      throw new Error('Cliente no encontrado')
    }
    throw err
  }
}

/**
 * Obtener historial de pedidos de un cliente
 */
export async function getHistorialCliente(clienteId) {
  if (USE_MOCK_DATA) {
    // Mock de historial de pedidos
    return [
      {
        id: 101,
        fecha_pedido: new Date().toISOString(),
        total_usd: 1550.00,
        estado_entrega: 'pendiente',
        productos_count: 2
      },
      {
        id: 102,
        fecha_pedido: new Date(Date.now() - 86400000).toISOString(),
        total_usd: 375.00,
        estado_entrega: 'entregado',
        productos_count: 2
      }
    ]
  }

  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        id,
        fecha_pedido,
        total_usd,
        estado_entrega,
        detalles_pedido(count)
      `)
      .eq('cliente_id', clienteId)
      .order('fecha_pedido', { ascending: false })

    if (error) {
      console.error('Error al obtener historial:', error)
      throw new Error(error.message)
    }

    return data || []
  } catch (err) {
    console.error('Error en getHistorialCliente:', err)
    if (err.message.includes('fetch failed')) {
      console.warn('Usando datos mock debido a error de conexión')
      return [
        {
          id: 101,
          fecha_pedido: new Date().toISOString(),
          total_usd: 1550.00,
          estado_entrega: 'pendiente',
          productos_count: 2
        }
      ]
    }
    throw err
  }
}
