/**
 * Tests de integración: Asignación de Guardias Médicas
 * Modelo de 3 capas: Médicos -> Médico-Periodo -> Días
 */

#include "edmonds_karp.h"
#include "graph.h"
#include "test_utils.h"
#include <iostream>

// Test 1: Modelo 3 capas básico
void test_modelo_3_capas_basico() {
  std::cout << "\n=== Test: Modelo 3 Capas Básico ===\n";

  // Modelo de 3 capas:
  // - Capa 1: Médicos
  // - Capa 2: Médico-Periodo (controla máx guardias por periodo)
  // - Capa 3: Días
  //
  // 2 médicos: M1, M2
  // 1 periodo: P1
  // 3 días de guardia: D1, D2, D3
  // M1 disponible: D1, D2, D3
  // M2 disponible: D2, D3
  // Máximo C = 2 guardias por médico por periodo
  // Cada día necesita 1 médico

  // Nodos:
  // 0 = source
  // 1 = M1, 2 = M2
  // 3 = M1-P1, 4 = M2-P1
  // 5 = D1, 6 = D2, 7 = D3
  // 8 = sink

  Graph g(9);
  int C = 2;

  // CAPA 1: Source -> Médicos
  g.addEdge(0, 1, 3);
  g.addEdge(0, 2, 2);

  // CAPA 2: Médicos -> Médico-Periodo
  g.addEdge(1, 3, C);
  g.addEdge(2, 4, C);

  // CAPA 3: Médico-Periodo -> Días
  g.addEdge(3, 5, 1);
  g.addEdge(3, 6, 1);
  g.addEdge(3, 7, 1);
  g.addEdge(4, 6, 1);
  g.addEdge(4, 7, 1);

  // Días -> Sink
  g.addEdge(5, 8, 1);
  g.addEdge(6, 8, 1);
  g.addEdge(7, 8, 1);

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int maxFlowValue = ek.maxFlowWithResult(g, 0, 8, flowGraph);

  std::cout << "  Flujo máximo: " << maxFlowValue << " (esperado: 3)\n";
  printResult("Asignación factible (3 días cubiertos)", maxFlowValue == 3);

  // Mostrar asignaciones
  std::cout << "  Asignaciones encontradas:\n";
  std::string medicoPeriodo[] = {"", "", "", "M1-P1", "M2-P1"};
  std::string dias[] = {"", "", "", "", "", "D1", "D2", "D3"};

  for (int mp = 3; mp <= 4; mp++) {
    for (int d = 5; d <= 7; d++) {
      if (flowGraph[mp][d] > 0) {
        std::cout << "    " << medicoPeriodo[mp] << " -> " << dias[d] << "\n";
      }
    }
  }
}

// Test 2: Modelo 3 capas con múltiples periodos
void test_modelo_3_capas_multiples_periodos() {
  std::cout << "\n=== Test: Modelo 3 Capas con Múltiples Periodos ===\n";

  // 2 médicos, 2 periodos, 4 días (2 días por periodo)
  // M1 disponible: D1, D2, D3, D4
  // M2 disponible: D1, D3
  // C = 1 (máx 1 guardia por periodo por médico)

  // Nodos:
  // 0 = source
  // 1 = M1, 2 = M2
  // 3 = M1-P1, 4 = M1-P2, 5 = M2-P1, 6 = M2-P2
  // 7 = D1, 8 = D2, 9 = D3, 10 = D4
  // 11 = sink

  Graph g(12);
  int C = 1;

  // Source -> Médicos
  g.addEdge(0, 1, 4);
  g.addEdge(0, 2, 2);

  // Médicos -> Médico-Periodo
  g.addEdge(1, 3, C);
  g.addEdge(1, 4, C);
  g.addEdge(2, 5, C);
  g.addEdge(2, 6, C);

  // Médico-Periodo -> Días
  g.addEdge(3, 7, 1);  // M1-P1 -> D1
  g.addEdge(3, 8, 1);  // M1-P1 -> D2
  g.addEdge(5, 7, 1);  // M2-P1 -> D1
  g.addEdge(4, 9, 1);  // M1-P2 -> D3
  g.addEdge(4, 10, 1); // M1-P2 -> D4
  g.addEdge(6, 9, 1);  // M2-P2 -> D3

  // Días -> Sink
  g.addEdge(7, 11, 1);
  g.addEdge(8, 11, 1);
  g.addEdge(9, 11, 1);
  g.addEdge(10, 11, 1);

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int maxFlowValue = ek.maxFlowWithResult(g, 0, 11, flowGraph);

  std::cout << "  Flujo máximo: " << maxFlowValue << " (esperado: 4)\n";
  printResult("Asignación factible (4 días cubiertos)", maxFlowValue == 4);

  // Mostrar asignaciones
  std::cout << "  Asignaciones encontradas:\n";
  std::string mp[] = {"", "", "", "M1-P1", "M1-P2", "M2-P1", "M2-P2"};
  std::string dias[] = {"", "", "", "", "", "", "", "D1", "D2", "D3", "D4"};

  for (int m = 3; m <= 6; m++) {
    for (int d = 7; d <= 10; d++) {
      if (flowGraph[m][d] > 0) {
        std::cout << "    " << mp[m] << " -> " << dias[d] << "\n";
      }
    }
  }
}

