#include "graph.h"
#include <iomanip>
#include <iostream>

Graph::Graph(int vertices) : numVertices(vertices) {
  // Initialize capacity matrix with zeros
  capacity.resize(vertices, std::vector<int>(vertices, 0));
}

void Graph::addEdge(int from, int to, int cap) {
  if (from >= 0 && from < numVertices && to >= 0 && to < numVertices) {
    capacity[from][to] = cap;
  }
}

int Graph::getNumVertices() const { return numVertices; }

int Graph::getCapacity(int from, int to) const {
  if (from >= 0 && from < numVertices && to >= 0 && to < numVertices) {
    return capacity[from][to];
  }
  return 0;
}

void Graph::setCapacity(int from, int to, int cap) {
  if (from >= 0 && from < numVertices && to >= 0 && to < numVertices) {
    capacity[from][to] = cap;
  }
}

void Graph::printGraph() const {
  std::cout << "Graph (Capacity Matrix):\n";
  std::cout << "    ";
  for (int i = 0; i < numVertices; i++) {
    std::cout << std::setw(4) << i;
  }
  std::cout << "\n";

  for (int i = 0; i < numVertices; i++) {
    std::cout << std::setw(4) << i;
    for (int j = 0; j < numVertices; j++) {
      std::cout << std::setw(4) << capacity[i][j];
    }
    std::cout << "\n";
  }
}
