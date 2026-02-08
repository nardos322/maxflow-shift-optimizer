CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2

# Directorios
BUILD_DIR = build
SRC_DIR = src
INCLUDE_DIR = include
TEST_DIR = tests

# Flags de include
INCLUDES = -I$(INCLUDE_DIR) -I$(TEST_DIR)

# Archivos programa principal
TARGET = $(BUILD_DIR)/solver
SOURCES = $(SRC_DIR)/main.cpp $(SRC_DIR)/graph.cpp $(SRC_DIR)/edmonds_karp.cpp $(SRC_DIR)/graph_builder.cpp $(SRC_DIR)/json_parser.cpp
OBJECTS = $(BUILD_DIR)/main.o $(BUILD_DIR)/graph.o $(BUILD_DIR)/edmonds_karp.o $(BUILD_DIR)/graph_builder.o $(BUILD_DIR)/json_parser.o

# Archivos tests
# Test unificado
TEST_SUITE_TARGET = $(BUILD_DIR)/test_suite

# Regla principal
all: $(BUILD_DIR) $(TARGET)

# Crear directorio build si no existe
$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

# Enlazar ejecutable principal
$(TARGET): $(OBJECTS)
	$(CXX) $(CXXFLAGS) -o $(TARGET) $(OBJECTS)

# Compilar archivos de src/
$(BUILD_DIR)/main.o: $(SRC_DIR)/main.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

$(BUILD_DIR)/graph.o: $(SRC_DIR)/graph.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

$(BUILD_DIR)/edmonds_karp.o: $(SRC_DIR)/edmonds_karp.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

$(BUILD_DIR)/graph_builder.o: $(SRC_DIR)/graph_builder.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

$(BUILD_DIR)/json_parser.o: $(SRC_DIR)/json_parser.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

# Tests individuales
# Compilar Test Suite Unificada
$(TEST_SUITE_TARGET): $(BUILD_DIR)/main_test.o $(BUILD_DIR)/test_graph.o $(BUILD_DIR)/test_edmonds_karp.o $(BUILD_DIR)/test_hospital.o $(BUILD_DIR)/test_graph_builder.o $(BUILD_DIR)/test_json_parser.o $(BUILD_DIR)/test_mincut.o $(BUILD_DIR)/graph.o $(BUILD_DIR)/edmonds_karp.o $(BUILD_DIR)/graph_builder.o $(BUILD_DIR)/json_parser.o
	$(CXX) $(CXXFLAGS) -o $@ $^

# Compilar archivos de tests/
$(BUILD_DIR)/main_test.o: $(TEST_DIR)/main_test.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

$(BUILD_DIR)/test_graph.o: $(TEST_DIR)/test_graph.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

$(BUILD_DIR)/test_edmonds_karp.o: $(TEST_DIR)/test_edmonds_karp.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

$(BUILD_DIR)/test_hospital.o: $(TEST_DIR)/test_hospital.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

$(BUILD_DIR)/test_graph_builder.o: $(TEST_DIR)/test_graph_builder.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

$(BUILD_DIR)/test_json_parser.o: $(TEST_DIR)/test_json_parser.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

$(BUILD_DIR)/test_mincut.o: $(TEST_DIR)/test_mincut.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

# Limpiar
clean:
	rm -rf $(BUILD_DIR)

# Ejecutar programa principal
run: $(TARGET)
	./$(TARGET)

# Ejecutar todos los tests (usando la suite unificada)
test: $(BUILD_DIR) $(TEST_SUITE_TARGET)
	@echo ""
	@./$(TEST_SUITE_TARGET)

# Tests individuales


# Para debugging: mostrar variables
debug-makefile:
	@echo "SOURCES: $(SOURCES)"
	@echo "OBJECTS: $(OBJECTS)"
	@echo "TARGET: $(TARGET)"

# Generar compile_commands.json para clangd
compile_commands:
	@echo '[' > compile_commands.json
	@echo '  {"directory": "$(CURDIR)", "command": "$(CXX) $(CXXFLAGS) $(INCLUDES) -c $(SRC_DIR)/main.cpp", "file": "$(SRC_DIR)/main.cpp"},' >> compile_commands.json
	@echo '  {"directory": "$(CURDIR)", "command": "$(CXX) $(CXXFLAGS) $(INCLUDES) -c $(SRC_DIR)/graph.cpp", "file": "$(SRC_DIR)/graph.cpp"},' >> compile_commands.json
	@echo '  {"directory": "$(CURDIR)", "command": "$(CXX) $(CXXFLAGS) $(INCLUDES) -c $(SRC_DIR)/edmonds_karp.cpp", "file": "$(SRC_DIR)/edmonds_karp.cpp"},' >> compile_commands.json
	@echo '  {"directory": "$(CURDIR)", "command": "$(CXX) $(CXXFLAGS) $(INCLUDES) -c $(SRC_DIR)/graph_builder.cpp", "file": "$(SRC_DIR)/graph_builder.cpp"},' >> compile_commands.json
	@echo '  {"directory": "$(CURDIR)", "command": "$(CXX) $(CXXFLAGS) $(INCLUDES) -c $(TEST_DIR)/test_graph.cpp", "file": "$(TEST_DIR)/test_graph.cpp"},' >> compile_commands.json
	@echo '  {"directory": "$(CURDIR)", "command": "$(CXX) $(CXXFLAGS) $(INCLUDES) -c $(TEST_DIR)/test_edmonds_karp.cpp", "file": "$(TEST_DIR)/test_edmonds_karp.cpp"},' >> compile_commands.json
	@echo '  {"directory": "$(CURDIR)", "command": "$(CXX) $(CXXFLAGS) $(INCLUDES) -c $(TEST_DIR)/test_hospital.cpp", "file": "$(TEST_DIR)/test_hospital.cpp"},' >> compile_commands.json
	@echo '  {"directory": "$(CURDIR)", "command": "$(CXX) $(CXXFLAGS) $(INCLUDES) -c $(TEST_DIR)/test_graph_builder.cpp", "file": "$(TEST_DIR)/test_graph_builder.cpp"}' >> compile_commands.json
	@echo ']' >> compile_commands.json
	@echo "✓ compile_commands.json generado"

.PHONY: all clean run test test-graph test-ek test-hospital test-builder debug-makefile compile_commands
