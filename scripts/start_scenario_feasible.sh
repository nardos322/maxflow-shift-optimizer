#!/bin/bash
set -e
cd "$(dirname "$0")/.." # Asegurar que corremos desde la raíz del proyecto

echo "========================================="
echo "✅ Iniciando Escenario: FACTIBLE"
echo "========================================="

# 1. Compilar Core
echo ""
echo "📦 [1/3] Compilando Core C++..."
cd core
make
if [ $? -ne 0 ]; then
    echo "❌ Error compilando Core."
    exit 1
fi
cd ..

# 2. Cargar Escenario en DB
echo ""
echo "💾 [2/3] Cargando datos de escenario FACTIBLE..."
cd api
npm run db:scenario:feasible

# 3. Iniciar Server
echo ""
echo "🟢 [3/3] Iniciando API..."
echo "   Base de datos: dev.db (con datos del escenario)"
echo "   URL: http://localhost:3000"
echo "========================================="

npm run dev
