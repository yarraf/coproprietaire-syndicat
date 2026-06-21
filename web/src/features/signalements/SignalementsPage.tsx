import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { getSignalements } from '@/api/signalements'
import { formatDateTime } from '@/lib/utils'

export function SignalementsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statutFilter, setstatutFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['signalements', statutFilter],
    queryFn: () => getSignalements(statutFilter ? { statut: statutFilter } : undefined),
  })

  const filtered = data?.filter(s =>
    `${s.titre} ${s.description}`.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  return (
    <div>
      <PageHeader title="Signalements" description="Gérez les réclamations et incidents des résidents" />

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input placeholder="Rechercher..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          value={statutFilter}
          onChange={e => setstatutFilter(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Tous les statuts</option>
          <option value="recu">Reçu</option>
          <option value="en_cours">En cours</option>
          <option value="resolu">Résolu</option>
          <option value="cloture">Clôturé</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Aucun signalement" description="Aucun signalement ne correspond à votre filtre." />
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id} className="cursor-pointer" onClick={() => navigate(`/signalements/${s.id}`)}>
                  <TableCell>
                    <p className="font-medium text-neutral-900">{s.titre}</p>
                    <p className="text-xs text-neutral-400 truncate max-w-xs">{s.description}</p>
                  </TableCell>
                  <TableCell><StatusBadge status={s.type} /></TableCell>
                  <TableCell><StatusBadge status={s.statut} /></TableCell>
                  <TableCell className="text-neutral-400 text-sm">{formatDateTime(s.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); navigate(`/signalements/${s.id}`) }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
