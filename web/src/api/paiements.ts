import { client } from './client'

export interface Paiement {
  id: string
  lotId: string
  residentId: string
  montant: number
  type: string
  libelle?: string
  periode?: string
  statut: string
  justificatifPath?: string
  motifRejet?: string
  createdAt: string
}

export interface Ajustement {
  id: string
  lotId: string
  montant: number
  type: string
  libelle: string
  periode?: string
  createdAt: string
}

export const getPaiements = (params?: { statut?: string; lotId?: string; residenceId?: string }) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return client.get<Paiement[]>(`/paiements${qs ? `?${qs}` : ''}`).then(r => r.data)
}

export const getPaiement = (id: string) => client.get<Paiement>(`/paiements/${id}`).then(r => r.data)

export const submitPaiement = (formData: FormData) =>
  client.post<Paiement>('/paiements', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)

export const validerPaiement = (id: string) =>
  client.post(`/paiements/${id}/valider`).then(r => r.data)

export const rejeterPaiement = (id: string, motifRejet: string) =>
  client.post(`/paiements/${id}/rejeter`, { motifRejet }).then(r => r.data)

export const getAjustements = (params?: { lotId?: string }) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return client.get<Ajustement[]>(`/ajustements-solde${qs ? `?${qs}` : ''}`).then(r => r.data)
}

export const createAjustement = (data: { lotId: string; montant: number; type: string; libelle: string; periode?: string }) =>
  client.post<Ajustement>('/ajustements-solde', data).then(r => r.data)
