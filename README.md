# MaxFlow Shift Optimizer

Sistema de optimización de asignación de guardias hospitalarias utilizando algoritmos de flujo máximo (Edmonds-Karp). Este proyecto combina un núcleo de alto rendimiento en C++ con una API REST en Node.js para la gestión de datos.

## Características

-   **Optimización de Asignaciones**: Asignación automática de médicos a guardias basada en disponibilidad y capacidad.
-   **Algoritmo Eficiente**: Implementación de Edmonds-Karp en C++ para resolver la red de flujo.
-   **API REST**: Interfaz completa en Node.js (Express) para gestionar médicos, guardias y asignaciones.
-   **Análisis de Fallos**: Diagnóstico de escenarios infactibles mediante análisis de Min-Cut.
-   **Reparación de Asignaciones**: Reasignación inteligente cuando ocurren imprevistos (bajas médicas).

## Requisitos Previos

-   **Node.js**: v16 o superior.
-   **C++ Compiler**: g++ con soporte para C++17.
-   **Base de Datos**: SQLite (por defecto) o PostgreSQL.

## Instalación Rápida y Uso

El proyecto incluye scripts de utilidad que automatizan la compilación del core y la configuración de la API.

1.  **Iniciar Entorno de Desarrollo**
    Compila el core C++, instala dependencias y levanta la API.
    ```bash
    make dev
    ```
    La API estará disponible en `http://localhost:3000`.

2.  **Cargar Escenarios**
    Para probar con datos precargados:
    
    -   **Escenario Factible**:
        ```bash
        make feasible
        ```
    -   **Escenario Infactible**:
        ```bash
        make infeasible
        ```

3.  **Entorno de Pruebas**
    Para levantar un entorno limpio para pruebas manuales:
    ```bash
    make test
    ```

## Instalación Manual (Alternativa)

Si prefieres no usar los scripts automáticos:

1.  **Compilar el Core**
    ```bash
    cd core
    make
    ```

2.  **Iniciar API**
    ```bash
    cd api
    npm install
    npm run setup
    npm run dev
    ```

## Estructura del Proyecto

-   `/core`: Código fuente C++ (Algoritmo Edmonds-Karp).
-   `/api`: Código fuente Node.js (Express API + Prisma).
-   `/scripts`: Scripts de utilidad para desarrollo y testing.

## Documentación Técnica

Para información detallada sobre la arquitectura, desarrollo y convenciones del proyecto, consulta el archivo [GEMINI.md](./GEMINI.md).
