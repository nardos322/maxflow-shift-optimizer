# MaxFlow Shift Optimizer 🏥 ⚡

![C++](https://img.shields.io/badge/Core-C++17-blue.svg) ![Node.js](https://img.shields.io/badge/API-Node.js-green.svg) ![Algorithm](https://img.shields.io/badge/Algorithm-Edmonds--Karp-orange.svg)

> **Más que un simple script de asignación: Un sistema de gestión de personal resiliente, explicable y de alto rendimiento.**

Este proyecto resuelve el complejo problema de la asignación de guardias hospitalarias utilizando algoritmos de flujo máximo. A diferencia de soluciones tradicionales que simplemente "asignan huecos", MaxFlow Shift Optimizer garantiza una distribución matemática óptima, equitativa y transparente.

---

## 🚀 ¿Por qué este sistema? (Value Proposition)

### 1. Garantía de Justicia Matemática ⚖️
Elimina el favoritismo y el error humano. El motor de asignación basado en **Edmonds-Karp** asegura que las reglas de capacidad máxima y disponibilidad se respeten estrictamente para todos los médicos.

### 2. Diagnóstico Inteligente de Cuellos de Botella 🧠
¿No cierran los números? La mayoría de los sistemas fallan en silencio. Este sistema implementa un análisis de **Min-Cut** (Corte Mínimo) para decirte *exactamente* por qué es imposible cubrir la demanda:
> *"No se puede cubrir el turno porque el grupo de 'Pediatras' tiene un tope de 3 guardias totales, limitando el flujo máximo a 15 turnos cuando se requieren 20."*

### 3. Resiliencia Operativa (Auto-Repair) 🛡️
Las bajas médicas ocurren. Nuestra función de **Reparación Inteligente** permite dar de baja a un médico y reasignar *solo* sus turnos vacantes a otros profesionales disponibles, sin alterar el cronograma del resto del equipo.

---

## 🏗️ Arquitectura Híbrida

Este sistema utiliza una arquitectura de "lo mejor de dos mundos", desacoplando la lógica de negocio intensiva del cálculo computacional:

| Componente | Tecnología | Responsabilidad | Por qué se eligió |
|------------|------------|-----------------|-------------------|
| **Core** | **C++ (C++17)** | Algoritmos de Grafos | **Rendimiento Puro:** Gestión manual de memoria y optimización de bajo nivel para recorrer grafos de miles de nodos en milisegundos. |
| **API** | **Node.js + Express** | Orquestación y Datos | **Flexibilidad:** Rápido desarrollo de endpoints REST, fácil integración con bases de datos (Prisma) y manejo asíncrono de procesos. |

---

## 🤓 Decisiones Técnicas y Trade-offs

En el desarrollo de este sistema se tomaron decisiones ingenieriles conscientes priorizando la robustez y mantenibilidad sobre la optimización prematura.

### Representación del Grafo: ¿Matriz de Adyacencia o Lista de Adyacencia?

Se eligió una **Matriz de Adyacencia** (`vector<vector<int>>`) para representar la red de flujo.

*   **El Mito:** "Las listas de adyacencia son siempre mejores porque ahorran memoria".
*   **La Realidad del Negocio:**
    1.  **Acceso O(1):** El algoritmo de Edmonds-Karp requiere consultar y actualizar constantemente la *capacidad residual* de las aristas (ida y vuelta). En una matriz, esto es instantáneo (`adj[u][v]`). En una lista, requiere iterar sobre los vecinos, añadiendo overhead en grafos densos.
    2.  **Escala del Problema:** Para un hospital con 100 médicos y un año de turnos, el grafo tendrá $N < 2000$ nodos. Una matriz de $2000 \times 2000$ enteros ocupa ~16 MB de RAM.
    3.  **Conclusión:** El costo de memoria es despreciable para cualquier servidor moderno, mientras que la **simplicidad del código** y la velocidad de acceso garantizan un sistema más robusto y menos propenso a bugs de punteros.

---

## 🛠️ Instalación y Uso

### Requisitos Previos
-   **Node.js**: v16+
-   **C++ Compiler**: g++ (soporte C++17)
-   **Make**: Para scripts de automatización

### Inicio Rápido (Dev Environment)

El proyecto incluye scripts que compilan el core C++ y levantan la API automáticamente.

```bash
# 1. Compilar Core y levantar API en modo desarrollo
make dev

# La API estará lista en http://localhost:3000
# Documentación Swagger en http://localhost:3000/api-docs
```

### Carga de Escenarios de Prueba

No empieces desde cero. Usa nuestros seeds para probar situaciones reales:

*   **Escenario Ideal:** Carga médicos y turnos donde todo encaja perfectamente.
    ```bash
    make feasible
    ```

*   **Escenario de Estrés (Infactible):** Fuerza al sistema a fallar para probar el diagnóstico Min-Cut.
    ```bash
    make infeasible
    ```

## 📂 Estructura del Proyecto

*   `/core`: **The Brain.** Código fuente C++ (Solver Edmonds-Karp).
*   `/api`: **The Nervous System.** API REST Node.js y gestión de DB (Prisma).
*   `/scripts`: Utilities para automatizar el ciclo de vida del desarrollo.

---
*Developed with ❤️ and C++ by [Tu Nombre]*
