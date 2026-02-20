import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings } from "lucide-react";

import { updateConfiguracionBodySchema, type z } from "@maxflow/shared";
import { configuracionService } from "@/services/configuracion.service";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ConfigForm = z.infer<typeof updateConfiguracionBodySchema>;

export function ConfigPage() {
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const { data: config, isLoading } = useQuery({
        queryKey: ["configuracion"],
        queryFn: () => configuracionService.get(),
    });

    const form = useForm<ConfigForm>({
        resolver: zodResolver(updateConfiguracionBodySchema),
    });

    useEffect(() => {
        if (config) {
            form.reset({
                maxGuardiasTotales: config.maxGuardiasTotales,
                medicosPorDia: config.medicosPorDia,
            });
        }
    }, [config, form]);

    const mutation = useMutation({
        mutationFn: (values: ConfigForm) => configuracionService.update(values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["configuracion"] });
            setSuccess("Configuración actualizada con éxito.");
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    function onSubmit(values: ConfigForm) {
        setError(null);
        setSuccess(null);
        // The schema has optional fields, so we need to convert them to numbers
        const numericValues = {
            maxGuardiasTotales: Number(values.maxGuardiasTotales),
            medicosPorDia: Number(values.medicosPorDia),
        }
        mutation.mutate(numericValues);
    }

    if (isLoading) {
        return <div>Cargando configuración...</div>
    }

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-start">
                <div>
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Settings className="h-8 w-8" />
                    Configuración del Sistema
                </h2>
                <p className="text-muted-foreground mt-1">
                    Ajusta los parámetros globales del planificador.
                </p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Parámetros del Algoritmo</CardTitle>
                    <CardDescription>
                        Estos valores afectan cómo se distribuyen las guardias.
                    </CardDescription>
                </CardHeader>
                 <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="maxGuardiasTotales"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Máximo de Guardias por Médico</FormLabel>
                                    <FormControl>
                                    <Input type="number" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Límite máximo de guardias que un médico puede tener en el periodo total.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="medicosPorDia"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Médicos Requeridos por Día</FormLabel>
                                    <FormControl>
                                     <Input type="number" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Cuántos médicos se necesitan para cubrir la demanda de un día.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            {error && (
                                <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md">
                                {error}
                                </div>
                            )}

                             {success && (
                                <div className="p-3 bg-green-600/15 text-green-700 text-sm rounded-md">
                                {success}
                                </div>
                            )}

                            <Button type="submit" className="mt-4" disabled={mutation.isPending}>
                                {mutation.isPending ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
