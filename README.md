# MaxFlow Shift Optimizer 🏥 ⚡

![C++](https://img.shields.io/badge/Core-C++17-blue.svg) ![Node.js](https://img.shields.io/badge/API-Node.js-green.svg) ![Algorithm](https://img.shields.io/badge/Algorithm-Edmonds--Karp-orange.svg)

> **More than just an assignment script: A resilient, explainable, and high-performance personnel management engine.**

MaxFlow Shift Optimizer resolves the operational complexity of hospital shift planning using **Maximum Flow** algorithms. Unlike traditional solutions that simply "fill gaps," this system ensures a mathematically optimal, equitable distribution with **coverage guarantee**.

Built on a hybrid architecture with a **high-performance C++ Core** and a **flexible Node.js API**, the system manages critical constraints and diagnoses bottlenecks in milliseconds.

---

## 🏥 The Real-World Problem

Imagine you are the shift supervisor of a hospital with **20 doctors in your team**.

It's December, and you have to plan **how all the holidays for the next year will be covered**: New Year's, Easter, National Holidays, Christmas... In total, **35+ critical shifts** that nobody wants to work but someone must cover.

**The rules are strict:**
- No doctor can work more than **K shifts in the entire year** (e.g., maximum 6 annual shifts to avoid burnout).
- No doctor can work more than **C shifts per holiday period** (currently C=1, meaning max 1 shift during Easter, max 1 during Christmas, etc.).
- Each shift needs a **minimum number of doctors (M)** to cover emergencies (e.g., at least 2 doctors per shift).


**The Problem:**
With 20 people, 35 shifts, and dozens of cross-constraints, doing this manually is:
- ⏰ **Slow** (days of back-and-forth Excel spreadsheets).
- ❌ **Error-prone** (you forgot Dr. Perez is on leave in July).
- 😤 **Conflict-prone** (why did I get 5 shifts and they only got 2?).
- 🚫 **Impossible to validate** (are you sure this planning is the best possible?).

**Even worse:** When a doctor requests leave in March, you have to **re-solve the entire puzzle** to redistribute only their shifts without affecting the rest of the team.



---

## 🚀 The Solution: MaxFlow Shift Optimizer

This system **solves this problem in less than 100 milliseconds** using graph theory and maximum flow.

It's not just a "shift assigner." It's an optimization engine that:

✅ **Guarantees mathematical fairness** (no favoritism, the algorithm is blind).
✅ **Detects impossibilities** (tells you *exactly* why demand cannot be met).
✅ **Auto-repairs** (if a doctor is absent, it reassigns only their shifts without touching the rest).
✅ **Scales effortlessly** (works the same for 10 doctors as it does for 100).

> **Typical use case:** Annual holiday/weekend shift planning for teams of 15-50 doctors in medium-sized hospitals.

### 📋 How does it work in practice?

The typical workflow is simple and direct:

1. **📅 Supervisor uploads the year's holidays** (New Year's, Easter, etc.).
2. **👨‍⚕️ Each doctor submits their availability** (maximum shifts they can cover).
3. **⚡ Supervisor runs the solver** (presses a button).
4. **✅ The system responds in milliseconds:**
   - If feasible → returns the complete and equitable schedule.
   - If impossible → explains exactly which constraint cannot be met.

**Bonus:** If a doctor is absent later, the system **repairs** only their shifts without touching the rest of the assignments.


### 📐 System Configuration Variables

The system operates with three main capacity constraints:

**K (Total Annual Capacity)**  
Maximum shifts a doctor can work across all holidays in the year.
- Example: `K = 6` means no doctor will work more than 6 shifts in all holidays throughout the year.

**C (Capacity per Holiday Period)**  
Maximum shifts a doctor can work within a single holiday period.
- Current example: `C = 1` means a doctor can work **maximum 1 day** in each holiday period.
- **What is a "holiday period"?** A set of consecutive days forming a long holiday.

**M (Doctors per Shift)**  
Minimum number of doctors required to cover a shift.
- Example: `M = 2` means each shift needs at least 2 assigned doctors.

**Period Examples:**
- **Easter**: 4 consecutive days (Thursday, Friday, Saturday, Easter Sunday).
  - With C=1 → A doctor can cover maximum 1 of those 4 days.
- **Christmas**: 2 days (December 24th and 25th).
  - With C=1 → A doctor can cover maximum 1 of those 2 days.
- **New Year**: 1 day (January 1st).
  - With C=1 → A doctor can cover that single day (or not work).

