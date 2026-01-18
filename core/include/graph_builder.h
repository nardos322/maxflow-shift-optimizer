#ifndef GRAPH_BUILDER_H
#define GRAPH_BUILDER_H

#include "graph.h"
#include <map>
#include <string>
#include <vector>

/**
 * Estructura para representar un periodo
 */
struct Periodo {
  std::string id;
  std::vector<std::string> dias; // IDs de los días en este periodo
};

/**
 * Estructura para el resultado de la asignación
 */
struct Asignacion {
  std::string medico;
  std::string dia;
};

/**
 * Resultado del solver
 */
struct ResultadoAsignacion {
  bool factible;
  int diasCubiertos;
  int diasRequeridos;
  std::vector<Asignacion> asignaciones;
};

/**
 * GraphBuilder: Construye el grafo de 3 capas para el problema de asignación
 *
 * Estructura del grafo:
 *   Source -> [Médicos] -> [Médico-Periodo] -> [Días] -> Sink
 *
 * - Source -> Médico: capacidad = días disponibles del médico
 * - Médico -> Médico-Periodo: capacidad = C (máx guardias por periodo)
 * - Médico-Periodo -> Día: capacidad = 1 (si está disponible)
 * - Día -> Sink: capacidad = médicos requeridos ese día
 */
class GraphBuilder {
private:
  // Datos de entrada
  std::vector<std::string> medicos_;
  std::vector<std::string> dias_;
  std::vector<Periodo> periodos_;
  std::map<std::string, std::vector<std::string>>
      disponibilidad_;                       // medico -> [dias]
  int maxGuardiasPorPeriodo_;                // máx por período (1 según enunciado)
  int maxGuardiasTotales_;                   // C: máx días totales por médico
  std::map<std::string, int> medicosPorDia_; // dia -> cantidad requerida

  // Mapeo de IDs a índices del grafo
  int source_;
  int sink_;
  std::map<std::string, int> medicoToNode_;
  std::map<std::pair<std::string, std::string>, int>
      medicoPeriodoToNode_; // (medico, periodo) -> node
  std::map<std::string, int> diaToNode_;

  // Mapeo inverso (para extraer resultados)
  std::map<int, std::string> nodeToMedico_;
  std::map<int, std::pair<std::string, std::string>> nodeToMedicoPeriodo_;
  std::map<int, std::string> nodeToDia_;

  int numVertices_;

public:
  GraphBuilder();

  // Configuración
  void setMedicos(const std::vector<std::string> &medicos);
  void setDias(const std::vector<std::string> &dias);
  void setPeriodos(const std::vector<Periodo> &periodos);
  void setDisponibilidad(
      const std::map<std::string, std::vector<std::string>> &disponibilidad);
  void setMaxGuardiasPorPeriodo(int c);
  void setMaxGuardiasTotales(int c);
  void setMedicosPorDia(const std::map<std::string, int> &medicosPorDia);
  void setMedicosRequeridosTodosDias(
      int cantidad); // Shortcut: misma cantidad para todos

  // Construcción
  Graph build();

  // Extracción de resultados
  ResultadoAsignacion
  extraerResultado(const std::vector<std::vector<int>> &flowGraph);

  // Getters útiles
  int getSource() const { return source_; }
  int getSink() const { return sink_; }
  int getNumVertices() const { return numVertices_; }

private:
  void calcularIndices();
  bool estaDisponible(const std::string &medico, const std::string &dia) const;
  std::string getPeriodoDeDia(const std::string &dia) const;
};

#endif
