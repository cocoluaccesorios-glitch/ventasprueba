# Sistema Automático de Tasa BCV

Este sistema obtiene automáticamente la tasa de cambio del Banco Central de Venezuela (BCV) desde su página web oficial y la integra en tu aplicación de ventas.

## 🚀 Características

- **Obtención automática** de la tasa USD desde bcv.org.ve
- **Almacenamiento** en base de datos Supabase
- **Actualización automática** cada 6 horas
- **Integración** en el frontend con botón de actualización manual
- **Fallback** con tasa por defecto en caso de error

## 📋 Instalación

### 1. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 2. Crear la tabla en la base de datos

Ejecuta el siguiente SQL en tu dashboard de Supabase (SQL Editor):

```sql
-- Crear tabla tasa_cambio
CREATE TABLE IF NOT EXISTS tasa_cambio (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    tasa_bcv DECIMAL(10,8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_tasa_cambio_fecha ON tasa_cambio(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_tasa_cambio_created_at ON tasa_cambio(created_at DESC);

-- Habilitar RLS
ALTER TABLE tasa_cambio ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Allow read access to tasa_cambio" ON tasa_cambio
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access to tasa_cambio" ON tasa_cambio
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to tasa_cambio" ON tasa_cambio
    FOR UPDATE USING (true);
```

### 3. Instalar y probar el sistema

```bash
# Instalar dependencias
npm install

# Configurar y probar el sistema BCV
npm run bcv:install
```

## 🎯 Uso

### Comandos disponibles

```bash
# Actualizar tasa una vez
npm run bcv:update

# Modo automático continuo (actualiza cada 6 horas)
npm run bcv:auto

# Probar el scraper
npm run bcv:test

# Configurar el sistema
npm run bcv:setup

# Iniciar automatización
npm run bcv:start
```

### En la aplicación

1. **Carga automática**: La tasa se carga automáticamente al abrir la página de crear venta
2. **Actualización manual**: Haz clic en el botón 🔄 junto a la tasa BCV para actualizarla
3. **Actualización automática**: El sistema verifica si la tasa tiene más de 6 horas y la actualiza automáticamente

## 🔧 Configuración

### Frecuencia de actualización

El sistema se actualiza automáticamente:
- **Cada 6 horas** en modo continuo
- **Diariamente a las 8:00 AM**
- **Diariamente a las 2:00 PM**

### Tasa de respaldo

Si no se puede obtener la tasa del BCV, se usa una tasa de respaldo de **166.58 Bs/USD**.

## 📁 Archivos del sistema

```
src/
├── services/
│   └── bcvService.js          # Servicio principal del BCV
├── composables/
│   └── useBCV.js             # Composable para Vue
└── components/
    └── BCVDisplay.vue        # Componente de visualización

scripts/
├── bcv-simple.js             # Script simple de actualización
├── update-bcv-rate.js        # Script con automatización
├── setup-bcv-system.js       # Script de configuración
└── start-bcv-automation.js   # Script de inicio
```

## 🚨 Solución de problemas

### Error: "permission denied for table tasa_cambio"

1. Verifica que la tabla existe en Supabase
2. Ejecuta el SQL de creación manualmente
3. Verifica las políticas RLS

### Error: "No se pudo encontrar la tasa USD"

1. Verifica la conexión a internet
2. El sitio del BCV podría estar temporalmente inaccesible
3. Se usará la tasa de respaldo automáticamente

### Error: "Faltan credenciales de Supabase"

1. Verifica que el archivo `.env` existe
2. Verifica que las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están configuradas

## 🔄 Automatización en producción

### Opción 1: PM2 (Recomendado)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar el proceso
pm2 start scripts/start-bcv-automation.js --name "bcv-automation"

# Ver logs
pm2 logs bcv-automation

# Reiniciar
pm2 restart bcv-automation
```

### Opción 2: Cron (Linux/Mac)

```bash
# Editar crontab
crontab -e

# Agregar línea para actualizar cada 6 horas
0 */6 * * * cd /ruta/a/tu/proyecto && npm run bcv:update
```

### Opción 3: Vercel Cron Jobs

Si usas Vercel, puedes configurar cron jobs en `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/bcv-update",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

## 📊 Monitoreo

El sistema registra todas las operaciones en la consola:

- ✅ Operaciones exitosas
- ❌ Errores
- 🔄 Actualizaciones en progreso
- ⚠️ Advertencias

## 🎉 ¡Listo!

Tu sistema ahora obtiene automáticamente la tasa del BCV y la usa en todas las transacciones de tu aplicación de ventas.
