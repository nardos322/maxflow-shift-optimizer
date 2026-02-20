import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Calculator, Settings, Calendar, FileText } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";

export function Sidebar() {
    const location = useLocation();
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.rol === "ADMIN";

    const getInitials = (email: string | undefined) => {
        if (!email) return "U";
        return email.substring(0, 2).toUpperCase();
    }

    const navItems = isAdmin
        ? [
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/medicos", label: "Médicos", icon: Users },
            { href: "/periodos", label: "Períodos", icon: Calendar },
            { href: "/reportes", label: "Reportes", icon: FileText },
            { href: "/solver", label: "Planificador", icon: Calculator },
            { href: "/config", label: "Configuración", icon: Settings },
          ]
        : [{ href: "/mi-panel", label: "Mi Panel", icon: LayoutDashboard }];

    return (
        <aside className="panel-glass border-b border-border/70 md:min-h-screen md:w-72 md:border-b-0 md:border-r">
            <div className="px-5 pb-4 pt-5 md:px-6 md:pt-7">
                <h1 className="text-2xl font-extrabold tracking-tight text-primary">
                    MaxFlow Shift
                </h1>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">Hospital Optimizer</p>
            </div>

            <nav className="flex gap-2 overflow-x-auto px-4 pb-4 md:block md:space-y-1 md:px-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex min-w-max items-center gap-3 rounded-xl border px-3 py-2 text-sm font-semibold transition-all md:min-w-0",
                                isActive
                                    ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
                                    : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-accent/40 hover:text-foreground"
                            )}
                        >
                            <Icon size={17} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="hidden border-t border-border/70 p-4 md:block">
                <div className="flex items-center gap-3 rounded-xl bg-accent/30 p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                        {getInitials(user?.email)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{user?.nombre ?? 'Usuario'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
