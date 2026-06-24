import axios from 'axios'

// Review I5: baseURL nisbiy '/api' — dev'da Vite proxy, prod'da Nginx hal qiladi.
// Boshqa domendagi backend uchun VITE_API_URL to'liq URL beriladi.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh && !isRefreshing) {
        original._retry = true
        isRefreshing = true
        try {
          // Review I5: refresh ham shu `api` instance orqali (prod'da buzilmaydi).
          const { data } = await api.post('/auth/token/refresh/', { refresh })
          localStorage.setItem('access_token', data.access)
          isRefreshing = false
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          isRefreshing = false
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
