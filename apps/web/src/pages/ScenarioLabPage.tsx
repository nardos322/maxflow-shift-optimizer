import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarDays, FlaskConical, Plus, X } from "lucide-react";
import { periodosService } from "@/services/periodos.service";
import { medicosService } from "@/services/medicos.service";
import { asignacionesService } from "@/services/asignaciones.service";
import type { SimulacionResult } from "@/types/asignaciones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type HypotheticalDoctorDraft = {
  id: string;
  nombre: string;
  availabilityMode: "all" | "specific";
  disponibilidadFechas: string[];
};

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start).toLocaleDateString();
  const endDate = new Date(end).toLocaleDateString();
  return `${startDate} - ${endDate}`;
}

function formatScenarioDate(dateIso: string) {
  return new Date(`${dateIso}T00:00:00`).toLocaleDateString();
}

export function ScenarioLabPage() {
  const [selectedPeriodIds, setSelectedPeriodIds] = useState<number[]>([]);
  const [excludedMedicos, setExcludedMedicos] = useState<number[]>([]);
  const [hypotheticalName, setHypotheticalName] = useState("");
  const [hypotheticalDoctors, setHypotheticalDoctors] = useState<
    HypotheticalDoctorDraft[]
  >([]);
  const [simMaxGuardiasTotales, setSimMaxGuardiasTotales] = useState("");
  const [simMedicosPorDia, setSimMedicosPorDia] = useState("");
  const [result, setResult] = useState<SimulacionResult | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const { data: periodos = [], isLoading: isLoadingPeriodos } = useQuery({
    queryKey: ["periodos", "scenario-lab"],
    queryFn: () => periodosService.getAll(),
  });
  const { data: medicos = [], isLoading: isLoadingMedicos } = useQuery({
    queryKey: ["medicos", "activos", "scenario-lab"],
    queryFn: () => medicosService.getAll(true),
  });

  const selectedFeriadosCount = useMemo(() => {
    return periodos
      .filter((periodo) => selectedPeriodIds.includes(periodo.id))
      .reduce((sum, periodo) => sum + (periodo.feriados?.length ?? 0), 0);
  }, [periodos, selectedPeriodIds]);

  const selectedScenarioDates = useMemo(() => {
    const dateSet = new Set<string>();
    periodos
      .filter((periodo) => selectedPeriodIds.includes(periodo.id))
      .forEach((periodo) => {
        (periodo.feriados ?? []).forEach((feriado) => {
          dateSet.add(new Date(feriado.fecha).toISOString().split("T")[0]);
        });
      });

    return Array.from(dateSet).sort();
  }, [periodos, selectedPeriodIds]);

  const simulationMutation = useMutation({
    mutationFn: () => {
      const config: Record<string, number> = {};
      const maxGuardiasTotales = Number(simMaxGuardiasTotales);
      const medicosPorDia = Number(simMedicosPorDia);

      if (simMaxGuardiasTotales !== "" && Number.isFinite(maxGuardiasTotales)) {
        config.maxGuardiasTotales = maxGuardiasTotales;
      }
      if (simMedicosPorDia !== "" && Number.isFinite(medicosPorDia)) {
        config.medicosPorDia = medicosPorDia;
      }

      return asignacionesService.simular({
        periodosIds: selectedPeriodIds,
        excluirMedicos: excludedMedicos,
        medicosHipoteticos: hypotheticalDoctors.map((medico) => ({
          nombre: medico.nombre,
          disponibilidadFechas:
            medico.availabilityMode === "specific"
              ? medico.disponibilidadFechas
              : undefined,
        })),
        config: Object.keys(config).length > 0 ? config : undefined,
      });
    },
    onSuccess: (data) => {
      setResult(data);
      setErrorText(null);
    },
    onError: (error: Error) => {
      setErrorText(error.message);
    },
  });

  const togglePeriod = (periodoId: number) => {
    setSelectedPeriodIds((current) => {
      const next = current.includes(periodoId)
        ? current.filter((id) => id !== periodoId)
        : [...current, periodoId];

      // Clean specific availability dates that are no longer part of selected periods
      const nextDateSet = new Set(
        periodos
          .filter((periodo) => next.includes(periodo.id))
          .flatMap((periodo) =>
            (periodo.feriados ?? []).map((feriado) =>
              new Date(feriado.fecha).toISOString().split("T")[0]
            )
          )
      );

      setHypotheticalDoctors((drafts) =>
        drafts.map((draft) => ({
          ...draft,
          disponibilidadFechas: draft.disponibilidadFechas.filter((date) =>
            nextDateSet.has(date)
          ),
        }))
      );

      return next;
    });
  };

  const toggleMedicoExclusion = (medicoId: number) => {
    setExcludedMedicos((current) =>
      current.includes(medicoId)
        ? current.filter((id) => id !== medicoId)
        : [...current, medicoId]
    );
  };

  const addHypotheticalDoctor = () => {
    const cleanName = hypotheticalName.trim();
    if (!cleanName) return;

    const nameExists =
      hypotheticalDoctors.some((doctor) => doctor.nombre === cleanName) ||
      medicos.some((medico) => medico.nombre === cleanName);

    if (nameExists) {
      setErrorText(`Ya existe un médico con nombre "${cleanName}"`);
      return;
    }

    setHypotheticalDoctors((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        nombre: cleanName,
        availabilityMode: "all",
        disponibilidadFechas: [],
      },
    ]);
    setHypotheticalName("");
    setErrorText(null);
  };

  const removeHypotheticalDoctor = (doctorId: string) => {
    setHypotheticalDoctors((current) =>
      current.filter((doctor) => doctor.id !== doctorId)
    );
  };

  const setDoctorMode = (doctorId: string, mode: "all" | "specific") => {
    setHypotheticalDoctors((current) =>
      current.map((doctor) =>
        doctor.id === doctorId
          ? {
              ...doctor,
              availabilityMode: mode,
              disponibilidadFechas:
                mode === "all" ? [] : doctor.disponibilidadFechas,
            }
          : doctor
      )
    );
  };

  const toggleDoctorDate = (doctorId: string, dateIso: string) => {
    setHypotheticalDoctors((current) =>
      current.map((doctor) => {
        if (doctor.id !== doctorId) return doctor;
        const hasDate = doctor.disponibilidadFechas.includes(dateIso);
        return {
          ...doctor,
          disponibilidadFechas: hasDate
            ? doctor.disponibilidadFechas.filter((date) => date !== dateIso)
            : [...doctor.disponibilidadFechas, dateIso],
        };
      })
    );
  };

  const runSimulation = () => {
    const invalidDoctor = hypotheticalDoctors.find(
      (doctor) =>
        doctor.availabilityMode === "specific" &&
        doctor.disponibilidadFechas.length === 0
    );

    if (invalidDoctor) {
      setErrorText(
        `Selecciona al menos una fecha para ${invalidDoctor.nombre} o usa "Todos los días".`
      );
      return;
    }

    setResult(null);
    setErrorText(null);
    simulationMutation.mutate();
  };

  const simulationFactible = result?.resultado?.factible ?? result?.factible;
  const simulationBottlenecks =
    result?.resultado?.bottlenecks ?? result?.resultado?.minCut ?? [];

  return (
    <div className="space-y-6">
      <section className="panel-glass dash-reveal rounded-2xl border border-border/70 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-border/80 bg-accent/50 p-2 text-accent-foreground">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Laboratorio de Escenarios
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Simula cambios estructurales sin afectar la planificación real:
              períodos objetivo, médicos excluidos y médicos hipotéticos.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel-glass dash-reveal delay-1 rounded-xl border border-border/70 p-6">
          <h3 className="text-lg font-bold">Períodos de la simulación</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Elige qué períodos incluir en el escenario de prueba.
          </p>
          <div className="mt-4 flex max-h-64 flex-col gap-2 overflow-y-auto rounded-lg border border-border/70 bg-background/55 p-3">
            {isLoadingPeriodos && (
              <span className="text-sm text-muted-foreground">
                Cargando períodos...
              </span>
            )}
            {!isLoadingPeriodos &&
              periodos.map((periodo) => {
                const selected = selectedPeriodIds.includes(periodo.id);
                return (
                  <button
                    key={periodo.id}
                    type="button"
                    onClick={() => togglePeriod(periodo.id)}
                    className={`rounded-lg border px-3 py-2 text-left transition ${
                      selected
                        ? "border-primary/50 bg-primary/10"
                        : "border-border/80 bg-background hover:bg-accent/50"
                    }`}
                  >
                    <p className="text-sm font-semibold">{periodo.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateRange(periodo.fechaInicio, periodo.fechaFin)}
                    </p>
                  </button>
                );
              })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-accent/35">
              {selectedPeriodIds.length} período(s)
            </Badge>
            <Badge variant="outline">{selectedFeriadosCount} feriado(s)</Badge>
            <Badge variant="outline" className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {selectedScenarioDates.length} fecha(s) escenario
            </Badge>
          </div>
        </section>

        <section className="panel-glass dash-reveal delay-2 rounded-xl border border-border/70 p-6">
          <h3 className="text-lg font-bold">Médicos hipotéticos</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Agrega médicos virtuales y define si cubren todos los días o solo
            fechas específicas.
          </p>

          <div className="mt-4 flex gap-2">
            <Input
              value={hypotheticalName}
              onChange={(e) => setHypotheticalName(e.target.value)}
              placeholder="Ej: Dra. Refuerzo"
              className="rounded-lg bg-background/80"
            />
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={addHypotheticalDoctor}
            >
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {hypotheticalDoctors.length === 0 && (
              <div className="rounded-lg border border-border/70 bg-background/55 p-3">
                <p className="text-sm text-muted-foreground">
                  Sin médicos hipotéticos agregados.
                </p>
              </div>
            )}

            {hypotheticalDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="rounded-lg border border-border/70 bg-background/55 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{doctor.nombre}</p>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeHypotheticalDoctor(doctor.id)}
                    aria-label={`Eliminar ${doctor.nombre}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDoctorMode(doctor.id, "all")}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      doctor.availabilityMode === "all"
                        ? "border-primary/45 bg-primary/10 text-primary"
                        : "border-border/70 bg-background text-muted-foreground"
                    }`}
                  >
                    Todos los días
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoctorMode(doctor.id, "specific")}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      doctor.availabilityMode === "specific"
                        ? "border-primary/45 bg-primary/10 text-primary"
                        : "border-border/70 bg-background text-muted-foreground"
                    }`}
                  >
                    Días específicos
                  </button>
                </div>

                {doctor.availabilityMode === "specific" && (
                  <div className="mt-3 rounded-md border border-border/70 bg-background p-2">
                    {selectedScenarioDates.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Selecciona períodos para habilitar fechas.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedScenarioDates.map((dateIso) => {
                          const active = doctor.disponibilidadFechas.includes(dateIso);
                          return (
                            <button
                              key={`${doctor.id}-${dateIso}`}
                              type="button"
                              onClick={() => toggleDoctorDate(doctor.id, dateIso)}
                              aria-label={`toggle-date-${dateIso}`}
                              className={`rounded-full border px-2.5 py-1 text-xs ${
                                active
                                  ? "border-primary/50 bg-primary/10 text-primary"
                                  : "border-border/70 bg-background text-muted-foreground hover:bg-accent/40"
                              }`}
                            >
                              {formatScenarioDate(dateIso)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel-glass dash-reveal delay-3 rounded-xl border border-border/70 p-6">
        <h3 className="text-lg font-bold">Ajustes de simulación</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Excluir médicos activos
            </Label>
            <div className="max-h-36 overflow-y-auto rounded-lg border border-border/70 bg-background/55 p-2">
              {isLoadingMedicos && (
                <span className="text-sm text-muted-foreground">
                  Cargando médicos...
                </span>
              )}
              {!isLoadingMedicos &&
                medicos.map((medico) => {
                  const excluded = excludedMedicos.includes(medico.id);
                  return (
                    <button
                      key={medico.id}
                      type="button"
                      onClick={() => toggleMedicoExclusion(medico.id)}
                      className={`mb-1 block w-full rounded-md px-2 py-1 text-left text-sm ${
                        excluded
                          ? "bg-destructive/15 text-destructive"
                          : "hover:bg-accent/40"
                      }`}
                    >
                      {medico.nombre}
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Máx. Guardias Totales
            </Label>
            <Input
              type="number"
              min={1}
              value={simMaxGuardiasTotales}
              onChange={(e) => setSimMaxGuardiasTotales(e.target.value)}
              placeholder="Sin override"
              className="rounded-lg bg-background/80"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Médicos por Día
            </Label>
            <Input
              type="number"
              min={1}
              value={simMedicosPorDia}
              onChange={(e) => setSimMedicosPorDia(e.target.value)}
              placeholder="Sin override"
              className="rounded-lg bg-background/80"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={runSimulation}
              disabled={simulationMutation.isPending}
              className="w-full rounded-xl"
            >
              {simulationMutation.isPending ? "Simulando..." : "Ejecutar Escenario"}
            </Button>
          </div>
        </div>
      </section>

      {errorText && (
        <div className="rounded-xl border border-destructive/35 bg-destructive/10 p-4 text-sm text-destructive">
          {errorText}
        </div>
      )}

      {result && (
        <section className="panel-glass dash-reveal rounded-xl border border-border/70 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-accent/35">
              {simulationFactible ? "FACTIBLE" : "INFACTIBLE"}
            </Badge>
            <Badge variant="outline">
              {result.parametros?.periodosConsiderados ?? 0} período(s)
            </Badge>
            <Badge variant="outline">
              {result.parametros?.medicosHipoteticos ?? 0} médico(s) hipotético(s)
            </Badge>
            <Badge variant="outline">
              {result.parametros?.medicosExcluidos ?? 0} excluido(s)
            </Badge>
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            {result.resultado?.message ??
              result.message ??
              "Escenario ejecutado correctamente."}
          </p>

          {(simulationBottlenecks?.length ?? 0) > 0 && (
            <ul className="mt-4 space-y-2 text-sm">
              {simulationBottlenecks!.slice(0, 8).map((item, idx) => (
                <li
                  key={`${idx}-${String(item.id ?? "bottleneck")}`}
                  className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-2 text-yellow-900"
                >
                  {`${String(item.tipo ?? "N/A")} · ${String(item.id ?? "N/A")} · ${String(item.razon ?? "Sin detalle")}`}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
