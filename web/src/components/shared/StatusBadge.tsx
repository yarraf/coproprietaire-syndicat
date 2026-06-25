import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  en_attente:       { label: 'En attente',      className: 'bg-[#FBF0D8] text-[#9A6A12] border-[#D9982A]/30' },
  valide:           { label: 'Validé',           className: 'bg-[#E2F3EA] text-[#157A4B] border-[#1E9E63]/30' },
  rejete:           { label: 'Rejeté',           className: 'bg-[#FBE5E3] text-[#A8332B] border-[#D4483F]/30' },
  recu:             { label: 'Reçu',             className: 'bg-[#E4EEFB] text-[#225399] border-[#2E73C8]/30' },
  en_cours:         { label: 'En cours',         className: 'bg-[#FBF0D8] text-[#9A6A12] border-[#D9982A]/30' },
  resolu:           { label: 'Résolu',           className: 'bg-[#E2F3EA] text-[#157A4B] border-[#1E9E63]/30' },
  cloture:          { label: 'Clôturé',          className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  a_venir:          { label: 'À venir',          className: 'bg-[#E4EEFB] text-[#225399] border-[#2E73C8]/30' },
  terminee:         { label: 'Terminée',         className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  planifiee:        { label: 'Planifiée',        className: 'bg-[#E4EEFB] text-[#225399] border-[#2E73C8]/30' },
  tenue:            { label: 'Tenue',            className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  annulee:          { label: 'Annulée',          className: 'bg-[#FBE5E3] text-[#A8332B] border-[#D4483F]/30' },
  reclamation:      { label: 'Réclamation',      className: 'bg-[#FBF0D8] text-[#9A6A12] border-[#D9982A]/30' },
  incident:         { label: 'Incident',         className: 'bg-[#FBE5E3] text-[#A8332B] border-[#D4483F]/30' },
  actif:            { label: 'Actif',            className: 'bg-[#E2F3EA] text-[#157A4B] border-[#1E9E63]/30' },
  inactif:          { label: 'Inactif',          className: 'bg-neutral-100 text-neutral-500 border-neutral-200' },
  proprietaire:     { label: 'Propriétaire',     className: 'bg-primary-50 text-primary-700 border-primary-200' },
  locataire:        { label: 'Locataire',        className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  appartement:      { label: 'Appartement',      className: 'bg-[#E4EEFB] text-[#225399] border-[#2E73C8]/30' },
  local_commercial: { label: 'Local commercial', className: 'bg-[#ECF6F6] text-primary-700 border-primary-200' },
  local:            { label: 'Local',            className: 'bg-[#ECF6F6] text-primary-700 border-primary-200' },
  parking:          { label: 'Parking',          className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  charge:           { label: 'Charge',           className: 'bg-[#FBE5E3] text-[#A8332B] border-[#D4483F]/30' },
  regularisation:   { label: 'Régularisation',   className: 'bg-[#E2F3EA] text-[#157A4B] border-[#1E9E63]/30' },
  reglement:        { label: 'Règlement',        className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  pv_ag:            { label: "PV d'AG",          className: 'bg-[#E4EEFB] text-[#225399] border-[#2E73C8]/30' },
  autre:            { label: 'Autre',            className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
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
