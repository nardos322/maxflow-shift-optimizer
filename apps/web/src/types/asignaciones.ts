import type { Medico } from "./medicos";
import type { Periodo } from "./periodos";

export interface Asignacion {
  id: number;
  fecha: string;
  medico: Medico;
  periodo: Periodo;
  medicoId: number;
  periodoId: number;
}
