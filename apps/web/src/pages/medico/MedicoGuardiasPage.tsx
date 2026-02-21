import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { asignacionesService } from "@/services/asignaciones.service";
import { useCurrentMedico } from "@/hooks/useCurrentMedico";

export function MedicoGuardiasPage() {
  const { medico, isLoading: isLoadingMedico, isError: isErrorMedico, error: medicoError } = useCurrentMedico();

  const {
    data: asignaciones,
    isLoading: isLoadingAsignaciones,
    isError: isErrorAsignaciones,
    error: asignacionesError,
  } = useQuery({
    queryKey: ["asignaciones"],
    queryFn: () => asignacionesService.getResultados(),
    enabled: !!medico,
  });

  const misGuardias = useMemo(() => {
    return (asignaciones ?? [])
      .filter((asignacion) => asignacion.medicoId === medico?.id)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }, [asignaciones, medico?.id]);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const proximaGuardia = misGuardias.find((asignacion) => new Date(asignacion.fecha) >= hoy) ?? null;
  const guardiasFuturas = misGuardias.filter((asignacion) => new Date(asignacion.fecha) >= hoy).length;
  const guardiasPasadas = misGuardias.length - guardiasFuturas;

  const guardiasPorPeriodo = useMemo(() => {
    const grouped = new Map<string, typeof misGuardias>();
    for (const guardia of misGuardias) {
      const key = guardia.periodo.nombre;
      const list = grouped.get(key) ?? [];
      list.push(guardia);
      grouped.set(key, list);
    }
    return Array.from(grouped.entries());
  }, [misGuardias]);

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

  if (isErrorMedico || isErrorAsignaciones) {
    return (
      <div className="panel-glass rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
        Error al cargar guardias: {(medicoError as Error)?.message || (asignacionesError as Error)?.message || "Intenta nuevamente."}
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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel-glass dash-reveal delay-1 rounded-xl border border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Próxima Guardia</p>
          <p className="mt-2 text-lg font-bold">
            {proximaGuardia ? new Date(proximaGuardia.fecha).toLocaleDateString() : "Sin guardias próximas"}
          </p>
        </div>
        <div className="panel-glass dash-reveal delay-2 rounded-xl border border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Futuras</p>
          <p className="mt-2 text-3xl font-extrabold text-primary">{guardiasFuturas}</p>
        </div>
        <div className="panel-glass dash-reveal delay-3 rounded-xl border border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Pasadas</p>
          <p className="mt-2 text-3xl font-extrabold text-muted-foreground">{guardiasPasadas}</p>
        </div>
      </div>

      <div className="panel-glass dash-reveal delay-2 rounded-xl border border-border/70">
        <div className="border-b border-border/70 p-6">
          <h3 className="text-xl font-bold">Agenda por Período</h3>
          <p className="mt-1 text-sm text-muted-foreground">Tus guardias se agrupan por período para lectura rápida.</p>
        </div>
        <div className="space-y-4 p-6">
          {misGuardias.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/80 bg-muted/40 p-8 text-center text-muted-foreground">
              No tienes guardias asignadas actualmente.
            </div>
          ) : (
            guardiasPorPeriodo.map(([periodoNombre, guardias]) => (
              <div key={periodoNombre} className="rounded-lg border border-border/70 bg-card/60 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="font-semibold">{periodoNombre}</p>
                  <span className="rounded-full bg-accent/35 px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                    {guardias.length} guardia{guardias.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="space-y-2">
                  {guardias.map((guardia) => (
                    <div key={guardia.id} className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">
                      <span className="text-sm font-medium">{new Date(guardia.fecha).toLocaleDateString()}</span>
                      <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                        {new Date(guardia.fecha) >= hoy ? "Pendiente" : "Cumplida"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
