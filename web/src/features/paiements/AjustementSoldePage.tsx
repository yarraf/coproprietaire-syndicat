import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getResidences, getImmeubles, getLots } from '@/api/residences'
import { createAjustement, getAjustements } from '@/api/paiements'
import { formatMontant, formatDate, formatPeriode } from '@/lib/utils'

const schema = z.object({
  residenceId: z.string().min(1, 'Résidence requise'),
  immeubleId: z.string().min(1, 'Immeuble requis'),
  lotId: z.string().min(1, 'Lot requis'),
  montant: z.coerce.number().refine(v => v !== 0, 'Le montant ne peut pas être 0'),
  type: z.enum(['charge', 'regularisation']),
  libelle: z.string().min(2, 'Libellé requis'),
  periode: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export function AjustementSoldePage() {
  const qc = useQueryClient()
  const [selectedLotId, setSelectedLotId] = useState<string>('')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { residenceId: '', immeubleId: '', lotId: '', montant: 0, type: 'charge', libelle: '', periode: '' },
  })

  const residenceId = form.watch('residenceId')
  const immeubleId = form.watch('immeubleId')
  const lotId = form.watch('lotId')

  const { data: residences } = useQuery({ queryKey: ['residences'], queryFn: getResidences })
  const { data: immeubles } = useQuery({
    queryKey: ['immeubles', residenceId],
    queryFn: () => getImmeubles(residenceId),
    enabled: !!residenceId,
  })
  const { data: lots } = useQuery({
    queryKey: ['lots', immeubleId],
    queryFn: () => getLots(immeubleId),
    enabled: !!immeubleId,
  })
  const { data: historique, isLoading: loadingHist } = useQuery({
    queryKey: ['ajustements', lotId],
    queryFn: () => getAjustements({ lotId }),
    enabled: !!lotId,
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (v: FormValues) => createAjustement({ lotId: v.lotId, montant: v.montant, type: v.type, libelle: v.libelle, periode: v.periode || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ajustements'] })
      toast.success('Ajustement enregistré')
      form.reset()
    },
    onError: () => toast.error('Erreur lors de l\'ajustement'),
  })

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
        <Link to="/paiements" className="hover:text-primary-500">Paiements</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-neutral-900 font-medium">Ajustement de solde</span>
      </div>
      <PageHeader title="Ajustement de solde" description="Enregistrez une charge ou une régularisation sur un lot" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Nouvel ajustement</CardTitle></CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => mutate(v))} className="space-y-4">
                <FormField control={form.control} name="residenceId" render={({ field }) => (
                  <FormItem><FormLabel>Résidence</FormLabel>
                    <FormControl>
                      <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        onChange={e => { field.onChange(e); form.setValue('immeubleId', ''); form.setValue('lotId', '') }}>
                        <option value="">Sélectionner...</option>
                        {residences?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="immeubleId" render={({ field }) => (
                  <FormItem><FormLabel>Immeuble</FormLabel>
                    <FormControl>
                      <select {...field} disabled={!residenceId} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                        onChange={e => { field.onChange(e); form.setValue('lotId', '') }}>
                        <option value="">Sélectionner...</option>
                        {immeubles?.map(i => <option key={i.id} value={i.id}>{i.blockName}</option>)}
                      </select>
                    </FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="lotId" render={({ field }) => (
                  <FormItem><FormLabel>Lot</FormLabel>
                    <FormControl>
                      <select {...field} disabled={!immeubleId} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                        onChange={e => { field.onChange(e); setSelectedLotId(e.target.value) }}>
                        <option value="">Sélectionner...</option>
                        {lots?.map(l => <option key={l.id} value={l.id}>Lot {l.number} — {l.lotType} — Solde: {formatMontant(l.balance)}</option>)}
                      </select>
                    </FormControl><FormMessage /></FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem><FormLabel>Type</FormLabel>
                      <FormControl>
                        <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                          <option value="charge">Charge</option>
                          <option value="regularisation">Régularisation</option>
                        </select>
                      </FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="montant" render={({ field }) => (
                    <FormItem><FormLabel>Montant (DH)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="libelle" render={({ field }) => (
                  <FormItem><FormLabel>Libellé</FormLabel><FormControl><Input placeholder="Charges de copropriété Q1 2026" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="periode" render={({ field }) => (
                  <FormItem><FormLabel>Période (optionnel)</FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer l'ajustement
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Historique des ajustements</CardTitle></CardHeader>
          <CardContent>
            {!lotId ? (
              <p className="text-sm text-neutral-400 py-8 text-center">Sélectionnez un lot pour voir son historique</p>
            ) : loadingHist ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : historique?.length === 0 ? (
              <p className="text-sm text-neutral-400 py-8 text-center">Aucun ajustement pour ce lot</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historique?.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-sm">{a.libelle}</TableCell>
                      <TableCell><StatusBadge status={a.type} /></TableCell>
                      <TableCell className={`font-semibold text-sm ${a.type === 'charge' ? 'text-danger' : 'text-success'}`}>
                        {a.type === 'charge' ? '-' : '+'}{formatMontant(Math.abs(a.montant))}
                      </TableCell>
                      <TableCell className="text-neutral-400 text-xs">{formatDate(a.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
