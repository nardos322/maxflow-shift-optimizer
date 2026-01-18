#include "edmonds_karp.h"
#include "json_parser.h"
#include "test_utils.h"

void testParseBasico() {
  std::cout << "\n=== Test: Parse Básico ===\n";

  std::string json = R"({
    "medicos": ["Ana", "Luis"],
    "dias": ["Lunes", "Martes"],
    "periodos": [{"id": "P1", "dias": ["Lunes", "Martes"]}],
    "disponibilidad": {
      "Ana": ["Lunes"],
      "Luis": ["Martes"]
    },
    "maxGuardiasPorPeriodo": 2,
    "medicosPorDia": 1
  })";

  InputData data = JSONParser::parseInput(json);

  printResult("Debe tener 2 médicos", data.medicos.size() == 2);
  printResult("Debe tener 2 días", data.dias.size() == 2);
  printResult("Debe tener 1 periodo", data.periodos.size() == 1);
  printResult("MaxGuardias debe ser 2", data.maxGuardiasPorPeriodo == 2);
  printResult("Ana disponible 1 día", data.disponibilidad["Ana"].size() == 1);
  printResult("Luis disponible 1 día", data.disponibilidad["Luis"].size() == 1);
}

void testParseFromFile() {
  std::cout << "\n=== Test: Parse From File ===\n";

  // Usamos el archivo de ejemplo
  InputData data = JSONParser::parseInputFromFile("data/ejemplo.json");

  printResult("Debe tener 4 médicos", data.medicos.size() == 4);
  printResult("Debe tener 6 días", data.dias.size() == 6);
  printResult("Debe tener 2 periodos", data.periodos.size() == 2);
}

void testConfigureBuilder() {
  std::cout << "\n=== Test: Configure Builder ===\n";

  std::string json = R"({
    "medicos": ["Ana", "Luis"],
    "dias": ["Lunes", "Martes"],
    "periodos": [{"id": "P1", "dias": ["Lunes", "Martes"]}],
    "disponibilidad": {
      "Ana": ["Lunes", "Martes"],
      "Luis": ["Lunes", "Martes"]
    },
    "maxGuardiasPorPeriodo": 2,
    "medicosPorDia": 1
  })";

  InputData data = JSONParser::parseInput(json);

  GraphBuilder builder;
  JSONParser::configureBuilder(builder, data);

  Graph g = builder.build();

  // Verificar que el grafo se construyó correctamente
  printResult("El grafo debe tener vértices", g.getNumVertices() > 0);
}

void testToJson() {
  std::cout << "\n=== Test: To JSON ===\n";

  ResultadoAsignacion resultado;
  resultado.factible = true;
  resultado.diasCubiertos = 2;
  resultado.diasRequeridos = 2;
  resultado.asignaciones = {{"Ana", "Lunes"}, {"Luis", "Martes"}};

  std::string jsonOutput = JSONParser::toJson(resultado);

  // Verificar que contiene los campos esperados
  printResult("Debe contener factible: true",
              jsonOutput.find("\"factible\": true") != std::string::npos);
  printResult("Debe contener diasCubiertos: 2",
              jsonOutput.find("\"diasCubiertos\": 2") != std::string::npos);
  printResult("Debe contener Ana",
              jsonOutput.find("\"Ana\"") != std::string::npos);
}

void testFlujoCompleto() {
  std::cout << "\n=== Test: Flujo Completo (End-to-End) ===\n";

  // Test end-to-end: JSON -> Parser -> Builder -> Graph -> EdmondsKarp ->
  // Resultado -> JSON
  std::string inputJson = R"({
    "medicos": ["Ana", "Luis", "Carlos"],
    "dias": ["Lunes", "Martes", "Miercoles"],
    "periodos": [{"id": "Semana", "dias": ["Lunes", "Martes", "Miercoles"]}],
    "disponibilidad": {
      "Ana": ["Lunes", "Martes"],
      "Luis": ["Martes", "Miercoles"],
      "Carlos": ["Lunes", "Miercoles"]
    },
    "maxGuardiasPorPeriodo": 2,
    "medicosPorDia": 1
  })";

  // Parsear
  InputData data = JSONParser::parseInput(inputJson);

  // Configurar builder
  GraphBuilder builder;
  JSONParser::configureBuilder(builder, data);

  // Construir grafo
  Graph g = builder.build();

  // Ejecutar Edmonds-Karp
  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int maxFlow = ek.maxFlowWithResult(g, builder.getSource(), builder.getSink(),
                                     flowGraph);

  // Extraer resultado
  ResultadoAsignacion resultado = builder.extraerResultado(flowGraph);

  // Verificar
  printResult("Flujo máximo debe ser 3", maxFlow == 3);
  printResult("Debe ser factible", resultado.factible);
  printResult("Debe haber 3 asignaciones", resultado.asignaciones.size() == 3);

  // Convertir a JSON
  std::string outputJson = JSONParser::toJson(resultado);
  printResult("Output JSON debe indicar factible",
              outputJson.find("\"factible\": true") != std::string::npos);

  std::cout << "\nResultado JSON:\n" << outputJson << "\n";
}

int main() {
  std::cout << "═══════════════════════════════════════\n";
  std::cout << "       Tests JSON Parser\n";
  std::cout << "═══════════════════════════════════════\n";

  resetCounters();

  testParseBasico();
  testParseFromFile();
  testConfigureBuilder();
  testToJson();
  testFlujoCompleto();

  printSummary();
  return tests_failed > 0 ? 1 : 0;
}
