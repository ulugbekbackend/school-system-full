import api from './axios'

export const listGrades = (params) => api.get('/grades/', { params }).then((r) => r.data)
export const createGrade = (data) => api.post('/grades/', data).then((r) => r.data)
export const listCategories = () => api.get('/grades/categories/').then((r) => r.data)
export const createCategory = (data) => api.post('/grades/categories/', data).then((r) => r.data)
export const listTermReports = (params) => api.get('/grades/term-reports/', { params }).then((r) => r.data)
