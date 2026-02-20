import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SolverPage() {
  const queryClient = useQueryClient();

  // Fetch asignaciones
  const { data: asignaciones, isLoading } = useQuery({
    queryKey: ["asignaciones"],
    queryFn: () => asignacionesService.getResultados(),
  });

  // Resolver mutation
  const resolverMutation = useMutation({
    mutationFn: () => asignacionesService.resolver(),
    onSuccess: (data) => {
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
      resolverMutation.mutate();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Planificador de Guardias
          </h2>
          <p className="text-muted-foreground mt-1">
            Ejecuta el algoritmo de optimización para generar el calendario de guardias.
          </p>
        </div>
        <Button 
            onClick={handleResolverClick}
            disabled={resolverMutation.isPending}
        >
          <Zap className="mr-2 h-4 w-4" />
          {resolverMutation.isPending ? "Ejecutando..." : "Ejecutar Planificador"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resultados de Asignación</CardTitle>
          <CardDescription>
            Lista de guardias asignadas a los médicos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Cargando asignaciones...</div>
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
                    <TableCell className="font-medium">{new Date(asignacion.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{asignacion.medico.nombre}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{asignacion.periodo.nombre}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
           { !isLoading && asignaciones?.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                    No hay asignaciones para mostrar. Ejecuta el planificador para generarlas.
                </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
