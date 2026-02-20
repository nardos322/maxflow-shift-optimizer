export interface Feriado {
  id: number;
  fecha: string;
  descripcion: string;
  estadoPlanificacion?: "PENDIENTE" | "PLANIFICADO" | "CERRADO";
}

export interface Periodo {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  feriados?: Feriado[];
}
