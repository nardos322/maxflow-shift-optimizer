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
export function ReportesPage() {

  const { data: reporte, isLoading } = useQuery({
    queryKey: ["reporteEquidad"],
    queryFn: () => reportesService.getReporteEquidad(),
  });

  const stats = reporte?.estadisticasGlobales;

  if (isLoading) return <div className="text-sm text-muted-foreground">Cargando reporte...</div>;

  return (
    <div className="space-y-6">
      <section className="panel-glass dash-reveal rounded-2xl border border-border/70 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 md:text-4xl">
              <FileText className="h-8 w-8 text-primary" />
            Reporte de Equidad
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Métricas sobre la distribución de guardias entre los médicos.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard className="dash-reveal delay-1" title="Total Guardias" value={stats?.totalGuardias} />
        <MetricCard className="dash-reveal delay-1" title="Médicos Activos" value={stats?.medicosActivos} />
        <MetricCard className="dash-reveal delay-2" title="Promedio / Médico" value={stats?.promedioPorMedico} />
        <MetricCard className="dash-reveal delay-2" title="Desv. Estándar" value={stats?.desviacionEstandar} />
      </div>

      <div className="panel-glass dash-reveal delay-2 rounded-xl border border-border/70">
        <div className="border-b border-border/70 p-6">
          <h3 className="text-xl font-bold">Detalle por Médico</h3>
          <p className="mt-1 text-sm text-muted-foreground">Distribución individual de las guardias asignadas.</p>
        </div>
        <div className="p-6">
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
                  <TableCell className="font-semibold">{detalle.nombre}</TableCell>
                  <TableCell className="text-right font-mono">{detalle.totalGuardias}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, className }: { title: string; value: number | undefined; className?: string }) {
  return (
    <div className={`panel-glass rounded-xl border border-border/70 p-5 ${className ?? ""}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-extrabold">{value ?? "N/A"}</p>
    </div>
  );
}
