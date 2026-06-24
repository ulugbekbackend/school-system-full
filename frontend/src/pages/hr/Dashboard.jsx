import { useQuery } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import StatCard from '@/components/shared/StatCard'
import { hrSummary } from '@/api/analytics'
import { formatMoney } from '@/utils/helpers'

const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }

export default function HRDashboard() {
  const { data: stats } = useQuery({ queryKey: ['hr-stats'], queryFn: hrSummary })

  return (
    <PageWrapper title="HR / Buxgalteriya paneli">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard title="Jami xodimlar" value={stats?.total_staff ?? '—'} icon="👥" color="#3b82f6" />
        <StatCard title="Bu oy maosh" value={formatMoney(stats?.monthly_payroll)} icon="💰" color="#10b981" />
        <StatCard title="Ta'til so'rovlar" value={stats?.pending_leaves ?? '—'} icon="📅" color="#f59e0b" />
        <StatCard title="Inventar soni" value={stats?.inventory_count ?? '—'} icon="📦" color="#8b5cf6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Bo'limlar bo'yicha xodimlar</h3>
          {(stats?.by_department || []).map((dept, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{dept.name}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{dept.count} ta</span>
              </div>
              <div style={{ height: 6, background: '#f1f5f9', borderRadius: 4 }}>
                <div style={{ height: '100%', borderRadius: 4, background: '#3b82f6',
                  width: `${(dept.count / (stats?.total_staff || 1)) * 100}%` }} />
              </div>
            </div>
          ))}
          {!stats?.by_department?.length && <Empty />}
        </div>

        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Ta'til so'rovlari</h3>
          {(stats?.leave_requests || []).map((req, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{req.employee_name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{req.leave_type} · {req.days} kun</div>
              </div>
              <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 10px',
                borderRadius: 20, fontSize: 12 }}>Kutilmoqda</span>
            </div>
          ))}
          {!stats?.leave_requests?.length && <Empty />}
        </div>
      </div>
    </PageWrapper>
  )
}

const Empty = () => (
  <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Ma'lumot yo'q</div>
)
