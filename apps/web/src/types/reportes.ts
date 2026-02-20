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
