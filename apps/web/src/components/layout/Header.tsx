import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Bell } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "../ui/button";


export function Header() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Get initials from email
    const getInitials = (email: string | undefined) => {
        if (!email) return "U";
        return email.substring(0, 2).toUpperCase();
    }

    return (
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 px-4 py-3 backdrop-blur-md md:px-8">
            <div className="flex items-center justify-between gap-3">
                <div className="dash-reveal">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Centro de Operaciones</p>
                    <h1 className="text-xl font-bold text-foreground">Panel Clínico</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="hidden rounded-full border border-border/70 md:inline-flex">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-border/70 bg-card/80">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src="" alt={user?.email} />
                                    <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {user?.nombre ?? 'Usuario'}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                Cerrar Sesión
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
