/**
 * Tests unitarios para la clase Graph
 * Prueba las operaciones básicas del grafo
 */

#include "graph.h"
#include "test_utils.h"
#include <iostream>

// Test: Crear grafo vacío
void test_crear_grafo() {
  std::cout << "\n=== Test: Crear Grafo ===\n";

  Graph g(5);

  printResult("Grafo con 5 vértices", g.getNumVertices() == 5);
  printResult("Capacidad inicial es 0", g.getCapacity(0, 1) == 0);
}

// Test: Agregar aristas
void test_agregar_aristas() {
  std::cout << "\n=== Test: Agregar Aristas ===\n";

  Graph g(4);

  g.addEdge(0, 1, 10);
  g.addEdge(1, 2, 5);
  g.addEdge(2, 3, 15);

  printResult("Arista 0->1 con capacidad 10", g.getCapacity(0, 1) == 10);
  printResult("Arista 1->2 con capacidad 5", g.getCapacity(1, 2) == 5);
  printResult("Arista 2->3 con capacidad 15", g.getCapacity(2, 3) == 15);
  printResult("Arista inexistente retorna 0", g.getCapacity(0, 3) == 0);
}

// Test: Modificar capacidad
void test_modificar_capacidad() {
  std::cout << "\n=== Test: Modificar Capacidad ===\n";

  Graph g(3);

  g.addEdge(0, 1, 10);
  printResult("Capacidad inicial 10", g.getCapacity(0, 1) == 10);

  g.setCapacity(0, 1, 7);
  printResult("Capacidad modificada a 7", g.getCapacity(0, 1) == 7);

  g.setCapacity(0, 1, 0);
  printResult("Capacidad puede ser 0", g.getCapacity(0, 1) == 0);
}

// Test: Índices fuera de rango
void test_indices_invalidos() {
  std::cout << "\n=== Test: Índices Inválidos ===\n";

  Graph g(3);

  // No debería crashear con índices inválidos
  g.addEdge(-1, 0, 10);
  g.addEdge(0, 100, 10);

  printResult("addEdge con índice negativo no crashea", true);
  printResult("addEdge con índice fuera de rango no crashea", true);
  printResult("getCapacity índice inválido retorna 0",
              g.getCapacity(-1, 0) == 0);
  printResult("getCapacity índice fuera de rango retorna 0",
              g.getCapacity(0, 100) == 0);
}

// Test: Grafo dirigido (aristas en una dirección)
void test_grafo_dirigido() {
  std::cout << "\n=== Test: Grafo Dirigido ===\n";

  Graph g(3);

  g.addEdge(0, 1, 10);

  printResult("Arista 0->1 existe", g.getCapacity(0, 1) == 10);
  printResult("Arista 1->0 no existe (dirigido)", g.getCapacity(1, 0) == 0);
}

// Test: Múltiples aristas desde un nodo
void test_multiples_aristas() {
  std::cout << "\n=== Test: Múltiples Aristas ===\n";

  Graph g(5);

  // Nodo 0 conecta a varios nodos
  g.addEdge(0, 1, 5);
  g.addEdge(0, 2, 10);
  g.addEdge(0, 3, 15);
  g.addEdge(0, 4, 20);

  printResult("0->1 = 5", g.getCapacity(0, 1) == 5);
  printResult("0->2 = 10", g.getCapacity(0, 2) == 10);
  printResult("0->3 = 15", g.getCapacity(0, 3) == 15);
  printResult("0->4 = 20", g.getCapacity(0, 4) == 20);
}

// Runner para tests de Graph
void run_graph_tests() {
  std::cout << "╔════════════════════════════════════════════╗\n";
  std::cout << "║         Tests Unitarios: Graph             ║\n";
  std::cout << "╚════════════════════════════════════════════╝\n";

  test_crear_grafo();
  test_agregar_aristas();
  test_modificar_capacidad();
  test_indices_invalidos();
  test_grafo_dirigido();
  test_multiples_aristas();
}
