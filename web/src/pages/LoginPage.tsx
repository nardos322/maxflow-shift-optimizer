import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/hooks/useAuthStore";

import { loginBodySchema, type z } from "@maxflow/shared";

type LoginSchemaType = z.infer<typeof loginBodySchema>;

export function LoginPage() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.login);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<LoginSchemaType>({
        resolver: zodResolver(loginBodySchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const mutation = useMutation({
        mutationFn: (values: LoginSchemaType) =>
            authService.login(values.email, values.password),
        onSuccess: (data) => {
            setAuth(data.token, data.user);
            navigate("/");
        },
        onError: (err: Error) => {
            setError(err.message);
        }
    });

    function onSubmit(values: LoginSchemaType) {
        setError(null);
        mutation.mutate(values);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Users className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
                    <CardDescription className="text-center">
                        Ingresa tus credenciales para acceder al sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="admin@hospital.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {error && (
                                <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                {mutation.isPending ? "Ingresando..." : "Ingresar"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
                    <p>
                        ¿Olvidaste tu contraseña? Contacta al administrador.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
