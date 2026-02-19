import type { AuthResponse } from "@/types/auth";
import { useAuthStore } from "@/hooks/useAuthStore";

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
            const error = await response.json();
            throw new Error(error.error || 'Error al iniciar sesión');
        }

        return response.json();
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
            const error = await response.json();
            throw new Error(error.error || 'Error al registrarse');
        }

        return response.json();
    },
};
