#include "edmonds_karp.h"
#include <limits>
#include <queue>

bool EdmondsKarp::bfs(const Graph &residualGraph, int source, int sink,
                      std::vector<int> &parent) {
  int n = residualGraph.getNumVertices();
  std::vector<bool> visited(n, false);

  std::queue<int> q;
  q.push(source);
  visited[source] = true;
  parent[source] = -1;

  while (!q.empty()) {
    int u = q.front();
    q.pop();

    for (int v = 0; v < n; v++) {
      // Si no ha sido visitado y hay capacidad residual
      if (!visited[v] && residualGraph.getCapacity(u, v) > 0) {
        visited[v] = true;
        parent[v] = u;
        q.push(v);

        // Si llegamos al sink, encontramos un camino
        if (v == sink) {
          return true;
        }
      }
    }
  }

  return false;
}

int EdmondsKarp::maxFlow(Graph graph, int source, int sink) {
  int n = graph.getNumVertices();

  // Crear grafo residual (copia del original)
  Graph residualGraph = graph;

  std::vector<int> parent(n);
  int maxFlowValue = 0;

  // Mientras exista un camino aumentante
  while (bfs(residualGraph, source, sink, parent)) {
    // Encontrar la capacidad mínima en el camino encontrado
    int pathFlow = std::numeric_limits<int>::max();

    for (int v = sink; v != source; v = parent[v]) {
      int u = parent[v];
      pathFlow = std::min(pathFlow, residualGraph.getCapacity(u, v));
    }

    // Actualizar capacidades residuales
    for (int v = sink; v != source; v = parent[v]) {
      int u = parent[v];

      // Reducir capacidad en dirección forward
      int currentCap = residualGraph.getCapacity(u, v);
      residualGraph.setCapacity(u, v, currentCap - pathFlow);

      // Aumentar capacidad en dirección backward
      int reverseCap = residualGraph.getCapacity(v, u);
      residualGraph.setCapacity(v, u, reverseCap + pathFlow);
    }

    // Agregar flujo del camino al flujo total
    maxFlowValue += pathFlow;
  }

  return maxFlowValue;
}

int EdmondsKarp::maxFlowWithResult(Graph graph, int source, int sink,
                                   std::vector<std::vector<int>> &flowGraph) {
  int n = graph.getNumVertices();

  // Inicializar matriz de flujo
  flowGraph.resize(n, std::vector<int>(n, 0));

  // Crear grafo residual
  Graph residualGraph = graph;

  std::vector<int> parent(n);
  int maxFlowValue = 0;

  while (bfs(residualGraph, source, sink, parent)) {
    int pathFlow = std::numeric_limits<int>::max();

    for (int v = sink; v != source; v = parent[v]) {
      int u = parent[v];
      pathFlow = std::min(pathFlow, residualGraph.getCapacity(u, v));
    }

    for (int v = sink; v != source; v = parent[v]) {
      int u = parent[v];

      // Actualizar flujo
      flowGraph[u][v] += pathFlow;
      flowGraph[v][u] -= pathFlow;

      // Actualizar capacidad residual
      int currentCap = residualGraph.getCapacity(u, v);
      residualGraph.setCapacity(u, v, currentCap - pathFlow);

      int reverseCap = residualGraph.getCapacity(v, u);
      residualGraph.setCapacity(v, u, reverseCap + pathFlow);
    }

    maxFlowValue += pathFlow;
  }

  return maxFlowValue;
}

std::vector<int> EdmondsKarp::getReachableNodes(
    const Graph &graph, const std::vector<std::vector<int>> &flowGraph,
    int source) {
  int n = graph.getNumVertices();
  std::vector<bool> visited(n, false);
  std::vector<int> reachable;
  std::queue<int> q;

  q.push(source);
  visited[source] = true;
  reachable.push_back(source);

  while (!q.empty()) {
    int u = q.front();
    q.pop();

    for (int v = 0; v < n; v++) {
      if (!visited[v]) {
        // Capacidad residual = Capacidad original - Flujo neto
        // Nota: flowGraph[u][v] puede ser negativo si el flujo va de v a u
        int residualCap = graph.getCapacity(u, v) - flowGraph[u][v];

        if (residualCap > 0) {
          visited[v] = true;
          reachable.push_back(v);
          q.push(v);
        }
      }
    }
  }

  return reachable;
}
