-- CreateTable
CREATE TABLE "Medico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Periodo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Feriado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "descripcion" TEXT NOT NULL,
    "periodoId" INTEGER NOT NULL,
    CONSTRAINT "Feriado_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "Periodo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Disponibilidad" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "medicoId" INTEGER NOT NULL,
    "fecha" DATETIME NOT NULL,
    CONSTRAINT "Disponibilidad_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "maxGuardiasTotales" INTEGER NOT NULL DEFAULT 3,
    "medicosPorDia" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "Turno" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "medicoId" INTEGER NOT NULL,
    "periodoId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Turno_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Turno_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "Periodo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Medico_email_key" ON "Medico"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Feriado_fecha_key" ON "Feriado"("fecha");

-- CreateIndex
CREATE INDEX "Feriado_periodoId_idx" ON "Feriado"("periodoId");

-- CreateIndex
CREATE INDEX "Disponibilidad_medicoId_idx" ON "Disponibilidad"("medicoId");

-- CreateIndex
CREATE INDEX "Disponibilidad_fecha_idx" ON "Disponibilidad"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "Disponibilidad_medicoId_fecha_key" ON "Disponibilidad"("medicoId", "fecha");

-- CreateIndex
CREATE INDEX "Turno_medicoId_idx" ON "Turno"("medicoId");

-- CreateIndex
CREATE INDEX "Turno_periodoId_idx" ON "Turno"("periodoId");

-- CreateIndex
CREATE UNIQUE INDEX "Turno_fecha_medicoId_key" ON "Turno"("fecha", "medicoId");
