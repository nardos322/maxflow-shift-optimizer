import { authService } from "./auth.service";
import type { Configuracion } from "@/types/configuracion";

const API_BASE = "/api";

class ConfiguracionService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  }

  async get(): Promise<Configuracion> {
    const res = await fetch(`${API_BASE}/configuracion`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener la configuración");
    return res.json();
  }

  async update(data: Partial<Configuracion>): Promise<Configuracion> {
    const res = await fetch(`${API_BASE}/configuracion`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.message || "Error al actualizar la configuración");
    }
    return res.json();
  }
}

export const configuracionService = new ConfiguracionService();
