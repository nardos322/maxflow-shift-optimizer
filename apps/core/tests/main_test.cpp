#include "all_tests.h"
#include "test_utils.h"
#include <iostream>

int main() {
  std::cout << "\n";
  std::cout << "========================================\n";
  std::cout << "       Ejecutando Test Suite Completa\n";
  std::cout << "========================================\n";

  // Reiniciar contadores antes de empezar (por seguridad)
  resetCounters();

  // Ejecutar todas las suites de tests
  run_graph_tests();
  std::cout << "\n";

  run_edmonds_karp_tests();
  std::cout << "\n";

  run_hospital_tests();
  std::cout << "\n";

  run_graph_builder_tests();
  std::cout << "\n";

  run_json_parser_tests();
  std::cout << "\n";

  run_mincut_tests();
  std::cout << "\n";

  // Mostrar resumen final
  printSummary();

  // Retornar 0 si todos pasaron, 1 si hubo fallos
  return tests_failed > 0 ? 1 : 0;
}
