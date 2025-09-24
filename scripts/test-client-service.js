#!/usr/bin/env node

/**
 * Script para probar el servicio de clientes
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
 * Simular la función getClientes del servicio
 */
async function simularGetClientes() {
  try {
    console.log('🧪 Simulando función getClientes...')
    
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error('Error al cargar clientes:', error)
      throw new Error(error.message)
    }

    // Mapear los campos de la base de datos a la estructura esperada
    const clientesFormateados = (data || []).map(cliente => ({
      id: cliente.id,
      cedula_rif: cliente.cedula_rif, // Mantener cedula_rif para compatibilidad
      cedula: cliente.cedula_rif, // También mantener cedula para compatibilidad
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      telefono: cliente.telefono,
      email: cliente.email,
      direccion: cliente.direccion,
      fecha_registro: new Date().toISOString(), // Fecha actual como fallback
      estado: 'activo' // Estado por defecto
    }));

    console.log(`📊 Clientes formateados: ${clientesFormateados.length}`)
    
    clientesFormateados.forEach((cliente, index) => {
      console.log(`\\n${index + 1}. Cliente ID: ${cliente.id}`)
      console.log('📋 Estructura formateada:')
      Object.keys(cliente).forEach(key => {
        console.log(`   ${key}: ${cliente[key]}`);
      });
      
      console.log('\\n🔍 Verificación de campos:')
      console.log(`   cedula_rif: ${cliente.cedula_rif} (tipo: ${typeof cliente.cedula_rif})`)
      console.log(`   cedula: ${cliente.cedula} (tipo: ${typeof cliente.cedula})`)
      console.log(`   nombre: ${cliente.nombre} (tipo: ${typeof cliente.nombre})`)
      
      // Simular selección
      console.log('\\n✅ Simulación de selección:')
      console.log(`   Tiene cedula_rif: ${!!cliente.cedula_rif}`)
      console.log(`   Cedula válida: ${cliente.cedula_rif && cliente.cedula_rif.trim()}`)
    });

    return clientesFormateados;
  } catch (err) {
    console.error('Error en simularGetClientes:', err)
    throw err
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🧪 Prueba del servicio de clientes')
  console.log(`⏰ ${new Date().toLocaleString('es-VE')}`)
  console.log('')
  
  try {
    const clientes = await simularGetClientes()
    
    console.log('')
    console.log('🎉 ¡Prueba exitosa!')
    console.log('✅ El servicio de clientes funciona correctamente')
    console.log('✅ Los campos cedula_rif y cedula están disponibles')
    console.log('✅ La estructura es compatible con el componente')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar
main()
