# Interface Design System

## Direction
Editorial clínica para producto operativo: interfaz de administración con tono técnico-calmo, superficies cálidas, acento teal y feedback semántico claro.

## Intent
- Usuario principal: equipo administrativo hospitalario.
- Objetivo: ejecutar acciones de planificación y revisar estado sin fricción.
- Sensación: precisa, sobria, confiable.

## Tokens
- Background base: `--background: 45 38% 95%`
- Foreground principal: `--foreground: 210 20% 14%`
- Primary/acento: `--primary: 184 64% 30%`
- Accent suave: `--accent: 35 92% 92%`
- Border/Input: `--border: 28 28% 84%`, `--input: 28 28% 84%`
- Radius base: `--radius: 0.875rem`

## Typography
- Display/headings: `Bricolage Grotesque`
- Body/UI text: `IBM Plex Sans`
- Jerarquía:
- H1/H2: bold-extrabold con tracking negativo leve.
- Labels y metadata: uppercase + tracking amplio (`0.14em` a `0.22em`).
- Datos numéricos destacados: tamaño grande y peso alto.

## Depth Strategy
- Usar principalmente **bordes + capas suaves** (no sombras dramáticas).
- Superficies principales: clase `panel-glass`.
- Textura de fondo: `grain-layer` para atmósfera sutil.
- Separación interna: `border-border/70`.

## Motion
- Entradas cortas con `dash-reveal`.
- Escalonado: `delay-1`, `delay-2`, `delay-3`.
- Evitar animación decorativa continua.

## Layout Patterns
- Estructura app:
- Sidebar en panel translúcido, navegación horizontal en mobile y vertical en desktop.
- Header sticky con contexto de ubicación.
- Main con padding `p-4 md:p-8`.

- Sección hero de página:
- `panel-glass`, `rounded-2xl`, título fuerte + subtítulo operativo.

- Metric cards:
- `panel-glass`, `rounded-xl`, label uppercase y valor grande.

- Data sections:
- Contenedor panel con header separado por borde y body para tabla/lista.

## Component Rules
- Badges en tablas con fondo tenue (`bg-accent/35`) cuando sean categóricos.
- Empty states dentro de bloque dashed suave.
- Botones de acción principal con radio redondeado (`rounded-xl`).

## Solver Operations Pattern
- Página de operaciones del solver en 3 capas:
- 1) Hero de ejecución principal (resolver),
- 2) Módulos tácticos en grid (`xl:grid-cols-2`) para `simulación` y `reparación`,
- 3) Resultados persistidos (tabla) + paneles de conflicto (`minCut`/`bottlenecks`).

- Cada módulo táctico debe incluir:
- Ícono en contenedor sutil (`rounded-lg border bg-accent/50|bg-secondary/60`),
- Título + microcopy operativo,
- Formulario compacto con labels uppercase tracking amplio,
- CTA al pie con estado pending,
- Caja de resultado con badges de estado y lista resumida de conflictos.

- Estado global de operaciones:
- métrica "Estado del Motor" cambia a `Procesando` si cualquier mutation está pendiente.
- métrica "Última Acción" se actualiza con etiqueta semántica de la última operación ejecutada.

- Tratamiento de errores operativos:
- evitar `alert()` bloqueante,
- mostrar feedback persistente en bloque visible dentro de la página.

## Consistency Rules
- No volver a fuentes genéricas (`Arial`, `Inter`, `Roboto`).
- No introducir paletas fuera del sistema salvo estados semánticos.
- No mezclar estrategia de profundidad con sombras pesadas.
- Mantener clases utilitarias de atmósfera (`panel-glass`, `grain-layer`) en pantallas core.
