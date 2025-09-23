import { supabase } from '../lib/supabaseClient.js'
import Swal from 'sweetalert2'

// ========================================
// VERSIÓN 4.0 - NUEVA LÓGICA IMPLEMENTADA
// ========================================
// Timestamp: 2025-09-23T23:30:00Z
// Cambio drástico para forzar nueva versión
// Solo busca en base de datos - SIN PROXIES CORS
// ========================================

/**
 * Obtiene la tasa de cambio del BCV desde la base de datos
 * @returns {Promise<number>} Tasa de cambio en Bs/USD
 */
export async function obtenerTasaBCV() {
  try {
    console.log('🚀 [VERSIÓN 4.0] NUEVA LÓGICA - Solo base de datos!')
    console.log('🔄 Obteniendo tasa BCV desde la base de datos...')
    
    const fechaHoy = new Date().toISOString().split('T')[0]
    console.log(`📅 Buscando tasa para ${fechaHoy}...`)
    
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('tasa_bcv')
      .eq('fecha', fechaHoy)
      .order('id', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Error al buscar tasa en BD: ${error.message}`)
    }
    
    if (data?.tasa_bcv) {
      console.log(`✅ Tasa BCV encontrada: ${data.tasa_bcv} Bs/USD`)
      return data.tasa_bcv
    }
    
    // No hay tasa para hoy, mostrar alerta manual
    console.log(`⚠️ No hay tasa registrada para ${fechaHoy}`)
    console.log('🔄 Solicitando entrada manual...')
    
    const tasaManual = await mostrarAlertaTasaManual()
    
    if (tasaManual && tasaManual > 0) {
      console.log(`✅ Tasa manual ingresada: ${tasaManual} Bs/USD`)
      
      // Guardar la tasa manual en la base de datos
      await guardarTasaManualEnBD(tasaManual, fechaHoy)
      
      return tasaManual
    }
    
    throw new Error('No se pudo obtener la tasa del BCV y no se ingresó tasa manual')
    
  } catch (error) {
    console.error('❌ Error al obtener tasa del BCV:', error.message)
    
    // Mostrar alerta de error y solicitar entrada manual
    const tasaManual = await mostrarAlertaTasaManual()
    
    if (tasaManual && tasaManual > 0) {
      console.log(`✅ Tasa manual ingresada después del error: ${tasaManual} Bs/USD`)
      
      // Guardar la tasa manual en la base de datos
      const fechaHoy = new Date().toISOString().split('T')[0]
      await guardarTasaManualEnBD(tasaManual, fechaHoy)
      
      return tasaManual
    }
    
    throw new Error('No se pudo obtener la tasa del BCV y no se ingresó tasa manual')
  }
}

/**
 * Guarda una tasa manual en la base de datos
 * @param {number} tasa - Tasa a guardar
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 */
async function guardarTasaManualEnBD(tasa, fecha) {
  try {
    console.log(`💾 Guardando tasa manual para ${fecha}: ${tasa} Bs/USD`)
    
    const { error } = await supabase
      .from('tasa_cambio')
      .insert({
        fecha: fecha,
        tasa_bcv: tasa
      })
    
    if (error) {
      console.warn('⚠️ Error al guardar tasa manual:', error.message)
    } else {
      console.log(`✅ Tasa manual guardada: ${tasa} Bs/USD`)
    }
    
  } catch (err) {
    console.warn('⚠️ Error inesperado al guardar tasa manual:', err.message)
  }
}

/**
 * Muestra alerta para entrada manual de tasa BCV
 * @returns {Promise<number>} Tasa ingresada manualmente
 */
async function mostrarAlertaTasaManual() {
  try {
    const { value: tasaManual } = await Swal.fire({
      title: '⚠️ Error al obtener tasa BCV',
      html: `
        <div style="text-align: left;">
          <p>No se pudo obtener la tasa de cambio del BCV automáticamente.</p>
          <p><strong>Por favor, ingresa la tasa manualmente:</strong></p>
          <p style="font-size: 0.9em; color: #666;">
            Puedes consultar la tasa actual en:
            <a href="https://www.bcv.org.ve" target="_blank" style="color: #007bff;">www.bcv.org.ve</a>
          </p>
        </div>
      `,
      input: 'number',
      inputLabel: 'Tasa BCV (Bs/USD)',
      inputPlaceholder: 'Ejemplo: 168.4157',
      inputValue: '168.4157',
      inputAttributes: {
        step: '0.0001',
        min: '50',
        max: '1000'
      },
      showCancelButton: false,
      confirmButtonText: 'Usar esta tasa',
      confirmButtonColor: '#28a745',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes ingresar una tasa válida'
        }
        const tasa = parseFloat(value)
        if (isNaN(tasa) || tasa < 50 || tasa > 1000) {
          return 'La tasa debe estar entre 50 y 1000 Bs/USD'
        }
        return null
      }
    })
    
    if (tasaManual) {
      const tasa = parseFloat(tasaManual)
      console.log(`✅ Tasa manual ingresada: ${tasa} Bs/USD`)
      
      // Guardar la tasa manual en la base de datos (solo si no existe para hoy)
      try {
        const fechaHoy = new Date().toISOString().split('T')[0]
        
        // Verificar si ya existe una tasa para hoy
        const { data: tasaExistente, error: selectError } = await supabase
          .from('tasa_cambio')
          .select('id')
          .eq('fecha', fechaHoy)
          .limit(1)
        
        if (tasaExistente && tasaExistente.length > 0) {
          console.log(`✅ Ya existe una tasa para ${fechaHoy}, no se actualiza`)
        } else {
          // Insertar nueva tasa solo si no existe
          const { error } = await supabase
            .from('tasa_cambio')
            .insert({
              fecha: fechaHoy,
              tasa_bcv: tasa
            })
          
          if (!error) {
            console.log(`✅ Tasa manual guardada en BD: ${tasa} Bs/USD`)
          }
        }
      } catch (err) {
        console.warn('⚠️ Error al guardar tasa manual:', err.message)
      }
      
      return tasa
    }
    
    return null
    
  } catch (error) {
    console.error('❌ Error en alerta de tasa manual:', error.message)
    return null
  }
}

/**
 * Obtiene la tasa más reciente de la base de datos
 * @returns {Promise<number>} Tasa más reciente
 */
export async function obtenerTasaMasReciente() {
  try {
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('tasa_bcv')
      .order('id', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.warn('No se pudo obtener la tasa de cambio:', error.message)
      throw new Error('No se pudo obtener la tasa más reciente de la base de datos')
    }

    if (!data?.tasa_bcv) {
      throw new Error('No hay tasas registradas en la base de datos')
    }

    return data.tasa_bcv

  } catch (err) {
    console.warn('Error al obtener tasa de cambio:', err)
    throw new Error('No se pudo obtener la tasa más reciente de la base de datos')
  }
}

/**
 * Actualiza la tasa BCV obteniéndola del sitio web y guardándola en la BD
 * @returns {Promise<number>} La nueva tasa obtenida
 */
export async function actualizarTasaBCV() {
  try {
    console.log('🚀 Iniciando actualización de tasa BCV...')
    
    const tasa = await obtenerTasaBCV()
    console.log(`📊 Tasa obtenida: ${tasa} Bs/USD`)
    
    return tasa
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    throw new Error('No se pudo actualizar la tasa BCV')
  }
}

/**
 * Obtiene la tasa BCV actual del sitio web
 * @returns {Promise<number>} Tasa BCV actual
 */
export async function getTasaBCV() {
  try {
    console.log('🔄 Obteniendo tasa BCV más actual del sitio web...')
    
    // SIEMPRE obtener la tasa actual del BCV
    const tasaActual = await obtenerTasaBCV()
    
    if (!tasaActual || tasaActual <= 0) {
      throw new Error('Tasa inválida obtenida del BCV')
    }
    
    console.log(`✅ Tasa BCV actual obtenida: ${tasaActual} Bs/USD`)
    
    // Intentar guardar la tasa actual en la base de datos (solo si no existe para hoy)
    const fechaHoy = new Date().toISOString().split('T')[0]
    try {
      // Verificar si ya existe una tasa para hoy
      const { data: tasaExistente, error: selectError } = await supabase
        .from('tasa_cambio')
        .select('id')
        .eq('fecha', fechaHoy)
        .limit(1)
      
      if (tasaExistente && tasaExistente.length > 0) {
        console.log(`✅ Ya existe una tasa para ${fechaHoy}, no se actualiza`)
      } else {
        // Insertar nueva tasa solo si no existe
        const { error: insertError } = await supabase
          .from('tasa_cambio')
          .insert({
            fecha: fechaHoy,
            tasa_bcv: tasaActual
          })
        
        if (insertError) {
          console.warn('⚠️ No se pudo guardar la tasa en la BD:', insertError.message)
        } else {
          console.log(`✅ Tasa actual guardada en BD: ${tasaActual} Bs/USD`)
        }
      }
    } catch (insertErr) {
      console.warn('⚠️ Error al guardar tasa en BD:', insertErr.message)
    }
    
    return tasaActual
    
  } catch (error) {
    console.error('❌ Error al obtener tasa BCV actual:', error.message)
    
    // Si hay error, mostrar alerta para entrada manual
    const tasaManual = await mostrarAlertaTasaManual()
    
    if (tasaManual && tasaManual > 0) {
      console.log(`✅ Tasa manual ingresada: ${tasaManual} Bs/USD`)
      return tasaManual
    }
    
    // Si no se ingresa tasa manual, lanzar error
    throw new Error('No se pudo obtener la tasa del BCV y no se ingresó tasa manual')
  }
}

/**
 * Obtiene la tasa BCV para una fecha específica
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Promise<number>} Tasa BCV para la fecha
 */
export async function getTasaBCVPorFecha(fecha) {
  try {
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('tasa_bcv')
      .eq('fecha', fecha)
      .order('id', { ascending: false })
      .limit(1)
      .single()

    if (data && !error) {
      console.log(`✅ Tasa BCV del ${fecha}: ${data.tasa_bcv}`)
      return data.tasa_bcv
    }

    console.log(`⚠️ No hay tasa para ${fecha}, obteniendo tasa actual del BCV...`)
    return await obtenerTasaBCV()

  } catch (error) {
    console.error('❌ Error al obtener tasa por fecha:', error.message)
    throw new Error(`No se pudo obtener la tasa BCV para la fecha ${fecha}`)
  }
}

/**
 * Obtiene la tasa de cambio del BCV desde la base de datos
 * @returns {Promise<number>} Tasa de cambio en Bs/USD
 */
export async function obtenerTasaBCV() {
  try {
    console.log('🚀 [VERSIÓN 3.0] NUEVA LÓGICA - Solo base de datos!')
    console.log('🔄 Obteniendo tasa BCV desde la base de datos...')
    
    const fechaHoy = new Date().toISOString().split('T')[0]
    console.log(`📅 Buscando tasa para ${fechaHoy}...`)
    
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('tasa_bcv')
      .eq('fecha', fechaHoy)
      .order('id', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Error al buscar tasa en BD: ${error.message}`)
    }
    
    if (data?.tasa_bcv) {
      console.log(`✅ Tasa BCV encontrada: ${data.tasa_bcv} Bs/USD`)
      return data.tasa_bcv
    }
    
    // No hay tasa para hoy, mostrar alerta manual
    console.log(`⚠️ No hay tasa registrada para ${fechaHoy}`)
    console.log('🔄 Solicitando entrada manual...')
    
    const tasaManual = await mostrarAlertaTasaManual()
    
    if (tasaManual && tasaManual > 0) {
      console.log(`✅ Tasa manual ingresada: ${tasaManual} Bs/USD`)
      
      // Guardar la tasa manual en la base de datos
      await guardarTasaManualEnBD(tasaManual, fechaHoy)
      
      return tasaManual
    }
    
    throw new Error('No se pudo obtener la tasa del BCV y no se ingresó tasa manual')
    
  } catch (error) {
    console.error('❌ Error al obtener tasa del BCV:', error.message)
    
    // Mostrar alerta de error y solicitar entrada manual
    const tasaManual = await mostrarAlertaTasaManual()
    
    if (tasaManual && tasaManual > 0) {
      console.log(`✅ Tasa manual ingresada después del error: ${tasaManual} Bs/USD`)
      
      // Guardar la tasa manual en la base de datos
      const fechaHoy = new Date().toISOString().split('T')[0]
      await guardarTasaManualEnBD(tasaManual, fechaHoy)
      
      return tasaManual
    }
    
    throw new Error('No se pudo obtener la tasa del BCV y no se ingresó tasa manual')
  }
}

