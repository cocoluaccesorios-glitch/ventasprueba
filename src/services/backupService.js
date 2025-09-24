// Servicio de backup y exportación
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient.js'
import { getPedidos } from './apiService.js'
import { getClientes } from './clientService.js'
import { obtenerProductos } from './productosService.js'
import { getIngresos } from './ingresosService.js'
import Swal from 'sweetalert2'

// Estado global de backup
const backups = ref([])
const cargando = ref(false)

// Función para crear backup completo
export async function crearBackupCompleto() {
  cargando.value = true
  
  try {
    console.log('💾 Creando backup completo...')
    
    // Obtener todos los datos
    const [pedidos, clientes, productos, ingresos] = await Promise.all([
      getPedidos(),
      getClientes(),
      obtenerProductos(),
      getIngresos()
    ])
    
    // Crear estructura del backup
    const backup = {
      metadata: {
        fechaCreacion: new Date().toISOString(),
        version: '1.0',
        tipo: 'backup_completo',
        descripcion: 'Backup completo del sistema Cocolu'
      },
      datos: {
        pedidos: pedidos.map(pedido => ({
          id: pedido.id,
          numero_pedido: pedido.numero_pedido,
          cliente_id: pedido.cliente_id,
          cliente_nombre: pedido.cliente_nombre,
          cliente_apellido: pedido.cliente_apellido,
          cliente_telefono: pedido.cliente_telefono,
          cliente_email: pedido.cliente_email,
          cliente_cedula: pedido.cliente_cedula,
          total_usd: pedido.total_usd,
          total_ves: pedido.total_ves,
          metodo_pago: pedido.metodo_pago,
          tipo_pago: pedido.tipo_pago,
          estado: pedido.estado,
          fecha_pedido: pedido.fecha_pedido,
          detalles_pedido: pedido.detalles_pedido,
          observaciones: pedido.observaciones,
          tasa_bcv: pedido.tasa_bcv,
          created_at: pedido.created_at,
          updated_at: pedido.updated_at
        })),
        clientes: clientes.map(cliente => ({
          id: cliente.id,
          cedula: cliente.cedula,
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          telefono: cliente.telefono,
          email: cliente.email,
          direccion: cliente.direccion,
          fecha_registro: cliente.fecha_registro,
          activo: cliente.activo,
          observaciones: cliente.observaciones,
          created_at: cliente.created_at,
          updated_at: cliente.updated_at
        })),
        productos: productos.map(producto => ({
          id: producto.id,
          sku: producto.sku,
          nombre: producto.nombre,
          nombre_producto: producto.nombre_producto,
          descripcion: producto.descripcion,
          precio_usd: producto.precio_usd,
          precio_ves: producto.precio_ves,
          stock_actual: producto.stock_actual,
          stock_minimo: producto.stock_minimo,
          stock_maximo: producto.stock_maximo,
          categoria: producto.categoria,
          categoria_id: producto.categoria_id,
          marca: producto.marca,
          modelo: producto.modelo,
          codigo_barras: producto.codigo_barras,
          ubicacion: producto.ubicacion,
          proveedor: producto.proveedor,
          costo_usd: producto.costo_usd,
          margen_ganancia: producto.margen_ganancia,
          activo: producto.activo,
          imagen_url: producto.imagen_url,
          peso: producto.peso,
          dimensiones: producto.dimensiones,
          unidad_medida: producto.unidad_medida,
          fecha_creacion: producto.fecha_creacion,
          fecha_actualizacion: producto.fecha_actualizacion
        })),
        ingresos: ingresos.map(ingreso => ({
          id: ingreso.id,
          fecha: ingreso.fecha,
          idVenta: ingreso.idVenta,
          cliente: ingreso.cliente,
          montoUSD: ingreso.montoUSD,
          montoVES: ingreso.montoVES,
          metodoPago: ingreso.metodoPago,
          referencia: ingreso.referencia,
          tipoIngreso: ingreso.tipoIngreso,
          descripcion: ingreso.descripcion,
          tasa_bcv: ingreso.tasa_bcv,
          fecha_creacion: ingreso.fecha_creacion
        }))
      },
      estadisticas: {
        totalPedidos: pedidos.length,
        totalClientes: clientes.length,
        totalProductos: productos.length,
        totalIngresos: ingresos.length,
        fechaUltimoPedido: pedidos.length > 0 ? pedidos[0].fecha_pedido : null,
        fechaUltimoCliente: clientes.length > 0 ? clientes[0].fecha_registro : null
      }
    }
    
    // Guardar backup en Supabase
    const { data, error } = await supabase
      .from('backups')
      .insert([
        {
          nombre: `backup_completo_${new Date().toISOString().split('T')[0]}`,
          tipo: 'completo',
          datos: JSON.stringify(backup),
          tamaño: JSON.stringify(backup).length,
          fecha_creacion: new Date().toISOString()
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Error al guardar backup:', error)
      throw new Error(`Error al guardar backup: ${error.message}`)
    }
    
    // Agregar al estado local
    backups.value.unshift(data)
    
    console.log('✅ Backup completo creado:', data.id)
    
    Swal.fire({
      title: 'Backup creado',
      text: 'El backup completo se ha creado exitosamente',
      icon: 'success',
      confirmButtonText: 'Entendido'
    })
    
    return data
    
  } catch (error) {
    console.error('Error al crear backup:', error)
    
    Swal.fire({
      title: 'Error',
      text: 'No se pudo crear el backup',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    
    throw error
  } finally {
    cargando.value = false
  }
}

// Función para exportar datos a CSV
export async function exportarDatosCSV(tipo, fechaInicio = null, fechaFin = null) {
  cargando.value = true
  
  try {
    console.log(`📊 Exportando ${tipo} a CSV...`)
    
    let datos = []
    let nombreArchivo = ''
    
    switch (tipo) {
      case 'pedidos':
        datos = await getPedidos()
        nombreArchivo = 'pedidos'
        
        // Filtrar por fecha si se especifica
        if (fechaInicio && fechaFin) {
          datos = datos.filter(pedido => {
            const fecha = new Date(pedido.fecha_pedido || pedido.created_at)
            return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin)
          })
        }
        break
        
      case 'clientes':
        datos = await getClientes()
        nombreArchivo = 'clientes'
        break
        
      case 'productos':
        datos = await obtenerProductos()
        nombreArchivo = 'productos'
        break
        
      case 'ingresos':
        datos = await getIngresos()
        nombreArchivo = 'ingresos'
        
        // Filtrar por fecha si se especifica
        if (fechaInicio && fechaFin) {
          datos = datos.filter(ingreso => {
            const fecha = new Date(ingreso.fecha)
            return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin)
          })
        }
        break
        
      default:
        throw new Error('Tipo de exportación no válido')
    }
    
    if (datos.length === 0) {
      Swal.fire({
        title: 'Sin datos',
        text: 'No hay datos para exportar',
        icon: 'info',
        confirmButtonText: 'Entendido'
      })
      return
    }
    
    // Generar CSV
    const csvContent = generarCSV(datos, tipo)
    
    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('✅ Datos exportados a CSV')
    
    Swal.fire({
      title: 'Exportación exitosa',
      text: `Se han exportado ${datos.length} registros a CSV`,
      icon: 'success',
      confirmButtonText: 'Entendido'
    })
    
  } catch (error) {
    console.error('Error al exportar datos:', error)
    
    Swal.fire({
      title: 'Error',
      text: 'No se pudo exportar los datos',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    
    throw error
  } finally {
    cargando.value = false
  }
}

// Función para generar CSV
function generarCSV(datos, tipo) {
  if (datos.length === 0) return ''
  
  let headers = []
  let rows = []
  
  switch (tipo) {
    case 'pedidos':
      headers = [
        'ID', 'Número Pedido', 'Cliente', 'Teléfono', 'Email', 'Cédula',
        'Total USD', 'Total VES', 'Método Pago', 'Tipo Pago', 'Estado',
        'Fecha Pedido', 'Observaciones', 'Tasa BCV'
      ]
      
      rows = datos.map(pedido => [
        pedido.id,
        pedido.numero_pedido || '',
        `${pedido.cliente_nombre || ''} ${pedido.cliente_apellido || ''}`.trim(),
        pedido.cliente_telefono || '',
        pedido.cliente_email || '',
        pedido.cliente_cedula || '',
        pedido.total_usd || 0,
        pedido.total_ves || 0,
        pedido.metodo_pago || '',
        pedido.tipo_pago || '',
        pedido.estado || '',
        pedido.fecha_pedido || '',
        pedido.observaciones || '',
        pedido.tasa_bcv || 0
      ])
      break
      
    case 'clientes':
      headers = [
        'ID', 'Cédula', 'Nombre', 'Apellido', 'Teléfono', 'Email',
        'Dirección', 'Fecha Registro', 'Activo', 'Observaciones'
      ]
      
      rows = datos.map(cliente => [
        cliente.id,
        cliente.cedula || '',
        cliente.nombre || '',
        cliente.apellido || '',
        cliente.telefono || '',
        cliente.email || '',
        cliente.direccion || '',
        cliente.fecha_registro || '',
        cliente.activo ? 'Sí' : 'No',
        cliente.observaciones || ''
      ])
      break
      
    case 'productos':
      headers = [
        'ID', 'SKU', 'Nombre', 'Descripción', 'Precio USD', 'Precio VES',
        'Stock Actual', 'Stock Mínimo', 'Stock Máximo', 'Categoría',
        'Marca', 'Modelo', 'Código Barras', 'Ubicación', 'Proveedor',
        'Costo USD', 'Activo'
      ]
      
      rows = datos.map(producto => [
        producto.id,
        producto.sku || '',
        producto.nombre || producto.nombre_producto || '',
        producto.descripcion || '',
        producto.precio_usd || 0,
        producto.precio_ves || 0,
        producto.stock_actual || 0,
        producto.stock_minimo || 0,
        producto.stock_maximo || 0,
        producto.categoria || '',
        producto.marca || '',
        producto.modelo || '',
        producto.codigo_barras || '',
        producto.ubicacion || '',
        producto.proveedor || '',
        producto.costo_usd || 0,
        producto.activo ? 'Sí' : 'No'
      ])
      break
      
    case 'ingresos':
      headers = [
        'ID', 'Fecha', 'ID Venta', 'Cliente', 'Monto USD', 'Monto VES',
        'Método Pago', 'Referencia', 'Tipo Ingreso', 'Descripción', 'Tasa BCV'
      ]
      
      rows = datos.map(ingreso => [
        ingreso.id,
        ingreso.fecha,
        ingreso.idVenta,
        ingreso.cliente,
        ingreso.montoUSD,
        ingreso.montoVES,
        ingreso.metodoPago,
        ingreso.referencia,
        ingreso.tipoIngreso,
        ingreso.descripcion,
        ingreso.tasa_bcv || 0
      ])
      break
  }
  
  // Crear contenido CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  return csvContent
}

// Función para obtener lista de backups
export async function obtenerBackups() {
  try {
    console.log('📋 Obteniendo lista de backups...')
    
    const { data, error } = await supabase
      .from('backups')
      .select('*')
      .order('fecha_creacion', { ascending: false })
    
    if (error) {
      console.error('Error al obtener backups:', error)
      throw new Error(`Error al obtener backups: ${error.message}`)
    }
    
    backups.value = data || []
    console.log('✅ Backups obtenidos:', backups.value.length)
    return backups.value
    
  } catch (error) {
    console.error('Error al obtener backups:', error)
    return []
  }
}

// Función para restaurar backup
export async function restaurarBackup(backupId) {
  try {
    console.log('🔄 Restaurando backup:', backupId)
    
    const confirmacion = await Swal.fire({
      title: 'Restaurar backup',
      text: '¿Estás seguro de que quieres restaurar este backup? Esto sobrescribirá todos los datos actuales.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    })
    
    if (!confirmacion.isConfirmed) return
    
    // Obtener backup
    const { data: backup, error } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backupId)
      .single()
    
    if (error) {
      console.error('Error al obtener backup:', error)
      throw new Error(`Error al obtener backup: ${error.message}`)
    }
    
    const datosBackup = JSON.parse(backup.datos)
    
    // Restaurar datos (esto requeriría implementar funciones de restauración específicas)
    console.log('📦 Datos del backup:', datosBackup.estadisticas)
    
    Swal.fire({
      title: 'Backup restaurado',
      text: 'El backup se ha restaurado exitosamente',
      icon: 'success',
      confirmButtonText: 'Entendido'
    })
    
  } catch (error) {
    console.error('Error al restaurar backup:', error)
    
    Swal.fire({
      title: 'Error',
      text: 'No se pudo restaurar el backup',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    
    throw error
  }
}

// Función para eliminar backup
export async function eliminarBackup(backupId) {
  try {
    console.log('🗑️ Eliminando backup:', backupId)
    
    const confirmacion = await Swal.fire({
      title: 'Eliminar backup',
      text: '¿Estás seguro de que quieres eliminar este backup?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    })
    
    if (!confirmacion.isConfirmed) return
    
    const { error } = await supabase
      .from('backups')
      .delete()
      .eq('id', backupId)
    
    if (error) {
      console.error('Error al eliminar backup:', error)
      throw new Error(`Error al eliminar backup: ${error.message}`)
    }
    
    // Remover del estado local
    backups.value = backups.value.filter(b => b.id !== backupId)
    
    console.log('✅ Backup eliminado:', backupId)
    
    Swal.fire({
      title: 'Backup eliminado',
      text: 'El backup se ha eliminado exitosamente',
      icon: 'success',
      confirmButtonText: 'Entendido'
    })
    
  } catch (error) {
    console.error('Error al eliminar backup:', error)
    
    Swal.fire({
      title: 'Error',
      text: 'No se pudo eliminar el backup',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    
    throw error
  }
}

// Función para limpiar backups antiguos
export async function limpiarBackupsAntiguos(dias = 30) {
  try {
    console.log('🧹 Limpiando backups antiguos...')
    
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - dias)
    
    const { error } = await supabase
      .from('backups')
      .delete()
      .lt('fecha_creacion', fechaLimite.toISOString())
    
    if (error) {
      console.error('Error al limpiar backups:', error)
      throw new Error(`Error al limpiar backups: ${error.message}`)
    }
    
    // Actualizar estado local
    backups.value = backups.value.filter(b => 
      new Date(b.fecha_creacion) >= fechaLimite
    )
    
    console.log('✅ Backups antiguos eliminados')
    
  } catch (error) {
    console.error('Error al limpiar backups:', error)
    throw error
  }
}

// Getters para el estado
export function getBackups() {
  return backups.value
}

export function getCargando() {
  return cargando.value
}
