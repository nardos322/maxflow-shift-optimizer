#ifndef TEST_UTILS_H
#define TEST_UTILS_H

#include <iostream>
#include <string>

// Contadores globales de tests
inline int tests_passed = 0;
inline int tests_failed = 0;

// ANSI Color Codes
inline const std::string GREEN = "\033[1;32m";
inline const std::string RED = "\033[1;31m";
inline const std::string RESET = "\033[0m";

inline void printResult(const std::string &testName, bool passed) {
  if (passed) {
    std::cout << GREEN << "[PASS] " << RESET << testName << "\n";
    tests_passed++;
  } else {
    std::cout << RED << "[FAIL] " << RESET << testName << "\n";
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
