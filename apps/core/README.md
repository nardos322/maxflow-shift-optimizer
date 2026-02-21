# MaxFlow Shift Optimizer - Core

[![C++17](https://img.shields.io/badge/C%2B%2B-17-00599C?logo=c%2B%2B&logoColor=white&style=flat-square)](https://isocpp.org/)
[![Build](https://img.shields.io/badge/Build-make-427819?style=flat-square)](https://www.gnu.org/software/make/)
[![Algorithm](https://img.shields.io/badge/Algorithm-Edmonds--Karp-orange?style=flat-square)](#algoritmo)
[![Analysis](https://img.shields.io/badge/Diagnosis-Min--Cut-8A2BE2?style=flat-square)](#diagnostico-de-no-factibilidad)

Motor de calculo en C++17 que resuelve la asignacion de guardias con flujo maximo.

## Algoritmo

- Implementacion: Edmonds-Karp (Ford-Fulkerson + BFS)
- Complejidad temporal: `O(V * E^2)`
- Complejidad espacial: `O(V^2)` (matriz de adyacencia)

### Decisiones clave

- Se usa matriz de adyacencia por simplicidad, robustez y buena localidad de cache.
- Para el tamano esperado del problema (hospitalario), el trade-off frente a listas es aceptable.

## Topologia del grafo

Capas del modelo:

1. `Source -> Medico` con capacidad `maxGuardiasTotales`.
2. `Medico -> Medico-Periodo` con capacidad `maxGuardiasPorPeriodo`.
3. `Medico-Periodo -> Dia` con capacidad `1` si hay disponibilidad.
4. `Dia -> Sink` con capacidad `medicosPorDia`.

![Graph Topology][graph-topology]

## Diagnostico de no factibilidad

Si `max_flow < required_flow`, el solver reporta `bottlenecks` usando Min-Cut para explicar por que no se cubre la demanda.

## Build y tests

Desde la raiz del repo:

```bash
cd apps/core
make
make test
```

Salida del binario:

- `apps/core/build/solver`

## Contrato I/O (stdin/stdout JSON)

Input esperado:

```json
{
  "medicos": ["ID1", "ID2"],
  "dias": ["2024-01-01", "2024-01-02"],
  "periodos": [{ "id": "P1", "dias": ["2024-01-01"] }],
  "disponibilidad": {
    "ID1": ["2024-01-01"]
  },
  "maxGuardiasTotales": 5,
  "maxGuardiasPorPeriodo": 1,
  "medicosPorDia": 1,
  "capacidades": {
    "ID1": 2
  }
}
```

Notas:

- `medicosPorDia` puede ser numero global o mapa por fecha.
- `capacidades` es opcional y permite limites por medico (usado en reparaciones).

Output factible:

```json
{
  "factible": true,
  "diasCubiertos": 10,
  "diasRequeridos": 10,
  "asignaciones": [{ "medico": "ID1", "dia": "2024-01-01" }],
  "bottlenecks": []
}
```

Output no factible:

```json
{
  "factible": false,
  "diasCubiertos": 8,
  "diasRequeridos": 10,
  "asignaciones": [],
  "bottlenecks": [
    { "tipo": "Doctor", "id": "ID1", "razon": "Reached maximum total shifts limit" },
    { "tipo": "Day", "id": "2024-01-02", "razon": "Could not assign enough doctors" }
  ]
}
```

<!-- Links -->
[graph-topology]: https://mermaid.ink/img/Z3JhcGggTFIKICAgIFMoKFNvdXJjZSkpIC0tPiBNe01lZGljb3N9CiAgICBNIC0tPiBNUFtNZWRpY28tUGVyaW9kb10KICAgIE1QIC0tPiBEKERpYXMpCiAgICBEIC0tPiBUKChTaW5rKSk=
