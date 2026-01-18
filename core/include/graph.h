#ifndef GRAPH_H
#define GRAPH_H

#include <vector>

class Graph {
private:
  int numVertices;
  // Matriz de adyacencia para capacidades
  // capacity[u][v] = capacidad de la arista u -> v
  std::vector<std::vector<int>> capacity;

public:
  Graph(int vertices);

  // Agregar arista con capacidad
  void addEdge(int from, int to, int cap);

  // Getters
  int getNumVertices() const;
  int getCapacity(int from, int to) const;

  // Setters (para el flujo)
  void setCapacity(int from, int to, int cap);

  // Utilidades
  void printGraph() const;
};

#endif
