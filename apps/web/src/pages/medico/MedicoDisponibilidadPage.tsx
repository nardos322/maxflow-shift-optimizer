import { useMemo } from "react";
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
  const { medico, isLoading: isLoadingMedico } = useCurrentMedico();

  const { data: periodos, isLoading: isLoadingPeriodos } = useQuery({
    queryKey: ["periodos"],
    queryFn: () => periodosService.getAll(),
    enabled: !!medico,
  });

  const { data: disponibilidad, isLoading: isLoadingDisponibilidad } = useQuery({
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["disponibilidad", medico?.id] }),
  });

  const removeMutation = useMutation({
    mutationFn: (fecha: string) => medicosService.removeDisponibilidad(medico!.id, [fecha]),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["disponibilidad", medico?.id] }),
  });

  const handleToggle = (fecha: string) => {
    if (!medico) return;
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
      </section>

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
              const isPending = addMutation.isPending || removeMutation.isPending;

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
                    {isAvailable ? "Quitar disponibilidad" : "Marcar disponible"}
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
