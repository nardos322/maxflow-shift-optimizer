import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Stethoscope } from "lucide-react";

import { createMedicoBodySchema, type CreateMedicoBody } from "@maxflow/shared";

import { medicosService } from "@/services/medicos.service";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Schema importado del shared package
// const createMedicoSchema = z.object({
//   nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
//   email: z.string().email("Email inválido"),
//   password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
// });

type CreateMedicoForm = CreateMedicoBody;

export function CreateMedicoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateMedicoForm>({
    resolver: zodResolver(createMedicoBodySchema),
    defaultValues: {
      nombre: "",
      email: "",
      password: "", // Opcional, backend usa default si esta vacío
    },
  });

  const mutation = useMutation({
    mutationFn: (values: CreateMedicoForm) => medicosService.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicos"] });
      navigate("/medicos");
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  function onSubmit(values: CreateMedicoForm) {
    if (!values.password) delete values.password; // Enviar undefined si está vacío
    setError(null);
    mutation.mutate(values);
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Registrar Nuevo Médico</CardTitle>
          <CardDescription className="text-center">
            Esto creará un perfil de médico y un usuario asociado para ingresar al sistema.
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
                      <Input placeholder="Dr. Juan Pérez" {...field} />
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
                      <Input placeholder="doctor@hospital.com" {...field} />
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
                    <FormLabel>Contraseña (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Por defecto: medico123" {...field} />
                    </FormControl>
                    <FormDescription>
                      Si se deja en blanco, la contraseña será <code>medico123</code>.
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

              <Button type="submit" className="w-full mt-4" disabled={mutation.isPending}>
                {mutation.isPending ? "Registrando..." : "Registrar Médico"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="link" onClick={() => navigate("/medicos")}>
            Volver al listado
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
