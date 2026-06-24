import api from './axios'

export const listStudents = (params) => api.get('/students/', { params }).then((r) => r.data)
export const getStudent = (id) => api.get(`/students/${id}/`).then((r) => r.data)
export const createStudent = (data) => api.post('/students/create/', data).then((r) => r.data)
export const listClasses = () => api.get('/students/classes/').then((r) => r.data)
export const createClass = (data) => api.post('/students/classes/', data).then((r) => r.data)
