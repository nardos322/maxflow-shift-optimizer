# MaxFlow Web

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=111827&style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vite.dev/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5.x-FF4154?logo=reactquery&logoColor=white&style=flat-square)](https://tanstack.com/query/latest)
[![Zustand](https://img.shields.io/badge/State-Zustand-4B5563?style=flat-square)](https://zustand-demo.pmnd.rs/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white&style=flat-square)](https://vitest.dev/)

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
