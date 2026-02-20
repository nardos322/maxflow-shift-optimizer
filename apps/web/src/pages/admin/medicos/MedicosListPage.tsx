import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Trash2, Edit2, UserX, UserCheck } from "lucide-react";
import { medicosService } from "@/services/medicos.service";
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

export function MedicosListPage() {
  const queryClient = useQueryClient();
  const [showInactive, setShowInactive] = useState(false);

  // Fetch medicos
  const { data: medicos, isLoading } = useQuery({
    queryKey: ["medicos", showInactive],
    queryFn: () => medicosService.getAll(!showInactive),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => medicosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicos"] });
    },
  });

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de desactivar este médico?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Médicos</h2>
          <p className="text-muted-foreground">
            Administra los perfiles de los médicos y sus usuarios asociados.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowInactive(!showInactive)}>
            {showInactive ? "Ocultar Inactivos" : "Mostrar Inactivos"}
          </Button>
          <Button asChild>
            <Link to="/medicos/new">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Médico
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Médicos Registrados</CardTitle>
          <CardDescription>Lista total de médicos en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Usuario Vinculado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicos?.map((medico) => (
                <TableRow key={medico.id}>
                  <TableCell className="font-medium">{medico.nombre}</TableCell>
                  <TableCell>{medico.email}</TableCell>
                  <TableCell>
                    {medico.activo ? (
                      <Badge variant="default" className="bg-green-600">Activo</Badge>
                    ) : (
                      <Badge variant="destructive">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {medico.userId ? (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <UserCheck className="mr-1 h-3 w-3 text-green-600" />
                        Si (ID: {medico.userId})
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <UserX className="mr-1 h-3 w-3 text-yellow-600" />
                        No
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon" title="Editar">
                      <Link to={`/medicos/${medico.id}/edit`}>
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    {medico.activo && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(medico.id)}
                        title="Desactivar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
