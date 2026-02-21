import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Calculator, FlaskConical, Wrench, Zap } from "lucide-react";
import { asignacionesService } from "@/services/asignaciones.service";
import { medicosService } from "@/services/medicos.service";
import type {
  Asignacion,
  ReparacionResult,
  SimulacionResult,
  SolverRunResult,
} from "@/types/asignaciones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getBottleneckLabel(item: Record<string, unknown>) {
  const tipo = typeof item.tipo === "string" ? item.tipo : "N/A";
  const id = typeof item.id === "string" ? item.id : "N/A";
  const razon = typeof item.razon === "string" ? item.razon : "Sin detalle";
  return `${tipo} · ${id} · ${razon}`;
}

export function SolverPage() {
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] = useState<SolverRunResult | null>(null);
  const [simulationResult, setSimulationResult] =
    useState<SimulacionResult | null>(null);
  const [repairResult, setRepairResult] = useState<ReparacionResult | null>(
    null
  );
  const [operationError, setOperationError] = useState<string | null>(null);
  const [lastActionLabel, setLastActionLabel] = useState("Sin cambios recientes");
  const [excludedMedicos, setExcludedMedicos] = useState<number[]>([]);
  const [simMaxGuardiasTotales, setSimMaxGuardiasTotales] = useState("");
  const [simMedicosPorDia, setSimMedicosPorDia] = useState("");
  const [repairMedicoId, setRepairMedicoId] = useState("");
  const [darDeBaja, setDarDeBaja] = useState(false);

  // Fetch asignaciones
  const { data: asignaciones, isLoading } = useQuery({
    queryKey: ["asignaciones"],
    queryFn: () => asignacionesService.getResultados(),
  });
  const { data: medicos = [], isLoading: isMedicosLoading } = useQuery({
    queryKey: ["medicos", "activos", "solver"],
    queryFn: () => medicosService.getAll(true),
  });

  // Resolver mutation
  const resolverMutation = useMutation({
    mutationFn: () => asignacionesService.resolver(),
    onSuccess: (data) => {
      setLastResult(data as SolverRunResult);
      setLastActionLabel("Ejecución completada");
      setOperationError(null);
      console.log("Resultado del Solver:", data);
      queryClient.invalidateQueries({ queryKey: ["asignaciones"] });
    },
    onError: (error: Error) => {
      setOperationError(`Planificador: ${error.message}`);
    },
  });
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
        excluirMedicos: excludedMedicos,
        config: Object.keys(config).length > 0 ? config : undefined,
      });
    },
    onSuccess: (data) => {
      setSimulationResult(data);
      setLastActionLabel("Simulación ejecutada");
      setOperationError(null);
    },
    onError: (error: Error) => {
      setOperationError(`Simulación: ${error.message}`);
    },
  });
  const repairMutation = useMutation({
    mutationFn: () =>
      asignacionesService.reparar({
        medicoId: Number(repairMedicoId),
        darDeBaja,
      }),
    onSuccess: (data) => {
      setRepairResult(data);
      setLastActionLabel("Reparación ejecutada");
      setOperationError(null);
      queryClient.invalidateQueries({ queryKey: ["asignaciones"] });
      queryClient.invalidateQueries({ queryKey: ["medicos"] });
    },
    onError: (error: Error) => {
      setOperationError(`Reparación: ${error.message}`);
    },
  });

  const handleResolverClick = () => {
    if (
      confirm(
        "¿Estás seguro de que quieres ejecutar el planificador? Esto reemplazará las asignaciones actuales."
      )
    ) {
      setLastResult(null);
      setOperationError(null);
      resolverMutation.mutate();
    }
  };
  const handleRepairClick = () => {
    if (!repairMedicoId) return;
    const askConfirmation = darDeBaja
      ? "¿Confirmas la reparación y dar de baja al médico seleccionado?"
      : "¿Confirmas ejecutar la reparación del calendario para el médico seleccionado?";
    if (confirm(askConfirmation)) {
      setRepairResult(null);
      repairMutation.mutate();
    }
  };
  const toggleExcludedMedico = (medicoId: number) => {
    setExcludedMedicos((current) =>
      current.includes(medicoId)
        ? current.filter((id) => id !== medicoId)
        : [...current, medicoId]
    );
  };
  const simulationEngineResult = simulationResult?.resultado;
  const simulationFactible =
    simulationEngineResult?.factible ?? simulationResult?.factible;
  const simulationBottlenecks =
    simulationEngineResult?.bottlenecks ?? simulationEngineResult?.minCut ?? [];
  const simulationMessage =
    simulationEngineResult?.message ?? simulationResult?.message;

  return (
    <div className="space-y-6">
      <section className="panel-glass dash-reveal rounded-2xl border border-border/70 p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <h2 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight md:text-4xl">
              <Calculator className="h-8 w-8 text-primary" />
              Planificador de Guardias
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Ejecuta el algoritmo de optimización para generar el calendario de guardias.
            </p>
          </div>
          <Button
            onClick={handleResolverClick}
            disabled={resolverMutation.isPending}
            className="self-start rounded-xl px-5"
          >
            <Zap className="mr-2 h-4 w-4" />
            {resolverMutation.isPending ? "Ejecutando..." : "Ejecutar Planificador"}
          </Button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel-glass dash-reveal delay-1 rounded-xl border border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Asignaciones</p>
          <p className="mt-2 text-3xl font-extrabold">{asignaciones?.length ?? 0}</p>
        </div>
        <div className="panel-glass dash-reveal delay-2 rounded-xl border border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Estado del Motor</p>
          <p className="mt-2 text-lg font-bold text-primary">
            {resolverMutation.isPending ||
            simulationMutation.isPending ||
            repairMutation.isPending
              ? "Procesando"
              : "Listo"}
          </p>
        </div>
        <div className="panel-glass dash-reveal delay-3 rounded-xl border border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Última Acción</p>
          <p className="mt-2 text-lg font-bold text-foreground">{lastActionLabel}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel-glass dash-reveal delay-2 rounded-xl border border-border/70 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-border/80 bg-accent/50 p-2 text-accent-foreground">
              <FlaskConical className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Simulación What-If</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Prueba escenarios sin persistir cambios en la base de datos.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sim-max" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Máx. Guardias Totales
              </Label>
              <Input
                id="sim-max"
                type="number"
                min={1}
                value={simMaxGuardiasTotales}
                onChange={(e) => setSimMaxGuardiasTotales(e.target.value)}
                placeholder="Sin override"
                className="rounded-lg bg-background/80"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sim-medicos-dia" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Médicos por Día
              </Label>
              <Input
                id="sim-medicos-dia"
                type="number"
                min={1}
                value={simMedicosPorDia}
                onChange={(e) => setSimMedicosPorDia(e.target.value)}
                placeholder="Sin override"
                className="rounded-lg bg-background/80"
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Excluir médicos ({excludedMedicos.length})
            </p>
            <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-lg border border-border/70 bg-background/55 p-3">
              {isMedicosLoading && (
                <span className="text-sm text-muted-foreground">Cargando médicos...</span>
              )}
              {!isMedicosLoading &&
                medicos.map((medico) => {
                  const isSelected = excludedMedicos.includes(medico.id);
                  return (
                    <button
                      key={medico.id}
                      type="button"
                      onClick={() => toggleExcludedMedico(medico.id)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        isSelected
                          ? "border-primary/60 bg-primary/15 text-primary"
                          : "border-border/80 bg-background text-foreground hover:bg-accent/60"
                      }`}
                    >
                      {medico.nombre}
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Operación no destructiva
            </p>
            <Button
              onClick={() => {
                setSimulationResult(null);
                simulationMutation.mutate();
              }}
              disabled={simulationMutation.isPending}
              className="rounded-xl px-5"
            >
              {simulationMutation.isPending ? "Simulando..." : "Ejecutar Simulación"}
            </Button>
          </div>

          {simulationResult && (
            <div className="mt-4 rounded-lg border border-border/70 bg-background/70 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-accent/35">
                  {simulationFactible ? "FACTIBLE" : "INFACTIBLE"}
                </Badge>
                {typeof simulationEngineResult?.asignaciones?.length === "number" && (
                  <Badge variant="outline">
                    {simulationEngineResult.asignaciones.length} asignación(es) simuladas
                  </Badge>
                )}
              </div>
              {simulationMessage && (
                <p className="mt-3 text-sm text-muted-foreground">{simulationMessage}</p>
              )}
              {simulationBottlenecks.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm">
                  {simulationBottlenecks.slice(0, 5).map((item, idx) => (
                    <li
                      key={`${idx}-${String(item.id ?? "bottleneck")}`}
                      className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-2 text-yellow-900"
                    >
                      {getBottleneckLabel(item)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        <section className="panel-glass dash-reveal delay-3 rounded-xl border border-border/70 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-border/80 bg-secondary/60 p-2 text-primary">
              <Wrench className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Reparación de Asignaciones</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Redistribuye guardias de un médico y opcionalmente lo desactiva.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Médico objetivo
              </Label>
              <Select value={repairMedicoId} onValueChange={setRepairMedicoId}>
                <SelectTrigger className="rounded-lg bg-background/80">
                  <SelectValue placeholder="Selecciona un médico activo" />
                </SelectTrigger>
                <SelectContent>
                  {medicos.map((medico) => (
                    <SelectItem key={medico.id} value={String(medico.id)}>
                      {medico.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-3 rounded-lg border border-border/70 bg-background/55 p-3">
              <input
                type="checkbox"
                checked={darDeBaja}
                onChange={(e) => setDarDeBaja(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
              <span className="text-sm text-foreground">
                Dar de baja al médico después de la reparación
              </span>
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Reasignación con persistencia
            </p>
            <Button
              onClick={handleRepairClick}
              disabled={repairMutation.isPending || !repairMedicoId}
              variant="secondary"
              className="rounded-xl px-5"
            >
              {repairMutation.isPending ? "Reparando..." : "Ejecutar Reparación"}
            </Button>
          </div>

          {repairResult && (
            <div className="mt-4 rounded-lg border border-border/70 bg-background/70 p-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-accent/35">
                  {repairResult.status ?? "SIN ESTADO"}
                </Badge>
                {typeof repairResult.reasignaciones === "number" && (
                  <Badge variant="outline">
                    {repairResult.reasignaciones} reasignación(es)
                  </Badge>
                )}
              </div>
              {repairResult.message && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {repairResult.message}
                </p>
              )}
              {(repairResult.minCut?.length ?? 0) > 0 && (
                <ul className="mt-3 space-y-2 text-sm">
                  {repairResult.minCut!.slice(0, 5).map((item, idx) => (
                    <li
                      key={`${idx}-${String(item.id ?? "repair-cut")}`}
                      className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-2 text-yellow-900"
                    >
                      {getBottleneckLabel(item)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>

      {operationError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {operationError}
        </div>
      )}

      <div className="panel-glass dash-reveal delay-2 rounded-xl border border-border/70">
        <div className="border-b border-border/70 p-6">
          <h3 className="text-xl font-bold">Resultados de Asignación</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Lista de guardias asignadas a los médicos.
          </p>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Cargando asignaciones...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Médico Asignado</TableHead>
                  <TableHead>Periodo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asignaciones?.map((asignacion: Asignacion) => (
                  <TableRow key={asignacion.id}>
                    <TableCell className="font-semibold">{new Date(asignacion.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{asignacion.medico.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-accent/35">
                        {asignacion.periodo.nombre}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoading && asignaciones?.length === 0 && (
            <div className="rounded-lg border border-dashed border-border/80 bg-muted/40 p-8 text-center text-muted-foreground">
              No hay asignaciones para mostrar. Ejecuta el planificador para generarlas.
            </div>
          )}
        </div>
      </div>

      {lastResult?.status === "INFEASIBLE" && (
        <div className="panel-glass dash-reveal delay-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-6">
          <h3 className="text-lg font-bold text-yellow-700">Conflictos detectados por el Solver</h3>
          <p className="mt-2 text-sm text-yellow-800">
            {lastResult.message ?? "No se encontró una solución factible."}
          </p>
          {(lastResult.minCut?.length ?? 0) > 0 ? (
            <ul className="mt-4 space-y-2 text-sm text-yellow-900">
              {lastResult.minCut!.map((item, idx) => (
                <li key={`${idx}-${String(item.id ?? "node")}`} className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-2">
                  {getBottleneckLabel(item)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-yellow-800">No se recibieron cuellos de botella detallados.</p>
          )}
        </div>
      )}
    </div>
  );
}
