import api from './axios'

export const listPayroll = (params) => api.get('/hr/payroll/', { params }).then((r) => r.data)
export const createPayroll = (data) => api.post('/hr/payroll/', data).then((r) => r.data)
export const listLeaves = (params) => api.get('/hr/leaves/', { params }).then((r) => r.data)
export const createLeave = (data) => api.post('/hr/leaves/', data).then((r) => r.data)
export const updateLeave = (id, data) => api.patch(`/hr/leaves/${id}/`, data).then((r) => r.data)
export const listLeaveTypes = () => api.get('/hr/leave-types/').then((r) => r.data)
export const createLeaveType = (data) => api.post('/hr/leave-types/', data).then((r) => r.data)
export const listInventory = (params) => api.get('/hr/inventory/', { params }).then((r) => r.data)
export const createInventory = (data) => api.post('/hr/inventory/', data).then((r) => r.data)
