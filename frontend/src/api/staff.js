import api from './axios'

export const listTeachers = (params) => api.get('/staff/teachers/', { params }).then((r) => r.data)
export const createTeacher = (data) => api.post('/staff/teachers/create/', data).then((r) => r.data)
export const listStaff = (params) => api.get('/staff/members/', { params }).then((r) => r.data)
export const createStaff = (data) => api.post('/staff/members/create/', data).then((r) => r.data)
export const listSubjects = () => api.get('/staff/subjects/').then((r) => r.data)
export const createSubject = (data) => api.post('/staff/subjects/', data).then((r) => r.data)
export const listDepartments = () => api.get('/staff/departments/').then((r) => r.data)
export const createDepartment = (data) => api.post('/staff/departments/', data).then((r) => r.data)
