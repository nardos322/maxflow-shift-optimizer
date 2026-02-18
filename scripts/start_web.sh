#!/bin/bash
set -e
cd "$(dirname "$0")/../apps/web"

echo "========================================="
echo "🚀 Iniciando Frontend (Web)"
echo "========================================="

if [ ! -d "../../node_modules" ]; then
    echo "📦 Instalando dependencias (desde root)..."
    npm install --prefix ../..
fi

echo "🟢 Iniciando servidor de desarrollo..."
echo "   La web estará disponible en http://localhost:5173"
echo "========================================="
npm run dev
