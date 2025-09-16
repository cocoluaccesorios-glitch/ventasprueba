import { createClient } from '@supabase/supabase-js'
import { DATABASE_CONFIG, validateDatabaseConfig } from '../config/database.js'

// Validar configuración de base de datos
if (!validateDatabaseConfig()) {
  console.error('Crea un archivo .env con las credenciales de Supabase')
}

const config = DATABASE_CONFIG.providers[DATABASE_CONFIG.provider]

export const supabase = createClient(config.url, config.key, config.options)