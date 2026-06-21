import { client } from './client'

export interface Document {
  id: string
  residenceId?: string
  immeubleId?: string
  type: string
  titre: string
  fichierPath: string
  date: string
  visibleResidents: boolean
  createdAt: string
}

export const getDocuments = (params?: { residenceId?: string; type?: string }) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return client.get<Document[]>(`/documents${qs ? `?${qs}` : ''}`).then(r => r.data)
}

export const getDocument = (id: string) => client.get<Document>(`/documents/${id}`).then(r => r.data)

export const uploadDocument = (formData: FormData) =>
  client.post<Document>('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
