import { authService } from "./auth.service";
import type { Medico } from "@/types/medicos";
import { parseApiError } from "./apiError";

const API_BASE = "/api";
export interface Disponibilidad {
  id: number;
  medicoId: number;
  fecha: string;
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
    if (!res.ok) throw await parseApiError(res, "Error al obtener médicos");
    return res.json();
  }

  async getById(id: number): Promise<Medico> {
    const res = await fetch(`${API_BASE}/medicos/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, "Error al obtener el médico");
    return res.json();
  }

  async create(data: { nombre: string; email: string; password?: string }): Promise<Medico> {
    const res = await fetch(`${API_BASE}/medicos`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw await parseApiError(res, "Error al crear médico");

    return res.json();
  }

  async update(id: number, data: Partial<Medico>): Promise<Medico> {
    const res = await fetch(`${API_BASE}/medicos/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await parseApiError(res, "Error al actualizar médico");
    return res.json();
  }

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/medicos/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, "Error al eliminar médico");
  }

  async getDisponibilidad(medicoId: number): Promise<Disponibilidad[]> {
    const res = await fetch(`${API_BASE}/medicos/${medicoId}/disponibilidad`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, "Error al obtener disponibilidad");
    return res.json();
  }

  async addDisponibilidad(medicoId: number, fechas: string[]): Promise<Disponibilidad[]> {
    const res = await fetch(`${API_BASE}/medicos/${medicoId}/disponibilidad`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ fechas }),
    });
    if (!res.ok) throw await parseApiError(res, "Error al agregar disponibilidad");
    return res.json();
  }

  async removeDisponibilidad(medicoId: number, fechas: string[]): Promise<void> {
    const res = await fetch(`${API_BASE}/medicos/${medicoId}/disponibilidad`, {
      method: "DELETE",
      headers: this.getHeaders(),
      body: JSON.stringify({ fechas }),
    });
    if (!res.ok) throw await parseApiError(res, "Error al eliminar disponibilidad");
  }
}

export const medicosService = new MedicosService();
