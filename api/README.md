# MaxFlow API 🚀

This is the orchestration and data management layer of the system. It acts as the interface between the user, the database, and the C++ calculation engine.

## 🛠️ Tech Stack

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **ORM:** Prisma (SQLite by default)
*   **Validation:** Zod
*   **Docs:** Swagger / OpenAPI
*   **Testing:** Jest + Supertest

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

*   `src/controllers`: Endpoint logic.
*   `src/routes`: API route definitions.
*   `prisma/schema.prisma`: Data model definition.
*   `prisma/scenarios`: Seed scripts to recreate edge cases.

## 🔗 Core Integration (C++)

The API invokes the C++ executable (`../core/build/solver`) as a child process.
1.  **Input:** The API queries Prisma and generates a JSON that is injected into the `stdin` of the C++ process.
2.  **Output:** Reads the JSON response from the C++ `stdout`.
3.  **Error Handling:** Captures outputs in `stderr` for diagnostics.
