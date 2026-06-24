import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  en_attente: { label: 'En attente', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  valide:     { label: 'Validé',     className: 'bg-green-100 text-green-800 border-green-200' },
  rejete:     { label: 'Rejeté',     className: 'bg-red-100 text-red-800 border-red-200' },
  recu:       { label: 'Reçu',       className: 'bg-blue-100 text-blue-800 border-blue-200' },
  en_cours:   { label: 'En cours',   className: 'bg-amber-100 text-amber-800 border-amber-200' },
  resolu:     { label: 'Résolu',     className: 'bg-green-100 text-green-800 border-green-200' },
  cloture:    { label: 'Clôturé',    className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  a_venir:    { label: 'À venir',    className: 'bg-blue-50 text-blue-700 border-blue-200' },
  terminee:   { label: 'Terminée',   className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  planifiee:  { label: 'Planifiée',  className: 'bg-blue-100 text-blue-800 border-blue-200' },
  tenue:      { label: 'Tenue',      className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  annulee:    { label: 'Annulée',    className: 'bg-red-100 text-red-800 border-red-200' },
  reclamation:{ label: 'Réclamation',className: 'bg-orange-100 text-orange-800 border-orange-200' },
  incident:   { label: 'Incident',   className: 'bg-red-100 text-red-800 border-red-200' },
  actif:        { label: 'Actif',        className: 'bg-green-100 text-green-800 border-green-200' },
  inactif:      { label: 'Inactif',      className: 'bg-neutral-100 text-neutral-500 border-neutral-200' },
  proprietaire: { label: 'Propriétaire', className: 'bg-primary-50 text-primary-700 border-primary-200' },
  locataire:    { label: 'Locataire',    className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  appartement:  { label: 'Appartement',  className: 'bg-blue-50 text-blue-700 border-blue-100' },
  local_commercial: { label: 'Local commercial', className: 'bg-purple-50 text-purple-700 border-purple-100' },
  local:        { label: 'Local',        className: 'bg-purple-50 text-purple-700 border-purple-100' },
  parking:    { label: 'Parking',    className: 'bg-neutral-100 text-neutral-600 border-neutral-100' },
  charge:     { label: 'Charge',     className: 'bg-red-50 text-red-700 border-red-100' },
  regularisation: { label: 'Régularisation', className: 'bg-green-50 text-green-700 border-green-100' },
  reglement:  { label: 'Règlement',  className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  pv_ag:      { label: 'PV d\'AG',   className: 'bg-blue-100 text-blue-800 border-blue-200' },
  autre:      { label: 'Autre',      className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-neutral-100 text-neutral-600 border-neutral-200' }
  return (
    <Badge className={cn('border font-medium', config.className, className)} variant="outline">
      {config.label}
    </Badge>
  )
}
