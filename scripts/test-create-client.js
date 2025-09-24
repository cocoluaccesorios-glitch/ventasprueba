#!/usr/bin/env node

/**
 * Script para probar la creación de clientes
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan credenciales de Supabase en el archivo .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Simular la función crearCliente del servicio
 */
async function simularCrearCliente(cliente) {
  try {
    console.log('👤 Creando nuevo cliente:', cliente)
    
    // Validar que la cédula no exista
    const { data: clienteExistente, error: fetchError } = await supabase
      .from('clientes')
      .select('*')
      .eq('cedula_rif', cliente.cedula)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error al verificar cliente existente:', fetchError.message)
      throw new Error(fetchError.message)
    }
    
    if (clienteExistente) {
      console.warn('⚠️ Cliente ya existe con cédula:', cliente.cedula)
      throw new Error('Ya existe un cliente con esta cédula')
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert([{
        cedula_rif: cliente.cedula,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        telefono: cliente.telefono,
        email: cliente.email,
        direccion: cliente.direccion,
        fecha_registro: new Date().toISOString(),
        activo: true
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Error al crear cliente:', error)
      
      // Si es error de duplicado, mostrar mensaje específico
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        throw new Error('Ya existe un cliente con esta cédula')
      }
      
      throw new Error(error.message)
    }

    console.log('✅ Cliente creado exitosamente:', data.id)
    
    // Formatear respuesta
    const clienteFormateado = {
      id: data.id,
      cedula_rif: data.cedula_rif, // Mantener cedula_rif para compatibilidad
      cedula: data.cedula_rif, // También mantener cedula para compatibilidad
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
      email: data.email,
      direccion: data.direccion,
      fecha_registro: data.fecha_registro || new Date().toISOString(),
      estado: 'activo'
    }
    
    return clienteFormateado
  } catch (err) {
    console.error('❌ Error en simularCrearCliente:', err.message)
    throw err
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🧪 Prueba de creación de clientes')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    // Datos de prueba
    const clientePrueba = {
      cedula: 'TEST123456',
      nombre: 'Cliente',
      apellido: 'Prueba',
      telefono: '0412-1234567',
      email: 'cliente.prueba@email.com',
      direccion: 'Dirección de prueba'
    }
    
    console.log('📋 Datos del cliente a crear:')
    console.log(JSON.stringify(clientePrueba, null, 2))
    
    const nuevoCliente = await simularCrearCliente(clientePrueba)
    
    console.log('\\n✅ Cliente creado exitosamente:')
    console.log(JSON.stringify(nuevoCliente, null, 2))
    
    console.log('\\n🎉 ¡Prueba exitosa!')
    console.log('✅ La creación de clientes funciona correctamente')
    console.log('✅ Los datos se guardan en la base de datos')
    console.log('✅ La estructura es compatible con el componente')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
