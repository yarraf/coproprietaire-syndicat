import { client } from './client'

export interface Assemblee {
  id: string
  residenceId: string
  titre: string
  date: string
  lieu: string
  ordreDuJour: string
  statut: string
  pvDocumentId?: string
  createdAt: string
}

export const getAssemblees = (params?: { residenceId?: string }) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return client.get<Assemblee[]>(`/assemblees${qs ? `?${qs}` : ''}`).then(r => r.data)
}

export const getAssemblee = (id: string) => client.get<Assemblee>(`/assemblees/${id}`).then(r => r.data)

export const createAssemblee = (data: { residenceId: string; titre: string; date: string; lieu: string; ordreDuJour: string }) =>
  client.post<Assemblee>('/assemblees', data).then(r => r.data)

export const updateAssemblee = (id: string, data: { titre: string; date: string; lieu: string; ordreDuJour: string }) =>
  client.put<Assemblee>(`/assemblees/${id}`, data).then(r => r.data)

export const deleteAssemblee = (id: string) =>
  client.delete(`/assemblees/${id}`)

export const convoquerAssemblee = (id: string) =>
  client.post(`/assemblees/${id}/convoquer`).then(r => r.data)

export const uploadPv = (id: string, file: File) => {
  const fd = new FormData()
  fd.append('pv', file)
  return client.post(`/assemblees/${id}/pv`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}
