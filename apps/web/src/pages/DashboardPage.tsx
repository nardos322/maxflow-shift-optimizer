import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportesService } from "@/services/reportes.service";
import { auditService } from "@/services/audit.service";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function normalizeAuditAction(action: string) {
    return action
        .replace("RESOLVER_TURNOS", "RESOLVER_ASIGNACIONES")
        .replace("REPARAR_TURNOS", "REPARAR_ASIGNACIONES");
}

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
    const { data: guardiasFaltantes, isLoading: isLoadingFaltantes } = useQuery({
        queryKey: ["guardiasFaltantes"],
        queryFn: reportesService.getGuardiasFaltantes,
    });
    const [periodoFilter, setPeriodoFilter] = useState<string>("all");
    const [fromDateFilter, setFromDateFilter] = useState<string>("");
    const [toDateFilter, setToDateFilter] = useState<string>("");
    const [searchFilter, setSearchFilter] = useState<string>("");

    const stats = data?.estadisticasGlobales;
    const cobertura = stats ? `${stats.coberturaPorcentaje}%` : undefined;
    const hasRunSolver = (stats?.totalGuardias ?? 0) > 0;
    const totalFaltantes = (guardiasFaltantes ?? []).reduce((acc, item) => acc + item.faltantes, 0);
    const conflictos = hasRunSolver
        ? (guardiasFaltantes ? totalFaltantes : stats?.turnosSinCobertura)
        : "Sin ejecutar";
    const periodosOptions = useMemo(() => {
        const unique = new Map<number, string>();
        for (const item of guardiasFaltantes ?? []) {
            unique.set(item.periodo.id, item.periodo.nombre);
        }
        return Array.from(unique.entries()).map(([id, nombre]) => ({ id, nombre }));
    }, [guardiasFaltantes]);
    const filteredFaltantes = useMemo(() => {
        const fromTs = fromDateFilter ? new Date(`${fromDateFilter}T00:00:00`).getTime() : null;
        const toTs = toDateFilter ? new Date(`${toDateFilter}T23:59:59`).getTime() : null;
        const search = searchFilter.trim().toLowerCase();

        return (guardiasFaltantes ?? []).filter((item) => {
            if (periodoFilter !== "all" && String(item.periodo.id) !== periodoFilter) {
                return false;
            }

            const itemTs = new Date(item.fecha).getTime();
            if (fromTs !== null && itemTs < fromTs) return false;
            if (toTs !== null && itemTs > toTs) return false;

            if (!search) return true;
            const haystack = `${item.descripcion} ${item.periodo.nombre} ${item.motivo}`.toLowerCase();
            return haystack.includes(search);
        });
    }, [guardiasFaltantes, periodoFilter, fromDateFilter, toDateFilter, searchFilter]);

    return (
        <div className="space-y-6">
            <section className="panel-glass dash-reveal rounded-2xl border border-border/70 p-6">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">Dashboard</h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Estado operativo en tiempo real del sistema de cobertura médica.
                </p>
            </section>

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
                    className="dash-reveal delay-1"
                />
                <DashboardCard
                    title="Guardias Asignadas"
                    value={stats?.totalGuardias}
                    isLoading={isLoading}
                    className="dash-reveal delay-1"
                />
                <DashboardCard
                    title="Cobertura"
                    value={cobertura}
                    valueClassName="text-green-600"
                    isLoading={isLoading}
                    className="dash-reveal delay-2"
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
                    className="dash-reveal delay-2"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="panel-glass dash-reveal delay-2 col-span-4 min-h-[300px] rounded-xl border border-border/70 p-6">
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
                                    <span className="font-medium">{normalizeAuditAction(log.accion)}</span>{" "}
                                    <span className="text-muted-foreground">por {log.usuario} · {new Date(log.createdAt).toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="panel-glass dash-reveal delay-3 col-span-3 min-h-[300px] rounded-xl border border-border/70 p-6">
                    <h3 className="text-lg font-medium mb-4">Guardias Sin Cobertura</h3>
                    <div className="mb-4 grid gap-3">
                        <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los períodos</SelectItem>
                                {periodosOptions.map((periodo) => (
                                    <SelectItem key={periodo.id} value={String(periodo.id)}>
                                        {periodo.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                type="date"
                                value={fromDateFilter}
                                onChange={(event) => setFromDateFilter(event.target.value)}
                                aria-label="Fecha desde"
                            />
                            <Input
                                type="date"
                                value={toDateFilter}
                                onChange={(event) => setToDateFilter(event.target.value)}
                                aria-label="Fecha hasta"
                            />
                        </div>
                        <Input
                            type="search"
                            placeholder="Buscar por descripción o motivo"
                            value={searchFilter}
                            onChange={(event) => setSearchFilter(event.target.value)}
                            aria-label="Buscar guardias faltantes"
                        />
                        <Button
                            variant="outline"
                            onClick={() => {
                                setPeriodoFilter("all");
                                setFromDateFilter("");
                                setToDateFilter("");
                                setSearchFilter("");
                            }}
                        >
                            Limpiar filtros
                        </Button>
                    </div>
                    {isLoadingFaltantes && (
                        <p className="text-muted-foreground text-sm">Cargando guardias faltantes...</p>
                    )}
                    {!isLoadingFaltantes && (guardiasFaltantes?.length ?? 0) === 0 && (
                        <p className="text-muted-foreground text-sm">No hay guardias faltantes.</p>
                    )}
                    {!isLoadingFaltantes && (guardiasFaltantes?.length ?? 0) > 0 && filteredFaltantes.length === 0 && (
                        <p className="text-muted-foreground text-sm">No hay resultados con los filtros seleccionados.</p>
                    )}
                    {!isLoadingFaltantes && filteredFaltantes.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Período</TableHead>
                                    <TableHead>Detalle</TableHead>
                                    <TableHead className="text-right">Cobertura</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFaltantes.map((item) => (
                                    <TableRow key={`${item.periodo.id}-${item.fecha}`}>
                                        <TableCell>{new Date(item.fecha).toLocaleDateString()}</TableCell>
                                        <TableCell>{item.periodo.nombre}</TableCell>
                                        <TableCell>
                                            <p className="font-medium">{item.descripcion}</p>
                                            <p className="text-xs text-muted-foreground">{item.motivo}</p>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.medicosAsignados}/{item.medicosRequeridos}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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
    className?: string;
}

function DashboardCard({ title, value, valueClassName, isLoading, className }: DashboardCardProps) {
    return (
        <div className={`panel-glass rounded-xl border border-border/70 p-6 ${className ?? ""}`}>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</div>
            <div className={`text-2xl font-bold ${valueClassName}`}>
                {isLoading ? <span className="text-sm">Cargando...</span> : (value ?? 'N/A')}
            </div>
        </div>
    )
}
