import { authService } from "./auth.service";
import type {
    Asignacion,
    PlanApprovalResult,
    PlanAutofixResult,
    PlanDiffResult,
    PlanRiskResult,
    PlanVersionSummary,
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

    async previsualizarReparacion(payload: ReparacionParams): Promise<ReparacionResult> {
        const res = await fetch(`${API_BASE}/asignaciones/reparaciones/previsualizar`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw await parseApiError(res, "Error al previsualizar la reparación");
        return res.json();
    }

    async crearReparacionCandidata(payload: ReparacionParams): Promise<ReparacionResult> {
        const res = await fetch(`${API_BASE}/asignaciones/reparaciones/candidatas`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw await parseApiError(res, "Error al crear la candidata de reparación");
        return res.json();
    }

    async getVersiones(): Promise<PlanVersionSummary[]> {
        const res = await fetch(`${API_BASE}/asignaciones/versiones`, {
            headers: this.getHeaders(),
        });
        if (!res.ok) throw await parseApiError(res, "Error al obtener versiones");
        return res.json();
    }

    async publicarVersion(versionId: number): Promise<PlanVersionSummary> {
        const res = await fetch(`${API_BASE}/asignaciones/versiones/${versionId}/publicar`, {
            method: "POST",
            headers: this.getHeaders(),
        });
        if (!res.ok) throw await parseApiError(res, "Error al publicar versión");
        return res.json();
    }

    async getDiffPublicado(toVersionId: number): Promise<PlanDiffResult> {
        const params = new URLSearchParams({ toVersionId: String(toVersionId) });
        const res = await fetch(`${API_BASE}/asignaciones/diff/publicado?${params.toString()}`, {
            headers: this.getHeaders(),
        });
        if (!res.ok) throw await parseApiError(res, "Error al comparar con la versión publicada");
        return res.json();
    }

    async getRiesgoVersion(versionId: number): Promise<PlanRiskResult> {
        const res = await fetch(`${API_BASE}/asignaciones/versiones/${versionId}/riesgo`, {
            headers: this.getHeaders(),
        });
        if (!res.ok) throw await parseApiError(res, "Error al obtener riesgo de versión");
        return res.json();
    }

    async getAprobacionVersion(versionId: number): Promise<PlanApprovalResult> {
        const res = await fetch(`${API_BASE}/asignaciones/versiones/${versionId}/aprobacion`, {
            headers: this.getHeaders(),
        });
        if (!res.ok) throw await parseApiError(res, "Error al obtener resumen de aprobación");
        return res.json();
    }

    async getAutofixVersion(versionId: number): Promise<PlanAutofixResult> {
        const res = await fetch(`${API_BASE}/asignaciones/versiones/${versionId}/autofix-sugerido`, {
            headers: this.getHeaders(),
        });
        if (!res.ok) throw await parseApiError(res, "Error al obtener autofix sugerido");
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
