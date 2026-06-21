import { FileText } from 'lucide-react'

interface FilePreviewProps {
  path: string
  className?: string
}

function isImage(path: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(path)
}

function isPdf(path: string): boolean {
  return /\.pdf$/i.test(path)
}

export function FilePreview({ path, className }: FilePreviewProps) {
  const url = path.startsWith('http') ? path : `/${path.replace(/^\//, '')}`

  if (isImage(path)) {
    return (
      <img
        src={url}
        alt="Justificatif"
        className={`max-w-full rounded-lg object-contain ${className ?? ''}`}
        style={{ maxHeight: '60vh' }}
      />
    )
  }

  if (isPdf(path)) {
    return (
      <iframe
        src={url}
        title="Document PDF"
        className={`w-full rounded-lg border ${className ?? ''}`}
        style={{ height: '60vh' }}
      />
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-neutral-400">
      <FileText className="h-12 w-12" />
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-500 hover:underline">
        Télécharger le fichier
      </a>
    </div>
  )
}

export function FileThumbnail({ path }: { path: string }) {
  const url = path.startsWith('http') ? path : `/${path.replace(/^\//, '')}`
  if (isImage(path)) {
    return <img src={url} alt="" className="h-10 w-10 rounded object-cover border" />
  }
  return <div className="flex h-10 w-10 items-center justify-center rounded border bg-neutral-100"><FileText className="h-4 w-4 text-neutral-400" /></div>
}
