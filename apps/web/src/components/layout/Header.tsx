import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/hooks/useAuthStore";
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
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-2 text-muted-foreground">
                {/* Can be a breadcrumb in the future */}
            </div>

            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
        </header>
    );
}
