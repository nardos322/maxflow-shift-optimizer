import { useAuthStore } from "@/hooks/useAuthStore";

// Based on the backend service, let's define the response type
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


export const reportesService = {
  async getReporteEquidad(): Promise<ReporteEquidad> {
    const token = useAuthStore.getState().token;
    const response = await fetch('/api/reportes/equidad', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener el reporte de equidad');
    }

    return response.json();
  },
};
