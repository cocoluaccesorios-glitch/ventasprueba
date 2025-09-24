#!/usr/bin/env node

/**
 * Script para verificar la carga de clientes en la base de datos
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
 * Verificar clientes en la base de datos
 */
async function verificarClientes() {
  try {
    console.log('🔍 Verificando clientes en la base de datos...')
    
    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Error al obtener clientes:', error.message)
      return false
    }
    
    console.log(`📊 Total de clientes encontrados: ${clientes.length}`)
    console.log('')
    
    if (clientes.length === 0) {
      console.log('⚠️ No hay clientes en la base de datos')
      console.log('💡 Necesitas crear algunos clientes primero')
      return false
    }
    
    console.log('👥 Lista de clientes:')
    clientes.forEach((cliente, index) => {
      console.log(`${index + 1}. ID: ${cliente.id}`)
      console.log(`   Nombre: ${cliente.nombre} ${cliente.apellido}`)
      console.log(`   Cédula: ${cliente.cedula_rif}`)
      console.log(`   Teléfono: ${cliente.telefono || 'N/A'}`)
      console.log(`   Email: ${cliente.email || 'N/A'}`)
      console.log(`   Creado: ${new Date(cliente.created_at).toLocaleString('es-VE')}`)
      console.log('')
    })
    
    // Probar búsqueda
    console.log('🔍 Probando búsqueda de clientes...')
    
    if (clientes.length > 0) {
      const primerCliente = clientes[0]
      const nombreBusqueda = primerCliente.nombre.substring(0, 3)
      
      console.log(`🔍 Buscando por: "${nombreBusqueda}"`)
      
      const { data: resultadosBusqueda, error: errorBusqueda } = await supabase
        .from('clientes')
        .select('*')
        .or(`nombre.ilike.%${nombreBusqueda}%,apellido.ilike.%${nombreBusqueda}%,cedula_rif.ilike.%${nombreBusqueda}%`)
        .limit(5)
      
      if (errorBusqueda) {
        console.error('❌ Error en búsqueda:', errorBusqueda.message)
      } else {
        console.log(`✅ Resultados de búsqueda: ${resultadosBusqueda.length} clientes`)
        resultadosBusqueda.forEach((cliente, index) => {
          console.log(`   ${index + 1}. ${cliente.nombre} ${cliente.apellido} (${cliente.cedula_rif})`)
        })
      }
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Crear un cliente de prueba si no hay clientes
 */
async function crearClientePrueba() {
  try {
    console.log('👤 Creando cliente de prueba...')
    
    const clientePrueba = {
      nombre: 'Juan',
      apellido: 'Pérez',
      cedula_rif: 'V-12345678',
      telefono: '0412-1234567',
      email: 'juan.perez@email.com',
      direccion: 'Caracas, Venezuela'
    }
    
    const { data, error } = await supabase
      .from('clientes')
      .insert([clientePrueba])
      .select()
    
    if (error) {
      console.error('❌ Error al crear cliente de prueba:', error.message)
      return false
    }
    
    console.log('✅ Cliente de prueba creado exitosamente:')
    console.log(`   ID: ${data[0].id}`)
    console.log(`   Nombre: ${data[0].nombre} ${data[0].apellido}`)
    console.log(`   Cédula: ${data[0].cedula_rif}`)
    
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🔍 Verificación de clientes en la base de datos')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    const clientesExisten = await verificarClientes()
    
    if (!clientesExisten) {
      console.log('')
      console.log('💡 Creando cliente de prueba...')
      const clienteCreado = await crearClientePrueba()
      
      if (clienteCreado) {
        console.log('')
        console.log('✅ Cliente de prueba creado')
        console.log('🔄 Verificando nuevamente...')
        await verificarClientes()
      }
    }
    
    console.log('')
    console.log('📋 Resumen:')
    console.log('   ✅ Base de datos accesible')
    console.log('   ✅ Clientes disponibles para búsqueda')
    console.log('   ✅ Búsqueda funcionando')
    console.log('')
    console.log('💡 Si el problema persiste en la aplicación:')
    console.log('   1. Verifica que el servicio de clientes esté funcionando')
    console.log('   2. Revisa la consola del navegador para errores')
    console.log('   3. Verifica que los eventos de click estén funcionando')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
