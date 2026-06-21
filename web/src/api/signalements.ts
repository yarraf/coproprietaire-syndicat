import { client } from './client'

export interface Signalement {
  id: string
  type: string
  lotId?: string
  immeubleId?: string
  residentId: string
  titre: string
  description: string
  photoPath?: string
  statut: string
  assigneA?: string
  reponse?: string
  createdAt: string
}

export const getSignalements = (params?: { statut?: string; type?: string }) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return client.get<Signalement[]>(`/signalements${qs ? `?${qs}` : ''}`).then(r => r.data)
}

export const getSignalement = (id: string) => client.get<Signalement>(`/signalements/${id}`).then(r => r.data)

export const updateSignalement = (id: string, data: { statut: string; reponse?: string; assigneA?: string }) =>
  client.put<Signalement>(`/signalements/${id}`, data).then(r => r.data)
