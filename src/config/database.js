// Configuración de base de datos
// Este archivo centraliza la configuración para facilitar el cambio de base de datos

export const DATABASE_CONFIG = {
  // Configuración actual: Supabase
  provider: 'supabase',
  
  // Configuración para otros proveedores (ejemplos)
  providers: {
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL,
      key: import.meta.env.VITE_SUPABASE_ANON_KEY,
      options: {
        auth: { persistSession: false }
      }
    },
    
    // Ejemplo para PostgreSQL directo
    postgresql: {
      host: 'localhost',
      port: 5432,
      database: 'cocolu_ventas',
      username: 'postgres',
      password: 'password'
    },
    
    // Ejemplo para MySQL
    mysql: {
      host: 'localhost',
      port: 3306,
      database: 'cocolu_ventas',
      username: 'root',
      password: 'password'
    }
  }
}

// Función para validar configuración
export function validateDatabaseConfig() {
  const config = DATABASE_CONFIG.providers[DATABASE_CONFIG.provider];
  
  if (!config.url || !config.key) {
    console.error('❌ Configuración de base de datos incompleta');
    console.error('Verifica que las variables de entorno estén configuradas correctamente');
    return false;
  }
  
  console.log('✅ Configuración de base de datos válida');
  return true;
}
