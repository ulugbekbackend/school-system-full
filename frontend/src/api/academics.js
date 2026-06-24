import api from './axios'

export const listSchedule = (params) => api.get('/academics/schedule/', { params }).then((r) => r.data)
export const createSchedule = (data) => api.post('/academics/schedule/', data).then((r) => r.data)
export const listRooms = () => api.get('/academics/rooms/').then((r) => r.data)
export const createRoom = (data) => api.post('/academics/rooms/', data).then((r) => r.data)
export const listTimeSlots = () => api.get('/academics/timeslots/').then((r) => r.data)
export const createTimeSlot = (data) => api.post('/academics/timeslots/', data).then((r) => r.data)
export const mySchedule = () => api.get('/academics/my-schedule/').then((r) => r.data)