/**
 * Guarda una tasa manual en la base de datos
 * @param {number} tasa - Tasa a guardar
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 */
async function guardarTasaManualEnBD(tasa, fecha) {
  try {
    console.log(`💾 Guardando tasa manual para ${fecha}: ${tasa} Bs/USD`)
    
    const { error } = await supabase
      .from('tasa_cambio')
      .insert({
        fecha: fecha,
        tasa_bcv: tasa
      })
    
    if (error) {
      console.warn('⚠️ Error al guardar tasa manual:', error.message)
    } else {
      console.log(`✅ Tasa manual guardada: ${tasa} Bs/USD`)
    }
    
  } catch (err) {
    console.warn('⚠️ Error inesperado al guardar tasa manual:', err.message)
  }
}

/**
 * Muestra alerta para entrada manual de tasa BCV
 * @returns {Promise<number>} Tasa ingresada manualmente
 */
async function mostrarAlertaTasaManual() {
  try {
    const { value: tasaManual } = await Swal.fire({
      title: '⚠️ Error al obtener tasa BCV',
      html: `
        <div style="text-align: left;">
          <p>No se pudo obtener la tasa de cambio del BCV automáticamente.</p>
          <p><strong>Por favor, ingresa la tasa manualmente:</strong></p>
          <p style="font-size: 0.9em; color: #666;">
            Puedes consultar la tasa actual en: 
            <a href="https://www.bcv.org.ve" target="_blank" style="color: #007bff;">www.bcv.org.ve</a>
          </p>
        </div>
      `,
      input: 'number',
      inputLabel: 'Tasa BCV (Bs/USD)',
      inputPlaceholder: 'Ejemplo: 168.4157',
      inputValue: '168.4157',
      inputAttributes: {
        step: '0.0001',
        min: '50',
        max: '1000'
      },
      showCancelButton: false,
      confirmButtonText: 'Usar esta tasa',
      confirmButtonColor: '#28a745',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes ingresar una tasa válida'
        }
        const tasa = parseFloat(value)
        if (isNaN(tasa) || tasa < 50 || tasa > 1000) {
          return 'La tasa debe estar entre 50 y 1000 Bs/USD'
        }
        return null
      }
    })
    
    if (tasaManual) {
      const tasa = parseFloat(tasaManual)
      console.log(`✅ Tasa manual ingresada: ${tasa} Bs/USD`)
      return tasa
    }
    
    return null
    
  } catch (error) {
    console.error('❌ Error en alerta de tasa manual:', error.message)
    return null
  }
}

