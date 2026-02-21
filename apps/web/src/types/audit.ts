export interface AuditLog {
  id: number;
  accion: string;
  usuario: string;
  detalles: string | null;
  createdAt: string;
}
