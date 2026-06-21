import { client } from './client'

export interface MaintenancePlanifiee {
  id: string
  residenceId: string
  immeubleId?: string
  type: string
  libelle: string
  datePrevue: string
  recurrence?: string
  statut: string
  visibleResidents: boolean
  createdAt: string
}

export const getMaintenances = () =>
  client.get<MaintenancePlanifiee[]>('/maintenance-planifiee').then(r => r.data)

export const createMaintenance = (data: {
  residenceId: string
  immeubleId?: string
  type: string
  libelle: string
  datePrevue: string
  recurrence?: string
  visibleResidents: boolean
}) => client.post<MaintenancePlanifiee>('/maintenance-planifiee', data).then(r => r.data)

export const updateMaintenance = (id: string, data: Partial<MaintenancePlanifiee>) =>
  client.put<MaintenancePlanifiee>(`/maintenance-planifiee/${id}`, data).then(r => r.data)