**Typical Case:**
- Hospital with 20 doctors.
- 35 shifts distributed across 10 different holiday periods.
- K = 6 (max 6 annual shifts per doctor).
- C = 1 (max 1 shift per holiday period).
- M = 2 (minimum 2 doctors per shift).
- Total Capacity: 20 doctors × 6 shifts = 120 available slots.
- Demand: 35 shifts × 2 doctors = 70 slots required.
- **Result: ✅ Feasible** (120 > 70).

This configuration ensures **temporal equity**: no doctor is stuck with all days of a long holiday, and the load is distributed proportionally throughout the year.

### Before vs After

| Aspect | Manual Method | MaxFlow Optimizer |
|---------|---------------|-------------------|
| Planning time | 2-3 days | < 1 second |
| Human errors | Frequent | Zero |
| Provable fairness | ❌ Subjective | ✅ Mathematical |
| Repair on absence | Redo everything | Affected shifts only |
| Validation capacity | Impossible | Min-Cut diagnosis |

---

## 🚀 Why this system? (Value Proposition)

### 🎯 Scope & Capabilities

The system strictly operates as a **Feasibility Engine**. It answers a binary question: *"Is it mathematically possible to satisfy all hospital demand given the constraints?"*

*   **In Scope (Features)**:
    *   Hard Constraints (Maximum shifts per doctor).
    *   Period Constraints (Fairness in weekend/holiday distribution).
    *   Demand Satisfaction (Full coverage of required shifts).
*   **Out of Scope (Future Roadmap)**:
    *   Soft preferences (e.g., "I prefer not to work on Thursdays") (requires *Cost-Flow*).
    *   Seniority weighting (Requires *Weighted Flow*).
    *   Cost minimization.

> *Note: The architecture is decoupled to allow future implementation of a Min-Cost Max-Flow solver that supports these soft constraints without rewriting the API.*

### 1. Mathematical Fairness Guarantee ⚖️
Eliminates favoritism and human error. The **Edmonds-Karp** based assignment engine ensures that maximum capacity and availability rules are strictly respected for all doctors.

### 2. Intelligent Bottleneck Diagnosis 🧠
Numbers don't add up? Most systems fail silently. This system implements a **Min-Cut** analysis to tell you *exactly* why it is impossible to cover demand:
> *"Cannot cover the shift because the 'Pediatricians' group has a cap of 3 total shifts, limiting maximum flow to 15 shifts when 20 are required."*

### 3. Operational Resilience (Auto-Repair) 🛡️
Medical leaves happen. Our **Intelligent Repair** feature allows deactivating a doctor and reassigning *only* their vacant shifts to other available professionals, without altering the schedule of the rest of the team.

---

### API Example - Resolve Assignments

