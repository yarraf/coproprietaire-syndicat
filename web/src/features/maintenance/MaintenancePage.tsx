import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Wrench, Calendar, Loader2, Pencil, Trash2, LayoutGrid, List, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { getMaintenances, createMaintenance, updateMaintenance, deleteMaintenance, type MaintenancePlanifiee } from '@/api/maintenance'
import { getResidences } from '@/api/residences'
import { formatDate } from '@/lib/utils'

type View = 'card' | 'list'

const STATUTS = [
  { value: 'a_venir',  label: 'À venir' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'terminee', label: 'Terminée' },
]

const createSchema = z.object({
  residenceId: z.string().min(1, 'Résidence requise'),
  type: z.string().min(2, 'Type requis'),
  libelle: z.string().min(2, 'Libellé requis'),
  datePrevue: z.string().min(1, 'Date prévue requise'),
  recurrence: z.string().optional(),
  visibleResidents: z.boolean(),
})

const editSchema = z.object({
  type: z.string().min(2, 'Type requis'),
  libelle: z.string().min(2, 'Libellé requis'),
  datePrevue: z.string().min(1, 'Date prévue requise'),
  recurrence: z.string().optional(),
  visibleResidents: z.boolean(),
  nouveauStatut: z.string().optional(),
})

type CreateValues = z.infer<typeof createSchema>
type EditValues = z.infer<typeof editSchema>

