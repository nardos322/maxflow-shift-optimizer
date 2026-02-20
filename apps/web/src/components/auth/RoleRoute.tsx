import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/hooks/useAuthStore";

interface RoleRouteProps {
  allowedRoles: string[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return allowedRoles.includes(user.rol) ? <Outlet /> : <Navigate to="/" replace />;
}
