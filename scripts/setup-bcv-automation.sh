#!/bin/bash

# Script para configurar la automatización diaria de la tasa BCV
# Este script configura un cron job para ejecutar el script de actualización diaria

echo "🚀 Configurando automatización diaria de tasa BCV..."

# Obtener el directorio actual
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 Directorio del proyecto: $PROJECT_DIR"

# Crear el comando del cron job
CRON_COMMAND="0 8 * * * cd $PROJECT_DIR && node scripts/update-bcv-daily.js >> logs/bcv-update.log 2>&1"

echo "⏰ Comando del cron job: $CRON_COMMAND"

# Crear directorio de logs si no existe
mkdir -p "$PROJECT_DIR/logs"

# Verificar si ya existe el cron job
if crontab -l 2>/dev/null | grep -q "update-bcv-daily.js"; then
    echo "⚠️ Ya existe un cron job para actualizar la tasa BCV"
    echo "¿Deseas actualizarlo? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        # Remover el cron job existente
        crontab -l 2>/dev/null | grep -v "update-bcv-daily.js" | crontab -
        echo "✅ Cron job anterior removido"
    else
        echo "❌ Operación cancelada"
        exit 1
    fi
fi

# Agregar el nuevo cron job
(crontab -l 2>/dev/null; echo "$CRON_COMMAND") | crontab -

if [ $? -eq 0 ]; then
    echo "✅ Cron job configurado exitosamente"
    echo "📅 La tasa BCV se actualizará automáticamente todos los días a las 8:00 AM"
    echo ""
    echo "📋 Cron jobs actuales:"
    crontab -l
    echo ""
    echo "📝 Logs se guardarán en: $PROJECT_DIR/logs/bcv-update.log"
    echo ""
    echo "🔧 Para probar manualmente:"
    echo "   cd $PROJECT_DIR && node scripts/update-bcv-daily.js"
    echo ""
    echo "🗑️ Para remover el cron job:"
    echo "   crontab -l | grep -v 'update-bcv-daily.js' | crontab -"
else
    echo "❌ Error al configurar el cron job"
    exit 1
fi
