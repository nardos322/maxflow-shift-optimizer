# ==========================================
# Stage 1: Build C++ Core
# ==========================================
FROM gcc:12-bookworm as cpp-builder

WORKDIR /app

# Copiar el código fuente del core
COPY core/ ./core/

# Compilar
WORKDIR /app/core
RUN make

# Validar que el binario existe
RUN ls -l build/solver

# ==========================================
# Stage 2: Production Runtime (Node.js)
# ==========================================
FROM node:20-bookworm-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias (OpenSSL para Prisma)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copiar el binario compilado desde el Stage 1
# Nota: Respetamos la estructura de directorios que espera el servicio de Node
COPY --from=cpp-builder /app/core/build/solver /app/core/build/solver

# Configurar la API
WORKDIR /app/api

# Copiar archivos de dependencias
COPY api/package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar el resto del código fuente de la API
COPY api/prisma ./prisma
COPY api/src ./src
COPY api/index.js ./

# Generar cliente de Prisma
RUN npx prisma generate

# Entorno
ENV NODE_ENV=production
ENV PORT=3000
# Esta variable se sobreescribirá en docker-compose, pero dejamos un default
ENV DATABASE_URL="file:./prisma/dev.db"

EXPOSE 3000

# Script de inicio: Migrar DB y levantar servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seedAdmin.js && npm start"]
