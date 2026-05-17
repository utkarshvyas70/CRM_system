const BASE = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Something went wrong' }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  getStats: () => request('/api/stats'),

  getTickets: (params = {}) => {
    const q = new URLSearchParams()
    if (params.status)   q.set('status', params.status)
    if (params.priority) q.set('priority', params.priority)
    if (params.search)   q.set('search', params.search)
    if (params.page)     q.set('page', params.page)
    if (params.limit)    q.set('limit', params.limit)
    return request(`/api/tickets?${q}`)
  },

  getTicket: (id) => request(`/api/tickets/${id}`),

  createTicket: (data) => request('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateTicket: (id, data) => request(`/api/tickets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deleteTicket: (id) => request(`/api/tickets/${id}`, { method: 'DELETE' }),
}
