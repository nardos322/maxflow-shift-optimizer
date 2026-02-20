import { authService } from "./auth.service";
import type { Medico } from "./medicos.service";

const API_BASE = "/api";

// From prisma schema
export interface Periodo {
    id: number;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
}

// From prisma schema
export interface Asignacion {
    id: number;
    fecha: string;
    medico: Medico;
    periodo: Periodo;
    medicoId: number;
    periodoId: number;
}


class AsignacionesService {
    private getHeaders() {
        const token = authService.getToken();
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    }

    async resolver(): Promise<any> {
        const res = await fetch(`${API_BASE}/asignaciones/resolver`, {
            method: "POST",
            headers: this.getHeaders(),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || error.message || "Error al ejecutar el planificador");
        }
        return res.json();
    }

    async getResultados(): Promise<Asignacion[]> {
        const res = await fetch(`${API_BASE}/asignaciones`, {
            headers: this.getHeaders(),
        });
        if (!res.ok) throw new Error("Error al obtener las asignaciones");
        return res.json();
    }
}

export const asignacionesService = new AsignacionesService();
