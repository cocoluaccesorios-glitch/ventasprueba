/**
 * Servicio para manejar la tasa de cambio del BCV
 * Incluye funciones para obtener, guardar y usar la tasa automáticamente
 */

import { supabase } from '../lib/supabaseClient.js'
import * as cheerio from 'cheerio'
import Swal from 'sweetalert2'

/**
 * Obtiene la tasa de cambio del BCV desde su página web
 * @returns {Promise<number>} Tasa de cambio en Bs/USD
 */
export async function obtenerTasaBCV() {
  try {
    console.log('🔄 Obteniendo tasa de cambio del BCV...')
    
    // Ejecutar el script de Node.js para obtener la tasa real
    const tasaReal = await ejecutarScriptBCV()
    
    if (tasaReal && tasaReal > 0) {
      console.log(`✅ Tasa BCV real obtenida: ${tasaReal} Bs/USD`)
      return tasaReal
    }
    
    // Si falla, mostrar alerta para entrada manual
    console.log('❌ No se pudo obtener la tasa del BCV automáticamente')
    const tasaManual = await mostrarAlertaTasaManual()
    
    if (tasaManual && tasaManual > 0) {
      console.log(`✅ Tasa manual ingresada: ${tasaManual} Bs/USD`)
      return tasaManual
    }
    
    // Si no se ingresa tasa manual, lanzar error
    throw new Error('No se pudo obtener la tasa del BCV y no se ingresó tasa manual')
    
  } catch (error) {
    console.error('❌ Error al obtener tasa del BCV:', error.message)
    
    // Mostrar alerta de error y solicitar entrada manual
    const tasaManual = await mostrarAlertaTasaManual()
    
    if (tasaManual && tasaManual > 0) {
      console.log(`✅ Tasa manual ingresada después del error: ${tasaManual} Bs/USD`)
      return tasaManual
    }
    
    // Si no se ingresa tasa manual, lanzar error
    throw new Error('No se pudo obtener la tasa del BCV y no se ingresó tasa manual')
  }
}

/**
 * Ejecuta el script de Node.js para obtener la tasa real del BCV
 * @returns {Promise<number>} Tasa real del BCV
 */
async function ejecutarScriptBCV() {
  try {
    // Usar el script existente que ya funciona
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Ejecutar el script bcv-simple.js que ya existe
    const { stdout, stderr } = await execAsync('node scripts/bcv-simple.js');
    
    // Buscar la tasa en la salida
    const match = stdout.match(/Tasa obtenida: (\d+\.?\d*)/);
    if (match) {
      const tasa = parseFloat(match[1]);
      console.log(`✅ Tasa obtenida del script: ${tasa} Bs/USD`);
      return tasa;
    }
    
    return null;
    
  } catch (error) {
    console.warn('⚠️ Error en ejecutarScriptBCV:', error.message);
    return null;
  }
}

/**
 * Extrae la tasa USD del HTML usando cheerio
 * @param {Object} $ - Objeto cheerio con el HTML cargado
 * @returns {number|null} Tasa USD encontrada o null
 */
async function extraerTasaDelHTML($) {
  let tasaUSD = null
  
  // Método 1: Buscar por el patrón específico
  const textContent = $.text()
  
  // Buscar patrones como "168,41570000" o "168.41570000"
  const patterns = [
    /USD[:\s]*(\d{1,3}[,.]\d{2,8})/i,
    /\$[:\s]*(\d{1,3}[,.]\d{2,8})/i,
    /(\d{1,3}[,.]\d{2,8})\s*USD/i,
    /(\d{1,3}[,.]\d{2,8})\s*Bs/i
  ]
  
  for (const pattern of patterns) {
    const match = textContent.match(pattern)
    if (match) {
      let tasa = match[1].replace(',', '.')
      tasa = parseFloat(tasa)
      if (tasa > 50 && tasa < 1000) { // Rango razonable para la tasa
        tasaUSD = tasa
        console.log(`✅ Tasa encontrada con patrón: ${tasa}`)
        break
      }
    }
  }
  
  // Método 2: Buscar en elementos específicos
  if (!tasaUSD) {
    $('*').each((i, element) => {
      const text = $(element).text().trim()
      if (text.includes('USD') || text.includes('$')) {
        const match = text.match(/(\d{1,3}[,.]\d{2,8})/)
        if (match) {
          let tasa = match[1].replace(',', '.')
          tasa = parseFloat(tasa)
          if (tasa > 50 && tasa < 1000) {
            tasaUSD = tasa
            console.log(`✅ Tasa encontrada en elemento: ${tasa}`)
            return false // Salir del loop
          }
        }
      }
    })
  }
  
  return tasaUSD
}

