# MaxFlow API 🚀

This is the orchestration and data management layer of the system. It acts as the interface between the user, the database, and the C++ calculation engine.

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Prisma (SQLite by default)
- **Validation:** Zod
- **Docs:** Swagger / OpenAPI
- **Testing:** Vitest + Supertest

## ⚡ Key Commands

These commands are executed inside the `/api` folder:

### Development

```bash
# Start server in watch mode (Node 18+)
npm run dev

# Open GUI to view/edit database (Very useful)
npm run db:studio
```

### Database Management & Seeds

The project includes predefined scenarios to test the algorithm:

```bash
# Load ideal scenario (feasible solution found)
npm run db:scenario:feasible

# Load stress scenario (forces Min-Cut analysis)
npm run db:scenario:infeasible

# Reset DB completely
npm run db:reset
```

### Testing

Integration tests spin up a test database (isolated) and verify the endpoints.

```bash
npm test
```

## 📂 Structure

- `src/controllers`: Endpoint logic.
- `src/routes`: API route definitions.
- `prisma/schema.prisma`: Data model definition.
- `prisma/scenarios`: Seed scripts to recreate edge cases.

## 🔗 Core Integration (C++)

The API invokes the C++ executable (`../core/build/solver`) as a child process.

1.  **Input:** The API queries Prisma and generates a JSON that is injected into the `stdin` of the C++ process.
2.  **Output:** Reads the JSON response from the C++ `stdout`.
3.  **Error Handling:** Captures outputs in `stderr` for diagnostics.

### 🧾 Solver Contract (JSON)

The API builds the solver payload automatically based on database data, but this is the exact format sent to the core.

**Input (sent to solver):**

```json
{
  "medicos": ["Dra. Perez", "Dr. Lopez"],
  "dias": ["2024-06-01", "2024-06-02"],
  "periodos": [{ "id": "Junio", "dias": ["2024-06-01", "2024-06-02"] }],
  "disponibilidad": {
    "Dra. Perez": ["2024-06-01"],
    "Dr. Lopez": ["2024-06-02"]
  },
  "maxGuardiasPorPeriodo": 1,
  "maxGuardiasTotales": 4,
  "medicosPorDia": 1,
  "capacidades": {
    "Dra. Perez": 2
  }
}
```

**Output (returned by solver):**

```json
{
  "factible": true,
  "diasCubiertos": 2,
  "diasRequeridos": 2,
  "asignaciones": [
    { "medico": "Dra. Perez", "dia": "2024-06-01" },
    { "medico": "Dr. Lopez", "dia": "2024-06-02" }
  ],
  "bottlenecks": []
}
```

> Notes:
>
> - `medicosPorDia` can be a number (same for every day) or an object with per-day requirements.
> - `capacidades` is optional and used by the repair flow to cap remaining shifts per doctor.
