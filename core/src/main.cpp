#include "edmonds_karp.h"
#include "graph.h"
#include "graph_builder.h"
#include "json_parser.h"
#include <iostream>
#include <sstream>

int main(int argc, char *argv[]) {
  std::string jsonInput;

  // Leer JSON de stdin o archivo
  if (argc > 1) {
    // Si se pasa un archivo como argumento
    try {
      InputData data = JSONParser::parseInputFromFile(argv[1]);
      GraphBuilder builder;
      JSONParser::configureBuilder(builder, data);
      Graph g = builder.build();

      EdmondsKarp ek;
      std::vector<std::vector<int>> flowGraph;
      ek.maxFlowWithResult(g, builder.getSource(), builder.getSink(),
                           flowGraph);

      ResultadoAsignacion resultado = builder.extraerResultado(flowGraph);

      if (!resultado.factible) {
        // Calcular Min-Cut para identificar cuellos de botella
        std::vector<int> reachable =
            ek.getReachableNodes(g, flowGraph, builder.getSource());
        resultado.bottlenecks = builder.analyzeMinCut(reachable);
      }

      std::cout << JSONParser::toJson(resultado) << std::endl;
      return 0;
    } catch (const std::exception &e) {
      std::cerr << R"({"error": ")" << e.what() << R"("})" << std::endl;
      return 1;
    }
  }

  // Leer de stdin
  std::stringstream buffer;
  buffer << std::cin.rdbuf();
  jsonInput = buffer.str();

  if (jsonInput.empty()) {
    std::cerr << R"({"error": "No se recibió entrada JSON"})" << std::endl;
    return 1;
  }

  try {
    // Parsear JSON
    InputData data = JSONParser::parseInput(jsonInput);

    // Configurar y construir grafo
    GraphBuilder builder;
    JSONParser::configureBuilder(builder, data);
    Graph g = builder.build();

    // Ejecutar Edmonds-Karp
    EdmondsKarp ek;
    std::vector<std::vector<int>> flowGraph;
    ek.maxFlowWithResult(g, builder.getSource(), builder.getSink(), flowGraph);

    // Extraer y devolver resultado
    // Extraer y devolver resultado
    ResultadoAsignacion resultado = builder.extraerResultado(flowGraph);

    if (!resultado.factible) {
      // Calcular Min-Cut para identificar cuellos de botella
      std::vector<int> reachable =
          ek.getReachableNodes(g, flowGraph, builder.getSource());
      resultado.bottlenecks = builder.analyzeMinCut(reachable);
    }

    std::cout << JSONParser::toJson(resultado) << std::endl;

    return 0;
  } catch (const std::exception &e) {
    std::cerr << R"({"error": ")" << e.what() << R"("})" << std::endl;
    return 1;
  }
}
