import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCog } from "lucide-react";
import { updatePeriodoBodySchema, type z } from "@maxflow/shared";
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

type EditPeriodoForm = z.infer<typeof updatePeriodoBodySchema>;

export function EditPeriodoPage() {
    const { id } = useParams<{ id: string }>();
    const periodoId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);

    const { data: periodo, isLoading } = useQuery({
        queryKey: ["periodos", periodoId],
        queryFn: () => periodosService.getById(periodoId),
        enabled: !!periodoId,
    });

    const form = useForm<EditPeriodoForm>({
        resolver: zodResolver(updatePeriodoBodySchema),
    });

    useEffect(() => {
        if (periodo) {
            form.reset({
                nombre: periodo.nombre,
                fechaInicio: new Date(periodo.fechaInicio),
                fechaFin: new Date(periodo.fechaFin),
            });
        }
    }, [periodo, form]);

    const mutation = useMutation({
        mutationFn: (values: EditPeriodoForm) => periodosService.update(periodoId, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["periodos"] });
            navigate("/periodos");
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    function onSubmit(values: EditPeriodoForm) {
        setError(null);
        mutation.mutate(values);
    }
    
    if (isLoading) return <div>Cargando período...</div>;

    return (
        <div className="flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                      <CalendarCog className="h-8 w-8 text-blue-600" />
                  </div>
              </div>
            <CardTitle className="text-2xl">Editar Período</CardTitle>
            <CardDescription>
                Actualiza los detalles del período de planificación.
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
                      <Input {...field} />
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
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                        onChange={e => field.onChange(new Date(e.target.value))}
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
                         value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                         onChange={e => field.onChange(new Date(e.target.value))}
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
                  {mutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
}
