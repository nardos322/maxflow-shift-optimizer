#ifndef JSON_PARSER_H
#define JSON_PARSER_H

#include "graph_builder.h"
#include <string>

/**
 * Estructura con todos los datos de entrada parseados
 */
struct InputData {
  std::vector<std::string> medicos;
  std::vector<std::string> dias;
  std::vector<Periodo> periodos;
  std::map<std::string, std::vector<std::string>> disponibilidad;
  int maxGuardiasPorPeriodo;
  int maxGuardiasTotales;
  std::map<std::string, int> medicosPorDia;
};

/**
 * Estructura para el JSON de salida
 */
struct OutputData {
  bool factible;
  int diasCubiertos;
  int diasRequeridos;
  std::vector<Asignacion> asignaciones;
};

/**
 * JSONParser: Parsea JSON de entrada y serializa JSON de salida
 */
class JSONParser {
public:
  /**
   * Parsea un string JSON y retorna los datos de entrada
   * @throws std::runtime_error si el JSON es inválido
   */
  static InputData parseInput(const std::string &jsonString);

  /**
   * Parsea un archivo JSON y retorna los datos de entrada
   * @throws std::runtime_error si el archivo no existe o el JSON es inválido
   */
  static InputData parseInputFromFile(const std::string &filePath);

  /**
   * Convierte el resultado a JSON string
   */
  static std::string toJson(const ResultadoAsignacion &resultado);

  /**
   * Configura el GraphBuilder con los datos parseados
   */
  static void configureBuilder(GraphBuilder &builder, const InputData &data);
};

#endif
