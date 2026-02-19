import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { CreateUserPage } from '@/pages/admin/CreateUserPage'
import { MedicosListPage } from '@/pages/admin/medicos/MedicosListPage'
import { CreateMedicoPage } from '@/pages/admin/medicos/CreateMedicoPage'
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

              <Route path="/solver" element={<div>Planificador (Próximamente)</div>} />
              <Route path="/config" element={<div>Configuración (Próximamente)</div>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter >
    </QueryClientProvider >
  )
}

export default App
