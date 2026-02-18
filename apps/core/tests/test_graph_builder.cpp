/**
 * Tests unitarios para GraphBuilder
 * Verifica la construcción automática del grafo de 3 capas
 */

#include "edmonds_karp.h"
#include "graph_builder.h"
#include "test_utils.h"
#include <iostream>

// Test: Construcción básica
void test_construccion_basica() {
  std::cout << "\n=== Test: Construcción Básica ===\n";

  GraphBuilder builder;

  builder.setMedicos({"M1", "M2"});
  builder.setDias({"D1", "D2", "D3"});
  builder.setPeriodos({{"P1", {"D1", "D2", "D3"}}});
  builder.setDisponibilidad({{"M1", {"D1", "D2", "D3"}}, {"M2", {"D2", "D3"}}});
  builder.setMaxGuardiasPorPeriodo(2);
  builder.setMedicosRequeridosTodosDias(1);

  Graph g = builder.build();

  // 1 source + 2 médicos + 2 médico-periodo + 3 días + 1 sink = 9
  printResult("Número de vértices correcto", g.getNumVertices() == 9);
  printResult("Source es 0", builder.getSource() == 0);
  printResult("Sink es 8", builder.getSink() == 8);
}

// Test: Resolver con GraphBuilder
void test_resolver_con_builder() {
  std::cout << "\n=== Test: Resolver con GraphBuilder ===\n";

  GraphBuilder builder;

  builder.setMedicos({"M1", "M2"});
  builder.setDias({"D1", "D2", "D3"});
  builder.setPeriodos({{"P1", {"D1", "D2", "D3"}}});
  builder.setDisponibilidad({{"M1", {"D1", "D2", "D3"}}, {"M2", {"D2", "D3"}}});
  builder.setMaxGuardiasPorPeriodo(2);
  builder.setMedicosRequeridosTodosDias(1);

  Graph g = builder.build();

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int maxFlow = ek.maxFlowWithResult(g, builder.getSource(), builder.getSink(),
                                     flowGraph);

  ResultadoAsignacion resultado = builder.extraerResultado(flowGraph);

  std::cout << "  Flujo máximo: " << maxFlow << "\n";
  std::cout << "  Días cubiertos: " << resultado.diasCubiertos << "/"
            << resultado.diasRequeridos << "\n";

  printResult("Flujo máximo = 3", maxFlow == 3);
  printResult("Resultado factible", resultado.factible);
  printResult("3 asignaciones", resultado.asignaciones.size() == 3);

  std::cout << "  Asignaciones:\n";
  for (const auto &asig : resultado.asignaciones) {
    std::cout << "    " << asig.medico << " -> " << asig.dia << "\n";
  }
}

// Test: Múltiples periodos
void test_multiples_periodos() {
  std::cout << "\n=== Test: Múltiples Periodos ===\n";

  GraphBuilder builder;

  builder.setMedicos({"M1", "M2"});
  builder.setDias({"D1", "D2", "D3", "D4"});
  builder.setPeriodos({{"P1", {"D1", "D2"}}, {"P2", {"D3", "D4"}}});
  builder.setDisponibilidad(
      {{"M1", {"D1", "D2", "D3", "D4"}}, {"M2", {"D1", "D3"}}});
  builder.setMaxGuardiasPorPeriodo(1); // Solo 1 guardia por periodo
  builder.setMedicosRequeridosTodosDias(1);

  Graph g = builder.build();

  // 1 source + 2 médicos + 4 médico-periodo + 4 días + 1 sink = 12
  printResult("Número de vértices = 12", g.getNumVertices() == 12);

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int maxFlow = ek.maxFlowWithResult(g, builder.getSource(), builder.getSink(),
                                     flowGraph);

  ResultadoAsignacion resultado = builder.extraerResultado(flowGraph);

  std::cout << "  Flujo máximo: " << maxFlow << "\n";
  printResult("Resultado factible (4 días)", resultado.factible);
  printResult("4 asignaciones", resultado.asignaciones.size() == 4);
}

