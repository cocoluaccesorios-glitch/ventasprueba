#!/usr/bin/env node

/**
 * Script para probar la selección de clientes
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
 * Simular la búsqueda y selección de clientes
 */
async function simularSeleccionCliente() {
  try {
    console.log('🧪 Simulando búsqueda y selección de clientes...')
    
    // Obtener todos los clientes
    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('*')
    
    if (error) {
      console.error('❌ Error al obtener clientes:', error.message)
      return false
    }
    
    console.log(`📊 Total de clientes: ${clientes.length}`)
    
    // Simular búsqueda por "luis"
    const query = 'luis'
    console.log(`🔍 Buscando por: "${query}"`)
    
    const resultados = clientes.filter(cliente => {
      if (!cliente) return false
      
      const nombre = (cliente.nombre || '').toLowerCase()
      const apellido = (cliente.apellido || '').toLowerCase()
      const cedula = (cliente.cedula_rif || '').toLowerCase()
      const telefono = (cliente.telefono || '').toLowerCase()
      const queryLower = query.toLowerCase()
      
      const matchNombre = nombre.includes(queryLower)
      const matchApellido = apellido.includes(queryLower)
      const matchCedula = cedula.includes(queryLower)
      const matchTelefono = telefono.includes(queryLower)
      
      return matchNombre || matchApellido || matchCedula || matchTelefono
    })
    
    console.log(`📋 Resultados encontrados: ${resultados.length}`)
    
    if (resultados.length > 0) {
      const clienteSeleccionado = resultados[0]
      console.log('👤 Cliente seleccionado:')
      console.log('   ID:', clienteSeleccionado.id)
      console.log('   Nombre:', clienteSeleccionado.nombre)
      console.log('   Apellido:', clienteSeleccionado.apellido)
      console.log('   Cédula:', clienteSeleccionado.cedula_rif)
      console.log('   Teléfono:', clienteSeleccionado.telefono)
      console.log('   Email:', clienteSeleccionado.email)
      console.log('   Dirección:', clienteSeleccionado.direccion)
      
      // Simular asignación a venta
      const venta = {
        cliente_id: clienteSeleccionado.id,
        cliente_cedula: clienteSeleccionado.cedula_rif,
        cliente_nombre: clienteSeleccionado.nombre,
        cliente_apellido: clienteSeleccionado.apellido,
        cliente_telefono: clienteSeleccionado.telefono,
        cliente_email: clienteSeleccionado.email,
        cliente_direccion: clienteSeleccionado.direccion
      }
      
      console.log('')
      console.log('✅ Datos asignados a venta:')
      console.log('   cliente_id:', venta.cliente_id)
      console.log('   cliente_cedula:', venta.cliente_cedula)
      console.log('   cliente_nombre:', venta.cliente_nombre)
      console.log('   cliente_apellido:', venta.cliente_apellido)
      
      // Verificar validación
      const cedulaValida = venta.cliente_cedula && venta.cliente_cedula.trim()
      const nombreValido = venta.cliente_nombre && venta.cliente_nombre.trim()
      
      console.log('')
      console.log('🔍 Validación:')
      console.log('   Cédula válida:', cedulaValida)
      console.log('   Nombre válido:', nombreValido)
      
      if (cedulaValida && nombreValido) {
        console.log('✅ Validación exitosa - Cliente puede ser usado')
        return true
      } else {
        console.log('❌ Validación falló - Cliente no puede ser usado')
        return false
      }
    } else {
      console.log('⚠️ No se encontraron clientes')
      return false
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🧪 Prueba de selección de clientes')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    const exito = await simularSeleccionCliente()
    
    if (exito) {
      console.log('')
      console.log('🎉 ¡Prueba exitosa!')
      console.log('✅ La selección de clientes funciona correctamente')
      console.log('✅ Los datos se asignan correctamente')
      console.log('✅ La validación pasa')
      
    } else {
      console.log('')
      console.log('⚠️ La prueba falló')
      console.log('💡 Revisa los datos de los clientes en la base de datos')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
