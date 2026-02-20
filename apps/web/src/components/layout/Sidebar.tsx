import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Calculator, Settings, Calendar, FileText } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";

export function Sidebar() {
    const location = useLocation();
    const user = useAuthStore((state) => state.user);

    const getInitials = (email: string | undefined) => {
        if (!email) return "U";
        return email.substring(0, 2).toUpperCase();
    }

    const navItems = [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/medicos", label: "Médicos", icon: Users },
        { href: "/periodos", label: "Períodos", icon: Calendar },
        { href: "/reportes", label: "Reportes", icon: FileText },
        { href: "/solver", label: "Planificador", icon: Calculator },
        { href: "/config", label: "Configuración", icon: Settings },
    ];

    return (
        <aside className="w-64 bg-card border-r min-h-screen flex flex-col">
            <div className="p-6 border-b">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    MaxFlow Shift
                </h1>
                <p className="text-xs text-muted-foreground">Hospital Optimizer</p>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    // Also check for sub-paths
                    const isActive = location.pathname.startsWith(item.href) && (item.href !== '/' || location.pathname === '/');

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
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
