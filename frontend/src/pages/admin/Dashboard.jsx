import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import PageWrapper from '@/components/layout/PageWrapper'
import StatCard from '@/components/shared/StatCard'
import { adminSummary } from '@/api/analytics'
import { formatMoney } from '@/utils/helpers'

const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }

export default function AdminDashboard() {
  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: adminSummary })

  const monthlyData = stats?.monthly_payments || []
  const classStats = stats?.class_stats || []

  return (
    <PageWrapper title="Boshqaruv paneli">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard title="Jami talabalar" value={stats?.total_students ?? '—'} icon="🎓" color="#3b82f6" />
        <StatCard title="Faol xodimlar" value={stats?.total_staff ?? '—'} icon="🧑‍🏫" color="#10b981" />
        <StatCard title="Bu oy daromad" value={formatMoney(stats?.monthly_income)} icon="💰" color="#f59e0b" />
        <StatCard title="Qarzdorlar" value={stats?.overdue_count ?? '—'} icon="⚠️" color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Oylik daromad</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [formatMoney(v), 'Daromad']} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Sinflar davomati (%)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={classStats} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis dataKey="class_name" type="category" tick={{ fontSize: 12 }} width={50} />
              <Tooltip formatter={(v) => [`${v}%`, 'Davomat']} />
              <Bar dataKey="attendance_rate" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>So'nggi to'lovlar</h3>
        <table style={{ width: '100%', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              {['Talaba', 'Tur', 'Summa', 'Usul', 'Sana'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600,
                  color: '#64748b', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(stats?.recent_payments || []).map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '10px 12px' }}>{p.student_name}</td>
                <td style={{ padding: '10px 12px', color: '#64748b' }}>{p.fee_type}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{formatMoney(p.amount)}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px',
                    borderRadius: 6, fontSize: 12 }}>{p.method}</span>
                </td>
                <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 13 }}>{p.paid_at}</td>
              </tr>
            ))}
            {!stats?.recent_payments?.length && (
              <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>
                To'lovlar yo'q
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  )
}
