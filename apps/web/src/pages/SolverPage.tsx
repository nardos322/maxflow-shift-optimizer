import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Calculator, Zap } from "lucide-react";
import { asignacionesService } from "@/services/asignaciones.service";
import type { Asignacion } from "@/types/asignaciones";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type SolverResult = {
  status?: string;
  message?: string;
  minCut?: Array<Record<string, unknown>>;
};

function getBottleneckLabel(item: Record<string, unknown>) {
  const tipo = typeof item.tipo === "string" ? item.tipo : "N/A";
  const id = typeof item.id === "string" ? item.id : "N/A";
  const razon = typeof item.razon === "string" ? item.razon : "Sin detalle";
  return `${tipo} · ${id} · ${razon}`;
}

export function SolverPage() {
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] = useState<SolverResult | null>(null);

  // Fetch asignaciones
  const { data: asignaciones, isLoading } = useQuery({
    queryKey: ["asignaciones"],
    queryFn: () => asignacionesService.getResultados(),
  });

  // Resolver mutation
  const resolverMutation = useMutation({
    mutationFn: () => asignacionesService.resolver(),
    onSuccess: (data) => {
      setLastResult(data as SolverResult);
      console.log("Resultado del Solver:", data);
      queryClient.invalidateQueries({ queryKey: ["asignaciones"] });
      // Aquí podrías mostrar un Toast con el resultado.
    },
    onError: (error: Error) => {
        alert(`Error al ejecutar el planificador: ${error.message}`);
    }
  });

  const handleResolverClick = () => {
    if (confirm("¿Estás seguro de que quieres ejecutar el planificador? Esto reemplazará las asignaciones actuales.")) {
      setLastResult(null);
      resolverMutation.mutate();
    }
  }

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
          <p className="mt-2 text-lg font-bold text-primary">{resolverMutation.isPending ? "Procesando" : "Listo"}</p>
        </div>
        <div className="panel-glass dash-reveal delay-3 rounded-xl border border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Última Acción</p>
          <p className="mt-2 text-lg font-bold text-foreground">{resolverMutation.isSuccess ? "Ejecución completada" : "Sin cambios recientes"}</p>
        </div>
      </div>

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
