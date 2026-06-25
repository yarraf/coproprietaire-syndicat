import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Send, Upload, Calendar, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { getAssemblees, createAssemblee, convoquerAssemblee, uploadPv, type Assemblee } from '@/api/assemblees'
import { getResidences } from '@/api/residences'
import { formatDateTime } from '@/lib/utils'

const schema = z.object({
  residenceId: z.string().min(1, 'Résidence requise'),
  titre: z.string().min(2, 'Titre requis'),
  date: z.string().min(1, 'Date requise'),
  lieu: z.string().min(2, 'Lieu requis'),
  ordreDuJour: z.string().min(5, "L'ordre du jour est requis"),
})
type FormValues = z.infer<typeof schema>

export function AssembleesPage() {
  const qc = useQueryClient()
  const [openCreate, setOpenCreate] = useState(false)
  const [convId, setConvId] = useState<string | null>(null)
  const [pvId, setPvId] = useState<string | null>(null)
  const [pvFile, setPvFile] = useState<File | null>(null)

  const { data: assemblees, isLoading } = useQuery({ queryKey: ['assemblees'], queryFn: () => getAssemblees() })
  const { data: residences } = useQuery({ queryKey: ['residences'], queryFn: getResidences })

  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: createAssemblee,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assemblees'] }); toast.success('AG créée'); setOpenCreate(false); form.reset() },
    onError: () => toast.error('Erreur lors de la création'),
  })

  const { mutate: convoquer, isPending: convoking } = useMutation({
    mutationFn: () => convoquerAssemblee(convId!),
    onSuccess: () => { toast.success('Convocations envoyées'); setConvId(null) },
    onError: () => toast.error('Erreur lors de l\'envoi'),
  })

  const { mutate: uploadPvMut, isPending: uploading } = useMutation({
    mutationFn: () => uploadPv(pvId!, pvFile!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assemblees'] }); toast.success('PV archivé'); setPvId(null); setPvFile(null) },
    onError: () => toast.error('Erreur lors de l\'upload'),
  })

  const aVenir = assemblees?.filter(a => a.statut === 'planifiee') ?? []
  const passees = assemblees?.filter(a => a.statut !== 'planifiee') ?? []

  function AgCard({ a }: { a: Assemblee }) {
    if (!a) return null
    return (
      <Card key={a.id} className="hover:shadow-sm transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-neutral-900">{a.titre}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDateTime(a.date)}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.lieu}</span>
              </div>
            </div>
            <StatusBadge status={a.statut} />
          </div>
          <p className="text-xs text-neutral-500 line-clamp-2 mb-4">{a.ordreDuJour}</p>
          <div className="flex gap-2">
            {a.statut === 'planifiee' && (
              <Button size="sm" variant="outline" onClick={() => setConvId(a.id)}>
                <Send className="h-3.5 w-3.5 mr-1.5" /> Envoyer convocation
              </Button>
            )}
            {a.statut === 'planifiee' && (
              <Button size="sm" variant="outline" onClick={() => setPvId(a.id)}>
                <Upload className="h-3.5 w-3.5 mr-1.5" /> Uploader PV
              </Button>
            )}
            {a.pvDocumentId && (
              <span className="text-xs text-success font-medium flex items-center gap-1">✓ PV archivé</span>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <PageHeader
        title="Assemblées générales"
        description="Planifiez et gérez les assemblées générales"
        action={<Button onClick={() => setOpenCreate(true)}><Plus className="mr-2 h-4 w-4" /> Nouvelle AG</Button>}
      />

      <Tabs defaultValue="a_venir">
        <TabsList className="mb-4">
          <TabsTrigger value="a_venir">À venir ({aVenir.length})</TabsTrigger>
          <TabsTrigger value="passees">Passées ({passees.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="a_venir">
          {isLoading ? <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36" />)}</div>
            : aVenir.length === 0 ? <EmptyState title="Aucune AG planifiée" description="Créez votre première assemblée générale." action={{ label: 'Nouvelle AG', onClick: () => setOpenCreate(true) }} />
            : <div className="space-y-4">{aVenir.map(a => <AgCard key={a.id} a={a} />)}</div>
          }
        </TabsContent>

        <TabsContent value="passees">
          {isLoading ? <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36" />)}</div>
            : passees.length === 0 ? <EmptyState title="Aucune AG passée" />
            : <div className="space-y-4">{passees.map(a => <AgCard key={a.id} a={a} />)}</div>
          }
        </TabsContent>
      </Tabs>

      {/* Création AG */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>Nouvelle assemblée générale</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => create(v))} className="space-y-4">
              <FormField control={form.control} name="residenceId" render={({ field }) => (
                <FormItem><FormLabel>Résidence</FormLabel>
                  <FormControl>
                    <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                      <option value="">Sélectionner...</option>
                      {residences?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="titre" render={({ field }) => (
                <FormItem><FormLabel>Titre</FormLabel><FormControl><Input placeholder="Assemblée Générale Ordinaire 2026" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem><FormLabel>Date et heure</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="lieu" render={({ field }) => (
                  <FormItem><FormLabel>Lieu</FormLabel><FormControl><Input placeholder="Salle de réunion, Bloc A" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="ordreDuJour" render={({ field }) => (
                <FormItem><FormLabel>Ordre du jour</FormLabel><FormControl><Textarea rows={4} placeholder="1. Rapport de gestion&#10;2. Approbation des comptes&#10;3. Questions diverses" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Annuler</Button>
                <Button type="submit" disabled={creating}>{creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirmation convocation */}
      <ConfirmModal
        open={!!convId}
        onOpenChange={(o) => !o && setConvId(null)}
        title="Envoyer les convocations"
        description="Tous les résidents de la résidence recevront une notification push de convocation."
        onConfirm={convoquer}
        loading={convoking}
        confirmLabel="Envoyer"
      />

      {/* Upload PV */}
      <Dialog open={!!pvId} onOpenChange={(o) => { if (!o) { setPvId(null); setPvFile(null) } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Uploader le procès-verbal</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-neutral-200 p-8 text-center">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                id="pv-upload"
                onChange={e => setPvFile(e.target.files?.[0] ?? null)}
              />
              <label htmlFor="pv-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
                <p className="text-sm text-neutral-500">
                  {pvFile ? pvFile.name : 'Cliquez pour sélectionner un fichier (PDF, JPG, PNG)'}
                </p>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPvId(null); setPvFile(null) }}>Annuler</Button>
            <Button onClick={() => uploadPvMut()} disabled={!pvFile || uploading}>
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Archiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
