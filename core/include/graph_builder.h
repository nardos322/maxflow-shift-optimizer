#ifndef GRAPH_BUILDER_H
#define GRAPH_BUILDER_H

#include "graph.h"
#include <map>
#include <string>
#include <vector>

/**
 * Structure to represent a period
 */
struct Periodo {
  std::string id;
  std::vector<std::string> dias; // IDs of the days in this period
};

/**
 * Structure for the assignment result
 */
struct Asignacion {
  std::string medico;
  std::string dia;
};

/**
 * Solver result
 */
struct Bottleneck {
  std::string tipo; // "Doctor", "Day", "Period"
  std::string id;
  std::string razon; // "Saturated" or "Not covered"
};

/**
 * Assignment Result
 */
struct ResultadoAsignacion {
  bool factible;
  int diasCubiertos;
  int diasRequeridos;
  std::vector<Asignacion> asignaciones;
  std::vector<Bottleneck> bottlenecks; // List of bottlenecks
};

/**
 * GraphBuilder: Constructs the 3-layer graph for the assignment problem
 *
 * Graph Structure:
 *   Source -> [Doctors] -> [Doctor-Period] -> [Days] -> Sink
 *
 * - Source -> Doctor: capacity = available days of the doctor
 * - Doctor -> Doctor-Period: capacity = C (max shifts per period)
 * - Doctor-Period -> Day: capacity = 1 (if available)
 * - Day -> Sink: capacity = doctors required that day
 */
class GraphBuilder {
private:
  // Input data
  std::vector<std::string> medicos_;
  std::vector<std::string> dias_;
  std::vector<Periodo> periodos_;
  std::map<std::string, std::vector<std::string>>
      disponibilidad_;                       // doctor -> [days]
  int maxGuardiasPorPeriodo_;                // max per period (1 per statement)
  int maxGuardiasTotales_;                   // C: max total days per doctor
  std::map<std::string, int> medicosPorDia_; // day -> required amount
  std::map<std::string, int> personalCapacities_; // Individual capacity (optional)

  // IDs to graph indices mapping
  int source_;
  int sink_;
  std::map<std::string, int> medicoToNode_;
  std::map<std::pair<std::string, std::string>, int>
      medicoPeriodoToNode_; // (doctor, period) -> node
  std::map<std::string, int> diaToNode_;

  // Reverse mapping (for result extraction)
  std::map<int, std::string> nodeToMedico_;
  std::map<int, std::pair<std::string, std::string>> nodeToMedicoPeriodo_;
  std::map<int, std::string> nodeToDia_;

  int numVertices_;

public:
  GraphBuilder();

  // Configuration
  void setMedicos(const std::vector<std::string> &medicos);
  void setDias(const std::vector<std::string> &dias);
  void setPeriodos(const std::vector<Periodo> &periodos);
  void setDisponibilidad(
      const std::map<std::string, std::vector<std::string>> &disponibilidad);
  void setMaxGuardiasPorPeriodo(int c);
  void setMaxGuardiasTotales(int c);
  void setMedicosPorDia(const std::map<std::string, int> &medicosPorDia);
  void setPersonalCapacities(const std::map<std::string, int> &capacities);
  void setMedicosRequeridosTodosDias(
      int cantidad); // Shortcut: same amount for everyone

  // Construction
  Graph build();

  // Result extraction
  ResultadoAsignacion
  extraerResultado(const std::vector<std::vector<int>> &flowGraph);

  // Analyze min-cut to find bottlenecks
  std::vector<Bottleneck> analyzeMinCut(const std::vector<int> &reachableNodes);

  // Useful getters
  int getSource() const { return source_; }
  int getSink() const { return sink_; }
  int getNumVertices() const { return numVertices_; }

private:
  void calcularIndices();
  bool estaDisponible(const std::string &medico, const std::string &dia) const;
  std::string getPeriodoDeDia(const std::string &dia) const;
};

#endif
