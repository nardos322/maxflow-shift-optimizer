import { authService } from "./auth.service";
import type { AuditLog } from "@/types/audit";
import { parseApiError } from "./apiError";

const API_BASE = "/api";

class AuditService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/auditoria`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, "Error al obtener actividad reciente");
    const logs = (await res.json()) as AuditLog[];
    return logs.slice(0, 5);
  }
}

export const auditService = new AuditService();
