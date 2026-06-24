import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Search, Mail, Pencil, UserX, Send, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatDate } from '@/lib/utils'
import {
  getResidents, createResident, updateResident, deactivateResident, inviteResident,
  type ResidentResponse, type InvitationResponse,
} from '@/api/copropietaires'

const schema = z.object({
  lastName: z.string().min(2, 'Nom requis'),
  firstName: z.string().min(2, 'Prénom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  residentType: z.enum(['proprietaire', 'locataire']),
})
type FormValues = z.infer<typeof schema>

const defaultValues: FormValues = { lastName: '', firstName: '', email: '', phone: '', residentType: 'proprietaire' }

export function CopropietairesPage() {
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<ResidentResponse | null>(null)
  const [deactivateItem, setDeactivateItem] = useState<ResidentResponse | null>(null)
  const [inviteResult, setInviteResult] = useState<InvitationResponse | null>(null)
  const [pendingInviteId, setPendingInviteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { data: residents, isLoading } = useQuery({ queryKey: ['residents'], queryFn: getResidents })

  const createForm = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues })
  const editForm = useForm<FormValues>({ resolver: zodResolver(schema) })

  const { mutate: mutateCreate, isPending: pendingCreate } = useMutation({
    mutationFn: createResident,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['residents'] })
      toast.success('Résident créé')
      setCreateOpen(false)
      createForm.reset(defaultValues)
    },
    onError: () => toast.error('Erreur lors de la création'),
  })

  const { mutate: mutateUpdate, isPending: pendingUpdate } = useMutation({
    mutationFn: (v: FormValues) => updateResident(editItem!.id, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['residents'] })
      toast.success('Résident modifié')
      setEditItem(null)
    },
    onError: () => toast.error('Erreur lors de la modification'),
  })

  const { mutate: mutateDeactivate, isPending: pendingDeactivate } = useMutation({
    mutationFn: (id: string) => deactivateResident(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['residents'] })
      toast.success('Résident désactivé')
      setDeactivateItem(null)
    },
    onError: () => toast.error('Erreur lors de la désactivation'),
  })

  const { mutate: mutateInvite } = useMutation({
    mutationFn: (id: string) => inviteResident(id),
    onSuccess: (data) => { setPendingInviteId(null); setInviteResult(data) },
    onError: () => { setPendingInviteId(null); toast.error('Erreur lors de l\'invitation') },
  })

  function openEdit(r: ResidentResponse) {
    setEditItem(r)
    editForm.reset({ lastName: r.lastName, firstName: r.firstName, email: r.email, phone: r.phone ?? '', residentType: r.type as 'proprietaire' | 'locataire' })
  }

  function handleInvite(r: ResidentResponse) {
    setPendingInviteId(r.id)
    mutateInvite(r.id)
  }

  const filtered = residents?.filter(r =>
    `${r.lastName} ${r.firstName} ${r.email}`.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const ResidentFormFields = ({ control }: { control: any }) => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField control={control} name="lastName" render={({ field }) => (
          <FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="Alami" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={control} name="firstName" render={({ field }) => (
          <FormItem><FormLabel>Prénom</FormLabel><FormControl><Input placeholder="Mohammed" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>
      <FormField control={control} name="email" render={({ field }) => (
        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="m.alami@email.ma" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name="phone" render={({ field }) => (
        <FormItem><FormLabel>Téléphone</FormLabel><FormControl><Input placeholder="+212 6XX XXX XXX" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name="residentType" render={({ field }) => (
        <FormItem><FormLabel>Type</FormLabel>
          <FormControl>
            <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="proprietaire">Propriétaire</option>
              <option value="locataire">Locataire</option>
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </>
  )

  return (
    <div>
      <PageHeader
        title="Copropriétaires"
        description="Annuaire des résidents et copropriétaires"
        action={
          <Button onClick={() => { setCreateOpen(true); createForm.reset(defaultValues) }}>
            <Plus className="mr-2 h-4 w-4" /> Nouveau
          </Button>
        }
      />

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Rechercher par nom, prénom ou email..."
          className="pl-10"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucun copropriétaire"
          description="Commencez par créer un copropriétaire ou modifier votre recherche."
          action={{ label: 'Créer', onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Compte</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id} className={r.status === 'inactif' ? 'opacity-60' : ''}>
                  <TableCell className="font-medium">{r.lastName} {r.firstName}</TableCell>
                  <TableCell className="text-neutral-500">{r.email}</TableCell>
                  <TableCell className="text-neutral-500">{r.phone ?? '—'}</TableCell>
                  <TableCell><StatusBadge status={r.type} /></TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell>
                    {r.isAccountActivated
                      ? <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="h-3.5 w-3.5" />Activé</span>
                      : <span className="flex items-center gap-1 text-xs text-neutral-400"><XCircle className="h-3.5 w-3.5" />Non activé</span>
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Email" asChild>
                        <a href={`mailto:${r.email}`}><Mail className="h-3.5 w-3.5" /></a>
                      </Button>
                      {!r.isAccountActivated && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-600" title="Envoyer invitation"
                          disabled={pendingInviteId === r.id} onClick={() => handleInvite(r)}>
                          {pendingInviteId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Modifier" onClick={() => openEdit(r)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {r.status === 'actif' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" title="Désactiver" onClick={() => setDeactivateItem(r)}>
                          <UserX className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal — Créer */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouveau résident</DialogTitle></DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit((v) => mutateCreate(v))} className="space-y-4">
              <ResidentFormFields control={createForm.control} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={pendingCreate}>{pendingCreate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal — Modifier */}
      <Dialog open={editItem !== null} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier le résident</DialogTitle></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((v) => mutateUpdate(v))} className="space-y-4">
              <ResidentFormFields control={editForm.control} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditItem(null)}>Annuler</Button>
                <Button type="submit" disabled={pendingUpdate}>{pendingUpdate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal — Désactiver */}
      <Dialog open={deactivateItem !== null} onOpenChange={() => setDeactivateItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Désactiver le résident</DialogTitle></DialogHeader>
          <p className="text-sm text-neutral-600">
            Le résident <strong>{deactivateItem?.lastName} {deactivateItem?.firstName}</strong> sera marqué inactif.
            Son compte ne sera plus accessible.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateItem(null)}>Annuler</Button>
            <Button variant="destructive" disabled={pendingDeactivate} onClick={() => mutateDeactivate(deactivateItem!.id)}>
              {pendingDeactivate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Désactiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal — Résultat invitation */}
      <Dialog open={inviteResult !== null} onOpenChange={() => setInviteResult(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invitation générée</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              <span className="text-green-800">Invitation créée avec succès</span>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-neutral-500">Email :</span>
                <span className="ml-2 font-medium text-neutral-900">{inviteResult?.email}</span>
              </div>
              <div>
                <span className="text-neutral-500">Expire le :</span>
                <span className="ml-2 font-medium text-neutral-900">{inviteResult?.expiresAt ? formatDate(inviteResult.expiresAt) : '—'}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Token de réinitialisation :</span>
                <div className="rounded bg-neutral-100 border px-3 py-2 text-xs font-mono break-all text-neutral-700 select-all">
                  {inviteResult?.token}
                </div>
              </div>
            </div>
            <p className="text-xs text-neutral-400">Communiquez ce token au résident pour qu'il puisse définir son mot de passe.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setInviteResult(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
