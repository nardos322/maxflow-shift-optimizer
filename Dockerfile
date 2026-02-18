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
COPY --from=cpp-builder /app/core/build/solver /app/core/build/solver

# Copiar archivos de configuración del monorepo
COPY package.json package-lock.json ./
COPY packages ./packages
COPY api/package.json ./api/

# Instalar dependencias incluyendo workspaces
RUN npm ci

# Copiar el código fuente de la API
COPY api/prisma ./api/prisma
COPY api/src ./api/src
COPY api/index.js ./api/

# Generar cliente de Prisma y construir shared
WORKDIR /app/packages/shared
RUN npm run build

WORKDIR /app/api
RUN npx prisma generate

# Entorno
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:/app/data/db/prod.db"

EXPOSE 3000

# Script de inicio
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seedAdmin.js && npm start"]
