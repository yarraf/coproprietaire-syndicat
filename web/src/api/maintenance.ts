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

export interface UpdateMaintenanceRequest {
  type: string
  libelle: string
  datePrevue: string
  recurrence?: string
  visibleResidents: boolean
  nouveauStatut?: string
}

export const updateMaintenance = (id: string, data: UpdateMaintenanceRequest) =>
  client.put<MaintenancePlanifiee>(`/maintenance-planifiee/${id}`, data).then(r => r.data)

export const deleteMaintenance = (id: string) =>
  client.delete(`/maintenance-planifiee/${id}`)
