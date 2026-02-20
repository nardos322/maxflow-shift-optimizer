import type { AuthResponse } from "@/types/auth";
import { useAuthStore } from "@/hooks/useAuthStore";

async function parseResponseBody(response: Response): Promise<unknown> {
    const rawBody = await response.text();
    if (!rawBody) {
        return null;
    }

    try {
        return JSON.parse(rawBody);
    } catch {
        return { error: rawBody };
    }
}

function extractErrorMessage(body: unknown, fallback: string): string {
    if (body && typeof body === "object" && "error" in body) {
        const message = (body as { error?: unknown }).error;
        if (typeof message === "string" && message.trim()) {
            return message;
        }
    }
    return fallback;
}

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

        const body = await parseResponseBody(response);

        if (!response.ok) {
            throw new Error(extractErrorMessage(body, "Error al iniciar sesión"));
        }

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

        const body = await parseResponseBody(response);

        if (!response.ok) {
            throw new Error(extractErrorMessage(body, "Error al registrarse"));
        }

        if (!body || typeof body !== "object") {
            throw new Error("Respuesta inválida del servidor");
        }

        return body as AuthResponse;
    },
};
