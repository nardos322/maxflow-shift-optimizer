#!/bin/bash
set -e

echo "========================================="
echo "🧪 Corriendo TODOS los tests (API + Web)"
echo "========================================="

# 1. Tests de API
echo ""
echo "backend: 📦 Ejecutando tests de API..."
cd "$(dirname "$0")/../api"
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias de API..."
    npm install
fi
npm test

# 2. Tests de Web
echo ""
echo "frontend: 📦 Ejecutando tests de Web..."
cd "../web"
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias de Web..."
    npm install
fi
npm test

echo ""
echo "✅ Todos los tests pasaron correctamente."
