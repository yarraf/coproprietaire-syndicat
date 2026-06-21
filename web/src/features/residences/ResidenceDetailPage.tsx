import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ChevronRight, Plus, Building2, Layers, Home, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import {
  getResidence, getGroupesHabitation, getImmeubles, getLots,
  createGroupeHabitation, createImmeuble, createLot,
} from '@/api/residences'
import { formatMontant } from '@/lib/utils'

const ghSchema = z.object({ name: z.string().min(2, 'Nom requis') })
const immSchema = z.object({ name: z.string().min(2, 'Nom requis'), nbFloors: z.coerce.number().min(1) })
const lotSchema = z.object({
  number: z.string().min(1, 'Numéro requis'),
  type: z.string().min(1, 'Type requis'),
  floor: z.coerce.number().min(0),
  area: z.coerce.number().min(1),
})

function LotCard({ lot }: { lot: ReturnType<typeof getLots> extends Promise<infer T> ? T extends Array<infer U> ? U : never : never }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-neutral-50">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-xs font-bold text-neutral-600">
          {lot.number}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-900">Lot {lot.number}</span>
            <StatusBadge status={lot.type} />
          </div>
          <p className="text-xs text-neutral-400">Étage {lot.floor} · {lot.area} m²</p>
        </div>
      </div>
      <span className={`text-sm font-semibold ${lot.solde >= 0 ? 'text-success' : 'text-danger'}`}>
        {formatMontant(lot.solde)}
      </span>
    </div>
  )
}

function ImmeubleSection({ immeubleId, residenceId }: { immeubleId: string; residenceId: string }) {
  const [addLot, setAddLot] = useState(false)
  const qc = useQueryClient()
  const { data: lots, isLoading } = useQuery({
    queryKey: ['lots', immeubleId],
    queryFn: () => getLots(immeubleId),
  })
  const form = useForm({ resolver: zodResolver(lotSchema), defaultValues: { number: '', type: 'appartement', floor: 0, area: 0 } })
  const { mutate, isPending } = useMutation({
    mutationFn: (v: z.infer<typeof lotSchema>) => createLot({ immeubleId, ...v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lots', immeubleId] }); toast.success('Lot créé'); setAddLot(false); form.reset() },
    onError: () => toast.error('Erreur lors de la création du lot'),
  })

  return (
    <div className="mt-3">
      {isLoading ? <Skeleton className="h-12" /> : (
        <div className="space-y-2">
          {lots?.map(l => <LotCard key={l.id} lot={l} />)}
          {lots?.length === 0 && <p className="text-xs text-neutral-400 py-2 pl-1">Aucun lot</p>}
        </div>
      )}
      <Button variant="ghost" size="sm" className="mt-2 text-xs text-primary-600" onClick={() => setAddLot(true)}>
        <Plus className="h-3 w-3 mr-1" /> Ajouter un lot
      </Button>
      <Dialog open={addLot} onOpenChange={setAddLot}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouveau lot</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutate(v))} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="number" render={({ field }) => (
                  <FormItem><FormLabel>Numéro</FormLabel><FormControl><Input placeholder="A01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem><FormLabel>Type</FormLabel>
                    <FormControl>
                      <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                        <option value="appartement">Appartement</option>
                        <option value="local">Local commercial</option>
                        <option value="parking">Parking</option>
                      </select>
                    </FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="floor" render={({ field }) => (
                  <FormItem><FormLabel>Étage</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="area" render={({ field }) => (
                  <FormItem><FormLabel>Superficie (m²)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddLot(false)}>Annuler</Button>
                <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function ResidenceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [addImm, setAddImm] = useState(false)
  const [addGH, setAddGH] = useState(false)

  const { data: residence, isLoading } = useQuery({ queryKey: ['residence', id], queryFn: () => getResidence(id!) })
  const { data: ghs } = useQuery({ queryKey: ['ghs', id], queryFn: () => getGroupesHabitation(id!) })
  const { data: immeubles } = useQuery({ queryKey: ['immeubles', id], queryFn: () => getImmeubles(id!) })

  const ghForm = useForm({ resolver: zodResolver(ghSchema) })
  const immForm = useForm({ resolver: zodResolver(immSchema), defaultValues: { name: '', nbFloors: 1 } })

  const { mutate: createGH, isPending: pendingGH } = useMutation({
    mutationFn: (v: z.infer<typeof ghSchema>) => createGroupeHabitation({ residenceId: id!, ...v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ghs', id] }); toast.success('Groupe créé'); setAddGH(false); ghForm.reset() },
    onError: () => toast.error('Erreur lors de la création'),
  })
  const { mutate: createImm, isPending: pendingImm } = useMutation({
    mutationFn: (v: z.infer<typeof immSchema>) => createImmeuble({ residenceId: id!, ...v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['immeubles', id] }); toast.success('Immeuble créé'); setAddImm(false); immForm.reset() },
    onError: () => toast.error('Erreur lors de la création'),
  })

  if (isLoading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
        <Link to="/residences" className="hover:text-primary-500">Résidences</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-neutral-900 font-medium">{residence?.name}</span>
      </div>

      <PageHeader
        title={residence?.name ?? ''}
        description={`${residence?.address}, ${residence?.city}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setAddGH(true)}>
              <Plus className="h-4 w-4 mr-1" /> Groupe d'habitation
            </Button>
            <Button size="sm" onClick={() => setAddImm(true)}>
              <Plus className="h-4 w-4 mr-1" /> Immeuble
            </Button>
          </div>
        }
      />

      {/* Groupes d'habitation */}
      {ghs && ghs.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4" /> Groupes d'habitation
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ghs.map(gh => (
              <Card key={gh.id} className="bg-neutral-50">
                <CardContent className="p-4">
                  <p className="font-medium text-neutral-800">{gh.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Immeubles + lots */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4" /> Immeubles
        </h2>
        {immeubles?.length === 0 && <p className="text-sm text-neutral-400">Aucun immeuble dans cette résidence.</p>}
        <div className="space-y-4">
          {immeubles?.map(imm => (
            <Card key={imm.id}>
              <CardHeader className="py-4 px-5 flex flex-row items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                  <Home className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <CardTitle className="text-base">{imm.name}</CardTitle>
                  <p className="text-xs text-neutral-400">{imm.nbFloors} étage(s)</p>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <ImmeubleSection immeubleId={imm.id} residenceId={id!} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modales */}
      <Dialog open={addGH} onOpenChange={setAddGH}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouveau groupe d'habitation</DialogTitle></DialogHeader>
          <Form {...ghForm}>
            <form onSubmit={ghForm.handleSubmit((v) => createGH(v))} className="space-y-4">
              <FormField control={ghForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="Bloc A" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddGH(false)}>Annuler</Button>
                <Button type="submit" disabled={pendingGH}>{pendingGH && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={addImm} onOpenChange={setAddImm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvel immeuble</DialogTitle></DialogHeader>
          <Form {...immForm}>
            <form onSubmit={immForm.handleSubmit((v) => createImm(v))} className="space-y-4">
              <FormField control={immForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="Immeuble A" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={immForm.control} name="nbFloors" render={({ field }) => (
                <FormItem><FormLabel>Nombre d'étages</FormLabel><FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddImm(false)}>Annuler</Button>
                <Button type="submit" disabled={pendingImm}>{pendingImm && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
