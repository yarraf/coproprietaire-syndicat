import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ChevronRight, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FilePreview } from '@/components/shared/FilePreview'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { getPaiement, validerPaiement, rejeterPaiement } from '@/api/paiements'
import { getLot } from '@/api/residences'
import { formatMontant, formatDate, formatPeriode } from '@/lib/utils'

const rejetSchema = z.object({
  motifRejet: z.string().min(10, 'Le motif doit comporter au moins 10 caractères'),
})

export function PaiementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [confirmValider, setConfirmValider] = useState(false)
  const [openRejet, setOpenRejet] = useState(false)

  const { data: paiement, isLoading } = useQuery({
    queryKey: ['paiement', id],
    queryFn: () => getPaiement(id!),
  })

  const { data: lot } = useQuery({
    queryKey: ['lot', paiement?.lotId],
    queryFn: () => getLot(paiement!.lotId),
    enabled: !!paiement?.lotId,
  })

  const form = useForm({ resolver: zodResolver(rejetSchema), defaultValues: { motifRejet: '' } })

  const { mutate: valider, isPending: validating } = useMutation({
    mutationFn: () => validerPaiement(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paiements'] })
      qc.invalidateQueries({ queryKey: ['paiement', id] })
      toast.success('Paiement validé')
      setConfirmValider(false)
      navigate('/paiements')
    },
    onError: () => toast.error('Erreur lors de la validation'),
  })

  const { mutate: rejeter, isPending: rejecting } = useMutation({
    mutationFn: ({ motifRejet }: { motifRejet: string }) => rejeterPaiement(id!, motifRejet),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paiements'] })
      toast.success('Paiement rejeté')
      setOpenRejet(false)
      navigate('/paiements')
    },
    onError: () => toast.error('Erreur lors du rejet'),
  })

  if (isLoading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
  if (!paiement) return <p className="text-neutral-500">Paiement introuvable.</p>

  const canAct = paiement.statut === 'en_attente'

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
        <Link to="/paiements" className="hover:text-primary-500">Paiements</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-neutral-900 font-medium">Détail</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Justificatif */}
        <Card>
          <CardHeader><CardTitle>Justificatif</CardTitle></CardHeader>
          <CardContent>
            {paiement.justificatifPath
              ? <FilePreview path={paiement.justificatifPath} />
              : <p className="text-sm text-neutral-400 py-8 text-center">Aucun justificatif joint</p>
            }
          </CardContent>
        </Card>

        {/* Infos */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Statut</span>
                <StatusBadge status={paiement.statut} />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Montant</span>
                <span className="text-lg font-bold text-neutral-900">{formatMontant(paiement.montant)}</span>
              </div>
              {paiement.periode && (
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500">Période</span>
                  <span className="text-sm font-medium">{formatPeriode(paiement.periode)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Soumis le</span>
                <span className="text-sm">{formatDate(paiement.createdAt)}</span>
              </div>
              {lot && (
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500">Solde du lot</span>
                  <span className={`text-sm font-semibold ${lot.solde >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatMontant(lot.solde)}
                  </span>
                </div>
              )}
              {paiement.motifRejet && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3">
                  <p className="text-xs font-medium text-red-700 mb-1">Motif de rejet</p>
                  <p className="text-sm text-red-800">{paiement.motifRejet}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {canAct && (
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-success hover:bg-green-700"
                onClick={() => setConfirmValider(true)}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Valider
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setOpenRejet(true)}
              >
                <XCircle className="mr-2 h-4 w-4" /> Rejeter
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmValider}
        onOpenChange={setConfirmValider}
        title="Valider le paiement"
        description={`Confirmez la validation de ce paiement de ${formatMontant(paiement.montant)} ?`}
        onConfirm={valider}
        loading={validating}
        confirmLabel="Valider"
      />

      <Dialog open={openRejet} onOpenChange={setOpenRejet}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rejeter le paiement</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => rejeter(v))} className="space-y-4">
              <FormField control={form.control} name="motifRejet" render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif de rejet</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Décrivez le motif du rejet..." rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenRejet(false)}>Annuler</Button>
                <Button type="submit" variant="destructive" disabled={rejecting}>
                  {rejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Rejeter
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
