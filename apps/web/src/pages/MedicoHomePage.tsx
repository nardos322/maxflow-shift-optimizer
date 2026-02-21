import { ClipboardCheck, Stethoscope, CalendarClock } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";

export function MedicoHomePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <section className="panel-glass dash-reveal rounded-2xl border border-border/70 p-6">
        <h2 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight md:text-4xl">
          <Stethoscope className="h-8 w-8 text-primary" />
          Mi Panel
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Bienvenido/a, {user?.nombre ?? "Médico"}. Aquí verás tu información operativa y próximas funciones.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel-glass dash-reveal delay-1 rounded-xl border border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Estado de Cuenta</p>
          <p className="mt-2 text-lg font-bold text-primary">Activa</p>
        </div>
        <div className="panel-glass dash-reveal delay-2 rounded-xl border border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Módulo Principal</p>
          <p className="mt-2 text-lg font-bold">Panel Médico</p>
        </div>
        <div className="panel-glass dash-reveal delay-3 rounded-xl border border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Acceso</p>
          <p className="mt-2 text-lg font-bold text-foreground">Solo funciones clínicas</p>
        </div>
      </div>

      <div className="panel-glass dash-reveal delay-2 rounded-xl border border-border/70 p-6">
        <h3 className="text-xl font-bold">Próximas funciones para médico</h3>
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Consulta y gestión de disponibilidad personal.
          </li>
          <li className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            Revisión de guardias asignadas.
          </li>
        </ul>
      </div>
    </div>
  );
}
