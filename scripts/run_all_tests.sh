#!/bin/bash
set -e

echo "========================================="
echo "🧪 Corriendo TODOS los tests (API + Web)"
echo "========================================="

# 1. Tests de API
echo ""
echo "backend: 📦 Ejecutando tests de API..."
cd "$(dirname "$0")/../apps/api"
if [ ! -d "../../node_modules" ]; then
    echo "Instalando dependencias (desde root)..."
    npm install --prefix ../..
fi
npm test

# 2. Tests de Web
echo ""
echo "frontend: 📦 Ejecutando tests de Web..."
cd "../../apps/web"
if [ ! -d "../../node_modules" ]; then
    echo "Instalando dependencias (desde root)..."
    npm install --prefix ../..
fi
npm test

echo ""
echo "✅ Todos los tests pasaron correctamente."
