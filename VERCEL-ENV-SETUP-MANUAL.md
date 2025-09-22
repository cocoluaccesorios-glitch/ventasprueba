# 🔧 Configuración Manual de Variables de Entorno en Vercel

## 🚨 **Problema Identificado:**
Tu aplicación no se está conectando a Supabase porque las variables de entorno no están configuradas en Vercel.

## ✅ **Solución: Configuración Manual**

### **Paso 1: Acceder al Dashboard de Vercel**
1. Ve a [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Inicia sesión con tu cuenta
3. Busca y selecciona tu proyecto: `ventasprueba`

### **Paso 2: Configurar Variables de Entorno**
1. En tu proyecto, ve a **Settings** (Configuración)
2. Haz clic en **Environment Variables** (Variables de Entorno)
3. Agrega cada una de estas variables:

#### **Variable 1: VITE_SUPABASE_URL**
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://uaeniaskxpplxasolvoc.supabase.co`
- **Environment**: Marca **Production** ✅

#### **Variable 2: VITE_SUPABASE_ANON_KEY**
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhZW5pYXNreHBwbHhhc29sdm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MDkzNzgsImV4cCI6MjA3MzM4NTM3OH0.htxlOsrmXNvIFR6fPMRxCH3Cb91WgOXrGfJk1yvf1nE`
- **Environment**: Marca **Production** ✅

#### **Variable 3: VITE_APP_NAME**
- **Name**: `VITE_APP_NAME`
- **Value**: `Cocolú Ventas`
- **Environment**: Marca **Production** ✅

#### **Variable 4: VITE_APP_VERSION**
- **Name**: `VITE_APP_VERSION`
- **Value**: `1.0.0`
- **Environment**: Marca **Production** ✅

#### **Variable 5: VITE_APP_ENV**
- **Name**: `VITE_APP_ENV`
- **Value**: `production`
- **Environment**: Marca **Production** ✅

#### **Variable 6: VITE_ENABLE_MOCK_DATA**
- **Name**: `VITE_ENABLE_MOCK_DATA`
- **Value**: `false`
- **Environment**: Marca **Production** ✅

#### **Variable 7: VITE_ENABLE_DEBUG_MODE**
- **Name**: `VITE_ENABLE_DEBUG_MODE`
- **Value**: `false`
- **Environment**: Marca **Production** ✅

#### **Variable 8: VITE_ENABLE_ANALYTICS**
- **Name**: `VITE_ENABLE_ANALYTICS`
- **Value**: `false`
- **Environment**: Marca **Production** ✅

### **Paso 3: Guardar y Redeploy**
1. Después de agregar todas las variables, haz clic en **Save** (Guardar)
2. Ve a la pestaña **Deployments** (Despliegues)
3. Encuentra el último deployment
4. Haz clic en los **3 puntos** (⋯) del deployment
5. Selecciona **Redeploy** (Redesplegar)
6. Confirma el redeploy

### **Paso 4: Verificar**
1. Espera a que termine el redeploy (2-3 minutos)
2. Ve a tu aplicación: [https://ventasprueba-1sri.vercel.app](https://ventasprueba-1sri.vercel.app)
3. Verifica que:
   - ✅ Los productos se cargan desde la base de datos
   - ✅ Los clientes se cargan desde la base de datos
   - ✅ Los pedidos se cargan desde la base de datos
   - ✅ Puedes crear una nueva venta

## 🔍 **Verificación de la Conexión**

### **Síntomas de Conexión Exitosa:**
- ✅ Los productos aparecen en la lista
- ✅ Los clientes aparecen en la búsqueda
- ✅ Los pedidos se muestran en la lista
- ✅ Puedes crear nuevas ventas
- ✅ Los datos se guardan en la base de datos

### **Síntomas de Problemas de Conexión:**
- ❌ Lista de productos vacía
- ❌ No se pueden buscar clientes
- ❌ Lista de pedidos vacía
- ❌ Errores al crear ventas
- ❌ Mensajes de error en la consola del navegador

## 🚨 **Si Aún No Funciona:**

### **Verificar en el Navegador:**
1. Abre las **Herramientas de Desarrollador** (F12)
2. Ve a la pestaña **Console** (Consola)
3. Busca errores relacionados con Supabase
4. Ve a la pestaña **Network** (Red)
5. Verifica que las peticiones a Supabase se estén haciendo

### **Verificar Variables de Entorno:**
1. En Vercel, ve a **Settings** → **Environment Variables**
2. Verifica que todas las variables estén configuradas
3. Asegúrate de que estén marcadas para **Production**

### **Verificar el Redeploy:**
1. Ve a **Deployments** en Vercel
2. Verifica que el último deployment sea exitoso
3. Si hay errores, revisa los logs del deployment

## 📞 **Soporte Adicional:**
Si después de seguir estos pasos la aplicación aún no funciona, verifica:
1. Que las credenciales de Supabase sean correctas
2. Que la base de datos esté accesible
3. Que no haya problemas de permisos en Supabase

## ✅ **Resultado Esperado:**
Una vez configuradas las variables de entorno y hecho el redeploy, tu aplicación debería:
- ✅ Cargar productos desde Supabase
- ✅ Cargar clientes desde Supabase
- ✅ Cargar pedidos desde Supabase
- ✅ Permitir crear nuevas ventas
- ✅ Guardar datos en la base de datos
- ✅ Funcionar completamente con el sistema de abonos mixtos
