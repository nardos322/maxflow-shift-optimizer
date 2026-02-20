import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DashboardPage } from './DashboardPage'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/hooks/useAuthStore', () => ({
  useAuthStore: (selector: (state: { user: { rol: string } }) => unknown) =>
    selector({ user: { rol: 'ADMIN' } }),
}))

vi.mock('@/services/reportes.service', () => ({
  reportesService: {
    getReporteEquidad: vi.fn().mockResolvedValue({
      estadisticasGlobales: {
        medicosActivos: 10,
        totalGuardias: 20,
        promedioPorMedico: 2,
        desviacionEstandar: 0,
        totalTurnosRequeridos: 20,
        turnosSinCobertura: 0,
        coberturaPorcentaje: 100,
      },
    }),
  },
}))

vi.mock('@/services/audit.service', () => ({
  auditService: {
    getLogs: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('@/services/periodos.service', () => ({
  periodosService: {
    getAll: vi.fn().mockResolvedValue([]),
  },
}))

const renderDashboardPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('DashboardPage', () => {
  it('renders dashboard correctly', () => {
    renderDashboardPage()

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Total Médicos')).toBeInTheDocument()
    expect(screen.getByText('Guardias Asignadas')).toBeInTheDocument()
    expect(screen.getByText('Cobertura')).toBeInTheDocument()
    expect(screen.getByText('Conflictos')).toBeInTheDocument()
    expect(screen.getByText('Actividad Reciente')).toBeInTheDocument()
    expect(screen.getByText('Próximos Feriados')).toBeInTheDocument()
  })
})
