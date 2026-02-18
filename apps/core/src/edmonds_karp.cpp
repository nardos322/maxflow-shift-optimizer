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
      // If not visited and residual capacity exists
      if (!visited[v] && residualGraph.getCapacity(u, v) > 0) {
        visited[v] = true;
        parent[v] = u;
        q.push(v);

        // If we reach the sink, we found a path
        if (v == sink) {
          return true;
        }
      }
    }
  }

  return false;
}

int EdmondsKarp::maxFlowWithResult(Graph graph, int source, int sink,
                                   std::vector<std::vector<int>> &flowGraph) {
  int n = graph.getNumVertices();

  // Initialize flow matrix
  flowGraph.resize(n, std::vector<int>(n, 0));

  // Create residual graph
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

      // Update flow
      flowGraph[u][v] += pathFlow;
      flowGraph[v][u] -= pathFlow;

      // Update residual capacity
      int currentCap = residualGraph.getCapacity(u, v);
      residualGraph.setCapacity(u, v, currentCap - pathFlow);

      int reverseCap = residualGraph.getCapacity(v, u);
      residualGraph.setCapacity(v, u, reverseCap + pathFlow);
    }

    maxFlowValue += pathFlow;
  }

  return maxFlowValue;
}

std::vector<int>
EdmondsKarp::getReachableNodes(const Graph &graph,
                               const std::vector<std::vector<int>> &flowGraph,
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
        // Residual capacity = Original capacity - Net flow
        // Note: flowGraph[u][v] can be negative if flow goes from v to u
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
