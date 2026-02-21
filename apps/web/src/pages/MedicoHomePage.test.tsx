import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { MedicoHomePage } from './MedicoHomePage';

vi.mock('@/hooks/useAuthStore', () => ({
  useAuthStore: (selector: (state: { user: { nombre: string } }) => unknown) =>
    selector({ user: { nombre: 'Dra. Torres' } }),
}));

describe('MedicoHomePage', () => {
  it('renders medico home content', () => {
    render(
      <BrowserRouter>
        <MedicoHomePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Mi Panel')).toBeInTheDocument();
    expect(screen.getByText(/Dra. Torres/i)).toBeInTheDocument();
    expect(screen.getByText('Próximas funciones para médico')).toBeInTheDocument();
  });
});
