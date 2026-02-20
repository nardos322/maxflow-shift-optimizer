import { useQuery } from "@tanstack/react-query";
import { reportesService } from "@/services/reportes.service";
import { auditService } from "@/services/audit.service";
import { periodosService } from "@/services/periodos.service";
import { useAuthStore } from "@/hooks/useAuthStore";

export function DashboardPage() {
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.rol === "ADMIN";

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['reporteEquidad'],
        queryFn: reportesService.getReporteEquidad
    });
    const { data: activityLogs, isLoading: isLoadingActivity } = useQuery({
        queryKey: ["activityLogs"],
        queryFn: () => auditService.getLogs(),
        enabled: isAdmin,
    });
    const { data: upcomingHolidays, isLoading: isLoadingHolidays } = useQuery({
        queryKey: ["upcomingHolidays"],
        queryFn: async () => {
            const periodos = await periodosService.getAll();
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            return periodos
                .flatMap((periodo) =>
                    (periodo.feriados ?? []).map((feriado) => ({
                        id: feriado.id,
                        fecha: feriado.fecha,
                        descripcion: feriado.descripcion,
                        periodoNombre: periodo.nombre,
                    }))
                )
                .filter((item) => new Date(item.fecha) >= now)
                .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                .slice(0, 5);
        },
    });

    const stats = data?.estadisticasGlobales;
    const cobertura = stats ? `${stats.coberturaPorcentaje}%` : undefined;
    const hasRunSolver = (stats?.totalGuardias ?? 0) > 0;
    const conflictos = hasRunSolver ? stats?.turnosSinCobertura : "Sin ejecutar";

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
                    valueClassName={
                        typeof conflictos === "number"
                            ? (conflictos > 0 ? "text-yellow-600" : "text-green-600")
                            : "text-muted-foreground"
                    }
                    isLoading={isLoading}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 bg-card p-6 rounded-xl border shadow-sm min-h-[300px]">
                    <h3 className="text-lg font-medium mb-4">Actividad Reciente</h3>
                    {!isAdmin && (
                        <p className="text-muted-foreground text-sm">
                            Disponible solo para administradores.
                        </p>
                    )}
                    {isAdmin && isLoadingActivity && (
                        <p className="text-muted-foreground text-sm">Cargando actividad reciente...</p>
                    )}
                    {isAdmin && !isLoadingActivity && (activityLogs?.length ?? 0) === 0 && (
                        <p className="text-muted-foreground text-sm">No hay actividad reciente.</p>
                    )}
                    {isAdmin && !isLoadingActivity && (activityLogs?.length ?? 0) > 0 && (
                        <ul className="space-y-2">
                            {activityLogs!.map((log) => (
                                <li key={log.id} className="text-sm">
                                    <span className="font-medium">{log.accion}</span>{" "}
                                    <span className="text-muted-foreground">por {log.usuario} · {new Date(log.createdAt).toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="col-span-3 bg-card p-6 rounded-xl border shadow-sm min-h-[300px]">
                    <h3 className="text-lg font-medium mb-4">Próximos Feriados</h3>
                    {isLoadingHolidays && (
                        <p className="text-muted-foreground text-sm">Cargando próximos feriados...</p>
                    )}
                    {!isLoadingHolidays && (upcomingHolidays?.length ?? 0) === 0 && (
                        <p className="text-muted-foreground text-sm">No hay feriados cargados.</p>
                    )}
                    {!isLoadingHolidays && (upcomingHolidays?.length ?? 0) > 0 && (
                        <ul className="space-y-2">
                            {upcomingHolidays!.map((holiday) => (
                                <li key={holiday.id} className="text-sm">
                                    <span className="font-medium">{new Date(holiday.fecha).toLocaleDateString()}</span>{" "}
                                    <span className="text-muted-foreground">· {holiday.descripcion} ({holiday.periodoNombre})</span>
                                </li>
                            ))}
                        </ul>
                    )}
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
