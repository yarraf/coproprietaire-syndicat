import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FilePreview } from '@/components/shared/FilePreview'
import { getSignalement, updateSignalement } from '@/api/signalements'
import { formatDateTime } from '@/lib/utils'

const schema = z.object({
  statut: z.string().min(1),
  reponse: z.string().optional(),
})

const STATUTS = [
  { value: 'recu',     label: 'Reçu' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'resolu',   label: 'Résolu' },
  { value: 'cloture',  label: 'Clôturé' },
]

export function SignalementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()

  const { data: signalement, isLoading } = useQuery({
    queryKey: ['signalement', id],
    queryFn: () => getSignalement(id!),
  })

  const form = useForm({
    resolver: zodResolver(schema),
    values: { statut: signalement?.statut ?? '', reponse: signalement?.reponse ?? '' },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (v: z.infer<typeof schema>) => updateSignalement(id!, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['signalement', id] })
      qc.invalidateQueries({ queryKey: ['signalements'] })
      toast.success('Signalement mis à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })

  if (isLoading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
  if (!signalement) return <p className="text-neutral-500">Signalement introuvable.</p>

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
        <Link to="/signalements" className="hover:text-primary-500">Signalements</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-neutral-900 font-medium truncate max-w-xs">{signalement.titre}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Description + photo */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>{signalement.titre}</CardTitle>
                <StatusBadge status={signalement.statut} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={signalement.type} />
                <span className="text-xs text-neutral-400">{formatDateTime(signalement.createdAt)}</span>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed">{signalement.description}</p>
            </CardContent>
          </Card>

          {signalement.photoPath && (
            <Card>
              <CardHeader><CardTitle className="text-base">Photo</CardTitle></CardHeader>
              <CardContent>
                <FilePreview path={signalement.photoPath} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <Card>
          <CardHeader><CardTitle>Traitement</CardTitle></CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => mutate(v))} className="space-y-4">
                <FormField control={form.control} name="statut" render={({ field }) => (
                  <FormItem><FormLabel>Statut</FormLabel>
                    <FormControl>
                      <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                        {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="reponse" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Réponse à l'habitant</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="Décrivez les actions entreprises..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Mettre à jour
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
