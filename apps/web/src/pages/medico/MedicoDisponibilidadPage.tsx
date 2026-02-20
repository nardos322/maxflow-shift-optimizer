import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck2 } from "lucide-react";
import { periodosService } from "@/services/periodos.service";
import { medicosService } from "@/services/medicos.service";
import { Button } from "@/components/ui/button";
import { useCurrentMedico } from "@/hooks/useCurrentMedico";

function toDayKey(value: string) {
  return value.includes("T") ? value.slice(0, 10) : value;
}

function getDelayClass(index: number) {
  if (index === 0) return "delay-1";
  if (index === 1) return "delay-2";
  return "delay-3";
}

export function MedicoDisponibilidadPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pendingFecha, setPendingFecha] = useState<string | null>(null);
  const { medico, isLoading: isLoadingMedico, isError: isErrorMedico, error: medicoError } = useCurrentMedico();

  const {
    data: periodos,
    isLoading: isLoadingPeriodos,
    isError: isErrorPeriodos,
    error: periodosError,
  } = useQuery({
    queryKey: ["periodos"],
    queryFn: () => periodosService.getAll(),
    enabled: !!medico,
  });

  const {
    data: disponibilidad,
    isLoading: isLoadingDisponibilidad,
    isError: isErrorDisponibilidad,
    error: disponibilidadError,
  } = useQuery({
    queryKey: ["disponibilidad", medico?.id],
    queryFn: () => medicosService.getDisponibilidad(medico!.id),
    enabled: !!medico,
  });

  const disponibilidadSet = useMemo(
    () => new Set((disponibilidad ?? []).map((d) => toDayKey(d.fecha))),
    [disponibilidad]
  );

  const addMutation = useMutation({
    mutationFn: (fecha: string) => medicosService.addDisponibilidad(medico!.id, [fecha]),
    onSuccess: (_, fecha) => {
      queryClient.invalidateQueries({ queryKey: ["disponibilidad", medico?.id] });
      setFeedback({ type: "success", message: `Disponibilidad marcada para ${new Date(fecha).toLocaleDateString()}.` });
      setPendingFecha(null);
    },
    onError: (error: Error) => {
      setFeedback({ type: "error", message: error.message });
      setPendingFecha(null);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (fecha: string) => medicosService.removeDisponibilidad(medico!.id, [fecha]),
    onSuccess: (_, fecha) => {
      queryClient.invalidateQueries({ queryKey: ["disponibilidad", medico?.id] });
      setFeedback({ type: "success", message: `Disponibilidad quitada para ${new Date(fecha).toLocaleDateString()}.` });
      setPendingFecha(null);
    },
    onError: (error: Error) => {
      setFeedback({ type: "error", message: error.message });
      setPendingFecha(null);
    },
  });

  const handleToggle = (fecha: string) => {
    if (!medico) return;
    setFeedback(null);
    setPendingFecha(fecha);
    if (disponibilidadSet.has(fecha)) {
      removeMutation.mutate(fecha);
      return;
    }
    addMutation.mutate(fecha);
  };

  if (isLoadingMedico || isLoadingPeriodos || isLoadingDisponibilidad) {
    return <div className="text-sm text-muted-foreground">Cargando disponibilidad...</div>;
  }

  if (!medico) {
    return (
      <div className="panel-glass rounded-xl border border-border/70 p-6 text-sm text-muted-foreground">
        No se encontró un perfil de médico asociado a tu usuario.
      </div>
    );
  }

  if (isErrorMedico || isErrorPeriodos || isErrorDisponibilidad) {
    return (
      <div className="panel-glass rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
        Error al cargar disponibilidad:{" "}
        {(medicoError as Error)?.message ||
          (periodosError as Error)?.message ||
          (disponibilidadError as Error)?.message ||
          "Intenta nuevamente."}
      </div>
    );
  }

  const totalFeriados = (periodos ?? []).reduce((acc, p) => acc + (p.feriados?.length ?? 0), 0);

  return (
    <div className="space-y-6">
      <section className="panel-glass dash-reveal rounded-2xl border border-border/70 p-6">
        <h2 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight md:text-4xl">
          <CalendarCheck2 className="h-8 w-8 text-primary" />
          Mi Disponibilidad
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Marca en qué feriados puedes tomar guardia.
        </p>
        <p className="mt-4 text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {disponibilidadSet.size} de {totalFeriados} fechas marcadas
        </p>
      </section>

      {feedback && (
        <div
          className={
            feedback.type === "success"
              ? "rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary"
              : "rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          }
        >
          {feedback.message}
        </div>
      )}

      {totalFeriados === 0 && (
        <div className="panel-glass dash-reveal rounded-xl border border-dashed border-border/80 bg-muted/40 p-8 text-center text-muted-foreground">
          Aún no hay feriados disponibles para marcar en tus períodos.
        </div>
      )}

      {(periodos ?? []).map((periodo, idx) => (
        <div key={periodo.id} className={`panel-glass dash-reveal ${getDelayClass(idx)} rounded-xl border border-border/70`}>
          <div className="border-b border-border/70 p-5">
            <h3 className="text-lg font-bold">{periodo.nombre}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(periodo.fechaInicio).toLocaleDateString()} - {new Date(periodo.fechaFin).toLocaleDateString()}
            </p>
          </div>
          <div className="space-y-3 p-5">
            {(periodo.feriados ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Este período no tiene feriados cargados.</p>
            )}
            {(periodo.feriados ?? []).map((feriado) => {
              const fechaKey = toDayKey(feriado.fecha);
              const isAvailable = disponibilidadSet.has(fechaKey);
              const isPending = pendingFecha === fechaKey && (addMutation.isPending || removeMutation.isPending);

              return (
                <div key={feriado.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-card/50 p-3">
                  <div>
                    <p className="font-semibold">{feriado.descripcion}</p>
                    <p className="text-sm text-muted-foreground">{new Date(feriado.fecha).toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant={isAvailable ? "outline" : "default"}
                    disabled={isPending}
                    onClick={() => handleToggle(fechaKey)}
                  >
                    {isPending ? "Guardando..." : isAvailable ? "Quitar disponibilidad" : "Marcar disponible"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
