#!/bin/bash

# Script de Configuración y Ejecución de Pruebas Comprehensivas
# Sistema de Ventas Cocolú

echo "🚀 Configurando Pruebas Comprehensivas de Ventas"
echo "================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

print_status "Verificando dependencias..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Instala Node.js primero."
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado. Instala npm primero."
    exit 1
fi

# Verificar Playwright
if ! npx playwright --version &> /dev/null; then
    print_warning "Playwright no está instalado. Instalando..."
    npm install @playwright/test
    npx playwright install
fi

print_success "Dependencias verificadas"

# Crear directorios necesarios
print_status "Creando directorios necesarios..."
mkdir -p test-results
mkdir -p tests/screenshots
mkdir -p tests/utils

print_success "Directorios creados"

# Verificar que los archivos de prueba existen
print_status "Verificando archivos de prueba..."

required_files=(
    "tests/comprehensive-sales-tests.spec.js"
    "tests/comprehensive-test-runner.spec.js"
    "tests/utils/comprehensiveTestDataGenerator.js"
    "tests/utils/comprehensiveSalesFormHelper.js"
    "tests/run-comprehensive-tests.js"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Archivo requerido no encontrado: $file"
        exit 1
    fi
done

print_success "Archivos de prueba verificados"

# Función para verificar si la aplicación está ejecutándose
check_app_running() {
    if curl -s http://localhost:5174 > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Verificar si la aplicación está ejecutándose
print_status "Verificando si la aplicación está ejecutándose..."

if check_app_running; then
    print_success "Aplicación detectada en http://localhost:5174"
else
    print_warning "La aplicación no está ejecutándose en http://localhost:5174"
    print_status "Iniciando aplicación..."
    
    # Intentar iniciar la aplicación en background
    npm run dev &
    APP_PID=$!
    
    # Esperar a que la aplicación inicie
    print_status "Esperando a que la aplicación inicie..."
    for i in {1..30}; do
        if check_app_running; then
            print_success "Aplicación iniciada correctamente"
            break
        fi
        sleep 2
        echo -n "."
    done
    
    if ! check_app_running; then
        print_error "No se pudo iniciar la aplicación. Inicia manualmente con 'npm run dev'"
        exit 1
    fi
fi

# Menú de opciones
echo ""
echo "🎯 OPCIONES DE EJECUCIÓN:"
echo "========================="
echo "1. Ejecutar TODAS las pruebas (Recomendado)"
echo "2. Ejecutar solo pruebas de Contado"
echo "3. Ejecutar solo pruebas de Abono"
echo "4. Ejecutar solo pruebas de Mixto"
echo "5. Ejecutar solo pruebas de Registro Real"
echo "6. Ejecutar pruebas de Validación de Errores"
echo "7. Ejecutar pruebas existentes"
echo "8. Salir"
echo ""

read -p "Selecciona una opción (1-8): " choice

case $choice in
    1)
        print_status "Ejecutando TODAS las pruebas comprehensivas..."
        node tests/run-comprehensive-tests.js
        ;;
    2)
        print_status "Ejecutando pruebas de Contado..."
        npx playwright test tests/comprehensive-sales-tests.spec.js --grep "Contado"
        ;;
    3)
        print_status "Ejecutando pruebas de Abono..."
        npx playwright test tests/comprehensive-sales-tests.spec.js --grep "Abono"
        ;;
    4)
        print_status "Ejecutando pruebas de Mixto..."
        npx playwright test tests/comprehensive-sales-tests.spec.js --grep "Mixto"
        ;;
    5)
        print_status "Ejecutando pruebas de Registro Real..."
        npx playwright test tests/comprehensive-test-runner.spec.js --grep "Registro Real"
        ;;
    6)
        print_status "Ejecutando pruebas de Validación de Errores..."
        npx playwright test tests/comprehensive-test-runner.spec.js --grep "Validación de Errores"
        ;;
    7)
        print_status "Ejecutando pruebas existentes..."
        npx playwright test tests/advanced-sales-tests.spec.js
        ;;
    8)
        print_status "Saliendo..."
        exit 0
        ;;
    *)
        print_error "Opción inválida"
        exit 1
        ;;
esac

# Verificar resultados
if [ $? -eq 0 ]; then
    print_success "Pruebas completadas exitosamente"
    
    # Mostrar reportes generados
    if [ -d "test-results" ]; then
        echo ""
        print_status "Reportes generados:"
        ls -la test-results/
        
        # Abrir reporte HTML si existe
        html_report=$(ls test-results/*.html 2>/dev/null | tail -1)
        if [ ! -z "$html_report" ]; then
            echo ""
            read -p "¿Abrir reporte HTML en el navegador? (y/n): " open_report
            if [ "$open_report" = "y" ] || [ "$open_report" = "Y" ]; then
                if command -v open &> /dev/null; then
                    open "$html_report"
                elif command -v xdg-open &> /dev/null; then
                    xdg-open "$html_report"
                else
                    print_status "Abre manualmente: $html_report"
                fi
            fi
        fi
    fi
else
    print_error "Las pruebas fallaron. Revisa los logs para más detalles."
fi

# Limpiar proceso de aplicación si lo iniciamos
if [ ! -z "$APP_PID" ]; then
    print_status "Deteniendo aplicación..."
    kill $APP_PID 2>/dev/null
fi

echo ""
print_success "Script completado"
echo "========================"
