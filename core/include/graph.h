#ifndef GRAPH_H
#define GRAPH_H

#include <vector>

class Graph {
private:
  int numVertices;
  // Adjacency matrix for capacities
  // capacity[u][v] = capacity of edge u -> v
  std::vector<std::vector<int>> capacity;

public:
  Graph(int vertices);

  // Add edge with capacity
  void addEdge(int from, int to, int cap);

  // Getters
  int getNumVertices() const;
  int getCapacity(int from, int to) const;

  // Setters (for flow)
  void setCapacity(int from, int to, int cap);

  // Utilities
  void printGraph() const;
};

#endif