**Request:**
```bash
curl -X POST http://localhost:3000/asignaciones/resolver \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Response (Feasible Case):**
```json
{
  "factible": true,
  "diasCubiertos": 87,
  "diasRequeridos": 87,
  "asignaciones": [
    { "medico": "Dr. García", "dia": "2025-01-01" },
    // ... more assignments
  ],
  "bottlenecks": []
}
```

**Response (Infeasible Case - Min-Cut Diagnosis):**
```json
{
  "factible": false,
  "diasCubiertos": 15,
  "diasRequeridos": 20,
  "asignaciones": [],
  "bottlenecks": [
    {
       "tipo": "SOURCE",
       "id": "Pediatricians",
       "razon": "Maximum capacity reached"
    }
  ]
}
```




## 🧩 Model Universality (Adaptability)

Although this implementation is configured for the hospital domain, the underlying design pattern (**Network Flow Resource Allocation**) is agnostic and adaptable to any industry that requires assigning finite resources to temporal demands under strict constraints.

The current architecture can be easily refactored to solve problems in other fields:

| Domain | "Source" (Resource) | "Sink" (Demand) | Capacity Constraint |
|:-------:|:------------------:|:----------------:|:------------------------:|
| **Hospitals** (Current) | Doctors | On-Call Shifts | Max shifts/month |
| **Call Centers** | Agents | Time Slots | Max hours/week |
| **Logistics** | Trucks | Delivery Routes | Cargo Capacity |
| **Events** | Bands/Artists | Stages/Schedules | Show Duration |
| **Education** | Teachers | Classrooms/Subjects | Schedule Availability |

---

## 🔮 App Roadmap (Upcoming Features)

While the Core engine is feature-complete for the MVP, the Application layer is evolving to improve the user experience:

*   [ ] **Visual Dashboard (Frontend)**: High Priority. A dedicated web frontend is needed soon to visualize the schedule, manage doctors, and run the solver without relying on raw API calls.
*   [x] **Smart Simulation Mode (What-If)**: Run safe scenarios ("what if Dr. X is unvailable?") without affecting the production schedule.
*   [x] **Multi-Format Export**: Download schedules as `.ics` (Calendar), `.csv`, or `.xlsx` (Excel).
*   [x] **Dynamic Configuration**: Expose operational parameters (like holidays periods) via API.
*   [x] **Fairness Report**: Statistical endpoints to prove equitable distribution of shifts.
*   [x] **Audit System**: Track critical actions and changes for security and accountability.

---

## 🏗️ Hybrid Architecture

This system uses a "best of both worlds" architecture, decoupling intensive business logic from computational calculation:

| Component | Technology | Responsibility | Why it was chosen |
|------------|------------|-----------------|-------------------|
| **Core** | **C++ (C++17)** | Graph Algorithms | **Pure Performance:** Manual memory management and low-level optimization to traverse graphs of thousands of nodes in milliseconds. |
| **API** | **Node.js + Express** | Orchestration and Data | **Flexibility:** Rapid development of REST endpoints, easy database integration (Prisma), and asynchronous process handling. |



![Architecture Diagram][architecture-diagram]

---

## 🤓 Technical Decisions and Trade-offs

In developing this system, conscious engineering decisions were made prioritizing robustness and maintainability over premature optimization.

### Implementation Details (Core C++)
The resolution engine (Solver) is optimized for speed and robustness. A conscious decision was made to use an **Adjacency Matrix** instead of lists. This prioritizes **code simplicity and cache locality** over theoretical traversal speed, as the performance trade-off is negligible at our scale (~1000 nodes).

> 📖 For a detailed technical explanation on **Matrix vs List** and graph topology, consult the [Core README](./core/README.md#implementation-detail-matrix-over-adjacency-list).

---

## 🛠️ Installation and Usage

### Prerequisites
-   **Node.js**: v16+
-   **C++ Compiler**: g++ (C++17 support)
-   **Make**: For automation scripts
-   **Operating System**: Linux or macOS.
    > ⚠️ **Windows Users:** It is **mandatory** to use [WSL2 (Windows Subsystem for Linux)](https://learn.microsoft.com/en-us/windows/wsl/install) to run this project, as automation scripts (`.sh`) and system signal handling are not compatible with native PowerShell or CMD.

### Quick Start (Dev Environment)

The project includes scripts that compile the C++ core and start the API automatically.

```bash
# 1. Compile Core and start API in development mode
make dev

# The API will be ready at http://localhost:3000
# Swagger Documentation at http://localhost:3000/api-docs
```

### Loading Test Scenarios

Don't start from scratch. Use our seeds to test real situations:

*   **Ideal Scenario:** Loads doctors and shifts where everything fits perfectly.
    ```bash
    make feasible
    ```

*   **Stress Scenario (Infeasible):** Forces the system to fail to test Min-Cut diagnosis.
    ```bash
    make infeasible
    ```

*   **Repair Scenario:** Simulates a doctor dropping out to test the shift reassignment feature.
    ```bash
    make repair
    ```
    > *Follow the instructions in the terminal to trigger the repair.*

*   **Clean Test Environment:** Starts an empty QA environment (`test.db`) for manual testing.
    ```bash
    make test
    ```

### 🔌 API Snapshot (MVP)
The API is designed to be the single interface for managing data and triggering the solver. These are the most relevant endpoints for the MVP flow:

| Action | Method | Endpoint | Notes |
| --- | --- | --- | --- |
| Authenticate | `POST` | `/auth/login` | Returns JWT token. |
| List doctors | `GET` | `/medicos` | Requires auth. |
| Create doctor | `POST` | `/medicos` | Admin-only. |
| Configure global limits | `PUT` | `/configuracion` | Admin-only. |
| Solve assignments | `POST` | `/asignaciones/resolver` | Runs core solver and persists results if feasible. |
| Repair assignments | `POST` | `/asignaciones/reparar` | Reassigns only missing shifts. |
| **Simulate scenarios** | `POST` | `/asignaciones/simular` | "What-if" analysis without saving. |
| Get assignments | `GET` | `/asignaciones` | Returns current schedule. |
| **Fairness Report** | `GET` | `/reportes/equidad` | Statistics on shift distribution. |
| **Audit Logs** | `GET` | `/auditoria` | Admin-only security logs. |

> 📘 Full contract and request/response examples are documented in Swagger (`/api-docs`) and in the API README (`/api/README.md`).

### Docker Usage (Recommended for Production) 🐳

The project includes an optimized **Multi-stage Build** configuration to generate a lightweight and secure image.

> **Tip (Linux):** To run these commands without `sudo`, ensure your user is in the docker group:
> `sudo usermod -aG docker $USER` (requires re-login or `newgrp docker` to apply).

```bash
# Start production environment (Detached mode)
make prod
# Or manually: docker-compose up --build -d

