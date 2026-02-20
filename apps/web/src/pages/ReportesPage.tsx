import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { reportesService } from "@/services/reportes.service";
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

export function ReportesPage() {

  const { data: reporte, isLoading } = useQuery({
    queryKey: ["reporteEquidad"],
    queryFn: () => reportesService.getReporteEquidad(),
  });

  const stats = reporte?.estadisticasGlobales;

  if (isLoading) return <div>Cargando reporte...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Reporte de Equidad
            </h2>
          <p className="text-muted-foreground">
            Métricas sobre la distribución de guardias entre los médicos.
          </p>
        </div>
      </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader><CardTitle>Total Guardias</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{stats?.totalGuardias}</p></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Médicos Activos</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{stats?.medicosActivos}</p></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Promedio / Médico</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{stats?.promedioPorMedico}</p></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Desv. Estándar</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{stats?.desviacionEstandar}</p></CardContent>
            </Card>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle por Médico</CardTitle>
          <CardDescription>Distribución individual de las guardias asignadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Médico</TableHead>
                <TableHead className="text-right">Total de Guardias</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reporte?.detallePorMedico?.map((detalle) => (
                <TableRow key={detalle.id}>
                  <TableCell className="font-medium">{detalle.nombre}</TableCell>
                  <TableCell className="text-right font-mono">{detalle.totalGuardias}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
