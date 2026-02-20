import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { asignacionesService } from "@/services/asignaciones.service";
import { useCurrentMedico } from "@/hooks/useCurrentMedico";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function MedicoGuardiasPage() {
  const { medico, isLoading: isLoadingMedico } = useCurrentMedico();

  const { data: asignaciones, isLoading: isLoadingAsignaciones } = useQuery({
    queryKey: ["asignaciones"],
    queryFn: () => asignacionesService.getResultados(),
    enabled: !!medico,
  });

  const misGuardias = useMemo(
    () => (asignaciones ?? []).filter((asignacion) => asignacion.medicoId === medico?.id),
    [asignaciones, medico?.id]
  );

  if (isLoadingMedico || isLoadingAsignaciones) {
    return <div className="text-sm text-muted-foreground">Cargando guardias...</div>;
  }

  if (!medico) {
    return (
      <div className="panel-glass rounded-xl border border-border/70 p-6 text-sm text-muted-foreground">
        No se encontró un perfil de médico asociado a tu usuario.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="panel-glass dash-reveal rounded-2xl border border-border/70 p-6">
        <h2 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight md:text-4xl">
          <ClipboardList className="h-8 w-8 text-primary" />
          Mis Guardias
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Revisa tus guardias asignadas por fecha y período.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel-glass dash-reveal delay-1 rounded-xl border border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Médico</p>
          <p className="mt-2 text-lg font-bold">{medico.nombre}</p>
        </div>
        <div className="panel-glass dash-reveal delay-2 rounded-xl border border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Total de Guardias</p>
          <p className="mt-2 text-3xl font-extrabold">{misGuardias.length}</p>
        </div>
      </div>

      <div className="panel-glass dash-reveal delay-2 rounded-xl border border-border/70">
        <div className="border-b border-border/70 p-6">
          <h3 className="text-xl font-bold">Detalle</h3>
        </div>
        <div className="p-6">
          {misGuardias.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/80 bg-muted/40 p-8 text-center text-muted-foreground">
              No tienes guardias asignadas actualmente.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Período</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {misGuardias.map((asignacion) => (
                  <TableRow key={asignacion.id}>
                    <TableCell className="font-semibold">{new Date(asignacion.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{asignacion.periodo.nombre}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
