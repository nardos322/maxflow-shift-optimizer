/**
 * Tests unitarios para el algoritmo Edmonds-Karp
 * Prueba casos básicos de flujo máximo
 */

#include "edmonds_karp.h"
#include "graph.h"
#include "test_utils.h"
#include <iostream>

// Test: Flujo simple (una ruta)
void test_flujo_simple() {
  std::cout << "\n=== Test: Flujo Simple ===\n";

  // Grafo: 0 -> 1 -> 2
  Graph g(3);
  g.addEdge(0, 1, 10);
  g.addEdge(1, 2, 10);

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int flow = ek.maxFlowWithResult(g, 0, 2, flowGraph);

  printResult("Flujo máximo = 10", flow == 10);
}

// Test: Cuello de botella
void test_cuello_de_botella() {
  std::cout << "\n=== Test: Cuello de Botella ===\n";

  // Grafo: 0 --(10)--> 1 --(5)--> 2 --(10)--> 3
  // El cuello de botella es 5
  Graph g(4);
  g.addEdge(0, 1, 10);
  g.addEdge(1, 2, 5); // Cuello de botella
  g.addEdge(2, 3, 10);

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int flow = ek.maxFlowWithResult(g, 0, 3, flowGraph);

  printResult("Flujo limitado por cuello de botella = 5", flow == 5);
}

// Test: Dos rutas paralelas
void test_rutas_paralelas() {
  std::cout << "\n=== Test: Rutas Paralelas ===\n";

  // 0 -> 1 -> 3
  // 0 -> 2 -> 3
  Graph g(4);
  g.addEdge(0, 1, 10);
  g.addEdge(0, 2, 10);
  g.addEdge(1, 3, 10);
  g.addEdge(2, 3, 10);

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int flow = ek.maxFlowWithResult(g, 0, 3, flowGraph);

  printResult("Flujo por dos rutas = 20", flow == 20);
}

// Test: Sin camino
void test_sin_camino() {
  std::cout << "\n=== Test: Sin Camino ===\n";

  // Grafo desconectado
  Graph g(4);
  g.addEdge(0, 1, 10);
  // 2 y 3 no están conectados a 0,1
  g.addEdge(2, 3, 10);

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int flow = ek.maxFlowWithResult(g, 0, 3, flowGraph);

  printResult("Flujo sin camino = 0", flow == 0);
}

// Test: Grafo clásico de ejemplo
void test_grafo_clasico() {
  std::cout << "\n=== Test: Grafo Clásico ===\n";

  // Grafo con arista bidireccional
  Graph g(4);
  g.addEdge(0, 1, 16);
  g.addEdge(0, 2, 13);
  g.addEdge(1, 2, 10);
  g.addEdge(1, 3, 12);
  g.addEdge(2, 1, 4);
  g.addEdge(2, 3, 14);

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int flow = ek.maxFlowWithResult(g, 0, 3, flowGraph);

  std::cout << "  Flujo calculado: " << flow << " (esperado: 26)\n";
  printResult("Flujo máximo grafo clásico = 26", flow == 26);
}

// Test: maxFlowWithResult devuelve la matriz de flujo
void test_flow_result() {
  std::cout << "\n=== Test: Matriz de Flujo ===\n";

  Graph g(4);
  g.addEdge(0, 1, 10);
  g.addEdge(0, 2, 5);
  g.addEdge(1, 3, 10);
  g.addEdge(2, 3, 5);

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int flow = ek.maxFlowWithResult(g, 0, 3, flowGraph);

  printResult("Flujo total = 15", flow == 15);
  printResult("Flujo 0->1 = 10", flowGraph[0][1] == 10);
  printResult("Flujo 0->2 = 5", flowGraph[0][2] == 5);
  printResult("Flujo 1->3 = 10", flowGraph[1][3] == 10);
  printResult("Flujo 2->3 = 5", flowGraph[2][3] == 5);
}

// Test: Source igual a sink
void test_source_igual_sink() {
  std::cout << "\n=== Test: Source = Sink ===\n";

  Graph g(3);
  g.addEdge(0, 1, 10);
  g.addEdge(1, 2, 10);

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int flow = ek.maxFlowWithResult(g, 0, 0, flowGraph);

  printResult("Flujo source=sink = 0", flow == 0);
}

// Runner para tests de Edmonds-Karp
void run_edmonds_karp_tests() {
  std::cout << "╔════════════════════════════════════════════╗\n";
  std::cout << "║       Tests Unitarios: Edmonds-Karp        ║\n";
  std::cout << "╚════════════════════════════════════════════╝\n";

  test_flujo_simple();
  test_cuello_de_botella();
  test_rutas_paralelas();
  test_sin_camino();
  test_grafo_clasico();
  test_flow_result();
  test_source_igual_sink();
}
