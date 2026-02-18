#include "graph_builder.h"
#include <algorithm>

GraphBuilder::GraphBuilder()
    : maxGuardiasPorPeriodo_(1), maxGuardiasTotales_(999), source_(0), sink_(0),
      numVertices_(0) {}

void GraphBuilder::setMedicos(const std::vector<std::string> &medicos) {
  medicos_ = medicos;
}

void GraphBuilder::setDias(const std::vector<std::string> &dias) {
  dias_ = dias;
}

void GraphBuilder::setPeriodos(const std::vector<Periodo> &periodos) {
  periodos_ = periodos;
}

void GraphBuilder::setDisponibilidad(
    const std::map<std::string, std::vector<std::string>> &disponibilidad) {
  disponibilidad_ = disponibilidad;
}

void GraphBuilder::setMaxGuardiasPorPeriodo(int c) {
  maxGuardiasPorPeriodo_ = c;
}

void GraphBuilder::setMaxGuardiasTotales(int c) { maxGuardiasTotales_ = c; }

void GraphBuilder::setMedicosPorDia(
    const std::map<std::string, int> &medicosPorDia) {
  medicosPorDia_ = medicosPorDia;
}

void GraphBuilder::setPersonalCapacities(
    const std::map<std::string, int> &capacities) {
  personalCapacities_ = capacities;
}

void GraphBuilder::setMedicosRequeridosTodosDias(int cantidad) {
  for (const auto &dia : dias_) {
    medicosPorDia_[dia] = cantidad;
  }
}

void GraphBuilder::calcularIndices() {
  int currentNode = 0;

  // Source
  source_ = currentNode++;

  // Layer 1: Doctors
  for (const auto &medico : medicos_) {
    medicoToNode_[medico] = currentNode;
    nodeToMedico_[currentNode] = medico;
    currentNode++;
  }

  // Layer 2: Doctor-Period
  for (const auto &medico : medicos_) {
    for (const auto &periodo : periodos_) {
      auto key = std::make_pair(medico, periodo.id);
      medicoPeriodoToNode_[key] = currentNode;
      nodeToMedicoPeriodo_[currentNode] = key;
      currentNode++;
    }
  }

  // Layer 3: Days
  for (const auto &dia : dias_) {
    diaToNode_[dia] = currentNode;
    nodeToDia_[currentNode] = dia;
    currentNode++;
  }

  // Sink
  sink_ = currentNode++;

  numVertices_ = currentNode;
}

bool GraphBuilder::estaDisponible(const std::string &medico,
                                  const std::string &dia) const {
  auto it = disponibilidad_.find(medico);
  if (it == disponibilidad_.end()) {
    return false;
  }
  const auto &diasDisponibles = it->second;
  return std::find(diasDisponibles.begin(), diasDisponibles.end(), dia) !=
         diasDisponibles.end();
}

std::string GraphBuilder::getPeriodoDeDia(const std::string &dia) const {
  for (const auto &periodo : periodos_) {
    if (std::find(periodo.dias.begin(), periodo.dias.end(), dia) !=
        periodo.dias.end()) {
      return periodo.id;
    }
  }
  return "";
}

