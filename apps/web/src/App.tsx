import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { CreateUserPage } from '@/pages/admin/CreateUserPage'
import { MedicosListPage } from '@/pages/admin/medicos/MedicosListPage'
import { CreateMedicoPage } from '@/pages/admin/medicos/CreateMedicoPage'
import { EditMedicoPage } from '@/pages/admin/medicos/EditMedicoPage'
import { SolverPage } from '@/pages/SolverPage'
import { ConfigPage } from '@/pages/ConfigPage'
import { PeriodosListPage } from '@/pages/admin/periodos/PeriodosListPage'
import { CreatePeriodoPage } from '@/pages/admin/periodos/CreatePeriodoPage'
import { EditPeriodoPage as EditPeriodoPageAlias } from '@/pages/admin/periodos/EditPeriodoPage'
import { ReportesPage } from '@/pages/ReportesPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import './index.css'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/admin/users/new" element={<CreateUserPage />} />

              <Route path="/medicos" element={<MedicosListPage />} />
              <Route path="/medicos/new" element={<CreateMedicoPage />} />
              <Route path="/medicos/:id/edit" element={<EditMedicoPage />} />

              <Route path="/periodos" element={<PeriodosListPage />} />
              <Route path="/periodos/new" element={<CreatePeriodoPage />} />
              <Route path="/periodos/:id/edit" element={<EditPeriodoPageAlias />} />

              <Route path="/reportes" element={<ReportesPage />} />

              <Route path="/solver" element={<SolverPage />} />
              <Route path="/config" element={<ConfigPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter >
    </QueryClientProvider >
  )
}

export default App
