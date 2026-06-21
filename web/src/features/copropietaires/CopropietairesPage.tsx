import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Search, Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { getResidents, createResident } from '@/api/copropietaires'

const schema = z.object({
  lastName: z.string().min(2, 'Nom requis'),
  firstName: z.string().min(2, 'Prénom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  type: z.enum(['proprietaire', 'locataire']),
})
type FormValues = z.infer<typeof schema>

export function CopropietairesPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { data: residents, isLoading } = useQuery({ queryKey: ['residents'], queryFn: getResidents })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { lastName: '', firstName: '', email: '', phone: '', type: 'proprietaire' },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: createResident,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['residents'] }); toast.success('Copropriétaire créé'); setOpen(false); form.reset() },
    onError: () => toast.error('Erreur lors de la création'),
  })

  const filtered = residents?.filter(r =>
    `${r.lastName} ${r.firstName} ${r.email}`.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  return (
    <div>
      <PageHeader
        title="Copropriétaires"
        description="Annuaire des résidents et copropriétaires"
        action={
          <Button onClick={() => setOpen(true)}>
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
          action={{ label: 'Créer', onClick: () => setOpen(true) }}
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
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.lastName} {r.firstName}</TableCell>
                  <TableCell className="text-neutral-500">{r.email}</TableCell>
                  <TableCell className="text-neutral-500">{r.phone ?? '—'}</TableCell>
                  <TableCell><StatusBadge status={r.type} /></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`mailto:${r.email}`}><Mail className="h-4 w-4" /></a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouveau copropriétaire</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutate(v))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="Alami" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem><FormLabel>Prénom</FormLabel><FormControl><Input placeholder="Mohammed" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="m.alami@email.ma" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Téléphone</FormLabel><FormControl><Input placeholder="+212 6XX XXX XXX" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>Type</FormLabel>
                  <FormControl>
                    <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                      <option value="proprietaire">Propriétaire</option>
                      <option value="locataire">Locataire</option>
                    </select>
                  </FormControl>
                  <FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
