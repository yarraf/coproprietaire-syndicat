import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ChevronRight, Plus, Building2, Layers, Pencil, Trash2, UserPlus, Users, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatMontant, formatDate } from '@/lib/utils'
import {
  getResidence, getLots, assignResident, terminateLotResident,
  createGroupeHabitation, updateGroupeHabitation, deleteGroupeHabitation,
  createImmeuble, updateImmeuble, deleteImmeuble,
  createLot, updateLot, deleteLot,
  type GroupeHabitationResponse, type ImmeubleResponse, type LotResponse, type LotResidentResponse,
} from '@/api/residences'
import { getResidents } from '@/api/copropietaires'

// ── Schemas ───────────────────────────────────────────────────────────────────
const ghSchema = z.object({ name: z.string().min(2, 'Nom requis') })
const immSchema = z.object({
  blockName: z.string().min(2, 'Nom requis'),
  nbFloors: z.coerce.number().min(1, 'Min 1 étage'),
})
const lotSchema = z.object({
  number: z.string().min(1, 'Numéro requis'),
  lotType: z.enum(['appartement', 'local_commercial']),
  floor: z.coerce.number().min(0),
  area: z.coerce.number().optional(),
})
const assignSchema = z.object({
  residentId: z.string().min(1, 'Résident requis'),
  residentType: z.enum(['proprietaire', 'locataire']),
  startDate: z.string().min(1, 'Date requise'),
})
const terminateSchema = z.object({
  endDate: z.string().min(1, 'Date requise'),
})

type GhValues = z.infer<typeof ghSchema>
type ImmValues = z.infer<typeof immSchema>
type LotValues = z.infer<typeof lotSchema>
type AssignValues = z.infer<typeof assignSchema>
type TerminateValues = z.infer<typeof terminateSchema>