Graph GraphBuilder::build() {
  // Calculate node indices
  calcularIndices();

  Graph g(numVertices_);

  // LAYER 1: Source -> Doctors
  // Capacity = min(C, available days of doctor)
  // C = maxGuardiasTotales_ (total shift limit per doctor)
  for (const auto &medico : medicos_) {
    int diasDisponibles = 0;
    auto it = disponibilidad_.find(medico);
    if (it != disponibilidad_.end()) {
      diasDisponibles = it->second.size();
    }

    // Apply limit C: the doctor cannot work more than C days in total
    // If personal capacity is defined, use it. Otherwise, use global C.
    int limit = maxGuardiasTotales_;
    if (personalCapacities_.count(medico)) {
      limit = personalCapacities_[medico];
    }
    int capacidad = std::min(limit, diasDisponibles);
    g.addEdge(source_, medicoToNode_[medico], capacidad);
  }

  // LAYER 2: Doctors -> Doctor-Period
  // Capacity = maxGuardiasPorPeriodo (max 1 day per period per specs)
  for (const auto &medico : medicos_) {
    for (const auto &periodo : periodos_) {
      auto key = std::make_pair(medico, periodo.id);
      g.addEdge(medicoToNode_[medico], medicoPeriodoToNode_[key],
                maxGuardiasPorPeriodo_);
    }
  }

  // LAYER 3: Doctor-Period -> Days
  // Capacity = 1 if the doctor is available that day
  for (const auto &medico : medicos_) {
    for (const auto &periodo : periodos_) {
      auto mpKey = std::make_pair(medico, periodo.id);
      int mpNode = medicoPeriodoToNode_[mpKey];

      for (const auto &dia : periodo.dias) {
        if (estaDisponible(medico, dia)) {
          g.addEdge(mpNode, diaToNode_[dia], 1);
        }
      }
    }
  }

  // FINAL: Days -> Sink
  // Capacity = doctors required that day
  for (const auto &dia : dias_) {
    int requeridos = 1; // Default: 1 doctor per day
    auto it = medicosPorDia_.find(dia);
    if (it != medicosPorDia_.end()) {
      requeridos = it->second;
    }
    g.addEdge(diaToNode_[dia], sink_, requeridos);
  }

  return g;
}

ResultadoAsignacion
GraphBuilder::extraerResultado(const std::vector<std::vector<int>> &flowGraph) {
  ResultadoAsignacion resultado;
  resultado.factible = false;
  resultado.diasCubiertos = 0;
  resultado.diasRequeridos = 0;

  // Calculate required days
  for (const auto &dia : dias_) {
    auto it = medicosPorDia_.find(dia);
    resultado.diasRequeridos += (it != medicosPorDia_.end()) ? it->second : 1;
  }

  // Extract assignments from Doctor-Period -> Days
  for (const auto &[mpNode, mpPair] : nodeToMedicoPeriodo_) {
    const std::string &medico = mpPair.first;

    for (const auto &[dia, diaNode] : diaToNode_) {
      if (flowGraph[mpNode][diaNode] > 0) {
        Asignacion asig;
        asig.medico = medico;
        asig.dia = dia;
        resultado.asignaciones.push_back(asig);
        resultado.diasCubiertos++;
      }
    }
  }

  resultado.factible = (resultado.diasCubiertos == resultado.diasRequeridos);

  return resultado;
}

std::vector<Bottleneck>
GraphBuilder::analyzeMinCut(const std::vector<int> &reachableNodes) {
  std::vector<Bottleneck> bottlenecks;
  std::vector<bool> isReachable(numVertices_, false);
  for (int node : reachableNodes) {
    isReachable[node] = true;
  }

  // 1. Uncovered Days
  // If a DAY node is not reachable from Source, it means flow didn't reach it.
  for (const auto &[dia, node] : diaToNode_) {
    if (!isReachable[node]) {
      bottlenecks.push_back({"Day", dia, "Could not assign enough doctors"});
    }
  }

  // 2. Globally Saturated Doctors
  // If Source (Reachable) -> Doctor (Unreachable)
  // Means the Source->Doctor edge is saturated (Total Capacity exhausted)
  for (const auto &[medico, node] : medicoToNode_) {
    if (!isReachable[node]) {
      // The Doctor node is unreachable, so the Source->Doctor edge (cap=C) is
      // full.
      bottlenecks.push_back(
          {"Doctor", medico, "Reached maximum total shifts limit"});
    }
  }

  // 3. Period Saturated Doctors
  // If Doctor (Reachable) -> DoctorPeriod (Unreachable)
  // Means the doctor had total shifts available, but saturated the period limit
  for (const auto &[key, node] : medicoPeriodoToNode_) {
    if (isReachable[medicoToNode_[key.first]] && !isReachable[node]) {
      bottlenecks.push_back({"DoctorInPeriod", key.first + " in " + key.second,
                             "Reached shift limit in this period"});
    }
  }

  return bottlenecks;
}
