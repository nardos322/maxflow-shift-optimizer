export function DashboardPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Placeholder cards */}
                <div className="p-6 bg-card rounded-xl border shadow-sm">
                    <div className="text-sm font-medium text-muted-foreground">Total Médicos</div>
                    <div className="text-2xl font-bold">24</div>
                </div>
                <div className="p-6 bg-card rounded-xl border shadow-sm">
                    <div className="text-sm font-medium text-muted-foreground">Guardias Asignadas</div>
                    <div className="text-2xl font-bold">156</div>
                </div>
                <div className="p-6 bg-card rounded-xl border shadow-sm">
                    <div className="text-sm font-medium text-muted-foreground">Cobertura</div>
                    <div className="text-2xl font-bold text-green-600">98%</div>
                </div>
                <div className="p-6 bg-card rounded-xl border shadow-sm">
                    <div className="text-sm font-medium text-muted-foreground">Conflictos</div>
                    <div className="text-2xl font-bold text-yellow-600">2</div>
                </div>
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
