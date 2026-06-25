import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Users, CreditCard, CalendarDays,
  AlertTriangle, Wrench, FolderOpen, Settings, LogOut, Building,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/auth'
import { getPaiements } from '@/api/paiements'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { to: '/dashboard',      label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/residences',     label: 'Résidences',       icon: Building2 },
  { to: '/copropietaires', label: 'Copropriétaires',  icon: Users },
  { to: '/paiements',      label: 'Paiements',        icon: CreditCard, badge: true },
  { to: '/assemblees',     label: 'Assemblées',        icon: CalendarDays },
  { to: '/signalements',   label: 'Signalements',     icon: AlertTriangle },
  { to: '/maintenance',    label: 'Maintenance',       icon: Wrench },
  { to: '/documents',      label: 'Documents',         icon: FolderOpen },
  { to: '/parametres',     label: 'Paramètres',        icon: Settings },
]

export function AppLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const { data: paiementsEnAttente } = useQuery({
    queryKey: ['paiements', 'en_attente', 'count'],
    queryFn: () => getPaiements({ statut: 'en_attente' }),
    staleTime: 30_000,
  })
  const pendingCount = paiementsEnAttente?.length ?? 0

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'AG'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col bg-primary-900">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-primary-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 shrink-0">
            <Building className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm leading-tight">Syndic Manager</p>
            <p className="text-[11px] text-primary-300 leading-tight">Back Office</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV_LINKS.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-500/25 text-white'
                    : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && pendingCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-primary-800 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-primary-800 transition-colors">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-xs bg-primary-600 text-white">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-medium text-white truncate">{user?.email}</p>
                  <p className="text-xs text-primary-300">Agent</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/parametres')}>
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
