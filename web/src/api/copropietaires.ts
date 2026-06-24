import { client } from './client'

export interface ResidentResponse {
  id: string
  lastName: string
  firstName: string
  email: string
  phone?: string
  type: string             // "proprietaire" | "locataire"
  status: string           // "actif" | "inactif"
  isAccountActivated: boolean
  createdAt: string
}

export interface InvitationResponse {
  email: string
  token: string
  expiresAt: string
}

export const getResidents = () =>
  client.get<ResidentResponse[]>('/residents').then(r => r.data)

export const getResident = (id: string) =>
  client.get<ResidentResponse>(`/residents/${id}`).then(r => r.data)

export const createResident = (data: { lastName: string; firstName: string; email: string; phone?: string; residentType: string }) =>
  client.post<ResidentResponse>('/residents', data).then(r => r.data)

export const updateResident = (id: string, data: { lastName: string; firstName: string; email: string; phone?: string; residentType: string }) =>
  client.put<ResidentResponse>(`/residents/${id}`, data).then(r => r.data)

export const deactivateResident = (id: string) =>
  client.delete(`/residents/${id}`)

export const inviteResident = (id: string) =>
  client.post<InvitationResponse>(`/residents/${id}/invite`).then(r => r.data)
