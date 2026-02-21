CREATE TABLE "PlanVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'DRAFT',
    "usuario" TEXT NOT NULL,
    "sourcePlanVersionId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "PlanVersion_createdAt_idx" ON "PlanVersion"("createdAt");
CREATE INDEX "PlanVersion_tipo_idx" ON "PlanVersion"("tipo");

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Asignacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "medicoId" INTEGER NOT NULL,
    "periodoId" INTEGER NOT NULL,
    "planVersionId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Asignacion_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Asignacion_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "Periodo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Asignacion_planVersionId_fkey" FOREIGN KEY ("planVersionId") REFERENCES "PlanVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Asignacion" ("createdAt", "fecha", "id", "medicoId", "periodoId") SELECT "createdAt", "fecha", "id", "medicoId", "periodoId" FROM "Asignacion";
DROP TABLE "Asignacion";
ALTER TABLE "new_Asignacion" RENAME TO "Asignacion";
CREATE UNIQUE INDEX "Asignacion_fecha_medicoId_key" ON "Asignacion"("fecha", "medicoId");
CREATE INDEX "Asignacion_medicoId_idx" ON "Asignacion"("medicoId");
CREATE INDEX "Asignacion_periodoId_idx" ON "Asignacion"("periodoId");
CREATE INDEX "Asignacion_planVersionId_idx" ON "Asignacion"("planVersionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
