#ifndef EDMONDS_KARP_H
#define EDMONDS_KARP_H

#include "graph.h"
#include <vector>

class EdmondsKarp {
private:
  // BFS para encontrar camino aumentante
  bool bfs(const Graph &residualGraph, int source, int sink,
           std::vector<int> &parent);

public:
  // Ejecutar algoritmo y retornar flujo máximo
  int maxFlow(Graph graph, int source, int sink);

  // Versión que también retorna el grafo con el flujo
  int maxFlowWithResult(Graph graph, int source, int sink,
                        std::vector<std::vector<int>> &flowGraph);

  // Obtener nodos alcanzables en el grafo residual (para Min-Cut)
  std::vector<int> getReachableNodes(const Graph &graph,
                                     const std::vector<std::vector<int>> &flowGraph,
                                     int source);
};

#endif
