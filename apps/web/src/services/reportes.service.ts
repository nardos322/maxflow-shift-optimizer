import { useAuthStore } from "@/hooks/useAuthStore";
import type { GuardiaFaltante, ReporteEquidad } from "@/types/reportes";
import { parseApiError } from "./apiError";


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

    if (!response.ok) throw await parseApiError(response, 'Error al obtener el reporte de equidad');

    return response.json();
  },

  async getGuardiasFaltantes(): Promise<GuardiaFaltante[]> {
    const token = useAuthStore.getState().token;
    const response = await fetch('/api/reportes/faltantes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw await parseApiError(response, 'Error al obtener guardias faltantes');

    return response.json();
  },
};
