-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Configuracion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "maxGuardiasTotales" INTEGER NOT NULL DEFAULT 3,
    "maxGuardiasPorPeriodo" INTEGER NOT NULL DEFAULT 1,
    "medicosPorDia" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_Configuracion" ("id", "maxGuardiasTotales", "medicosPorDia") SELECT "id", "maxGuardiasTotales", "medicosPorDia" FROM "Configuracion";
DROP TABLE "Configuracion";
ALTER TABLE "new_Configuracion" RENAME TO "Configuracion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
