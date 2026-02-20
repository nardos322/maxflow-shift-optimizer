import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stethoscope } from "lucide-react";
import { updateMedicoBodySchema, type UpdateMedicoBody } from "@maxflow/shared";
import { medicosService } from "@/services/medicos.service";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EditMedicoForm = UpdateMedicoBody;

export function EditMedicoPage() {
  const { id } = useParams<{ id: string }>();
  const medicoId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: medico, isLoading: isLoadingMedico } = useQuery({
    queryKey: ["medicos", medicoId],
    queryFn: () => medicosService.getById(medicoId),
    enabled: !!medicoId,
  });

  const form = useForm<EditMedicoForm>({
    resolver: zodResolver(updateMedicoBodySchema),
    defaultValues: {
      activo: true,
    },
  });
  
  useEffect(() => {
    if (medico) {
      form.reset({
        nombre: medico.nombre,
        email: medico.email,
        activo: medico.activo,
      });
    }
  }, [medico, form]);


  const mutation = useMutation({
    mutationFn: (values: EditMedicoForm) => medicosService.update(medicoId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicos"] });
      navigate("/medicos");
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  function onSubmit(values: EditMedicoForm) {
    setError(null);
    mutation.mutate(values);
  }
  
  if (isLoadingMedico) return <div>Cargando médico...</div>

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                    <Stethoscope className="h-8 w-8 text-blue-600" />
                </div>
            </div>
          <CardTitle className="text-2xl">Editar Médico</CardTitle>
          <CardDescription>
            Actualiza la información del perfil del médico.
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
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="activo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "true")}
                      value={field.value === false ? "false" : "true"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Activo</SelectItem>
                        <SelectItem value="false">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
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
