import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { LoginPage } from '@/features/auth/LoginPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ResidenceListPage } from '@/features/residences/ResidenceListPage'
import { ResidenceDetailPage } from '@/features/residences/ResidenceDetailPage'
import { CopropietairesPage } from '@/features/copropietaires/CopropietairesPage'
import { PaiementsPage } from '@/features/paiements/PaiementsPage'
import { PaiementDetailPage } from '@/features/paiements/PaiementDetailPage'
import { AjustementSoldePage } from '@/features/paiements/AjustementSoldePage'
import { AssembleesPage } from '@/features/assemblees/AssembleesPage'
import { SignalementsPage } from '@/features/signalements/SignalementsPage'
import { SignalementDetailPage } from '@/features/signalements/SignalementDetailPage'
import { MaintenancePage } from '@/features/maintenance/MaintenancePage'
import { GedPage } from '@/features/ged/GedPage'
import { ParametresPage } from '@/features/parametres/ParametresPage'
import { useAuthStore } from '@/store/auth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore()
  if (!accessToken) return <Navigate to="/login" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard',          element: <DashboardPage /> },
      { path: 'residences',         element: <ResidenceListPage /> },
      { path: 'residences/:id',     element: <ResidenceDetailPage /> },
      { path: 'copropietaires',     element: <CopropietairesPage /> },
      { path: 'paiements',          element: <PaiementsPage /> },
      { path: 'paiements/ajustement', element: <AjustementSoldePage /> },
      { path: 'paiements/:id',      element: <PaiementDetailPage /> },
      { path: 'assemblees',         element: <AssembleesPage /> },
      { path: 'signalements',       element: <SignalementsPage /> },
      { path: 'signalements/:id',   element: <SignalementDetailPage /> },
      { path: 'maintenance',        element: <MaintenancePage /> },
      { path: 'documents',          element: <GedPage /> },
      { path: 'parametres',         element: <ParametresPage /> },
    ],
  },
])
