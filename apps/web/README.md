# MaxFlow Web

Frontend de operacion para el planificador de guardias.

## Stack

- React 19 + TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Tailwind + componentes UI
- Vitest + Testing Library

## Ubicacion

- Carpeta: `apps/web`
- App principal: `apps/web/src/App.tsx`

## Comandos

Ejecutar desde `apps/web`:

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm test
npm run test:watch
```

## Integracion con API

En desarrollo, Vite proxy redirige `/api/*` a `http://localhost:3000` y remueve el prefijo `/api`.

Configurado en `apps/web/vite.config.ts`:

- Frontend usa requests como `/api/auth/login`, `/api/asignaciones/resolver`, etc.
- El backend recibe `/auth/login`, `/asignaciones/resolver`, etc.

## Funcionalidad principal

- Login y rutas protegidas por rol.
- Admin: dashboard, gestion de usuarios, CRUD de medicos y periodos, configuracion global.
- Admin: ejecucion del solver, simulaciones, reparaciones y versionado de planes.
- Admin: reporte de equidad.
- Medico: panel personal, gestion de disponibilidad y consulta de guardias asignadas.

## Estructura relevante

- `src/pages`: pantallas de la app
- `src/components`: layout, auth y UI
- `src/services`: cliente HTTP hacia la API
- `src/hooks`: estado de autenticacion y hooks de dominio
- `src/test`: setup y pruebas base
