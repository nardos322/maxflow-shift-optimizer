import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Trash2, Edit2, Calendar } from "lucide-react";
import { periodosService } from "@/services/periodos.service";
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

export function PeriodosListPage() {
  const queryClient = useQueryClient();

  const { data: periodos, isLoading } = useQuery({
    queryKey: ["periodos"],
    queryFn: () => periodosService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => periodosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periodos"] });
    },
  });

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este período? Esto podría afectar asignaciones existentes.")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Cargando períodos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Gestión de Períodos
            </h2>
          <p className="text-muted-foreground">
            Crea y administra los períodos de planificación.
          </p>
        </div>
        <Button asChild>
          <Link to="/periodos/new">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Período
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Períodos Registrados</CardTitle>
          <CardDescription>Lista de períodos de planificación.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Fecha de Inicio</TableHead>
                <TableHead>Fecha de Fin</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periodos?.map((periodo) => (
                <TableRow key={periodo.id}>
                  <TableCell className="font-medium">{periodo.nombre}</TableCell>
                  <TableCell>{new Date(periodo.fechaInicio).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(periodo.fechaFin).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon" title="Editar">
                      <Link to={`/periodos/${periodo.id}/edit`}>
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(periodo.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
