import api from './axios'

export const listLeads = (params) => api.get('/crm/leads/', { params }).then((r) => r.data)
export const createLead = (data) => api.post('/crm/leads/', data).then((r) => r.data)
export const updateLead = (id, data) => api.patch(`/crm/leads/${id}/`, data).then((r) => r.data)
