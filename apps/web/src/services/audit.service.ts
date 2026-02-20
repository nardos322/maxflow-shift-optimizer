import { authService } from "./auth.service";

const API_BASE = "/api";

export interface AuditLog {
  id: number;
  accion: string;
  usuario: string;
  detalles: string | null;
  createdAt: string;
}

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
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Error al obtener actividad reciente");
    }
    const logs = (await res.json()) as AuditLog[];
    return logs.slice(0, 5);
  }
}

export const auditService = new AuditService();