// Test 3: Caso no factible
void test_caso_no_factible() {
  std::cout << "\n=== Test: Caso No Factible ===\n";

  // 1 médico, 1 periodo, 2 días
  // M1 solo disponible D1
  // C = 1
  // Se necesitan cubrir 2 días pero solo hay disponibilidad para 1

  // Nodos:
  // 0 = source
  // 1 = M1
  // 2 = M1-P1
  // 3 = D1, 4 = D2
  // 5 = sink

  Graph g(6);

  g.addEdge(0, 1, 1); // Source -> M1
  g.addEdge(1, 2, 1); // M1 -> M1-P1
  g.addEdge(2, 3, 1); // M1-P1 -> D1
  // D2 no tiene médico disponible
  g.addEdge(3, 5, 1); // D1 -> Sink
  g.addEdge(4, 5, 1); // D2 -> Sink

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int maxFlowValue = ek.maxFlowWithResult(g, 0, 5, flowGraph);

  std::cout << "  Flujo máximo: " << maxFlowValue << " (días requeridos: 2)\n";
  printResult("Detecta asignación no factible", maxFlowValue < 2);
}

// Test 4: Restricción de capacidad C
void test_restriccion_capacidad() {
  std::cout << "\n=== Test: Restricción de Capacidad C ===\n";

  // 1 médico disponible los 3 días, pero C=1 limita a 1 guardia por periodo
  // 1 periodo con 3 días

  // Nodos:
  // 0 = source
  // 1 = M1
  // 2 = M1-P1
  // 3 = D1, 4 = D2, 5 = D3
  // 6 = sink

  Graph g(7);
  int C = 1; // Solo 1 guardia por periodo

  g.addEdge(0, 1, 3); // M1 disponible 3 días
  g.addEdge(1, 2, C); // Limitado por C=1
  g.addEdge(2, 3, 1);
  g.addEdge(2, 4, 1);
  g.addEdge(2, 5, 1);
  g.addEdge(3, 6, 1);
  g.addEdge(4, 6, 1);
  g.addEdge(5, 6, 1);

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int maxFlowValue = ek.maxFlowWithResult(g, 0, 6, flowGraph);

  std::cout << "  Flujo máximo: " << maxFlowValue
            << " (esperado: 1, limitado por C)\n";
  printResult("Capacidad C limita correctamente", maxFlowValue == 1);
}

// Test 5: Múltiples médicos necesarios por día
void test_multiples_medicos_por_dia() {
  std::cout << "\n=== Test: Múltiples Médicos por Día ===\n";

  // 3 médicos, 1 periodo, 2 días
  // Cada día necesita 2 médicos
  // Todos los médicos disponibles todos los días
  // C = 2 (máx 2 guardias por periodo)

  // Nodos:
  // 0 = source
  // 1 = M1, 2 = M2, 3 = M3
  // 4 = M1-P1, 5 = M2-P1, 6 = M3-P1
  // 7 = D1, 8 = D2
  // 9 = sink

  Graph g(10);
  int C = 2;

  // Source -> Médicos
  g.addEdge(0, 1, 2);
  g.addEdge(0, 2, 2);
  g.addEdge(0, 3, 2);

  // Médicos -> Médico-Periodo
  g.addEdge(1, 4, C);
  g.addEdge(2, 5, C);
  g.addEdge(3, 6, C);

  // Médico-Periodo -> Días (todos disponibles)
  g.addEdge(4, 7, 1);
  g.addEdge(4, 8, 1);
  g.addEdge(5, 7, 1);
  g.addEdge(5, 8, 1);
  g.addEdge(6, 7, 1);
  g.addEdge(6, 8, 1);

  // Días -> Sink (cada día necesita 2 médicos)
  g.addEdge(7, 9, 2);
  g.addEdge(8, 9, 2);

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int maxFlowValue = ek.maxFlowWithResult(g, 0, 9, flowGraph);

  std::cout << "  Flujo máximo: " << maxFlowValue << " (esperado: 4)\n";
  printResult("4 asignaciones (2 médicos x 2 días)", maxFlowValue == 4);
}

// Runner para tests de asignación médica (hospital)
void run_hospital_tests() {
  std::cout << "╔════════════════════════════════════════════╗\n";
  std::cout << "║  Tests: Asignación de Médicos a Guardias   ║\n";
  std::cout << "║          Modelo de 3 Capas                 ║\n";
  std::cout << "╚════════════════════════════════════════════╝\n";

  test_modelo_3_capas_basico();
  test_modelo_3_capas_multiples_periodos();
  test_caso_no_factible();
  test_restriccion_capacidad();
  test_multiples_medicos_por_dia();
}
