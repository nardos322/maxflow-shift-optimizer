import type { Medico } from "./medicos";
import type { Periodo } from "./periodos";

export interface Asignacion {
  id: number;
  fecha: string;
  medico: Medico;
  periodo: Periodo;
  medicoId: number;
  periodoId: number;
}

export interface SolverBottleneck {
  id?: string;
  tipo?: string;
  razon?: string;
  [key: string]: unknown;
}

export interface SolverEngineResult {
  factible?: boolean;
  asignaciones?: Array<{ dia: string; medico: string }>;
  bottlenecks?: SolverBottleneck[];
  message?: string;
  status?: string;
  minCut?: SolverBottleneck[];
}

export interface SolverRunResult {
  status?: string;
  message?: string;
  minCut?: SolverBottleneck[];
  asignacionesCreadas?: number;
}

export interface SimulacionParams {
  excluirMedicos: number[];
  periodosIds?: number[];
  medicosHipoteticos?: Array<{
    nombre: string;
    disponibilidadFechas?: string[];
  }>;
  config?: {
    maxGuardiasTotales?: number;
    medicosPorDia?: number;
    maxGuardiasPorPeriodo?: number;
  };
}

export interface SimulacionResult {
  parametros?: {
    medicosExcluidos?: number;
    medicosHipoteticos?: number;
    periodosConsiderados?: number;
    config?: Record<string, unknown>;
  };
  resultado?: SolverEngineResult;
  factible?: boolean;
  message?: string;
}

export interface ReparacionParams {
  medicoId: number;
  darDeBaja?: boolean;
}

export interface ReparacionResult {
  status?: string;
  message?: string;
  reasignaciones?: number;
  minCut?: SolverBottleneck[];
}
