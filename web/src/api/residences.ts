import { client } from './client'

export interface LotResidentResponse {
  id: string
  lotId: string
  residentId: string
  residentFullName: string
  residentType: string
  startDate: string
  endDate?: string
  isActive: boolean
}

export interface LotResponse {
  id: string
  immeubleId: string
  number: string
  lotType: string
  floor: number
  area?: number
  balance: number
  createdAt: string
  activeResidents: LotResidentResponse[]
}

export interface ImmeubleResponse {
  id: string
  groupeHabitationId: string
  blockName: string
  address?: string
  nbFloors: number
  createdAt: string
}

export interface GroupeHabitationResponse {
  id: string
  residenceId: string
  name: string
  createdAt: string
  immeubles: ImmeubleResponse[]
}

export interface ResidenceResponse {
  id: string
  name: string
  address: string
  city: string
  createdAt: string
  groupesHabitation: GroupeHabitationResponse[]
}

// ── Résidences ────────────────────────────────────────────────────────────────
export const getResidences = () =>
  client.get<ResidenceResponse[]>('/residences').then(r => r.data)

export const getResidence = (id: string) =>
  client.get<ResidenceResponse>(`/residences/${id}`).then(r => r.data)

export const createResidence = (data: { name: string; address: string; city: string }) =>
  client.post<ResidenceResponse>('/residences', data).then(r => r.data)

export const updateResidence = (id: string, data: { name: string; address: string; city: string }) =>
  client.put<ResidenceResponse>(`/residences/${id}`, data).then(r => r.data)

export const deleteResidence = (id: string) =>
  client.delete(`/residences/${id}`)

// ── Helpers de navigation ─────────────────────────────────────────────────────
export const getImmeubles = (residenceId: string) =>
  getResidence(residenceId).then(r => r.groupesHabitation.flatMap(gh => gh.immeubles))

// ── Groupes d'habitation ──────────────────────────────────────────────────────
export const createGroupeHabitation = (residenceId: string, data: { name: string }) =>
  client.post<GroupeHabitationResponse>(`/residences/${residenceId}/groupes-habitation`, data).then(r => r.data)

export const updateGroupeHabitation = (residenceId: string, id: string, data: { name: string }) =>
  client.put<GroupeHabitationResponse>(`/residences/${residenceId}/groupes-habitation/${id}`, data).then(r => r.data)

export const deleteGroupeHabitation = (residenceId: string, id: string) =>
  client.delete(`/residences/${residenceId}/groupes-habitation/${id}`)

// ── Immeubles ─────────────────────────────────────────────────────────────────
export const createImmeuble = (residenceId: string, ghId: string, data: { blockName: string; nbFloors: number; address?: string }) =>
  client.post<ImmeubleResponse>(`/residences/${residenceId}/groupes-habitation/${ghId}/immeubles`, data).then(r => r.data)

export const updateImmeuble = (residenceId: string, ghId: string, id: string, data: { blockName: string; nbFloors: number; address?: string }) =>
  client.put<ImmeubleResponse>(`/residences/${residenceId}/groupes-habitation/${ghId}/immeubles/${id}`, data).then(r => r.data)

export const deleteImmeuble = (residenceId: string, ghId: string, id: string) =>
  client.delete(`/residences/${residenceId}/groupes-habitation/${ghId}/immeubles/${id}`)

// ── Lots ──────────────────────────────────────────────────────────────────────
export const getLot = (id: string) =>
  client.get<LotResponse>(`/lots/${id}`).then(r => r.data)

export const getLots = (immeubleId: string) =>
  client.get<LotResponse[]>(`/immeubles/${immeubleId}/lots`).then(r => r.data)

export const createLot = (immeubleId: string, data: { number: string; lotType: string; floor: number; area?: number }) =>
  client.post<LotResponse>(`/immeubles/${immeubleId}/lots`, data).then(r => r.data)

export const updateLot = (id: string, data: { number: string; lotType: string; floor: number; area?: number }) =>
  client.put<LotResponse>(`/lots/${id}`, data).then(r => r.data)

export const deleteLot = (id: string) =>
  client.delete(`/lots/${id}`)

// ── Affectations résidents ────────────────────────────────────────────────────
export const assignResident = (lotId: string, data: { residentId: string; residentType: string; startDate: string }) =>
  client.post<LotResidentResponse>(`/lots/${lotId}/residents`, data).then(r => r.data)

export const terminateLotResident = (lotId: string, lotResidentId: string, data: { endDate: string }) =>
  client.post<LotResidentResponse>(`/lots/${lotId}/residents/${lotResidentId}/terminate`, data).then(r => r.data)
