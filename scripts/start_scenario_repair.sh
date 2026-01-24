#!/bin/bash
set -e
cd "$(dirname "$0")/.." # Asegurar que corremos desde la raíz del proyecto

echo "========================================="
echo "🔧 Iniciando Escenario: REPARACIÓN"
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

# 2. Cargar Escenario
echo ""
echo "💾 [2/3] Cargando datos de escenario REPAIR..."
cd api
npm run setup > /dev/null 2>&1 # Asegurar DB limpia
node prisma/scenarios/repair.js

# 3. Iniciar Server
echo ""
echo "🟢 [3/3] Iniciando API..."
echo "========================================="
echo "💡 TIP: Cuando levante, usa otro terminal para:"
echo "   curl -X POST http://localhost:3000/asignaciones/reparar -H 'Content-Type: application/json' -d '{ \"medicoId\": <ID_DEL_OUTPUT_ANTERIOR> }'"
echo "========================================="

npm run dev