# Stop production environment
make stop
# Or manually: docker-compose down
```

### Production Configuration (Security) 🛡️
When deploying to production, you **should** configure the initial admin credentials using environment variables to avoid using the insecure defaults.

Set the following variables in your `docker-compose.yml` or your deployment environment:
*   `ADMIN_EMAIL`: Custom admin email.
*   `ADMIN_PASSWORD`: Secure password.
*   `ADMIN_NAME`: (Optional) Admin name.

**Example in docker-compose:**
```yaml
environment:
  - ADMIN_EMAIL=ops@hospital.com
  - ADMIN_PASSWORD=StrongPassword123!
```

**If these variables are NOT set**, the system will default to:
*   **Email**: `admin@hospital.com`
*   **Password**: `admin123`
*(Not recommended for public environments)*

> **Note:** The production database (`prod.db`) is stored in a **Docker Volume** (`sqlite_data`) to ensure persistence and security. It is not directly accessible as a file on the host (unless you inspect the volume).


---



## ❓ Troubleshooting

*   **Error: `make: g++: Command not found`**
    *   Ensure you have `g++` installed (`sudo apt install build-essential` on Ubuntu).
*   **Error: `EADDRINUSE: address already in use :::3000`**
    *   Another process is using port 3000. Kill it with `killall -9 node` or change the port in `.env`.
*   **Docker: `permission denied` connecting to socket**
    *   Ensure your user is in the docker group (`sudo usermod -aG docker $USER`) or run with `sudo`.

---

## ❓ Quick FAQ

**Q: Does this replace the supervisor?**  
A: No. The system assigns shifts optimally, but you still make the decisions (activating/deactivating doctors, configuring limits).

**Q: What if a doctor wants to swap their shift?**  
A: Currently, the system does not handle individual preferences (that requires Min-Cost Max-Flow, which is on the roadmap).

**Q: Does it work for other contexts (call centers, logistics)?**  
A: Yes, the pattern is reusable. See [Adaptability](#-model-universality-adaptability).

**Q: Why not use Python for the entire project?**  
A: The core needs maximum performance for large graphs (1000+ nodes). C++ offers 10-50x more speed than pure Python in graph algorithms.

---



## 📂 Project Structure

*   `/core`: **The Brain.** C++ source code (Edmonds-Karp Solver).
    > 📖 [See technical documentation of the algorithm and data schemas](./core/README.md)
*   `/api`: **The Nervous System.** Node.js REST API and DB management (Prisma).
*   `/scripts`: Utilities to automate the development lifecycle.


---

## 🤝 Contributing

This is a personal project, but contributions are welcome. If you want to collaborate:

1. Fork the repo.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

**Areas where contributions are accepted:**
- Unit/integration tests.
- API documentation.
- Solver optimizations.
- New adapters for other domains.


---

## 📄 License

MIT License - ver [LICENSE](LICENSE) para más detalles.

---

## 🙏 Acknowledgments

This project was inspired by real hospital planning problems and built with the goal of demonstrating that classic graph theory algorithms can solve complex real-world operational issues.

---
*Developed with ❤️ and C++ by [Nahuel Prieto]*

<!-- Links -->
[architecture-diagram]: https://mermaid.ink/img/Z3JhcGggTFIKICAgIEFbIkNsaWVudCByZXF1ZXN0Il0gLS0+fCJQT1NUIC9zb2x2ZSJ8IEIoIk5vZGUuanMgQVBJIikKICAgIEIgLS0+fCJHZW5lcmF0ZSBKU09OInwgQ3siaW5wdXQuanNvbiJ9CiAgICBDIC0tPnxSZWFkfCBEWyJDKysgQ29yZSBTb2x2ZXI8YnI+KEVkbW9uZHMtS2FycCkiXQogICAgRCAtLT58IldyaXRlIEpTT04ifCBFeyJvdXRwdXQuanNvbiJ9CiAgICBFIC0tPnxQYXJzZXwgQgogICAgQiAtLT58UGVyc2lzdHwgRlsoIlNRTGl0ZSBEQiIpXQogICAgQiAtLT58UmVzcG9uc2V8IEEKICAgIHN0eWxlIEQgZmlsbDojZjk2LHN0cm9rZTojMzMzLHN0cm9rZS13aWR0aDoycHgKICAgIHN0eWxlIEIgZmlsbDojNjliM2EyLHN0cm9rZTojMzMzLHN0cm9rZS13aWR0aDoycHg=
