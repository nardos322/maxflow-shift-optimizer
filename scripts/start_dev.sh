#!/bin/bash
set -e # Salir inmediatamente si algo falla
cd "$(dirname "$0")/.." # Asegurar que corremos desde la raíz del proyecto

echo "========================================="
echo "🚀 Iniciando Entorno de Desarrollo"
echo "========================================="

# 1. Compilar el Core C++
echo ""
echo "📦 [1/3] Compilando Core C++..."
cd core
make
if [ $? -eq 0 ]; then
    echo "✅ Core compilado correctamente."
else
    echo "❌ Error al compilar el Core."
    exit 1
fi
cd ..

# 2. Preparar la API
echo ""
echo "🔧 [2/3] Configurando API..."
cd api
echo "   Installing dependencies..."
npm install

echo "   Running DB setup..."
npm run setup
if [ $? -eq 0 ]; then
    echo "✅ API configurada."
else
    echo "❌ Error configurando la API."
    exit 1
fi

# 3. Iniciar el servidor
echo ""
echo "🟢 [3/3] Iniciando servidor en modo DEV..."
echo "   La API estará disponible en http://localhost:3000"
echo "========================================="
npm run dev
