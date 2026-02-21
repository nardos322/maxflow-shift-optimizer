import { authService } from "./auth.service";
import type {
    Asignacion,
    ReparacionParams,
    ReparacionResult,
    SimulacionParams,
    SimulacionResult,
    SolverRunResult,
} from "@/types/asignaciones";
import { parseApiError } from "./apiError";

const API_BASE = "/api";


class AsignacionesService {
    private getHeaders() {
        const token = authService.getToken();
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    }

    async resolver(): Promise<SolverRunResult> {
        const res = await fetch(`${API_BASE}/asignaciones/resolver`, {
            method: "POST",
            headers: this.getHeaders(),
        });

        if (!res.ok) throw await parseApiError(res, "Error al ejecutar el planificador");
        return res.json();
    }

    async simular(payload: SimulacionParams): Promise<SimulacionResult> {
        const res = await fetch(`${API_BASE}/asignaciones/simulaciones`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw await parseApiError(res, "Error al ejecutar la simulación");
        return res.json();
    }

    async reparar(payload: ReparacionParams): Promise<ReparacionResult> {
        const res = await fetch(`${API_BASE}/asignaciones/reparaciones`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw await parseApiError(res, "Error al ejecutar la reparación");
        return res.json();
    }

    async getResultados(): Promise<Asignacion[]> {
        const res = await fetch(`${API_BASE}/asignaciones`, {
            headers: this.getHeaders(),
        });
        if (!res.ok) throw await parseApiError(res, "Error al obtener las asignaciones");
        return res.json();
    }
}

export const asignacionesService = new AsignacionesService();
