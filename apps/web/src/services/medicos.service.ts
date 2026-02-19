import { authService } from "./auth.service";

const API_BASE = "/api";

export interface Medico {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  userId?: number;
}

class MedicosService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getAll(soloActivos = false): Promise<Medico[]> {
    const res = await fetch(`${API_BASE}/medicos?soloActivos=${soloActivos}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener médicos");
    return res.json();
  }

  async create(data: { nombre: string; email: string; password?: string }): Promise<Medico> {
    const res = await fetch(`${API_BASE}/medicos`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || error.message || "Error al crear médico");
    }

    return res.json();
  }

  async update(id: number, data: Partial<Medico>): Promise<Medico> {
    const res = await fetch(`${API_BASE}/medicos/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar médico");
    return res.json();
  }

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/medicos/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Error al eliminar médico");
  }
}

export const medicosService = new MedicosService();