/**
 * Guarda la tasa en la base de datos
 * @param {number} tasa - Tasa de cambio a guardar
 * @returns {Promise<boolean>} True si se guardó exitosamente
 */
export async function guardarTasaEnBD(tasa) {
  try {
    console.log('💾 Guardando tasa en la base de datos...')
    
    const { data, error } = await supabase
      .from('tasa_cambio')
      .insert({
        fecha: new Date().toISOString().split('T')[0],
        tasa_bcv: tasa
      })
      .select()
    
    if (error) {
      console.error('❌ Error al guardar tasa:', error.message)
      return false
    }
    
    console.log('✅ Tasa guardada exitosamente')
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

/**
 * Obtiene la tasa más reciente de la base de datos
 * @returns {Promise<number>} Tasa de cambio más reciente
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
      return 166.5800 // Tasa por defecto
    }
    
    return data?.tasa_bcv || 166.5800
    
  } catch (err) {
    console.warn('Error al obtener tasa de cambio:', err)
    return 166.5800 // Tasa por defecto en caso de error
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
    
    const guardado = await guardarTasaEnBD(tasa)
    
    if (guardado) {
      console.log('🎉 ¡Actualización completada exitosamente!')
      console.log(`💰 Nueva tasa: ${tasa} Bs/USD`)
    } else {
      console.log('⚠️  No se pudo guardar en la base de datos')
    }
    
    return tasa
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    return 166.5800 // Tasa de respaldo
  }
}

/**
 * Obtiene la tasa BCV para usar en la aplicación
 * SIEMPRE obtiene la tasa más actual del BCV, no usa cache
 * @returns {Promise<number>} Tasa de cambio para usar
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
    
    // Intentar guardar la tasa actual en la base de datos
    const fechaHoy = new Date().toISOString().split('T')[0]
    try {
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
      showCancelButton: true,
      confirmButtonText: 'Usar esta tasa',
      cancelButtonText: 'Usar tasa de respaldo',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
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
      
      // Guardar la tasa manual en la base de datos
      try {
        const fechaHoy = new Date().toISOString().split('T')[0]
        const { error } = await supabase
          .from('tasa_cambio')
        .insert({
          fecha: fechaHoy,
          tasa_bcv: tasa
        })
        
        if (!error) {
          console.log(`✅ Tasa manual guardada en BD: ${tasa} Bs/USD`)
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
 * Obtiene la tasa BCV de una fecha específica
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Promise<number>} Tasa de cambio de esa fecha
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
    
    // Si no existe tasa para esa fecha, obtener la tasa actual del BCV
    console.log(`⚠️ No hay tasa para ${fecha}, obteniendo tasa actual del BCV...`)
    return await obtenerTasaBCV()
    
  } catch (error) {
    console.error('❌ Error al obtener tasa por fecha:', error.message)
    return 166.5800 // Tasa de respaldo
  }
}

/**
 * Convierte USD a VES usando la tasa BCV
 * @param {number} usd - Cantidad en USD
 * @returns {Promise<number>} Cantidad en VES
 */
export async function convertirUSDaVES(usd) {
  const tasa = await getTasaBCV()
  return usd * tasa
}

/**
 * Convierte VES a USD usando la tasa BCV
 * @param {number} ves - Cantidad en VES
 * @returns {Promise<number>} Cantidad en USD
 */
export async function convertirVESaUSD(ves) {
  const tasa = await getTasaBCV()
  return ves / tasa
}
