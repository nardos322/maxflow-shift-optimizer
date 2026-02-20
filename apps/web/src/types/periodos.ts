export interface Feriado {
  id: number;
  fecha: string;
  descripcion: string;
}

export interface Periodo {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  feriados?: Feriado[];
}
