import { useQuery } from "@tanstack/react-query";
import { reportesService } from "@/services/reportes.service";

export function DashboardPage() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['reporteEquidad'],
        queryFn: reportesService.getReporteEquidad
    });

    const stats = data?.estadisticasGlobales;
    const cobertura = stats ? `${stats.coberturaPorcentaje}%` : undefined;
    const conflictos = stats?.turnosSinCobertura;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

            {isError && (
                 <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md">
                    Error al cargar el dashboard: {error.message}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard
                    title="Total Médicos"
                    value={stats?.medicosActivos}
                    isLoading={isLoading}
                />
                <DashboardCard
                    title="Guardias Asignadas"
                    value={stats?.totalGuardias}
                    isLoading={isLoading}
                />
                <DashboardCard
                    title="Cobertura"
                    value={cobertura}
                    valueClassName="text-green-600"
                    isLoading={isLoading}
                />
                <DashboardCard
                    title="Conflictos"
                    value={conflictos}
                    valueClassName={conflictos && conflictos > 0 ? "text-yellow-600" : "text-green-600"}
                    isLoading={isLoading}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 bg-card p-6 rounded-xl border shadow-sm min-h-[300px]">
                    <h3 className="text-lg font-medium mb-4">Actividad Reciente</h3>
                    <p className="text-muted-foreground text-sm">No hay actividad reciente.</p>
                </div>
                <div className="col-span-3 bg-card p-6 rounded-xl border shadow-sm min-h-[300px]">
                    <h3 className="text-lg font-medium mb-4">Próximos Feriados</h3>
                    <p className="text-muted-foreground text-sm">No hay feriados cargados.</p>
                </div>
            </div>
        </div>
    );
}

interface DashboardCardProps {
    title: string;
    value?: string | number;
    valueClassName?: string;
    isLoading: boolean;
}

function DashboardCard({ title, value, valueClassName, isLoading }: DashboardCardProps) {
    return (
        <div className="p-6 bg-card rounded-xl border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">{title}</div>
            <div className={`text-2xl font-bold ${valueClassName}`}>
                {isLoading ? <span className="text-sm">Cargando...</span> : (value ?? 'N/A')}
            </div>
        </div>
    )
}