export function MaintenancePage() {
  const qc = useQueryClient()
  const [view, setView] = useState<View>('card')
  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<MaintenancePlanifiee | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: maintenances, isLoading } = useQuery({ queryKey: ['maintenances'], queryFn: getMaintenances })
  const { data: residences } = useQuery({ queryKey: ['residences'], queryFn: getResidences })

  const filtered = (maintenances ?? []).filter(m => {
    const matchSearch = `${m.libelle} ${m.type}`.toLowerCase().includes(search.toLowerCase())
    const matchStatut = !statutFilter || m.statut === statutFilter
    return matchSearch && matchStatut
  })

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { residenceId: '', type: '', libelle: '', datePrevue: '', recurrence: '', visibleResidents: true },
  })

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
  })

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: createMaintenance,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['maintenances'] }); toast.success('Maintenance planifiée'); setOpenCreate(false); createForm.reset() },
    onError: () => toast.error('Erreur lors de la création'),
  })

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: (v: EditValues) => updateMaintenance(editTarget!.id, v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['maintenances'] }); toast.success('Maintenance mise à jour'); setEditTarget(null) },
    onError: () => toast.error('Erreur lors de la modification'),
  })

  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: () => deleteMaintenance(deleteId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['maintenances'] }); toast.success('Maintenance supprimée'); setDeleteId(null) },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  function openEdit(m: MaintenancePlanifiee) {
    setEditTarget(m)
    editForm.reset({
      type: m.type,
      libelle: m.libelle,
      datePrevue: m.datePrevue.slice(0, 16),
      recurrence: m.recurrence ?? '',
      visibleResidents: m.visibleResidents,
      nouveauStatut: m.statut,
    })
  }

  return (
    <div>
      <PageHeader
        title="Maintenance planifiée"
        description="Planifiez et suivez les interventions de maintenance"
        action={<Button onClick={() => setOpenCreate(true)}><Plus className="mr-2 h-4 w-4" /> Planifier</Button>}
      />

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input placeholder="Rechercher par libellé ou type..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          value={statutFilter}
          onChange={e => setStatutFilter(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Tous les statuts</option>
          <option value="a_venir">À venir</option>
          <option value="en_cours">En cours</option>
          <option value="terminee">Terminée</option>
        </select>
        <div className="flex rounded-md border border-input overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-none ${view === 'card' ? 'bg-neutral-100' : ''}`}
            onClick={() => setView('card')}
            title="Vue cartes"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-none ${view === 'list' ? 'bg-neutral-100' : ''}`}
            onClick={() => setView('list')}
            title="Vue liste"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : !filtered.length ? (
        <EmptyState
          title="Aucune maintenance trouvée"
          description={search || statutFilter ? 'Aucun résultat pour ce filtre.' : 'Planifiez une intervention de maintenance.'}
          action={!search && !statutFilter ? { label: 'Planifier', onClick: () => setOpenCreate(true) } : undefined}
        />
      ) : view === 'card' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(m => (
            <Card key={m.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100">
                    <Wrench className="h-4 w-4 text-neutral-500" />
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusBadge status={m.statut} />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(m)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => setDeleteId(m.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold text-neutral-900 text-sm mb-1">{m.libelle}</h3>
                <p className="text-xs text-neutral-400 mb-3">{m.type}</p>
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(m.datePrevue)}</span>
                </div>
                {m.recurrence && (
                  <p className="text-xs text-neutral-400 mt-1">Récurrence : {m.recurrence}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Libellé</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date prévue</TableHead>
                <TableHead>Récurrence</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium text-neutral-900">{m.libelle}</TableCell>
                  <TableCell className="text-neutral-500 text-sm">{m.type}</TableCell>
                  <TableCell className="text-neutral-500 text-sm">{formatDate(m.datePrevue)}</TableCell>
                  <TableCell className="text-neutral-400 text-sm">{m.recurrence ?? '—'}</TableCell>
                  <TableCell><StatusBadge status={m.statut} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(m)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => setDeleteId(m.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Création */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Planifier une maintenance</DialogTitle></DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit((v) => create(v))} className="space-y-4">
              <FormField control={createForm.control} name="residenceId" render={({ field }) => (
                <FormItem><FormLabel>Résidence</FormLabel>
                  <FormControl>
                    <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                      <option value="">Sélectionner...</option>
                      {residences?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={createForm.control} name="type" render={({ field }) => (
                  <FormItem><FormLabel>Type</FormLabel><FormControl><Input placeholder="Ascenseur, Pompe..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={createForm.control} name="datePrevue" render={({ field }) => (
                  <FormItem><FormLabel>Date prévue</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={createForm.control} name="libelle" render={({ field }) => (
                <FormItem><FormLabel>Libellé</FormLabel><FormControl><Input placeholder="Révision annuelle ascenseur" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={createForm.control} name="recurrence" render={({ field }) => (
                <FormItem><FormLabel>Récurrence (optionnel)</FormLabel><FormControl><Input placeholder="Annuelle, Trimestrielle..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={createForm.control} name="visibleResidents" render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
                  </FormControl>
                  <FormLabel className="!mt-0">Visible par les résidents</FormLabel>
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Annuler</Button>
                <Button type="submit" disabled={creating}>{creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Planifier</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modification */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier la maintenance</DialogTitle></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((v) => update(v))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="type" render={({ field }) => (
                  <FormItem><FormLabel>Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={editForm.control} name="datePrevue" render={({ field }) => (
                  <FormItem><FormLabel>Date prévue</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={editForm.control} name="libelle" render={({ field }) => (
                <FormItem><FormLabel>Libellé</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="recurrence" render={({ field }) => (
                  <FormItem><FormLabel>Récurrence</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={editForm.control} name="nouveauStatut" render={({ field }) => (
                  <FormItem><FormLabel>Statut</FormLabel>
                    <FormControl>
                      <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                        {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={editForm.control} name="visibleResidents" render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
                  </FormControl>
                  <FormLabel className="!mt-0">Visible par les résidents</FormLabel>
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Annuler</Button>
                <Button type="submit" disabled={updating}>{updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Suppression */}
      <ConfirmModal
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null) }}
        title="Supprimer la maintenance"
        description="Cette action est irréversible. La maintenance planifiée sera définitivement supprimée."
        onConfirm={remove}
        loading={deleting}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  )
}
