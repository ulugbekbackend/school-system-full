import api from './axios'

export const adminSummary = () => api.get('/analytics/admin-summary/').then((r) => r.data)
export const teacherSummary = () => api.get('/analytics/teacher-summary/').then((r) => r.data)
export const studentSummary = () => api.get('/analytics/student-summary/').then((r) => r.data)
export const parentSummary = (childId) =>
  api.get('/analytics/parent-summary/', { params: childId ? { child_id: childId } : {} }).then((r) => r.data)
export const hrSummary = () => api.get('/analytics/hr-summary/').then((r) => r.data)
