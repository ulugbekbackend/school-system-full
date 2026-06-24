import Sidebar from './Sidebar'
import NotificationBell from './NotificationBell'
import { useAuthStore } from '@/store/authStore'

export default function PageWrapper({ title, children }) {
  const user = useAuthStore((s) => s.user)
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 32px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#0f172a' }}>{title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <NotificationBell />
            <span style={{ fontSize: 14, color: '#475569' }}>{user?.fullName}</span>
          </div>
        </div>
        <div style={{ padding: '28px 32px' }}>{children}</div>
      </main>
    </div>
  )
}
