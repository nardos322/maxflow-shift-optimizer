#!/bin/bash
set -e
cd "$(dirname "$0")/.." # Asegurar que corremos desde la raíz del proyecto

echo "========================================="
echo "🧪 Iniciando Entorno de TEST (QA Manual)"
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

# 2. Resetear DB de Test
echo ""
echo "🧹 [2/3] Reseteando Base de Datos de TEST (test.db)..."
cd api
if [ ! -d "node_modules" ]; then
    npm install
fi

# Usamos dotenv-cli para cargar .env.test
npx dotenv -e .env.test -- npx prisma migrate reset --force --skip-seed
if [ $? -ne 0 ]; then
    echo "❌ Error reseteando DB de test."
    exit 1
fi

# 3. Iniciar Server
echo ""
echo "🟢 [3/3] Iniciando API en modo TEST..."
echo "   Base de datos: test.db"
echo "   URL: http://localhost:3000"
echo "========================================="

# Corremos nodemon o node observando cambios, pero inyectando .env.test
npx dotenv -e .env.test -- npm run dev
