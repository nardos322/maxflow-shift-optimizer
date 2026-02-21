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
  planVersion?: PlanVersionSummary;
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
  ventanaInicio?: string;
  ventanaFin?: string;
}

export interface ReparacionResult {
  status?: string;
  message?: string;
  reasignaciones?: number;
  minCut?: SolverBottleneck[];
  planVersion?: PlanVersionSummary;
  resumenImpacto?: RepairImpactSummary;
}

export interface PlanVersionSummary {
  id: number;
  tipo: string;
  estado: string;
  usuario?: string;
  sourcePlanVersionId?: number | null;
  totalAsignaciones?: number;
  createdAt?: string;
}

export interface PlanDiffSummary {
  totalFrom: number;
  totalTo: number;
  agregadas: number;
  removidas: number;
  cambiosNetos: number;
}

export interface PlanDiffResult {
  fromVersion: {
    id: number;
    tipo: string;
    createdAt: string;
  };
  toVersion: {
    id: number;
    tipo: string;
    createdAt: string;
  };
  resumen: PlanDiffSummary;
  agregadas: Array<{ fecha: string; medicoId: number; medico: string }>;
  removidas: Array<{ fecha: string; medicoId: number; medico: string }>;
}

export interface PlanRiskResult {
  version: {
    id: number;
    tipo: string;
    estado: string;
    createdAt: string;
  };
  baseline: {
    id: number;
    tipo: string;
    estado: string;
    createdAt: string;
  } | null;
  resumen: {
    cambiosNetos: number;
    agregadas: number;
    removidas: number;
    medicosAfectados: number;
    periodosAfectados: number;
    diasConRiesgoCobertura: number;
    cambiosEnZonaCongelada: number;
  };
  detallePorMedico: Array<{
    medicoId: number;
    medico: string;
    agregadas: number;
    removidas: number;
  }>;
  detallePorPeriodo: Array<{
    periodoId: number;
    periodo: string;
    agregadas: number;
    removidas: number;
  }>;
  diasConRiesgoCobertura: Array<{
    fecha: string;
    requeridos: number;
    asignados: number;
  }>;
}

export interface RepairImpactSummary {
  medicoIdAfectado: number;
  guardiasRemovidas: number;
  guardiasReasignadas: number;
  diasAfectados: number;
  listaDiasAfectados: string[];
  medicosEntrantes: number;
  listaMedicosEntrantes: number[];
  cambiosEstimados: number;
}

export interface PlanApprovalResult {
  version: {
    id: number;
    tipo: string;
    estado: string;
    createdAt: string;
  };
  decision: {
    aprobable: boolean;
    recomendacion: string;
    bloqueantes: string[];
    advertencias: string[];
  };
  resumenRiesgo: PlanRiskResult["resumen"];
  recomendaciones: Array<{
    tipo: string;
    prioridad: string;
    accion: string;
    detalle: Record<string, unknown>;
  }>;
  comparacionPublicada: {
    fromVersion: PlanDiffResult["fromVersion"];
    toVersion: PlanDiffResult["toVersion"];
    resumen: PlanDiffSummary;
  } | null;
}

export interface PlanAutofixResult {
  version: {
    id: number;
    tipo: string;
    estado: string;
  };
  decisionActual: PlanApprovalResult["decision"];
  parametrosReintento: {
    medicoId: number | null;
    darDeBaja: boolean;
    ventanaInicioSugerida: string;
    ventanaFinSugerida: string | null;
    fechasCriticasACubrir: string[];
    medicosMasImpactados: Array<{
      medicoId: number;
      medico: string;
      cambios: number;
    }>;
  };
  pasosSugeridos: string[];
  resumenRiesgo: PlanRiskResult["resumen"];
}
