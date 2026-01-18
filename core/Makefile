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
TARGET = $(BUILD_DIR)/turnos
SOURCES = $(SRC_DIR)/main.cpp $(SRC_DIR)/graph.cpp $(SRC_DIR)/edmonds_karp.cpp $(SRC_DIR)/graph_builder.cpp $(SRC_DIR)/json_parser.cpp
OBJECTS = $(BUILD_DIR)/main.o $(BUILD_DIR)/graph.o $(BUILD_DIR)/edmonds_karp.o $(BUILD_DIR)/graph_builder.o $(BUILD_DIR)/json_parser.o

# Archivos tests
TEST_GRAPH_TARGET = $(BUILD_DIR)/test_graph
TEST_EK_TARGET = $(BUILD_DIR)/test_edmonds_karp
TEST_HOSPITAL_TARGET = $(BUILD_DIR)/test_hospital
TEST_BUILDER_TARGET = $(BUILD_DIR)/test_graph_builder
TEST_JSON_TARGET = $(BUILD_DIR)/test_json_parser

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
$(TEST_GRAPH_TARGET): $(BUILD_DIR)/test_graph.o $(BUILD_DIR)/graph.o
	$(CXX) $(CXXFLAGS) -o $@ $^

$(TEST_EK_TARGET): $(BUILD_DIR)/test_edmonds_karp.o $(BUILD_DIR)/graph.o $(BUILD_DIR)/edmonds_karp.o
	$(CXX) $(CXXFLAGS) -o $@ $^

$(TEST_HOSPITAL_TARGET): $(BUILD_DIR)/test_hospital.o $(BUILD_DIR)/graph.o $(BUILD_DIR)/edmonds_karp.o
	$(CXX) $(CXXFLAGS) -o $@ $^

$(TEST_BUILDER_TARGET): $(BUILD_DIR)/test_graph_builder.o $(BUILD_DIR)/graph.o $(BUILD_DIR)/edmonds_karp.o $(BUILD_DIR)/graph_builder.o
	$(CXX) $(CXXFLAGS) -o $@ $^

$(TEST_JSON_TARGET): $(BUILD_DIR)/test_json_parser.o $(BUILD_DIR)/graph.o $(BUILD_DIR)/edmonds_karp.o $(BUILD_DIR)/graph_builder.o $(BUILD_DIR)/json_parser.o
	$(CXX) $(CXXFLAGS) -o $@ $^

# Compilar archivos de tests/
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

# Limpiar
clean:
	rm -rf $(BUILD_DIR)

# Ejecutar programa principal
run: $(TARGET)
	./$(TARGET)

# Ejecutar todos los tests
test: $(BUILD_DIR) $(TEST_GRAPH_TARGET) $(TEST_EK_TARGET) $(TEST_HOSPITAL_TARGET) $(TEST_BUILDER_TARGET) $(TEST_JSON_TARGET)
	@echo ""
	@echo "========================================"
	@echo "       Ejecutando todos los tests"
	@echo "========================================"
	@echo ""
	@./$(TEST_GRAPH_TARGET)
	@echo ""
	@./$(TEST_EK_TARGET)
	@echo ""
	@./$(TEST_HOSPITAL_TARGET)
	@echo ""
	@./$(TEST_BUILDER_TARGET)
	@echo ""
	@./$(TEST_JSON_TARGET)

# Tests individuales
test-graph: $(BUILD_DIR) $(TEST_GRAPH_TARGET)
	./$(TEST_GRAPH_TARGET)

test-ek: $(BUILD_DIR) $(TEST_EK_TARGET)
	./$(TEST_EK_TARGET)

test-hospital: $(BUILD_DIR) $(TEST_HOSPITAL_TARGET)
	./$(TEST_HOSPITAL_TARGET)

test-builder: $(BUILD_DIR) $(TEST_BUILDER_TARGET)
	./$(TEST_BUILDER_TARGET)

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
