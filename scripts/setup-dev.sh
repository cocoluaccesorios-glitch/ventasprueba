#!/bin/bash

# ===========================================
# SCRIPT DE CONFIGURACIÓN DE DESARROLLO
# ===========================================

echo "🚀 Configurando entorno de desarrollo para Ventas Cocolú..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org"
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Se requiere Node.js 18 o superior. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde env.example..."
    cp env.example .env
    echo "⚠️  IMPORTANTE: Edita el archivo .env con tus credenciales de Supabase"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
else
    echo "✅ Archivo .env ya existe"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar que las variables de entorno estén configuradas
if grep -q "your_supabase_project_url_here" .env; then
    echo "⚠️  RECUERDA: Configura tus credenciales de Supabase en el archivo .env"
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita el archivo .env con tus credenciales de Supabase"
echo "2. Ejecuta: npm run dev"
echo "3. Abre http://localhost:5173 en tu navegador"
echo ""
echo "🔧 Comandos útiles:"
echo "   npm run dev          - Iniciar servidor de desarrollo"
echo "   npm run build        - Construir para producción"
echo "   npm run preview      - Previsualizar build de producción"
echo "   npm run lint         - Ejecutar linter"
echo ""
