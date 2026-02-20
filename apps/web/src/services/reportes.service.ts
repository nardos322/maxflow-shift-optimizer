import { useAuthStore } from "@/hooks/useAuthStore";
import type { ReporteEquidad } from "@/types/reportes";


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
