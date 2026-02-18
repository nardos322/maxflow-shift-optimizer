import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DashboardPage } from '../DashboardPage'
import { BrowserRouter } from 'react-router-dom'

describe('DashboardPage', () => {
  it('renders dashboard correctly', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

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
