import type { AuthResponse } from "@/types/auth";
import { useAuthStore } from "@/hooks/useAuthStore";
import { parseApiError, readApiBody } from "./apiError";

export const authService = {
    getToken(): string | null {
        return useAuthStore.getState().token;
    },

    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            throw await parseApiError(response, "Error al iniciar sesión");
        }

        const body = await readApiBody(response);
        if (!body || typeof body !== "object") {
            throw new Error("Respuesta inválida del servidor");
        }

        return body as AuthResponse;
    },

    async register(data: unknown): Promise<AuthResponse> {
        const token = useAuthStore.getState().token;
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw await parseApiError(response, "Error al registrarse");
        }

        const body = await readApiBody(response);
        if (!body || typeof body !== "object") {
            throw new Error("Respuesta inválida del servidor");
        }

        return body as AuthResponse;
    },
};
