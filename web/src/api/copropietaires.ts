import { client } from './client'

export interface Resident {
  id: string
  lastName: string
  firstName: string
  email: string
  phone?: string
  type: string
  userId?: string
  createdAt: string
}

export interface LotResident {
  id: string
  lotId: string
  residentId: string
  startDate: string
  endDate?: string
}

export const getResidents = () => client.get<Resident[]>('/residents').then(r => r.data)
export const getResident = (id: string) => client.get<Resident>(`/residents/${id}`).then(r => r.data)
export const createResident = (data: { lastName: string; firstName: string; email: string; phone?: string; type: string }) =>
  client.post<Resident>('/residents', data).then(r => r.data)

export const inviteResident = (data: { residentId: string; lotId: string; startDate: string }) =>
  client.post('/residents/inviter', data).then(r => r.data)

export const getLotResidents = (lotId: string) =>
  client.get<LotResident[]>(`/lots/${lotId}/residents`).then(r => r.data)

export const assignResident = (data: { lotId: string; residentId: string; startDate: string }) =>
  client.post('/lots/residents', data).then(r => r.data)
