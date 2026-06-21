import { client } from './client'

export interface Residence {
  id: string
  name: string
  address: string
  city: string
  createdAt: string
}

export interface GroupeHabitation {
  id: string
  residenceId: string
  name: string
  createdAt: string
}

export interface Immeuble {
  id: string
  residenceId: string
  groupeHabitationId?: string
  name: string
  nbFloors: number
  createdAt: string
}

export interface Lot {
  id: string
  immeubleId: string
  number: string
  type: string
  floor: number
  area: number
  solde: number
  createdAt: string
}

export const getResidences = () => client.get<Residence[]>('/residences').then(r => r.data)
export const getResidence = (id: string) => client.get<Residence>(`/residences/${id}`).then(r => r.data)
export const createResidence = (data: { name: string; address: string; city: string }) =>
  client.post<Residence>('/residences', data).then(r => r.data)

export const getGroupesHabitation = (residenceId: string) =>
  client.get<GroupeHabitation[]>(`/groupes-habitation?residenceId=${residenceId}`).then(r => r.data)
export const createGroupeHabitation = (data: { residenceId: string; name: string }) =>
  client.post<GroupeHabitation>('/groupes-habitation', data).then(r => r.data)

export const getImmeubles = (residenceId: string) =>
  client.get<Immeuble[]>(`/immeubles?residenceId=${residenceId}`).then(r => r.data)
export const createImmeuble = (data: { residenceId: string; groupeHabitationId?: string; name: string; nbFloors: number }) =>
  client.post<Immeuble>('/immeubles', data).then(r => r.data)

export const getLots = (immeubleId: string) =>
  client.get<Lot[]>(`/lots?immeubleId=${immeubleId}`).then(r => r.data)
export const getLot = (id: string) => client.get<Lot>(`/lots/${id}`).then(r => r.data)
export const createLot = (data: { immeubleId: string; number: string; type: string; floor: number; area: number }) =>
  client.post<Lot>('/lots', data).then(r => r.data)
