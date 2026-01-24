#include "json_parser.h"
#include "external/json.hpp"
#include <fstream>
#include <stdexcept>

using json = nlohmann::json;

InputData JSONParser::parseInput(const std::string &jsonString) {
  InputData data;

  try {
    json j = json::parse(jsonString);

    // Parsear médicos
    if (j.contains("medicos") && j["medicos"].is_array()) {
      for (const auto &medico : j["medicos"]) {
        data.medicos.push_back(medico.get<std::string>());
      }
    }

    // Parsear días
    if (j.contains("dias") && j["dias"].is_array()) {
      for (const auto &dia : j["dias"]) {
        data.dias.push_back(dia.get<std::string>());
      }
    }

    // Parsear periodos
    if (j.contains("periodos") && j["periodos"].is_array()) {
      for (const auto &p : j["periodos"]) {
        Periodo periodo;
        periodo.id = p["id"].get<std::string>();
        if (p.contains("dias") && p["dias"].is_array()) {
          for (const auto &dia : p["dias"]) {
            periodo.dias.push_back(dia.get<std::string>());
          }
        }
        data.periodos.push_back(periodo);
      }
    }

    // Parsear disponibilidad
    if (j.contains("disponibilidad") && j["disponibilidad"].is_object()) {
      for (auto &[medico, dias] : j["disponibilidad"].items()) {
        std::vector<std::string> diasDisponibles;
        for (const auto &dia : dias) {
          diasDisponibles.push_back(dia.get<std::string>());
        }
        data.disponibilidad[medico] = diasDisponibles;
      }
    }

    // Parsear maxGuardiasPorPeriodo (máximo días por período, default 1)
    if (j.contains("maxGuardiasPorPeriodo")) {
      data.maxGuardiasPorPeriodo = j["maxGuardiasPorPeriodo"].get<int>();
    } else {
      data.maxGuardiasPorPeriodo = 1; // Default según enunciado
    }

    // Parsear maxGuardiasTotales (C: máximo días totales por médico)
    if (j.contains("maxGuardiasTotales")) {
      data.maxGuardiasTotales = j["maxGuardiasTotales"].get<int>();
    } else {
      data.maxGuardiasTotales = 999; // Sin límite por default
    }

    // Parsear medicosPorDia
    if (j.contains("medicosPorDia")) {
      if (j["medicosPorDia"].is_number()) {
        // Un solo valor para todos los días
        int cantidad = j["medicosPorDia"].get<int>();
        for (const auto &dia : data.dias) {
          data.medicosPorDia[dia] = cantidad;
        }
      } else if (j["medicosPorDia"].is_object()) {
        // Valor específico por día
        for (auto &[dia, cantidad] : j["medicosPorDia"].items()) {
          data.medicosPorDia[dia] = cantidad.get<int>();
        }
      }
    } else {
      // Default: 1 médico por día
      for (const auto &dia : data.dias) {
        data.medicosPorDia[dia] = 1;
      }
    }

    // Parsear capacidades personales (Opcional)
    if (j.contains("capacidades") && j["capacidades"].is_object()) {
      for (auto &[medico, cap] : j["capacidades"].items()) {
        data.personalCapacities[medico] = cap.get<int>();
      }
    }

  } catch (const json::exception &e) {
    throw std::runtime_error("Error parseando JSON: " + std::string(e.what()));
  }

  return data;
}

InputData JSONParser::parseInputFromFile(const std::string &filePath) {
  std::ifstream file(filePath);
  if (!file.is_open()) {
    throw std::runtime_error("No se pudo abrir el archivo: " + filePath);
  }

  std::string content((std::istreambuf_iterator<char>(file)),
                      std::istreambuf_iterator<char>());
  file.close();

  return parseInput(content);
}

std::string JSONParser::toJson(const ResultadoAsignacion &resultado) {
  json j;

  j["factible"] = resultado.factible;
  j["diasCubiertos"] = resultado.diasCubiertos;
  j["diasRequeridos"] = resultado.diasRequeridos;

  j["asignaciones"] = json::array();
  for (const auto &asig : resultado.asignaciones) {
    j["asignaciones"].push_back({{"medico", asig.medico}, {"dia", asig.dia}});
  }

  if (!resultado.factible) {
    j["bottlenecks"] = json::array();
    for (const auto &b : resultado.bottlenecks) {
      j["bottlenecks"].push_back(
          {{"tipo", b.tipo}, {"id", b.id}, {"razon", b.razon}});
    }
  }

  return j.dump(2); // Indentado con 2 espacios
}

void JSONParser::configureBuilder(GraphBuilder &builder,
                                  const InputData &data) {
  builder.setMedicos(data.medicos);
  builder.setDias(data.dias);
  builder.setPeriodos(data.periodos);
  builder.setDisponibilidad(data.disponibilidad);
  builder.setMaxGuardiasPorPeriodo(data.maxGuardiasPorPeriodo);
  builder.setMaxGuardiasTotales(data.maxGuardiasTotales);
  builder.setMedicosPorDia(data.medicosPorDia);
  builder.setPersonalCapacities(data.personalCapacities);
}
