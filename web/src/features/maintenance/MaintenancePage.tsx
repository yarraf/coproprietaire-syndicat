import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Wrench, Calendar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { getMaintenances, createMaintenance } from '@/api/maintenance'
import { getResidences } from '@/api/residences'
import { formatDate } from '@/lib/utils'

const schema = z.object({
  residenceId: z.string().min(1, 'Résidence requise'),
  type: z.string().min(2, 'Type requis'),
  libelle: z.string().min(2, 'Libellé requis'),
  datePrevue: z.string().min(1, 'Date prévue requise'),
  recurrence: z.string().optional(),
  visibleResidents: z.boolean(),
})
type FormValues = z.infer<typeof schema>

export function MaintenancePage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data: maintenances, isLoading } = useQuery({ queryKey: ['maintenances'], queryFn: getMaintenances })
  const { data: residences } = useQuery({ queryKey: ['residences'], queryFn: getResidences })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { residenceId: '', type: '', libelle: '', datePrevue: '', recurrence: '', visibleResidents: true },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: createMaintenance,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['maintenances'] }); toast.success('Maintenance planifiée'); setOpen(false); form.reset() },
    onError: () => toast.error('Erreur lors de la création'),
  })

  return (
    <div>
      <PageHeader
        title="Maintenance planifiée"
        description="Planifiez et suivez les interventions de maintenance"
        action={<Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> Planifier</Button>}
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : maintenances?.length === 0 ? (
        <EmptyState
          title="Aucune maintenance planifiée"
          description="Planifiez une intervention de maintenance."
          action={{ label: 'Planifier', onClick: () => setOpen(true) }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {maintenances?.map(m => (
            <Card key={m.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100">
                    <Wrench className="h-4 w-4 text-neutral-500" />
                  </div>
                  <StatusBadge status={m.statut} />
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
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Planifier une maintenance</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutate(v))} className="space-y-4">
              <FormField control={form.control} name="residenceId" render={({ field }) => (
                <FormItem><FormLabel>Résidence</FormLabel>
                  <FormControl>
                    <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                      <option value="">Sélectionner...</option>
                      {residences?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem><FormLabel>Type</FormLabel><FormControl><Input placeholder="Ascenseur, Pompe..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="datePrevue" render={({ field }) => (
                  <FormItem><FormLabel>Date prévue</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="libelle" render={({ field }) => (
                <FormItem><FormLabel>Libellé</FormLabel><FormControl><Input placeholder="Révision annuelle ascenseur" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="recurrence" render={({ field }) => (
                <FormItem><FormLabel>Récurrence (optionnel)</FormLabel><FormControl><Input placeholder="Annuelle, Trimestrielle..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="visibleResidents" render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
                  </FormControl>
                  <FormLabel className="!mt-0">Visible par les résidents</FormLabel>
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Planifier</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
