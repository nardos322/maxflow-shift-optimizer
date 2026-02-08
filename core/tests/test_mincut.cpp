#include "../include/edmonds_karp.h"
#include "../include/graph.h"
#include "test_utils.h"
#include <iostream>
#include <vector>

void testSimpleBottleneck() {
  std::cout << "\n=== Test: Simple Bottleneck ===\n";

  // Grafo simple: Source -> Node1 -> Sink
  // Cap(Source->Node1) = 10
  // Cap(Node1->Sink) = 5
  // Max Flow = 5. Bottleneck es Node1->Sink.
  // Residual:
  // Source->Node1: 10 - 5 = 5 (Reachable)
  // Node1->Sink: 5 - 5 = 0 (Saturated / Not Reachable via forward edge)
  // So Reachable nodes: {Source, Node1}. Sink is not reachable.

  Graph g(3);
  int source = 0;
  int node1 = 1;
  int sink = 2;

  g.addEdge(source, node1, 10);
  g.addEdge(node1, sink, 5);

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int maxFlow = ek.maxFlowWithResult(g, source, sink, flowGraph);

  printResult("Max Flow correcto (5)", maxFlow == 5);

  std::vector<int> reachable = ek.getReachableNodes(g, flowGraph, source);

  // Check reachability
  bool sourceReachable = false;
  bool node1Reachable = false;
  bool sinkReachable = false;

  for (int u : reachable) {
    if (u == source)
      sourceReachable = true;
    if (u == node1)
      node1Reachable = true;
    if (u == sink)
      sinkReachable = true;
  }

  printResult("Source Reachable", sourceReachable == true);
  printResult("Node1 Reachable", node1Reachable == true);
  printResult("Sink Unreachable (Cut Found)", sinkReachable == false);
}

void testSourceBottleneck() {
  std::cout << "\n=== Test: Source Bottleneck ===\n";
  // Grafo: Source -> Node1 -> Sink
  // Cap(Source->Node1) = 2
  // Cap(Node1->Sink) = 10
  // Max Flow = 2. Bottleneck es Source->Node1.
  // Reachable: {Source}. Node1 is not reachable.

  Graph g(3);
  int source = 0;
  int node1 = 1;
  int sink = 2;

  g.addEdge(source, node1, 2);
  g.addEdge(node1, sink, 10);

  EdmondsKarp ek;
  std::vector<std::vector<int>> flowGraph;
  int maxFlow = ek.maxFlowWithResult(g, source, sink, flowGraph);

  printResult("Max Flow correcto (2)", maxFlow == 2);

  std::vector<int> reachable = ek.getReachableNodes(g, flowGraph, source);

  bool sourceReachable = false;
  bool node1Reachable = false;

  for (int u : reachable) {
    if (u == source)
      sourceReachable = true;
    if (u == node1)
      node1Reachable = true;
  }

  printResult("Source Reachable", sourceReachable == true);
  printResult("Node1 Unreachable (Cut Found)", node1Reachable == false);
}

// Runner para tests de Min-Cut
void run_mincut_tests() {
  std::cout << "╔════════════════════════════════════════════╗\n";
  std::cout << "║       Tests Unitarios: Min-Cut             ║\n";
  std::cout << "╚════════════════════════════════════════════╝\n";

  testSimpleBottleneck();
  testSourceBottleneck();
}