// ── LotSection ────────────────────────────────────────────────────────────────
function LotSection({ immeubleId }: { immeubleId: string }) {
  const qc = useQueryClient()
  const [addLot, setAddLot] = useState(false)
  const [editLot, setEditLot] = useState<LotResponse | null>(null)
  const [assignLot, setAssignLot] = useState<LotResponse | null>(null)
  const [terminateLR, setTerminateLR] = useState<LotResidentResponse | null>(null)

  const { data: lots, isLoading } = useQuery({
    queryKey: ['lots', immeubleId],
    queryFn: () => getLots(immeubleId),
  })
  const { data: residents } = useQuery({
    queryKey: ['residents'],
    queryFn: getResidents,
    enabled: assignLot !== null,
  })

  const lotForm = useForm<LotValues>({ resolver: zodResolver(lotSchema) as Resolver<LotValues>, defaultValues: { number: '', lotType: 'appartement', floor: 0 } })
  const assignForm = useForm<AssignValues>({ resolver: zodResolver(assignSchema), defaultValues: { residentId: '', residentType: 'proprietaire', startDate: new Date().toISOString().split('T')[0] } })
  const terminateForm = useForm<TerminateValues>({ resolver: zodResolver(terminateSchema), defaultValues: { endDate: new Date().toISOString().split('T')[0] } })

  const { mutate: createLotMut, isPending: pendingCreate } = useMutation({
    mutationFn: (v: LotValues) => createLot(immeubleId, v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lots', immeubleId] }); toast.success('Lot créé'); setAddLot(false); lotForm.reset() },
    onError: () => toast.error('Erreur lors de la création'),
  })
  const { mutate: updateLotMut, isPending: pendingUpdate } = useMutation({
    mutationFn: (v: LotValues) => updateLot(editLot!.id, v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lots', immeubleId] }); toast.success('Lot modifié'); setEditLot(null) },
    onError: () => toast.error('Erreur lors de la modification'),
  })
  const { mutate: deleteLotMut } = useMutation({
    mutationFn: (id: string) => deleteLot(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lots', immeubleId] }); toast.success('Lot supprimé') },
    onError: () => toast.error('Suppression impossible — vérifiez qu\'il n\'y a plus d\'affectations actives'),
  })
  const { mutate: assignMut, isPending: pendingAssign } = useMutation({
    mutationFn: (v: AssignValues) => assignResident(assignLot!.id, v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lots', immeubleId] }); toast.success('Résident affecté'); setAssignLot(null); assignForm.reset() },
    onError: () => toast.error('Erreur lors de l\'affectation'),
  })
  const { mutate: terminateMut, isPending: pendingTerminate } = useMutation({
    mutationFn: (v: TerminateValues) => terminateLotResident(terminateLR!.lotId, terminateLR!.id, v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lots', immeubleId] }); toast.success('Affectation terminée'); setTerminateLR(null) },
    onError: () => toast.error('Erreur lors de la résiliation'),
  })

  function openEdit(lot: LotResponse) {
    setEditLot(lot)
    lotForm.reset({ number: lot.number, lotType: lot.lotType as 'appartement' | 'local_commercial', floor: lot.floor, area: lot.area })
  }

  return (
    <div className="mt-3 space-y-2">
      {isLoading ? <Skeleton className="h-12" /> : lots?.length === 0 ? (
        <p className="text-xs text-neutral-400 py-2 pl-1">Aucun lot — ajoutez-en un ci-dessous</p>
      ) : (
        lots?.map(lot => (
          <div key={lot.id} className="rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-xs font-bold text-neutral-600">
                  {lot.number}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-neutral-900">Lot {lot.number}</span>
                    <StatusBadge status={lot.lotType} />
                    <span className="text-xs text-neutral-400">Étage {lot.floor}{lot.area ? ` · ${lot.area} m²` : ''}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-semibold mr-2 ${lot.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatMontant(lot.balance)}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-600" title="Affecter un résident" onClick={() => { setAssignLot(lot); assignForm.reset() }}>
                  <UserPlus className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Modifier" onClick={() => openEdit(lot)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" title="Supprimer" onClick={() => { if (confirm('Supprimer ce lot ?')) deleteLotMut(lot.id) }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {lot.activeResidents.length > 0 && (
              <div className="mt-2 pl-11 space-y-1">
                {lot.activeResidents.map(lr => (
                  <div key={lr.id} className="flex items-center justify-between text-xs rounded bg-neutral-50 px-2 py-1">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Users className="h-3 w-3 text-neutral-400" />
                      <span className="font-medium">{lr.residentFullName}</span>
                      <StatusBadge status={lr.residentType} />
                      <span className="text-neutral-400">depuis {formatDate(lr.startDate)}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-5 text-xs text-red-500 px-2 hover:text-red-600"
                      onClick={() => { setTerminateLR(lr); terminateForm.reset({ endDate: new Date().toISOString().split('T')[0] }) }}>
                      Terminer
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      <Button variant="ghost" size="sm" className="text-xs text-primary-600" onClick={() => { setAddLot(true); lotForm.reset() }}>
        <Plus className="h-3 w-3 mr-1" /> Ajouter un lot
      </Button>

      {/* Modal — Créer lot */}
      <Dialog open={addLot} onOpenChange={setAddLot}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouveau lot</DialogTitle></DialogHeader>
          <Form {...lotForm}>
            <form onSubmit={lotForm.handleSubmit((v) => createLotMut(v))} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={lotForm.control} name="number" render={({ field }) => (
                  <FormItem><FormLabel>Numéro</FormLabel><FormControl><Input placeholder="A01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={lotForm.control} name="lotType" render={({ field }) => (
                  <FormItem><FormLabel>Type</FormLabel>
                    <FormControl>
                      <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                        <option value="appartement">Appartement</option>
                        <option value="local_commercial">Local commercial</option>
                      </select>
                    </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={lotForm.control} name="floor" render={({ field }) => (
                  <FormItem><FormLabel>Étage</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={lotForm.control} name="area" render={({ field }) => (
                  <FormItem><FormLabel>Superficie (m²)</FormLabel><FormControl><Input type="number" min={1} step="0.01" placeholder="50" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddLot(false)}>Annuler</Button>
                <Button type="submit" disabled={pendingCreate}>{pendingCreate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal — Modifier lot */}
      <Dialog open={editLot !== null} onOpenChange={() => setEditLot(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier le lot</DialogTitle></DialogHeader>
          <Form {...lotForm}>
            <form onSubmit={lotForm.handleSubmit((v) => updateLotMut(v))} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={lotForm.control} name="number" render={({ field }) => (
                  <FormItem><FormLabel>Numéro</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={lotForm.control} name="lotType" render={({ field }) => (
                  <FormItem><FormLabel>Type</FormLabel>
                    <FormControl>
                      <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                        <option value="appartement">Appartement</option>
                        <option value="local_commercial">Local commercial</option>
                      </select>
                    </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={lotForm.control} name="floor" render={({ field }) => (
                  <FormItem><FormLabel>Étage</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={lotForm.control} name="area" render={({ field }) => (
                  <FormItem><FormLabel>Superficie (m²)</FormLabel><FormControl><Input type="number" min={1} step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditLot(null)}>Annuler</Button>
                <Button type="submit" disabled={pendingUpdate}>{pendingUpdate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal — Affecter résident */}
      <Dialog open={assignLot !== null} onOpenChange={() => setAssignLot(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Affecter un résident — Lot {assignLot?.number}</DialogTitle></DialogHeader>
          <Form {...assignForm}>
            <form onSubmit={assignForm.handleSubmit((v) => assignMut(v))} className="space-y-3">
              <FormField control={assignForm.control} name="residentId" render={({ field }) => (
                <FormItem><FormLabel>Résident</FormLabel>
                  <FormControl>
                    <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                      <option value="">— Sélectionner —</option>
                      {residents?.map(r => (
                        <option key={r.id} value={r.id}>{r.lastName} {r.firstName} — {r.email}</option>
                      ))}
                    </select>
                  </FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={assignForm.control} name="residentType" render={({ field }) => (
                <FormItem><FormLabel>Type d'occupation</FormLabel>
                  <FormControl>
                    <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                      <option value="proprietaire">Propriétaire</option>
                      <option value="locataire">Locataire</option>
                    </select>
                  </FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={assignForm.control} name="startDate" render={({ field }) => (
                <FormItem><FormLabel>Date de début</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAssignLot(null)}>Annuler</Button>
                <Button type="submit" disabled={pendingAssign}>{pendingAssign && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Affecter</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal — Terminer affectation */}
      <Dialog open={terminateLR !== null} onOpenChange={() => setTerminateLR(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Terminer l'affectation</DialogTitle></DialogHeader>
          <p className="text-sm text-neutral-600">Résident : <strong>{terminateLR?.residentFullName}</strong></p>
          <Form {...terminateForm}>
            <form onSubmit={terminateForm.handleSubmit((v) => terminateMut(v))} className="space-y-3">
              <FormField control={terminateForm.control} name="endDate" render={({ field }) => (
                <FormItem><FormLabel>Date de fin</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setTerminateLR(null)}>Annuler</Button>
                <Button type="submit" variant="destructive" disabled={pendingTerminate}>
                  {pendingTerminate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Confirmer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export function ResidenceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()

  // Modals GH
  const [addGH, setAddGH] = useState(false)
  const [editGH, setEditGH] = useState<GroupeHabitationResponse | null>(null)
  const [deleteGHId, setDeleteGHId] = useState<string | null>(null)
  // Modals Immeuble
  const [addImmInGH, setAddImmInGH] = useState<string | null>(null) // ghId
  const [editImm, setEditImm] = useState<{ imm: ImmeubleResponse; ghId: string } | null>(null)
  const [deleteImm, setDeleteImm] = useState<{ id: string; ghId: string } | null>(null)

  const { data: residence, isLoading, refetch } = useQuery({
    queryKey: ['residence', id],
    queryFn: () => getResidence(id!),
  })

  const ghForm = useForm<GhValues>({ resolver: zodResolver(ghSchema), defaultValues: { name: '' } })
  const immForm = useForm<ImmValues>({ resolver: zodResolver(immSchema) as Resolver<ImmValues>, defaultValues: { blockName: '', nbFloors: 1 } })

  // GH mutations
  const { mutate: createGHMut, isPending: pendingCreateGH } = useMutation({
    mutationFn: (v: GhValues) => createGroupeHabitation(id!, v),
    onSuccess: () => { refetch(); toast.success('Groupe créé'); setAddGH(false); ghForm.reset() },
    onError: () => toast.error('Erreur lors de la création'),
  })
  const { mutate: updateGHMut, isPending: pendingUpdateGH } = useMutation({
    mutationFn: (v: GhValues) => updateGroupeHabitation(id!, editGH!.id, v),
    onSuccess: () => { refetch(); toast.success('Groupe modifié'); setEditGH(null) },
    onError: () => toast.error('Erreur lors de la modification'),
  })
  const { mutate: deleteGHMut, isPending: pendingDeleteGH } = useMutation({
    mutationFn: (ghId: string) => deleteGroupeHabitation(id!, ghId),
    onSuccess: () => { refetch(); toast.success('Groupe supprimé'); setDeleteGHId(null) },
    onError: () => toast.error('Suppression impossible'),
  })

  // Immeuble mutations
  const { mutate: createImmMut, isPending: pendingCreateImm } = useMutation({
    mutationFn: (v: ImmValues) => createImmeuble(id!, addImmInGH!, v),
    onSuccess: () => { refetch(); toast.success('Immeuble créé'); setAddImmInGH(null); immForm.reset() },
    onError: () => toast.error('Erreur lors de la création'),
  })
  const { mutate: updateImmMut, isPending: pendingUpdateImm } = useMutation({
    mutationFn: (v: ImmValues) => updateImmeuble(id!, editImm!.ghId, editImm!.imm.id, v),
    onSuccess: () => { refetch(); toast.success('Immeuble modifié'); setEditImm(null) },
    onError: () => toast.error('Erreur lors de la modification'),
  })
  const { mutate: deleteImmMut, isPending: pendingDeleteImm } = useMutation({
    mutationFn: ({ immId, ghId }: { immId: string; ghId: string }) => deleteImmeuble(id!, ghId, immId),
    onSuccess: () => { refetch(); toast.success('Immeuble supprimé'); setDeleteImm(null) },
    onError: () => toast.error('Suppression impossible'),
  })

  if (isLoading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
  if (!residence) return null

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
        <Link to="/residences" className="hover:text-primary-500">Résidences</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-neutral-900 font-medium">{residence.name}</span>
      </div>

      <PageHeader
        title={residence.name}
        description={`${residence.address}, ${residence.city}`}
        action={
          <Button size="sm" onClick={() => { setAddGH(true); ghForm.reset() }}>
            <Plus className="h-4 w-4 mr-1" /> Groupe d'habitation
          </Button>
        }
      />

      {residence.groupesHabitation.length === 0 && (
        <div className="mt-8 text-center text-sm text-neutral-400">
          Aucun groupe d'habitation — créez-en un pour commencer à ajouter des immeubles.
        </div>
      )}

      <div className="space-y-6 mt-4">
        {residence.groupesHabitation.map(gh => (
          <Card key={gh.id}>
            {/* En-tête GH */}
            <CardHeader className="py-4 px-5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                  <Layers className="h-4 w-4 text-amber-600" />
                </div>
                <CardTitle className="text-base">{gh.name}</CardTitle>
                <span className="text-xs text-neutral-400">{gh.immeubles.length} immeuble(s)</span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setAddImmInGH(gh.id); immForm.reset() }}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditGH(gh); ghForm.reset({ name: gh.name }) }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => setDeleteGHId(gh.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>

            {/* Immeubles dans ce GH */}
            <CardContent className="px-5 pb-5">
              {gh.immeubles.length === 0 ? (
                <p className="text-xs text-neutral-400">Aucun immeuble dans ce groupe.</p>
              ) : (
                <div className="space-y-4">
                  {gh.immeubles.map(imm => (
                    <div key={imm.id} className="rounded-lg border bg-neutral-50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary-600" />
                          <span className="font-medium text-neutral-800">{imm.blockName}</span>
                          <span className="text-xs text-neutral-400">{imm.nbFloors} étage(s)</span>
                          {imm.address && <span className="text-xs text-neutral-400">· {imm.address}</span>}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditImm({ imm, ghId: gh.id }); immForm.reset({ blockName: imm.blockName, nbFloors: imm.nbFloors }) }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => setDeleteImm({ id: imm.id, ghId: gh.id })}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <LotSection immeubleId={imm.id} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal — Créer GH */}
      <Dialog open={addGH} onOpenChange={setAddGH}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouveau groupe d'habitation</DialogTitle></DialogHeader>
          <Form {...ghForm}>
            <form onSubmit={ghForm.handleSubmit((v) => createGHMut(v))} className="space-y-4">
              <FormField control={ghForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="Bloc A" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddGH(false)}>Annuler</Button>
                <Button type="submit" disabled={pendingCreateGH}>{pendingCreateGH && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal — Modifier GH */}
      <Dialog open={editGH !== null} onOpenChange={() => setEditGH(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier le groupe d'habitation</DialogTitle></DialogHeader>
          <Form {...ghForm}>
            <form onSubmit={ghForm.handleSubmit((v) => updateGHMut(v))} className="space-y-4">
              <FormField control={ghForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nom</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditGH(null)}>Annuler</Button>
                <Button type="submit" disabled={pendingUpdateGH}>{pendingUpdateGH && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal — Supprimer GH */}
      <Dialog open={deleteGHId !== null} onOpenChange={() => setDeleteGHId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supprimer le groupe d'habitation</DialogTitle></DialogHeader>
          <p className="text-sm text-neutral-600">Cette action supprimera également tous les immeubles et lots associés. Confirmer ?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteGHId(null)}>Annuler</Button>
            <Button variant="destructive" disabled={pendingDeleteGH} onClick={() => deleteGHMut(deleteGHId!)}>
              {pendingDeleteGH && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal — Ajouter Immeuble */}
      <Dialog open={addImmInGH !== null} onOpenChange={() => setAddImmInGH(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvel immeuble</DialogTitle></DialogHeader>
          <Form {...immForm}>
            <form onSubmit={immForm.handleSubmit((v) => createImmMut(v))} className="space-y-4">
              <FormField control={immForm.control} name="blockName" render={({ field }) => (
                <FormItem><FormLabel>Nom du bloc</FormLabel><FormControl><Input placeholder="Immeuble A" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={immForm.control} name="nbFloors" render={({ field }) => (
                <FormItem><FormLabel>Nombre d'étages</FormLabel><FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddImmInGH(null)}>Annuler</Button>
                <Button type="submit" disabled={pendingCreateImm}>{pendingCreateImm && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal — Modifier Immeuble */}
      <Dialog open={editImm !== null} onOpenChange={() => setEditImm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier l'immeuble</DialogTitle></DialogHeader>
          <Form {...immForm}>
            <form onSubmit={immForm.handleSubmit((v) => updateImmMut(v))} className="space-y-4">
              <FormField control={immForm.control} name="blockName" render={({ field }) => (
                <FormItem><FormLabel>Nom du bloc</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={immForm.control} name="nbFloors" render={({ field }) => (
                <FormItem><FormLabel>Nombre d'étages</FormLabel><FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditImm(null)}>Annuler</Button>
                <Button type="submit" disabled={pendingUpdateImm}>{pendingUpdateImm && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal — Supprimer Immeuble */}
      <Dialog open={deleteImm !== null} onOpenChange={() => setDeleteImm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supprimer l'immeuble</DialogTitle></DialogHeader>
          <p className="text-sm text-neutral-600">Tous les lots associés seront également supprimés. Confirmer ?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteImm(null)}>Annuler</Button>
            <Button variant="destructive" disabled={pendingDeleteImm} onClick={() => deleteImmMut({ immId: deleteImm!.id, ghId: deleteImm!.ghId })}>
              {pendingDeleteImm && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
