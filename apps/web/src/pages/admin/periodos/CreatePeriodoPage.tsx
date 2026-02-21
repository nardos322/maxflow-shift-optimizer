import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus } from "lucide-react";
import { createPeriodoBodySchema, type z } from "@maxflow/shared";
import { periodosService } from "@/services/periodos.service";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CreatePeriodoForm = z.infer<typeof createPeriodoBodySchema>;

export function CreatePeriodoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreatePeriodoForm>({
    resolver: zodResolver(createPeriodoBodySchema),
    defaultValues: {
      nombre: "",
      fechaInicio: new Date(),
      fechaFin: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days later
    },
  });

  const mutation = useMutation({
    mutationFn: (values: CreatePeriodoForm) => periodosService.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periodos"] });
      navigate("/periodos");
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  function onSubmit(values: CreatePeriodoForm) {
    setError(null);
    mutation.mutate(values);
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                    <CalendarPlus className="h-8 w-8 text-green-600" />
                </div>
            </div>
          <CardTitle className="text-2xl">Crear Nuevo Período</CardTitle>
          <CardDescription>
            Define un nuevo período de tiempo para la planificación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Período</FormLabel>
                    <FormControl>
                      <Input placeholder="Enero 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fechaInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Inicio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} 
                        // The value needs to be formatted as yyyy-mm-dd for the input
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="fechaFin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Fin</FormLabel>
                    <FormControl>
                    <Input type="date" {...field} 
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                     />
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

              <Button type="submit" className="w-full mt-4" disabled={mutation.isPending}>
                {mutation.isPending ? "Creando..." : "Crear Período"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
