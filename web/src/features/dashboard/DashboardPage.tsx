import { useQueries } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Building2, CreditCard, AlertTriangle, CalendarDays, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { getResidences } from '@/api/residences'
import { getPaiements } from '@/api/paiements'
import { getSignalements } from '@/api/signalements'
import { getAssemblees } from '@/api/assemblees'
import { formatMontant, formatDate, formatDateTime } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'

export function DashboardPage() {
  const { user } = useAuthStore()
  const firstName = user?.email?.split('@')[0] ?? 'Agent'

  const [residencesQ, paiementsQ, signalementsQ, assQ] = useQueries({
    queries: [
      { queryKey: ['residences'], queryFn: getResidences },
      { queryKey: ['paiements', 'en_attente'], queryFn: () => getPaiements({ statut: 'en_attente' }) },
      { queryKey: ['signalements', 'ouverts'], queryFn: () => getSignalements({ statut: 'recu' }) },
      { queryKey: ['assemblees'], queryFn: () => getAssemblees() },
    ],
  })

  const prochaine = assQ.data
    ?.filter(a => a.statut === 'planifiee' && new Date(a.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

  const kpis = [
    {
      label: 'Résidences gérées',
      value: residencesQ.data?.length ?? 0,
      icon: Building2,
      color: 'text-primary-500',
      bg: 'bg-primary-50',
      href: '/residences',
    },
    {
      label: 'Paiements en attente',
      value: paiementsQ.data?.length ?? 0,
      icon: CreditCard,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      href: '/paiements',
    },
    {
      label: 'Signalements ouverts',
      value: signalementsQ.data?.length ?? 0,
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-50',
      href: '/signalements',
    },
    {
      label: 'Prochaine AG',
      value: prochaine ? formatDate(prochaine.date) : '—',
      icon: CalendarDays,
      color: 'text-info',
      bg: 'bg-info-light',
      href: '/assemblees',
    },
  ]

  const isLoading = residencesQ.isLoading || paiementsQ.isLoading

  return (
    <div>
      <PageHeader title={`Bonjour, ${firstName}`} description="Voici un aperçu de l'activité du syndic" />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {kpis.map((kpi) => (
          <Link key={kpi.label} to={kpi.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">{kpi.label}</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <p className="text-2xl font-bold text-neutral-900">{kpi.value}</p>
                    )}
                  </div>
                  <div className={`rounded-lg p-2 ${kpi.bg}`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Paiements en attente */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
            <CardTitle className="text-base">Derniers paiements en attente</CardTitle>
            <Link to="/paiements" className="flex items-center gap-1 text-xs text-primary-500 hover:underline">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            {paiementsQ.isLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : paiementsQ.data?.length === 0 ? (
              <p className="text-sm text-neutral-400 py-4 text-center">Aucun paiement en attente</p>
            ) : (
              <div className="space-y-2">
                {paiementsQ.data?.slice(0, 5).map(p => (
                  <Link key={p.id} to={`/paiements/${p.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-neutral-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{formatMontant(p.montant)}</p>
                      <p className="text-xs text-neutral-400">{formatDate(p.createdAt)}</p>
                    </div>
                    <StatusBadge status={p.statut} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signalements récents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
            <CardTitle className="text-base">Derniers signalements</CardTitle>
            <Link to="/signalements" className="flex items-center gap-1 text-xs text-primary-500 hover:underline">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            {signalementsQ.isLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : signalementsQ.data?.length === 0 ? (
              <p className="text-sm text-neutral-400 py-4 text-center">Aucun signalement en cours</p>
            ) : (
              <div className="space-y-2">
                {signalementsQ.data?.slice(0, 5).map(s => (
                  <Link key={s.id} to={`/signalements/${s.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-neutral-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-neutral-900 truncate max-w-[180px]">{s.titre}</p>
                      <p className="text-xs text-neutral-400">{formatDateTime(s.createdAt)}</p>
                    </div>
                    <StatusBadge status={s.statut} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
