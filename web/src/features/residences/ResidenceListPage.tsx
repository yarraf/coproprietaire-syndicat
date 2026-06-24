import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, MapPin, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { getResidences, createResidence, updateResidence, deleteResidence, type ResidenceResponse } from '@/api/residences'

const schema = z.object({
  name: z.string().min(2, 'Le nom est requis'),
  address: z.string().min(5, "L'adresse est requise"),
  city: z.string().min(2, 'La ville est requise'),
})
type FormValues = z.infer<typeof schema>

export function ResidenceListPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<ResidenceResponse | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: residences, isLoading } = useQuery({
    queryKey: ['residences'],
    queryFn: getResidences,
  })

  const createForm = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', address: '', city: '' } })
  const editForm = useForm<FormValues>({ resolver: zodResolver(schema) })

  const { mutate: mutateCreate, isPending: pendingCreate } = useMutation({
    mutationFn: createResidence,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['residences'] })
      toast.success('Résidence créée')
      setCreateOpen(false)
      createForm.reset()
    },
    onError: () => toast.error('Erreur lors de la création'),
  })

  const { mutate: mutateUpdate, isPending: pendingUpdate } = useMutation({
    mutationFn: (v: FormValues) => updateResidence(editItem!.id, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['residences'] })
      toast.success('Résidence modifiée')
      setEditItem(null)
    },
    onError: () => toast.error('Erreur lors de la modification'),
  })

  const { mutate: mutateDelete, isPending: pendingDelete } = useMutation({
    mutationFn: (id: string) => deleteResidence(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['residences'] })
      toast.success('Résidence supprimée')
      setDeleteId(null)
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  function openEdit(r: ResidenceResponse, e: React.MouseEvent) {
    e.stopPropagation()
    setEditItem(r)
    editForm.reset({ name: r.name, address: r.address, city: r.city })
  }

  return (
    <div>
      <PageHeader
        title="Résidences"
        description="Gérez vos résidences et leur arborescence"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle résidence
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : residences?.length === 0 ? (
        <EmptyState
          title="Aucune résidence"
          description="Commencez par créer votre première résidence."
          action={{ label: 'Créer une résidence', onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {residences?.map(r => (
            <Card
              key={r.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/residences/${r.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 shrink-0">
                    <span className="text-lg font-bold text-primary-600">{r.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => openEdit(r, e)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); setDeleteId(r.id) }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">{r.name}</h3>
                <div className="flex items-center gap-1 text-sm text-neutral-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{r.address}, {r.city}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Créer */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle résidence</DialogTitle></DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit((v) => mutateCreate(v))} className="space-y-4">
              <FormField control={createForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="Résidence Al Baraka" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={createForm.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Adresse</FormLabel><FormControl><Input placeholder="123 Avenue Hassan II" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={createForm.control} name="city" render={({ field }) => (
                <FormItem><FormLabel>Ville</FormLabel><FormControl><Input placeholder="Casablanca" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={pendingCreate}>
                  {pendingCreate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modifier */}
      <Dialog open={editItem !== null} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier la résidence</DialogTitle></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((v) => mutateUpdate(v))} className="space-y-4">
              <FormField control={editForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nom</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Adresse</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="city" render={({ field }) => (
                <FormItem><FormLabel>Ville</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditItem(null)}>Annuler</Button>
                <Button type="submit" disabled={pendingUpdate}>
                  {pendingUpdate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirmer suppression */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supprimer la résidence</DialogTitle></DialogHeader>
          <p className="text-sm text-neutral-600">Cette action supprimera également tous les groupes, immeubles et lots associés. Confirmer ?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button>
            <Button variant="destructive" disabled={pendingDelete} onClick={() => mutateDelete(deleteId!)}>
              {pendingDelete && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
