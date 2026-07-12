import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, LayoutGrid, List, AlertCircle, MessageSquare, Plus, Pencil, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { getSignalements, createSignalementAgent, deleteSignalement, type Signalement } from '@/api/signalements'
import { useAuthStore } from '@/store/auth'
import { formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'

type View = 'list' | 'card'

interface CreateForm {
  type: string
  titre: string
  description: string
}

const emptyForm: CreateForm = { type: 'incident', titre: '', description: '' }

export function SignalementsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore(s => s.user)

  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [view, setView] = useState<View>('list')

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState<CreateForm>(emptyForm)

  const [deleteTarget, setDeleteTarget] = useState<Signalement | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['signalements', statutFilter],
    queryFn: () => getSignalements(statutFilter ? { statut: statutFilter } : undefined),
  })

  const createMutation = useMutation({
    mutationFn: createSignalementAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signalements'] })
      toast.success('Signalement créé')
      setCreateOpen(false)
      setForm(emptyForm)
    },
    onError: () => toast.error('Erreur lors de la création'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSignalement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signalements'] })
      toast.success('Signalement supprimé')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  const filtered = data?.filter(s =>
    `${s.titre} ${s.description}`.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titre || !form.description) return
    createMutation.mutate({
      type: form.type,
      titre: form.titre,
      description: form.description,
    })
  }

  const isOwner = (s: Signalement) => !!s.createdByUserId && s.createdByUserId === user?.id

  return (
    <div>
      <PageHeader
        title="Signalements"
        description="Gérez les réclamations et incidents des résidents"
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nouveau signalement
          </Button>
        }
      />

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input placeholder="Rechercher..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          value={statutFilter}
          onChange={e => setStatutFilter(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Tous les statuts</option>
          <option value="recu">Reçu</option>
          <option value="en_cours">En cours</option>
          <option value="resolu">Résolu</option>
          <option value="cloture">Clôturé</option>
        </select>
        <div className="flex rounded-md border border-input overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-none ${view === 'list' ? 'bg-neutral-100' : ''}`}
            onClick={() => setView('list')}
            title="Vue liste"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-none ${view === 'card' ? 'bg-neutral-100' : ''}`}
            onClick={() => setView('card')}
            title="Vue cartes"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Aucun signalement" description="Aucun signalement ne correspond à votre filtre." />
      ) : view === 'list' ? (
        <ListView items={filtered} isOwner={isOwner} onOpen={id => navigate(`/signalements/${id}`)} onEdit={id => navigate(`/signalements/${id}`)} onDelete={setDeleteTarget} />
      ) : (
        <CardView items={filtered} isOwner={isOwner} onOpen={id => navigate(`/signalements/${id}`)} onEdit={id => navigate(`/signalements/${id}`)} onDelete={setDeleteTarget} />
      )}

      {/* Modal de création */}
      <Dialog open={createOpen} onOpenChange={open => { setCreateOpen(open); if (!open) setForm(emptyForm) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau signalement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Type *</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="incident">Incident</option>
                <option value="reclamation">Réclamation</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Titre *</label>
              <Input
                required
                value={form.titre}
                onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                placeholder="Titre du signalement"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description *</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Décrivez le problème..."
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Création...' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={open => { if (!open) setDeleteTarget(null) }}
        title="Supprimer le signalement"
        description={`Supprimer « ${deleteTarget?.titre} » ? Cette action est irréversible.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
        variant="danger"
        confirmLabel="Supprimer"
      />
    </div>
  )
}

interface ItemProps {
  items: Signalement[]
  isOwner: (s: Signalement) => boolean
  onOpen: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (s: Signalement) => void
}

function ListView({ items, isOwner, onOpen, onEdit, onDelete }: ItemProps) {
  return (
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
          {items.map(s => (
            <TableRow key={s.id} className="cursor-pointer" onClick={() => onOpen(s.id)}>
              <TableCell>
                <p className="font-medium text-neutral-900">{s.titre}</p>
                <p className="text-xs text-neutral-400 truncate max-w-xs">{s.description}</p>
              </TableCell>
              <TableCell><StatusBadge status={s.type} /></TableCell>
              <TableCell><StatusBadge status={s.statut} /></TableCell>
              <TableCell className="text-neutral-400 text-sm">{formatDateTime(s.createdAt)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); onOpen(s.id) }} title="Voir">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {isOwner(s) && (
                    <>
                      <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); onEdit(s.id) }} title="Modifier">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={e => { e.stopPropagation(); onDelete(s) }} title="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function CardView({ items, isOwner, onOpen, onEdit, onDelete }: ItemProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(s => (
        <Card
          key={s.id}
          className="hover:shadow-sm transition-shadow cursor-pointer"
          onClick={() => onOpen(s.id)}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100">
                {s.type === 'incident'
                  ? <AlertCircle className="h-4 w-4 text-orange-500" />
                  : <MessageSquare className="h-4 w-4 text-blue-500" />
                }
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={s.type} />
                <StatusBadge status={s.statut} />
              </div>
            </div>
            <h3 className="font-semibold text-neutral-900 text-sm mb-1 line-clamp-1">{s.titre}</h3>
            <p className="text-xs text-neutral-400 line-clamp-2 mb-3">{s.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-300">{formatDateTime(s.createdAt)}</p>
              {isOwner(s) && (
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(s.id)} title="Modifier">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => onDelete(s)} title="Supprimer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
