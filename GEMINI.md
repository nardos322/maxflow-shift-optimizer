# MaxFlow Shift Optimizer - Project Context

## Overview
This project is a hybrid C++/Node.js application designed to optimize hospital guard duty assignments using network flow algorithms (Edmonds-Karp).

## Architecture
The system consists of two main components:
1.  **Core (C++)**: A high-performance flow network solver.
    -   Implements Edmonds-Karp algorithm.
    -   Parses JSON input from stdin.
    -   Outputs JSON result to stdout.
2.  **API (Node.js)**: A REST API that manages data and orchestrates the core solver.
    -   Uses Prisma for database management (SQLite/Postgres).
    -   Spawns the C++ core as a child process for calculations.

### Communication
`API` -> `JSON (stdin)` -> `Core` -> `JSON (stdout)` -> `API`

## Project Structure
-   `core/`: C++ source code.
    -   `src/`: Main logic (`main.cpp`, `edmonds_karp.cpp`, `graph.cpp`).
    -   `Makefile`: Build configuration.
    -   `tests/`: C++ unit tests.
-   `api/`: Node.js Express application.
    -   `src/services/core.service.js`: Wrapper to spawn the C++ executable.
    -   `prisma/`: Database schema and scenarios.

## Development Workflow

### Quick Start (Helper Scripts)
The project includes shell scripts in `scripts/` folder to automate common tasks:

-   `./scripts/start_dev.sh`: Compiles core + runs API dev server.
-   `./scripts/start_scenario_feasible.sh`: Loads feasible data + runs API.
-   `./scripts/start_test_env.sh`: Sets up a clean test environment.

### Manual Workflow

#### 1. Build C++ Core
The core must be compiled before the API can use it.
```bash
cd core
make
```
Executable location: `core/build/solver`

#### 2. Run API
```bash
cd api
npm install
npm run dev
```

### 3. Database Management
-   **Reset & Seed**: `npm run db:reset`
-   **Load Scenarios**:
    -   `npm run db:scenario:feasible`
    -   `npm run db:scenario:infeasible`

### 4. Testing
-   **C++ Tests**:
    ```bash
    cd core
    make test
    ```
-   **API Tests**:
    ```bash
    cd api
    npm test
    ```

## Key Files for AI Context
-   `core/src/edmonds_karp.cpp`: Core algorithm logic.
-   `api/src/services/core.service.js`: Integration point between Node and C++.
-   `api/prisma/schema.prisma`: Data model.

## Coding Conventions
-   **C++**: C++17 standard.
-   **Node.js**: CommonJS modules, Async/Await patterns.