/**
 * Obtiene la tasa BCV para usar en la aplicación
 * @returns {Promise<number>} Tasa de cambio para usar
 */
export async function getTasaBCV() {
  try {
    console.log('🔄 Obteniendo tasa BCV más actual...')
    
    const tasaActual = await obtenerTasaBCV()
    
    if (!tasaActual || tasaActual <= 0) {
      throw new Error('Tasa inválida obtenida')
    }
    
    console.log(`✅ Tasa BCV actual obtenida: ${tasaActual} Bs/USD`)
    return tasaActual
    
  } catch (error) {
    console.error('❌ Error al obtener tasa BCV actual:', error.message)
    throw error
  }
}

/**
 * Obtiene la tasa más reciente de la base de datos
 * @returns {Promise<number>} Tasa más reciente
 */
export async function obtenerTasaMasReciente() {
  try {
    const { data, error } = await supabase
      .from('tasa_cambio')
      .select('tasa_bcv')
      .order('id', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.warn('No se pudo obtener la tasa de cambio:', error.message)
      throw new Error('No se pudo obtener la tasa más reciente de la base de datos')
    }

    if (!data?.tasa_bcv) {
      throw new Error('No hay tasas registradas en la base de datos')
    }

    return data.tasa_bcv

  } catch (err) {
    console.warn('Error al obtener tasa de cambio:', err)
    throw new Error('No se pudo obtener la tasa más reciente de la base de datos')
  }
}

/**
 * Actualiza la tasa BCV obteniéndola del sitio web y guardándola en la BD
 * @returns {Promise<number>} La nueva tasa obtenida
 */
export async function actualizarTasaBCV() {
  try {
    console.log('🚀 Iniciando actualización de tasa BCV...')
    
    const tasa = await obtenerTasaBCV()
    console.log(`📊 Tasa obtenida: ${tasa} Bs/USD`)
    
    return tasa
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    throw new Error('No se pudo actualizar la tasa BCV')
  }
}