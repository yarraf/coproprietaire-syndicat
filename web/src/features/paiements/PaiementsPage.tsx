import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FileThumbnail } from '@/components/shared/FilePreview'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { getPaiements } from '@/api/paiements'
import { formatMontant, formatDate, formatPeriode } from '@/lib/utils'

function PaiementTable({ statut }: { statut?: string }) {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['paiements', statut ?? 'all'],
    queryFn: () => getPaiements(statut ? { statut } : undefined),
  })

  if (isLoading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
  if (!data || data.length === 0) return <EmptyState title="Aucun paiement" description="Aucun paiement pour ce filtre." />

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Justificatif</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Période</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(p => (
            <TableRow key={p.id} className="cursor-pointer" onClick={() => navigate(`/paiements/${p.id}`)}>
              <TableCell>
                {p.justificatifPath
                  ? <FileThumbnail path={p.justificatifPath} />
                  : <span className="text-neutral-300 text-xs">—</span>
                }
              </TableCell>
              <TableCell className="font-semibold">{formatMontant(p.montant)}</TableCell>
              <TableCell className="text-neutral-500">{p.periode ? formatPeriode(p.periode) : '—'}</TableCell>
              <TableCell className="text-neutral-500">{formatDate(p.createdAt)}</TableCell>
              <TableCell><StatusBadge status={p.statut} /></TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); navigate(`/paiements/${p.id}`) }}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function PaiementsPage() {
  return (
    <div>
      <PageHeader
        title="Paiements"
        description="Validez les paiements et gérez les ajustements de solde"
        action={
          <Button asChild variant="outline">
            <Link to="/paiements/ajustement">Ajustement de solde</Link>
          </Button>
        }
      />

      <Tabs defaultValue="en_attente">
        <TabsList className="mb-4">
          <TabsTrigger value="en_attente">En attente</TabsTrigger>
          <TabsTrigger value="valide">Validés</TabsTrigger>
          <TabsTrigger value="rejete">Rejetés</TabsTrigger>
          <TabsTrigger value="all">Tous</TabsTrigger>
        </TabsList>
        <TabsContent value="en_attente"><PaiementTable statut="en_attente" /></TabsContent>
        <TabsContent value="valide"><PaiementTable statut="valide" /></TabsContent>
        <TabsContent value="rejete"><PaiementTable statut="rejete" /></TabsContent>
        <TabsContent value="all"><PaiementTable /></TabsContent>
      </Tabs>
    </div>
  )
}
