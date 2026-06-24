import api from './axios'

export const login = (data) => api.post('/auth/login/', data).then((r) => r.data)
export const getMe = () => api.get('/auth/me/').then((r) => r.data)
export const listUsers = (params) => api.get('/auth/users/', { params }).then((r) => r.data)
export const createUser = (data) => api.post('/auth/users/', data).then((r) => r.data)
