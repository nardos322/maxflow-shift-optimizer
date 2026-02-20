export interface ReporteEquidad {
  fechaGeneracion: string;
  estadisticasGlobales: {
    totalGuardias: number;
    medicosActivos: number;
    promedioPorMedico: number;
    desviacionEstandar: number;
    totalTurnosRequeridos: number;
    turnosSinCobertura: number;
    coberturaPorcentaje: number;
  };
  detallePorMedico: Array<{
    id: number;
    nombre: string;
    totalGuardias: number;
    periodosCubiertos: string[];
  }>;
}

export interface GuardiaFaltante {
  fecha: string;
  descripcion: string;
  periodo: {
    id: number;
    nombre: string;
  };
  medicosRequeridos: number;
  medicosAsignados: number;
  faltantes: number;
  motivo: string;
}
