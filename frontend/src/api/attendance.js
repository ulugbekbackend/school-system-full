import api from './axios'

export const listAttendance = (params) => api.get('/attendance/', { params }).then((r) => r.data)
export const bulkAttendance = (records) => api.post('/attendance/bulk/', records).then((r) => r.data)
export const attendanceSummary = (studentId) =>
  api.get(`/attendance/summary/${studentId}/`).then((r) => r.data)
