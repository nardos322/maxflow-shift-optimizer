import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScenarioLabPage } from "./ScenarioLabPage";
import { periodosService } from "@/services/periodos.service";
import { medicosService } from "@/services/medicos.service";
import { asignacionesService } from "@/services/asignaciones.service";

vi.mock("@/services/periodos.service", () => ({
  periodosService: {
    getAll: vi.fn(),
  },
}));
vi.mock("@/services/medicos.service", () => ({
  medicosService: {
    getAll: vi.fn(),
  },
}));
vi.mock("@/services/asignaciones.service", () => ({
  asignacionesService: {
    simular: vi.fn(),
  },
}));

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScenarioLabPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe("ScenarioLabPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (periodosService.getAll as any).mockResolvedValue([
      {
        id: 11,
        nombre: "Semana Santa",
        fechaInicio: "2026-04-01",
        fechaFin: "2026-04-05",
        feriados: [{ id: 1, fecha: "2026-04-03", descripcion: "Viernes" }],
      },
    ]);
    (medicosService.getAll as any).mockResolvedValue([
      { id: 1, nombre: "Dr. Real", email: "real@test.com", activo: true },
    ]);
    (asignacionesService.simular as any).mockResolvedValue({
      parametros: {
        medicosHipoteticos: 1,
        periodosConsiderados: 1,
        medicosExcluidos: 0,
      },
      resultado: { factible: true },
    });
  });

  it("renders lab and runs simulation with hypothetical doctor", async () => {
    renderComponent();

    await screen.findByText("Laboratorio de Escenarios");
    fireEvent.click(await screen.findByText("Semana Santa"));

    fireEvent.change(screen.getByPlaceholderText("Ej: Dra. Refuerzo"), {
      target: { value: "Dra. Hipotética" },
    });
    fireEvent.click(screen.getByRole("button", { name: /agregar/i }));

    fireEvent.click(screen.getByRole("button", { name: /ejecutar escenario/i }));

    await waitFor(() => {
      expect(asignacionesService.simular).toHaveBeenCalledWith(
        expect.objectContaining({
          periodosIds: [11],
          medicosHipoteticos: expect.arrayContaining([
            expect.objectContaining({ nombre: "Dra. Hipotética" }),
          ]),
        })
      );
    });

    expect(await screen.findByText("FACTIBLE")).toBeInTheDocument();
  });

  it("sends specific availability dates for hypothetical doctor when configured", async () => {
    renderComponent();

    await screen.findByText("Laboratorio de Escenarios");
    fireEvent.click(await screen.findByText("Semana Santa"));

    fireEvent.change(screen.getByPlaceholderText("Ej: Dra. Refuerzo"), {
      target: { value: "Dra. Fecha" },
    });
    fireEvent.click(screen.getByRole("button", { name: /agregar/i }));

    fireEvent.click(screen.getByRole("button", { name: /días específicos/i }));
    fireEvent.click(screen.getByRole("button", { name: "toggle-date-2026-04-03" }));

    fireEvent.click(screen.getByRole("button", { name: /ejecutar escenario/i }));

    await waitFor(() => {
      expect(asignacionesService.simular).toHaveBeenCalledWith(
        expect.objectContaining({
          medicosHipoteticos: expect.arrayContaining([
            expect.objectContaining({
              nombre: "Dra. Fecha",
              disponibilidadFechas: expect.arrayContaining(["2026-04-03"]),
            }),
          ]),
        })
      );
    });
  });
});
