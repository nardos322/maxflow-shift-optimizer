import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/hooks/useAuthStore";
import { medicosService } from "@/services/medicos.service";

export function useCurrentMedico() {
  const user = useAuthStore((state) => state.user);

  const query = useQuery({
    queryKey: ["medicos", "current", user?.id, user?.email],
    queryFn: async () => {
      const medicos = await medicosService.getAll(false);
      return medicos.find((medico) => medico.userId === user?.id || medico.email === user?.email) ?? null;
    },
    enabled: !!user && user.rol === "MEDICO",
  });

  return {
    medico: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
