# MaxFlow Shift Optimizer

[![Core C++17](https://img.shields.io/badge/Core-C%2B%2B17-00599C?logo=c%2B%2B&logoColor=white&style=flat-square)](apps/core/README.md)
[![API Node.js](https://img.shields.io/badge/API-Node.js-339933?logo=node.js&logoColor=white&style=flat-square)](apps/api/README.md)
[![Web React](https://img.shields.io/badge/Web-React-61DAFB?logo=react&logoColor=111827&style=flat-square)](apps/web/README.md)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white&style=flat-square)](apps/api/README.md)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white&style=flat-square)](apps/api/README.md)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white&style=flat-square)](apps/web/README.md)
[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

Monorepo para planificar guardias hospitalarias con un solver de flujo maximo en C++ y una capa de API/Web en Node.js + React.

## Problema real que resuelve

Planificar guardias hospitalarias de forma manual escala mal: muchas restricciones, cambios de ultimo momento y conflictos de equidad entre profesionales.

Con equipos de 15-50 medicos y decenas de dias criticos al ano, una planificacion manual suele ser:

- Lenta (horas o dias de ajustes).
- Fragil (errores de cobertura o sobrecarga de personas).
- Dificil de justificar (sin evidencia matematica de equidad).

## Propuesta de valor

MaxFlow Shift Optimizer no es solo un asignador de turnos; es un motor de factibilidad y resiliencia operativa:

- Garantiza cobertura bajo restricciones duras.
- Distribuye carga con criterios matematicos consistentes.
- Diagnostica por que un escenario no es factible (Min-Cut/bottlenecks).
- Permite reparar o simular cambios sin rehacer todo desde cero.

En la practica, permite pasar de planificaciones manuales e inestables a un flujo auditable, repetible y rapido.

## Diferenciadores del producto

- Core C++ dedicado al calculo (latencia baja en escenarios complejos).
- API con autenticacion, roles y trazabilidad (auditoria).
- Frontend operativo para usuarios admin y medicos.
- Versionado de planes para comparar, publicar y controlar riesgo.
- Exportes y reportes listos para operacion diaria.

## Reutilizacion del core C++

Aunque este repo esta orientado al dominio hospitalario, el core en C++ implementa un patron general de asignacion de recursos con restricciones usando flujo en redes.

Eso permite reutilizar el motor para otros contextos, por ejemplo:

- Asignacion de agentes a franjas horarias en call centers.
- Planificacion de rutas/cupos en logistica.
- Asignacion de docentes a cursos y bloques.
- Distribucion de personal tecnico en guardias de soporte.

En resumen: cambia el modelo de entrada y reglas de capacidad, pero el motor de optimizacion sigue siendo el mismo.

## Que incluye hoy

- Solver C++17 (Edmonds-Karp) con diagnostico Min-Cut para casos no factibles.
- API Express + Prisma con autenticacion JWT y control por roles (`ADMIN`, `MEDICO`, `LECTOR`).
- Frontend React para operar el sistema (dashboard, medicos, periodos, solver, simulaciones, versiones).
- Simulaciones y reparaciones sin rehacer todo el plan.
- Versionado de planes con comparacion (`diff`), publicacion, riesgo y sugerencias de autofix.
- Exportes (`/export/excel`, `/export/ics`), reportes de equidad y auditoria.

## Estructura del repo

- `apps/core`: solver C++ y tests del algoritmo.
- `apps/api`: backend REST + Prisma + Swagger.
- `apps/web`: frontend React + Vite.
- `packages/shared`: esquemas compartidos (validaciones/tipos).
- `scripts`: automatizaciones de entorno y escenarios.

Documentacion por modulo:

- `apps/core/README.md`
- `apps/api/README.md`
- `apps/web/README.md`
- `ARCHITECTURE.md`

## Requisitos

- Node.js 18+
- npm 9+
- `g++` con soporte C++17
- `make`
- Linux/macOS (en Windows, usar WSL2 para scripts `.sh`)

## Inicio rapido

Desde la raiz del repo:

```bash
npm install
make dev
```

Esto compila `apps/core`, prepara la API (`prisma generate` + migraciones) y levanta backend en modo desarrollo.

URLs:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`

En otra terminal:

```bash
make web
```

- Frontend: `http://localhost:5173`

## Quick demo (2 minutos)

1. Levanta backend y core:
```bash
make dev
```
2. En otra terminal, levanta frontend:
```bash
make web
```
3. Entra a `http://localhost:5173` e inicia sesion con usuario admin de desarrollo (`admin@hospital.com` / `admin123`).
4. Carga un escenario:
```bash
make feasible
```
5. Desde la UI ejecuta el solver y revisa asignaciones, reporte de equidad y versiones/diff del plan.

Nota: las credenciales de arriba son solo para entorno local de desarrollo.

## Escenarios y pruebas

```bash
make feasible     # escenario factible
make infeasible   # escenario infactible (diagnostico Min-Cut)
make repair       # flujo de reparacion
make test         # entorno manual de pruebas
```

```bash
make test-api
make test-web
make test-all
```

## Roles y permisos

| Rol | Acceso principal |
| --- | --- |
| `ADMIN` | Gestion completa: usuarios, medicos, periodos, configuracion, solver, simulaciones, reparaciones, versionado, exportes, reportes, auditoria. |
| `MEDICO` | Gestion de su disponibilidad y consulta de guardias/asignaciones/reportes permitidos. |
| `LECTOR` | Consulta de informacion operativa (asignaciones, versiones, reportes y exportes segun endpoint). |

## Snapshot de API

Rutas principales:

- `POST /auth/login`
- `POST /auth/register` (admin)
- `GET/POST/PUT/DELETE /medicos`
- `GET/POST/PUT/DELETE /periodos`
- `GET/PUT /configuracion`
- `POST /asignaciones/ejecuciones` (alias legacy: `POST /asignaciones/resolver`)
- `POST /asignaciones/simulaciones`
- `POST /asignaciones/reparaciones`
- `GET /asignaciones`
- `GET /asignaciones/versiones`
- `POST /asignaciones/versiones/:id/publicar`
- `GET /asignaciones/diff` y `GET /asignaciones/diff/publicado`
- `GET /asignaciones/versiones/:id/riesgo`
- `GET /asignaciones/versiones/:id/aprobacion`
- `GET /asignaciones/versiones/:id/autofix-sugerido`
- `GET /reportes/equidad`, `GET /reportes/faltantes`
- `GET /auditoria`
- `GET /export/excel`, `GET /export/ics`

## Metricas de referencia

Rendimiento esperado en escenarios hospitalarios medianos (referencial):

- Resolucion del solver en milisegundos a decenas de milisegundos.
- Diagnostico de no factibilidad en la misma corrida (sin proceso adicional manual).
- Flujo operativo completo (resolver + revisar reporte) en minutos desde UI.

Para publicar benchmarks oficiales, conviene medir en tu entorno con dataset y hardware fijos.

## Estado del proyecto

- Estado actual: `usable` para entorno de desarrollo y validacion funcional end-to-end.
- Alcance actual: factibilidad, simulacion, reparacion, reportes, auditoria y versionado.
- Benchmarks reproducibles.
- Capturas/demo visual oficial.
- Endurecimiento de despliegue productivo y observabilidad.

## Capturas del producto

Pendiente agregar imagenes/GIF del flujo real de uso. Recomendado incluir:

- Login + dashboard.
- Ejecucion del solver.
- Comparacion entre versiones (`diff`) y analisis de riesgo.
- Reporte de equidad.

Si quieres, puedo crear ahora una carpeta `docs/screenshots/` y dejar el bloque markdown listo para insertar las capturas apenas las tengas.

## Profundizar

- Arquitectura general: `ARCHITECTURE.md`
- Solver C++: `apps/core/README.md`
- API: `apps/api/README.md`
- Frontend: `apps/web/README.md`

## Docker (produccion)

```bash
make prod
make stop
```

Variables recomendadas para el admin inicial:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME` (opcional)

Si no se definen, se usan defaults de desarrollo.

## Licencia

MIT. Ver `LICENSE`.
