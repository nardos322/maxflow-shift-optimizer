/*
  Warnings:

  - You are about to drop the `Turno` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Turno";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Asignacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "medicoId" INTEGER NOT NULL,
    "periodoId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Asignacion_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Asignacion_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "Periodo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Asignacion_medicoId_idx" ON "Asignacion"("medicoId");

-- CreateIndex
CREATE INDEX "Asignacion_periodoId_idx" ON "Asignacion"("periodoId");

-- CreateIndex
CREATE UNIQUE INDEX "Asignacion_fecha_medicoId_key" ON "Asignacion"("fecha", "medicoId");
