#ifndef TEST_UTILS_H
#define TEST_UTILS_H

#include <iostream>
#include <string>

// Contadores globales de tests
inline int tests_passed = 0;
inline int tests_failed = 0;

inline void printResult(const std::string &testName, bool passed) {
  if (passed) {
    std::cout << "[PASS] " << testName << "\n";
    tests_passed++;
  } else {
    std::cout << "[FAIL] " << testName << "\n";
    tests_failed++;
  }
}

inline void resetCounters() {
  tests_passed = 0;
  tests_failed = 0;
}

inline void printSummary() {
  std::cout << "\n════════════════════════════════════════════\n";
  std::cout << "Resultados: " << tests_passed << " passed, " << tests_failed
            << " failed\n";
  std::cout << "════════════════════════════════════════════\n";
}

#endif
