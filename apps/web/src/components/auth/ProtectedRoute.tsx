import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/hooks/useAuthStore";

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};
