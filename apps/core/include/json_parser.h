#ifndef JSON_PARSER_H
#define JSON_PARSER_H

#include "graph_builder.h"
#include <string>

/**
 * Structure with all parsed input data
 */
struct InputData {
  std::vector<std::string> medicos;
  std::vector<std::string> dias;
  std::vector<Periodo> periodos;
  std::map<std::string, std::vector<std::string>> disponibilidad;
  int maxGuardiasPorPeriodo;
  int maxGuardiasTotales;
  std::map<std::string, int> medicosPorDia;
  std::map<std::string, int> personalCapacities;
};

/**
 * Structure for output JSON
 */
struct OutputData {
  bool factible;
  int diasCubiertos;
  int diasRequeridos;
  std::vector<Asignacion> asignaciones;
};

/**
 * JSONParser: Parses input JSON and serializes output JSON
 */
class JSONParser {
public:
  /**
   * Parses a JSON string and returns input data
   * @throws std::runtime_error if JSON is invalid
   */
  static InputData parseInput(const std::string &jsonString);

  /**
   * Parses a JSON file and returns input data
   * @throws std::runtime_error if file does not exist or JSON is invalid
   */
  static InputData parseInputFromFile(const std::string &filePath);

  /**
   * Converts result to JSON string
   */
  static std::string toJson(const ResultadoAsignacion &resultado);

  /**
   * Configures GraphBuilder with parsed data
   */
  static void configureBuilder(GraphBuilder &builder, const InputData &data);
};

#endif
