import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, MapPin, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { getResidences, createResidence } from '@/api/residences'

const schema = z.object({
  name: z.string().min(2, 'Le nom est requis'),
  address: z.string().min(5, "L'adresse est requise"),
  city: z.string().min(2, 'La ville est requise'),
})
type FormValues = z.infer<typeof schema>

export function ResidenceListPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data: residences, isLoading } = useQuery({
    queryKey: ['residences'],
    queryFn: getResidences,
  })

  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  const { mutate, isPending } = useMutation({
    mutationFn: createResidence,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['residences'] })
      toast.success('Résidence créée')
      setOpen(false)
      form.reset()
    },
    onError: () => toast.error('Erreur lors de la création'),
  })

  return (
    <div>
      <PageHeader
        title="Résidences"
        description="Gérez vos résidences et leur arborescence"
        action={
          <Button onClick={() => setOpen(true)}>
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
          action={{ label: 'Créer une résidence', onClick: () => setOpen(true) }}
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
                <div className="mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 mb-3">
                    <span className="text-lg font-bold text-primary-600">{r.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <h3 className="font-semibold text-neutral-900">{r.name}</h3>
                </div>
                <div className="flex items-center gap-1 text-sm text-neutral-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{r.address}, {r.city}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle résidence</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutate(v))} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl><Input placeholder="Résidence Al Baraka" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl><Input placeholder="123 Avenue Hassan II" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville</FormLabel>
                  <FormControl><Input placeholder="Casablanca" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