// Test: Caso donde no es factible cubrir la demanda
void builder_test_caso_no_factible() {
  std::cout << "\n=== Test: Caso No Factible ===\n";

  GraphBuilder builder;

  builder.setMedicos({"M1"});
  builder.setDias({"D1", "D2"});
  builder.setPeriodos({{"P1", {"D1", "D2"}}});
  builder.setDisponibilidad({
      {"M1", {"D1"}} // M1 solo disponible D1
  });
  builder.setMaxGuardiasPorPeriodo(2);
  builder.setMedicosRequeridosTodosDias(1);

  Graph g = builder.build();

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  ek.maxFlowWithResult(g, builder.getSource(), builder.getSink(), flowGraph);

  ResultadoAsignacion resultado = builder.extraerResultado(flowGraph);

  std::cout << "  Días cubiertos: " << resultado.diasCubiertos << "/"
            << resultado.diasRequeridos << "\n";
  printResult("No factible", !resultado.factible);
  printResult("Solo 1 día cubierto", resultado.diasCubiertos == 1);
}

// Test: Múltiples médicos disponibles el mismo día
void builder_test_multiples_medicos_por_dia() {
  std::cout << "\n=== Test: Múltiples Médicos por Día ===\n";

  GraphBuilder builder;

  builder.setMedicos({"M1", "M2", "M3"});
  builder.setDias({"D1", "D2"});
  builder.setPeriodos({{"P1", {"D1", "D2"}}});
  builder.setDisponibilidad(
      {{"M1", {"D1", "D2"}}, {"M2", {"D1", "D2"}}, {"M3", {"D1", "D2"}}});
  builder.setMaxGuardiasPorPeriodo(2);
  builder.setMedicosPorDia({{"D1", 2}, {"D2", 2}}); // 2 médicos por día

  Graph g = builder.build();

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int maxFlow = ek.maxFlowWithResult(g, builder.getSource(), builder.getSink(),
                                     flowGraph);

  ResultadoAsignacion resultado = builder.extraerResultado(flowGraph);

  std::cout << "  Flujo máximo: " << maxFlow << "\n";
  std::cout << "  Asignaciones: " << resultado.asignaciones.size() << "\n";

  printResult("4 asignaciones (2 médicos x 2 días)", maxFlow == 4);
  printResult("Factible", resultado.factible);
}

// Test: Restricción C limita correctamente
void test_restriccion_c() {
  std::cout << "\n=== Test: Restricción C ===\n";

  GraphBuilder builder;

  builder.setMedicos({"M1"});
  builder.setDias({"D1", "D2", "D3"});
  builder.setPeriodos({{"P1", {"D1", "D2", "D3"}}});
  builder.setDisponibilidad({
      {"M1", {"D1", "D2", "D3"}} // Disponible todos los días
  });
  builder.setMaxGuardiasPorPeriodo(1); // Pero C=1 limita a 1 guardia
  builder.setMedicosRequeridosTodosDias(1);

  Graph g = builder.build();

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int maxFlow = ek.maxFlowWithResult(g, builder.getSource(), builder.getSink(),
                                     flowGraph);

  std::cout << "  Flujo máximo: " << maxFlow
            << " (esperado: 1, limitado por C)\n";
  printResult("C=1 limita a 1 guardia", maxFlow == 1);
}

// Runner para tests de GraphBuilder
void run_graph_builder_tests() {
  std::cout << "╔════════════════════════════════════════════╗\n";
  std::cout << "║       Tests Unitarios: GraphBuilder        ║\n";
  std::cout << "╚════════════════════════════════════════════╝\n";

  test_construccion_basica();
  test_resolver_con_builder();
  test_multiples_periodos();
  builder_test_caso_no_factible();
  builder_test_multiples_medicos_por_dia();
  test_restriccion_c();
}
