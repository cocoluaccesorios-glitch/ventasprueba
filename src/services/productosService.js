// Servicio completo de gestión de productos
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient.js'
import Swal from 'sweetalert2'

// Estado global de productos
const productos = ref([])
const categorias = ref([])
const cargando = ref(false)

// Función para obtener todos los productos con información completa
export async function obtenerProductos() {
  cargando.value = true
  
  try {
    console.log('📦 Obteniendo productos desde Supabase...')
    
    const { data, error } = await supabase
      .from('productos')
      .select(`
        id, 
        sku, 
        nombre, 
        nombre_producto,
        descripcion,
        precio_usd, 
        precio_ves,
        stock_actual,
        stock_minimo,
        stock_maximo,
        categoria,
        categoria_id,
        marca,
        modelo,
        codigo_barras,
        ubicacion,
        proveedor,
        costo_usd,
        margen_ganancia,
        activo,
        fecha_creacion,
        fecha_actualizacion,
        imagen_url,
        peso,
        dimensiones,
        unidad_medida,
        categorias_producto(
          id,
          nombre,
          descripcion
        )
      `)
      .eq('activo', true)
      .order('nombre', { ascending: true })
    
    if (error) {
      console.error('Error al cargar productos:', error)
      throw new Error(`Error al cargar productos: ${error.message}`)
    }
    
    productos.value = data || []
    console.log('✅ Productos cargados:', productos.value.length)
    return productos.value
    
  } catch (error) {
    console.error('Error al obtener productos:', error)
    
    Swal.fire({
      title: 'Error',
      text: 'No se pudieron cargar los productos',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    
    return []
  } finally {
    cargando.value = false
  }
}

// Función para crear un nuevo producto
export async function crearProducto(datosProducto) {
  cargando.value = true
  
  try {
    console.log('➕ Creando nuevo producto...')
    
    const { data, error } = await supabase
      .from('productos')
      .insert([
        {
          sku: datosProducto.sku,
          nombre: datosProducto.nombre,
          nombre_producto: datosProducto.nombre_producto || datosProducto.nombre,
          descripcion: datosProducto.descripcion,
          precio_usd: parseFloat(datosProducto.precio_usd) || 0,
          precio_ves: parseFloat(datosProducto.precio_ves) || 0,
          stock_actual: parseInt(datosProducto.stock_actual) || 0,
          stock_minimo: parseInt(datosProducto.stock_minimo) || 5,
          stock_maximo: parseInt(datosProducto.stock_maximo) || 100,
          categoria: datosProducto.categoria,
          categoria_id: datosProducto.categoria_id,
          marca: datosProducto.marca,
          modelo: datosProducto.modelo,
          codigo_barras: datosProducto.codigo_barras,
          ubicacion: datosProducto.ubicacion,
          proveedor: datosProducto.proveedor,
          costo_usd: parseFloat(datosProducto.costo_usd) || 0,
          margen_ganancia: parseFloat(datosProducto.margen_ganancia) || 0,
          activo: true,
          imagen_url: datosProducto.imagen_url,
          peso: parseFloat(datosProducto.peso) || 0,
          dimensiones: datosProducto.dimensiones,
          unidad_medida: datosProducto.unidad_medida || 'unidad'
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Error al crear producto:', error)
      throw new Error(`Error al crear producto: ${error.message}`)
    }
    
    // Agregar al estado local
    productos.value.push(data)
    
    console.log('✅ Producto creado:', data.id)
    
    Swal.fire({
      title: 'Producto creado',
      text: 'El producto se ha creado exitosamente',
      icon: 'success',
      confirmButtonText: 'Entendido'
    })
    
    return data
    
  } catch (error) {
    console.error('Error al crear producto:', error)
    
    Swal.fire({
      title: 'Error',
      text: 'No se pudo crear el producto',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    
    throw error
  } finally {
    cargando.value = false
  }
}

// Función para actualizar un producto
export async function actualizarProducto(id, datosProducto) {
  cargando.value = true
  
  try {
    console.log('✏️ Actualizando producto:', id)
    
    const { data, error } = await supabase
      .from('productos')
      .update({
        sku: datosProducto.sku,
        nombre: datosProducto.nombre,
        nombre_producto: datosProducto.nombre_producto || datosProducto.nombre,
        descripcion: datosProducto.descripcion,
        precio_usd: parseFloat(datosProducto.precio_usd) || 0,
        precio_ves: parseFloat(datosProducto.precio_ves) || 0,
        stock_actual: parseInt(datosProducto.stock_actual) || 0,
        stock_minimo: parseInt(datosProducto.stock_minimo) || 5,
        stock_maximo: parseInt(datosProducto.stock_maximo) || 100,
        categoria: datosProducto.categoria,
        categoria_id: datosProducto.categoria_id,
        marca: datosProducto.marca,
        modelo: datosProducto.modelo,
        codigo_barras: datosProducto.codigo_barras,
        ubicacion: datosProducto.ubicacion,
        proveedor: datosProducto.proveedor,
        costo_usd: parseFloat(datosProducto.costo_usd) || 0,
        margen_ganancia: parseFloat(datosProducto.margen_ganancia) || 0,
        imagen_url: datosProducto.imagen_url,
        peso: parseFloat(datosProducto.peso) || 0,
        dimensiones: datosProducto.dimensiones,
        unidad_medida: datosProducto.unidad_medida || 'unidad',
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error al actualizar producto:', error)
      throw new Error(`Error al actualizar producto: ${error.message}`)
    }
    
    // Actualizar en el estado local
    const index = productos.value.findIndex(p => p.id === id)
    if (index !== -1) {
      productos.value[index] = data
    }
    
    console.log('✅ Producto actualizado:', data.id)
    
    Swal.fire({
      title: 'Producto actualizado',
      text: 'El producto se ha actualizado exitosamente',
      icon: 'success',
      confirmButtonText: 'Entendido'
    })
    
    return data
    
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    
    Swal.fire({
      title: 'Error',
      text: 'No se pudo actualizar el producto',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    
    throw error
  } finally {
    cargando.value = false
  }
}

// Función para eliminar un producto (soft delete)
export async function eliminarProducto(id) {
  cargando.value = true
  
  try {
    console.log('🗑️ Eliminando producto:', id)
    
    const { error } = await supabase
      .from('productos')
      .update({ 
        activo: false,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', id)
    
    if (error) {
      console.error('Error al eliminar producto:', error)
      throw new Error(`Error al eliminar producto: ${error.message}`)
    }
    
    // Remover del estado local
    productos.value = productos.value.filter(p => p.id !== id)
    
    console.log('✅ Producto eliminado:', id)
    
    Swal.fire({
      title: 'Producto eliminado',
      text: 'El producto se ha eliminado exitosamente',
      icon: 'success',
      confirmButtonText: 'Entendido'
    })
    
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    
    Swal.fire({
      title: 'Error',
      text: 'No se pudo eliminar el producto',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    
    throw error
  } finally {
    cargando.value = false
  }
}

// Función para buscar productos
export function buscarProductos(termino) {
  if (!termino) return productos.value
  
  const busqueda = termino.toLowerCase()
  return productos.value.filter(producto => 
    producto.nombre?.toLowerCase().includes(busqueda) ||
    producto.nombre_producto?.toLowerCase().includes(busqueda) ||
    producto.sku?.toLowerCase().includes(busqueda) ||
    producto.codigo_barras?.toLowerCase().includes(busqueda) ||
    producto.marca?.toLowerCase().includes(busqueda) ||
    producto.modelo?.toLowerCase().includes(busqueda)
  )
}

// Función para obtener productos por categoría
export function obtenerProductosPorCategoria(categoriaId) {
  return productos.value.filter(producto => 
    producto.categoria_id === categoriaId || producto.categoria === categoriaId
  )
}

// Función para obtener productos con stock bajo
export function obtenerProductosStockBajo() {
  return productos.value.filter(producto => 
    producto.stock_actual <= producto.stock_minimo
  )
}

// Función para actualizar stock de un producto
export async function actualizarStock(id, nuevaCantidad, motivo = 'Ajuste manual') {
  cargando.value = true
  
  try {
    console.log('📊 Actualizando stock:', id, 'nueva cantidad:', nuevaCantidad)
    
    const { data, error } = await supabase
      .from('productos')
      .update({
        stock_actual: parseInt(nuevaCantidad),
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error al actualizar stock:', error)
      throw new Error(`Error al actualizar stock: ${error.message}`)
    }
    
    // Actualizar en el estado local
    const index = productos.value.findIndex(p => p.id === id)
    if (index !== -1) {
      productos.value[index] = data
    }
    
    console.log('✅ Stock actualizado:', data.id)
    
    // Registrar movimiento de stock
    await registrarMovimientoStock(id, motivo, nuevaCantidad)
    
    return data
    
  } catch (error) {
    console.error('Error al actualizar stock:', error)
    throw error
  } finally {
    cargando.value = false
  }
}

// Función para registrar movimiento de stock
async function registrarMovimientoStock(productoId, motivo, cantidad) {
  try {
    await supabase
      .from('movimientos_stock')
      .insert([
        {
          producto_id: productoId,
          tipo_movimiento: 'ajuste',
          cantidad: cantidad,
          motivo: motivo,
          fecha: new Date().toISOString()
        }
      ])
  } catch (error) {
    console.error('Error al registrar movimiento de stock:', error)
  }
}

// Función para obtener categorías
export async function obtenerCategorias() {
  try {
    console.log('📂 Obteniendo categorías...')
    
    const { data, error } = await supabase
      .from('categorias_producto')
      .select('*')
      .order('nombre', { ascending: true })
    
    if (error) {
      console.error('Error al cargar categorías:', error)
      return []
    }
    
    categorias.value = data || []
    console.log('✅ Categorías cargadas:', categorias.value.length)
    return categorias.value
    
  } catch (error) {
    console.error('Error al obtener categorías:', error)
    return []
  }
}

// Función para crear categoría
export async function crearCategoria(datosCategoria) {
  try {
    console.log('➕ Creando nueva categoría...')
    
    const { data, error } = await supabase
      .from('categorias_producto')
      .insert([
        {
          nombre: datosCategoria.nombre,
          descripcion: datosCategoria.descripcion,
          activa: true
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Error al crear categoría:', error)
      throw new Error(`Error al crear categoría: ${error.message}`)
    }
    
    categorias.value.push(data)
    console.log('✅ Categoría creada:', data.id)
    return data
    
  } catch (error) {
    console.error('Error al crear categoría:', error)
    throw error
  }
}

// Getters para el estado
export function getProductos() {
  return productos.value
}

export function getCategorias() {
  return categorias.value
}

export function getCargando() {
  return cargando.value
}

// Función para obtener estadísticas de productos
export function obtenerEstadisticasProductos() {
  const totalProductos = productos.value.length
  const productosActivos = productos.value.filter(p => p.activo).length
  const productosStockBajo = obtenerProductosStockBajo().length
  const totalStock = productos.value.reduce((sum, p) => sum + (p.stock_actual || 0), 0)
  const valorInventario = productos.value.reduce((sum, p) => 
    sum + ((p.stock_actual || 0) * (p.precio_usd || 0)), 0)
  
  return {
    totalProductos,
    productosActivos,
    productosStockBajo,
    totalStock,
    valorInventario: parseFloat(valorInventario.toFixed(2))
  }
}
