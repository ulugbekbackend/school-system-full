import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Review I6: tokenlar bitta joyda boshqariladi — setAuth localStorage'ga ham yozadi,
// shuning uchun Login sahifasida qo'lda localStorage.setItem qilish shart emas.
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      role: null,
      setAuth: (data) => {
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        set({
          user: { id: data.user_id, fullName: data.full_name, role: data.role },
          role: data.role,
        })
      },
      clearAuth: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, role: null })
      },
    }),
    { name: 'auth-storage' }
  )
)
