import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const NAV_ITEMS = {
  admin: [
    { label: 'Dashboard',   path: '/admin/dashboard',  icon: '📊' },
    { label: 'Talabalar',   path: '/admin/students',   icon: '🎓' },
    { label: 'Xodimlar',    path: '/admin/staff',      icon: '🧑‍🏫' },
    { label: 'Akademik',    path: '/admin/academics',  icon: '🏫' },
    { label: 'Moliya',      path: '/admin/finance',    icon: '💰' },
    { label: 'CRM',         path: '/admin/crm',        icon: '🎯' },
    { label: 'Hisobotlar',  path: '/admin/reports',    icon: '📈' },
    { label: 'Sozlamalar',  path: '/admin/settings',   icon: '⚙️' },
  ],
  teacher: [
    { label: 'Dashboard',    path: '/teacher/dashboard',   icon: '📊' },
    { label: 'Sinflarim',    path: '/teacher/classes',     icon: '🏫' },
    { label: 'Davomat',      path: '/teacher/attendance',  icon: '✅' },
    { label: 'Baholar',      path: '/teacher/grades',      icon: '📝' },
    { label: 'Topshiriqlar', path: '/teacher/assignments', icon: '📋' },
    { label: 'Materiallar',  path: '/teacher/materials',   icon: '📚' },
  ],
  student: [
    { label: 'Dashboard',    path: '/student/dashboard',   icon: '📊' },
    { label: 'Darslarim',    path: '/student/courses',     icon: '📚' },
    { label: 'Baholar',      path: '/student/grades',      icon: '🏆' },
    { label: 'Jadval',       path: '/student/schedule',    icon: '📅' },
    { label: 'Topshiriqlar', path: '/student/assignments', icon: '📋' },
  ],
  parent: [
    { label: 'Dashboard',  path: '/parent/dashboard',  icon: '📊' },
    { label: 'Farzandim',  path: '/parent/children',   icon: '👦' },
    { label: 'Davomat',    path: '/parent/attendance', icon: '✅' },
    { label: 'Baholar',    path: '/parent/grades',     icon: '🏆' },
    { label: "To'lovlar",  path: '/parent/payments',   icon: '💳' },
  ],
  hr: [
    { label: 'Dashboard', path: '/hr/dashboard',  icon: '📊' },
    { label: 'Xodimlar',  path: '/hr/staff',      icon: '👥' },
    { label: "Ta'til",    path: '/hr/leaves',     icon: '📅' },
    { label: 'Maosh',     path: '/hr/payroll',    icon: '💰' },
    { label: 'Inventar',  path: '/hr/inventory',  icon: '📦' },
  ],
}
NAV_ITEMS.accountant = NAV_ITEMS.hr

export default function Sidebar() {
  const { user, role, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const items = NAV_ITEMS[role] || []

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <aside style={{ width: 240, minHeight: '100vh', background: '#1e293b',
      display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #334155' }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>EduCore</div>
        <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{user?.fullName}</div>
      </div>

      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {items.map((item) => (
          <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 8, marginBottom: 2, textDecoration: 'none', fontSize: 14,
            fontWeight: 500, color: isActive ? '#fff' : '#94a3b8',
            background: isActive ? '#3b82f6' : 'transparent' })}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '12px 8px', borderTop: '1px solid #334155' }}>
        <button onClick={handleLogout} style={{ width: '100%', padding: '10px 12px',
          background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer',
          textAlign: 'left', borderRadius: 8, fontSize: 14 }}>
          🚪 Chiqish
        </button>
      </div>
    </aside>
  )
}
