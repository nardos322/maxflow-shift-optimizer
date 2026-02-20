import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DashboardPage } from '../DashboardPage'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/services/reportes.service', () => ({
  reportesService: {
    getReporteEquidad: vi.fn().mockResolvedValue({
      estadisticasGlobales: {
        medicosActivos: 10,
        totalGuardias: 20,
      },
    }),
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

    // Verificamos elementos principales
    expect(screen.getByText('Dashboard')).toBeInTheDocument()

    // Verificamos tarjetas de estadísticas (placeholders)
    expect(screen.getByText('Total Médicos')).toBeInTheDocument()
    expect(screen.getByText('Guardias Asignadas')).toBeInTheDocument()
    expect(screen.getByText('Cobertura')).toBeInTheDocument()
    expect(screen.getByText('Conflictos')).toBeInTheDocument()

    // Verificamos secciones de contenido
    expect(screen.getByText('Actividad Reciente')).toBeInTheDocument()
    expect(screen.getByText('Próximos Feriados')).toBeInTheDocument()
  })
})
