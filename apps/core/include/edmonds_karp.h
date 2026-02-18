#ifndef EDMONDS_KARP_H
#define EDMONDS_KARP_H

#include "graph.h"
#include <vector>

class EdmondsKarp {
private:
  // BFS to find augmenting path
  bool bfs(const Graph &residualGraph, int source, int sink,
           std::vector<int> &parent);

public:
  // Version that also returns the graph with flow
  int maxFlowWithResult(Graph graph, int source, int sink,
                        std::vector<std::vector<int>> &flowGraph);

  // Get reachable nodes in residual graph (for Min-Cut)
  std::vector<int>
  getReachableNodes(const Graph &graph,
                    const std::vector<std::vector<int>> &flowGraph, int source);
};

#endif
