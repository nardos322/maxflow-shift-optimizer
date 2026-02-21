-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Feriado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estadoPlanificacion" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "periodoId" INTEGER NOT NULL,
    CONSTRAINT "Feriado_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "Periodo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Feriado" ("descripcion", "fecha", "id", "periodoId") SELECT "descripcion", "fecha", "id", "periodoId" FROM "Feriado";
DROP TABLE "Feriado";
ALTER TABLE "new_Feriado" RENAME TO "Feriado";
CREATE UNIQUE INDEX "Feriado_fecha_key" ON "Feriado"("fecha");
CREATE INDEX "Feriado_periodoId_idx" ON "Feriado"("periodoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
