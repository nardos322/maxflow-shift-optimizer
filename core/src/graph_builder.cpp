#include "graph_builder.h"
#include <algorithm>


GraphBuilder::GraphBuilder()
    : maxGuardiasPorPeriodo_(1), maxGuardiasTotales_(999), source_(0), sink_(0), numVertices_(0) {}

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

void GraphBuilder::setMaxGuardiasTotales(int c) {
  maxGuardiasTotales_ = c;
}

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

  // Capa 1: Médicos
  for (const auto &medico : medicos_) {
    medicoToNode_[medico] = currentNode;
    nodeToMedico_[currentNode] = medico;
    currentNode++;
  }

  // Capa 2: Médico-Periodo
  for (const auto &medico : medicos_) {
    for (const auto &periodo : periodos_) {
      auto key = std::make_pair(medico, periodo.id);
      medicoPeriodoToNode_[key] = currentNode;
      nodeToMedicoPeriodo_[currentNode] = key;
      currentNode++;
    }
  }

  // Capa 3: Días
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
  // Calcular índices de nodos
  calcularIndices();

  Graph g(numVertices_);

  // CAPA 1: Source -> Médicos
  // Capacidad = min(C, días disponibles del médico)
  // C = maxGuardiasTotales_ (límite total de guardias por médico)
  for (const auto &medico : medicos_) {
    int diasDisponibles = 0;
    auto it = disponibilidad_.find(medico);
    if (it != disponibilidad_.end()) {
      diasDisponibles = it->second.size();
    }

    // Aplicar límite C: el médico no puede trabajar más de C días en total
    // Si tiene capacidad personal definida, usar esa. Si no, usar la global C.
    int limit = maxGuardiasTotales_;
    if (personalCapacities_.count(medico)) {
      limit = personalCapacities_[medico];
    }
    int capacidad = std::min(limit, diasDisponibles);
    g.addEdge(source_, medicoToNode_[medico], capacidad);
  }

  // CAPA 2: Médicos -> Médico-Periodo
  // Capacidad = maxGuardiasPorPeriodo (máximo 1 día por período según enunciado)
  for (const auto &medico : medicos_) {
    for (const auto &periodo : periodos_) {
      auto key = std::make_pair(medico, periodo.id);
      g.addEdge(medicoToNode_[medico], medicoPeriodoToNode_[key],
                maxGuardiasPorPeriodo_);
    }
  }

  // CAPA 3: Médico-Periodo -> Días
  // Capacidad = 1 si el médico está disponible ese día
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

  // FINAL: Días -> Sink
  // Capacidad = médicos requeridos ese día
  for (const auto &dia : dias_) {
    int requeridos = 1; // Default: 1 médico por día
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

  // Calcular días requeridos
  for (const auto &dia : dias_) {
    auto it = medicosPorDia_.find(dia);
    resultado.diasRequeridos += (it != medicosPorDia_.end()) ? it->second : 1;
  }

  // Extraer asignaciones desde Médico-Periodo -> Días
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

  // 1. Días no cubiertos
  // Si un nodo DÍA no es alcanzable desde Source, significa que no llegó flujo a él.
  for (const auto &[dia, node] : diaToNode_) {
    if (!isReachable[node]) {
      bottlenecks.push_back({"Dia", dia, "No se pudo asignar médico suficiente"});
    }
  }

  // 2. Médicos Saturados Globalmente
  // Si Source (Reachable) -> Medico (Unreachable)
  // Significa que la arista Source->Medico está saturada (Capacidad Total agotada)
  for (const auto &[medico, node] : medicoToNode_) {
    if (!isReachable[node]) {
      // El nodo Médico no es alcanzable, por lo tanto la arista Source->Medico (cap=C) se llenó.
      bottlenecks.push_back(
          {"Medico", medico, "Alcanzó el límite máximo de guardias totales"});
    }
  }

  // 3. Médicos Saturados en Período
  // Si Medico (Reachable) -> MedicoPeriodo (Unreachable)
  // Significa que el médico tenía guardias totales disponibles, pero saturó el límite del período
  for (const auto &[key, node] : medicoPeriodoToNode_) {
    if (isReachable[medicoToNode_[key.first]] && !isReachable[node]) {
      bottlenecks.push_back({"MedicoEnPeriodo", key.first + " en " + key.second,
                             "Alcanzó el límite de guardias en este período"});
    }
  }

  return bottlenecks;
}
