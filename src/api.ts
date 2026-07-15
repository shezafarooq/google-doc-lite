export type User = { id: number; name: string; email: string; color: string }
export type DocSummary = { id: number; title: string; ownerId: number; ownerName: string; updatedAt: string; section: 'owned' | 'shared'; preview: string }
export type Document = { id: number; title: string; content: any; ownerId: number; ownerName: string; access: 'owner' | 'shared'; updatedAt: string; sharedWith: User[] }

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'Request failed')
  }
  return response.status === 204 ? undefined as T : response.json()
}
const json = (method: string, body: unknown): RequestInit => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

export const api = {
  users: () => request<User[]>('/api/users'),
  documents: (userId: number) => request<DocSummary[]>(`/api/documents?userId=${userId}`),
  document: (id: number, userId: number) => request<Document>(`/api/documents/${id}?userId=${userId}`),
  create: (ownerId: number) => request<{id: number}>('/api/documents', json('POST', { ownerId })),
  save: (id: number, userId: number, title: string, content: any) => request(`/api/documents/${id}`, json('PUT', { userId, title, content })),
  delete: (id: number, userId: number) => request(`/api/documents/${id}?userId=${userId}`, { method: 'DELETE' }),
  share: (id: number, ownerId: number, userId: number) => request(`/api/documents/${id}/share`, json('POST', { ownerId, userId })),
  unshare: (id: number, ownerId: number, userId: number) => request(`/api/documents/${id}/share/${userId}?ownerId=${ownerId}`, { method: 'DELETE' }),
  upload: (file: File, ownerId: number) => { const data = new FormData(); data.append('file', file); data.append('ownerId', String(ownerId)); return request<{id:number}>('/api/upload', { method: 'POST', body: data }) },
}
