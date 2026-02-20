import { authService } from "./auth.service";
import type { z } from "@maxflow/shared";
import { createPeriodoBodySchema, updatePeriodoBodySchema } from "@maxflow/shared";

const API_BASE = "/api";

export interface Periodo {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  feriados?: {
    id: number;
    fecha: string;
    descripcion: string;
  }[];
}

type CreatePeriodo = z.infer<typeof createPeriodoBodySchema>;
type UpdatePeriodo = z.infer<typeof updatePeriodoBodySchema>;

class PeriodosService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getAll(): Promise<Periodo[]> {
    const res = await fetch(`${API_BASE}/periodos`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener períodos");
    return res.json();
  }

  async getById(id: number): Promise<Periodo> {
    const res = await fetch(`${API_BASE}/periodos/${id}`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error("Error al obtener el período");
      return res.json();
  }

  async create(data: CreatePeriodo): Promise<Periodo> {
    const res = await fetch(`${API_BASE}/periodos`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || error.message || "Error al crear el período");
    }

    return res.json();
  }

  async update(id: number, data: UpdatePeriodo): Promise<Periodo> {
    const res = await fetch(`${API_BASE}/periodos/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.message || "Error al actualizar el período");
    }
    return res.json();
  }

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/periodos/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Error al eliminar el período");
  }
}

export const periodosService = new PeriodosService();
