import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROLE_REDIRECT } from '@/utils/constants'
import api from '@/api/axios'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login/', form)
      setAuth(data)   // tokenlarni localStorage'ga ham yozadi (I6)
      navigate(ROLE_REDIRECT[data.role] || '/login')
    } catch {
      setError("Login yoki parol noto'g'ri")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f8f9fa' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '40px 48px',
        boxShadow: '0 2px 24px rgba(0,0,0,0.08)', width: 380 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>EduCore</h1>
        <p style={{ color: '#6b7280', marginBottom: 28, fontSize: 14 }}>
          Maktab boshqaruv tizimi
        </p>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, fontWeight: 500 }}>Login</label>
          <input
            type="text" value={form.username} required autoFocus
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            style={inputStyle}
          />
          <label style={{ fontSize: 13, fontWeight: 500 }}>Parol</label>
          <input
            type="password" value={form.password} required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{ ...inputStyle, marginBottom: 24 }}
          />
          {error && (
            <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{error}</p>
          )}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '11px', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500,
            cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Kirish...' : 'Kirish'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle = {
  display: 'block', width: '100%', padding: '10px 12px',
  border: '1px solid #e5e7eb', borderRadius: 8, marginTop: 6,
  marginBottom: 16, fontSize: 14, boxSizing: 'border-box',
}
