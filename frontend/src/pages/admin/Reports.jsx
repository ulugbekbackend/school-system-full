import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import PageWrapper from '@/components/layout/PageWrapper'
import StatCard from '@/components/shared/StatCard'
import { adminSummary } from '@/api/analytics'
import { formatMoney } from '@/utils/helpers'

const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }

export default function AdminReports() {
  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: adminSummary })

  return (
    <PageWrapper title="Hisobotlar">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard title="Jami talabalar" value={stats?.total_students ?? '—'} icon="🎓" color="#3b82f6" />
        <StatCard title="Xodimlar" value={stats?.total_staff ?? '—'} icon="🧑‍🏫" color="#10b981" />
        <StatCard title="Bu oy daromad" value={formatMoney(stats?.monthly_income)} icon="💰" color="#f59e0b" />
        <StatCard title="Qarzdorlar" value={stats?.overdue_count ?? '—'} icon="⚠️" color="#ef4444" />
      </div>

      <div style={{ ...card, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Daromad dinamikasi (6 oy)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={stats?.monthly_payments || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [formatMoney(v), 'Daromad']} />
            <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Sinflar davomati (%)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats?.class_stats || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="class_name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [`${v}%`, 'Davomat']} />
            <Bar dataKey="attendance_rate" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </PageWrapper>
  )
}
