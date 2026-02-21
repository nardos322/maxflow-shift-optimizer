# MaxFlow API

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white&style=flat-square)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white&style=flat-square)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white&style=flat-square)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/DB-SQLite-003B57?logo=sqlite&logoColor=white&style=flat-square)](https://www.sqlite.org/)
[![Zod](https://img.shields.io/badge/Validation-Zod-3E67B1?style=flat-square)](https://zod.dev/)
[![Swagger](https://img.shields.io/badge/API%20Docs-Swagger-85EA2D?logo=swagger&logoColor=111827&style=flat-square)](#endpoints-principales)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white&style=flat-square)](https://vitest.dev/)

Capa backend del sistema. Orquesta autenticacion, reglas de negocio, persistencia y ejecucion del solver C++.

## Stack

- Node.js + Express
- Prisma (SQLite)
- Validaciones compartidas con `@maxflow/shared`
- Swagger/OpenAPI en `/api-docs`
- Vitest + Supertest

## Ubicacion

- Carpeta: `apps/api`
- Entry point: `apps/api/index.js`
- App express: `apps/api/src/app.js`

## Comandos

Ejecutar desde `apps/api`:

```bash
npm run setup                # prisma generate + prisma migrate dev
npm run dev                  # modo watch
npm run start                # modo normal
npm run db:migrate
npm run db:seed
npm run db:reset
npm run db:studio
npm run db:scenario:feasible
npm run db:scenario:infeasible
npm test
npm run test:ci
```

## Variables de entorno

Archivo local: `apps/api/.env`

- `DATABASE_URL` (por defecto `file:./dev.db`)
- `PORT` (por defecto `3000`)
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN` (opcional)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` (seed de admin inicial)

Para tests: `apps/api/.env.test`.

## Integracion con Core (C++)

La API ejecuta `apps/core/build/solver` como child process (ruta relativa desde API: `../core/build/solver`).

Flujo:

1. Lee datos desde Prisma.
2. Construye payload JSON y lo envia por `stdin`.
3. Lee respuesta JSON por `stdout`.
4. Captura `stderr` para diagnostico.

## Endpoints principales

- Auth: `POST /auth/login`, `POST /auth/register`
- Medicos: `GET/POST/PUT/DELETE /medicos`, disponibilidad por medico
- Periodos: `GET/POST/PUT/DELETE /periodos`
- Config: `GET/PUT /configuracion`
- `POST /asignaciones/ejecuciones` (alias legacy: `POST /asignaciones/resolver`)
- `POST /asignaciones/simulaciones`
- `POST /asignaciones/reparaciones`
- `POST /asignaciones/reparaciones/previsualizar`
- `POST /asignaciones/reparaciones/candidatas`
- `GET /asignaciones`
- `GET /asignaciones/versiones`
- `POST /asignaciones/versiones/:id/publicar`
- `GET /asignaciones/diff`
- `GET /asignaciones/diff/publicado`
- `GET /asignaciones/versiones/:id/riesgo`
- `GET /asignaciones/versiones/:id/aprobacion`
- `GET /asignaciones/versiones/:id/autofix-sugerido`
- Reportes: `GET /reportes/equidad`, `GET /reportes/faltantes`
- Export: `GET /export/excel`, `GET /export/ics`
- Auditoria: `GET /auditoria`

## Contrato de errores

Todas las respuestas de error salen normalizadas:

```json
{
  "error": "Mensaje legible",
  "code": "ERROR_CODE",
  "factible": false,
  "details": {}
}
```

Codigos comunes:

- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `RATE_LIMIT` (429)
- `INTERNAL_ERROR` (500)

## Estructura relevante

- `src/controllers`: controladores HTTP
- `src/services`: logica de negocio
- `src/routes`: definicion de endpoints
- `src/middlewares`: auth, validacion, rate limit y manejo de errores
- `prisma/schema.prisma`: modelo de datos
- `prisma/scenarios`: escenarios de seed
