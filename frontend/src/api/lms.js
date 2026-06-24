import api from './axios'

export const listCourses = (params) => api.get('/lms/courses/', { params }).then((r) => r.data)
export const createCourse = (data) => api.post('/lms/courses/', data).then((r) => r.data)
export const listLessons = (params) => api.get('/lms/lessons/', { params }).then((r) => r.data)
export const createLesson = (data) => api.post('/lms/lessons/', data).then((r) => r.data)
export const listAssignments = (params) => api.get('/lms/assignments/', { params }).then((r) => r.data)
export const createAssignment = (data) => api.post('/lms/assignments/', data).then((r) => r.data)
export const listSubmissions = (params) => api.get('/lms/submissions/', { params }).then((r) => r.data)
export const listQuizzes = (params) => api.get('/lms/quizzes/', { params }).then((r) => r.data)
