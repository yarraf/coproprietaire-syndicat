import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Upload, Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FilePreview } from '@/components/shared/FilePreview'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { getDocuments, uploadDocument } from '@/api/ged'
import { getResidences } from '@/api/residences'
import { formatDate } from '@/lib/utils'

export function GedPage() {
  const qc = useQueryClient()
  const [openUpload, setOpenUpload] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState('')

  // Upload form state
  const [file, setFile] = useState<File | null>(null)
  const [titre, setTitre] = useState('')
  const [type, setType] = useState<string>('reglement')
  const [date, setDate] = useState('')
  const [residenceId, setResidenceId] = useState('')
  const [visibleResidents, setVisibleResidents] = useState(true)

  const { data: documents, isLoading } = useQuery({ queryKey: ['documents', typeFilter], queryFn: () => getDocuments(typeFilter ? { type: typeFilter } : undefined) })
  const { data: residences } = useQuery({ queryKey: ['residences'], queryFn: getResidences })

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('fichier', file!)
      fd.append('titre', titre)
      fd.append('type', type)
      fd.append('date', date)
      if (residenceId) fd.append('residenceId', residenceId)
      fd.append('visibleResidents', visibleResidents.toString())
      return uploadDocument(fd)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document archivé')
      setOpenUpload(false)
      setFile(null); setTitre(''); setDate(''); setResidenceId('')
    },
    onError: () => toast.error('Erreur lors de l\'upload'),
  })

  return (
    <div>
      <PageHeader
        title="Gestion des documents"
        description="Archivez et consultez les documents de la copropriété"
        action={<Button onClick={() => setOpenUpload(true)}><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>}
      />

      <div className="mb-4">
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Tous les types</option>
          <option value="reglement">Règlement</option>
          <option value="pv_ag">PV d'AG</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : documents?.length === 0 ? (
        <EmptyState title="Aucun document" description="Aucun document archivé pour ce filtre." action={{ label: 'Ajouter un document', onClick: () => setOpenUpload(true) }} />
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Visibilité</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents?.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.titre}</TableCell>
                  <TableCell><StatusBadge status={doc.type} /></TableCell>
                  <TableCell className="text-neutral-400 text-sm">{formatDate(doc.date)}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium ${doc.visibleResidents ? 'text-success' : 'text-neutral-400'}`}>
                      {doc.visibleResidents ? 'Résidents ✓' : 'Agents seulement'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setPreviewDoc(doc.fichierPath)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Upload modal */}
      <Dialog open={openUpload} onOpenChange={setOpenUpload}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Ajouter un document</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-neutral-200 p-6 text-center">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" id="doc-upload" onChange={e => setFile(e.target.files?.[0] ?? null)} />
              <label htmlFor="doc-upload" className="cursor-pointer">
                <Upload className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
                <p className="text-sm text-neutral-500">{file ? file.name : 'Sélectionner un fichier (PDF, JPG, PNG)'}</p>
              </label>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Titre</label>
              <Input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Règlement de copropriété 2026" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <select value={type} onChange={e => setType(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="reglement">Règlement</option>
                  <option value="pv_ag">PV d'AG</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Date</label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Résidence</label>
              <select value={residenceId} onChange={e => setResidenceId(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Toutes résidences</option>
                {residences?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={visibleResidents} onChange={e => setVisibleResidents(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
              Visible par les résidents
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenUpload(false)}>Annuler</Button>
            <Button onClick={() => mutate()} disabled={!file || !titre || !date || isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Archiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview modal */}
      <Dialog open={!!previewDoc} onOpenChange={o => !o && setPreviewDoc(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Aperçu du document</DialogTitle></DialogHeader>
          {previewDoc && <FilePreview path={previewDoc} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
