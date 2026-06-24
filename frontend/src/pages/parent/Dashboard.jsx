import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import StatCard from '@/components/shared/StatCard'
import { parentSummary } from '@/api/analytics'
import { formatMoney } from '@/utils/helpers'

const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }

export default function ParentDashboard() {
  const [childId, setChildId] = useState(null)
  const { data: stats } = useQuery({
    queryKey: ['parent-stats', childId],
    queryFn: () => parentSummary(childId),
  })

  const child = stats?.child
  const children = stats?.children || []

  return (
    <PageWrapper title="Ota-ona paneli">
      {/* I7: bir nechta farzand bo'lsa tanlash */}
      {children.length > 1 && (
        <select
          value={childId ?? child?.id ?? ''}
          onChange={(e) => setChildId(e.target.value)}
          style={{ marginBottom: 20, padding: '8px 12px', borderRadius: 8,
            border: '1px solid #e5e7eb', fontSize: 14 }}>
          {children.map((c) => (
            <option key={c.id} value={c.id}>{c.full_name} — {c.class_name}</option>
          ))}
        </select>
      )}

      {child && (
        <div style={{ ...card, padding: 20, marginBottom: 24, display: 'flex',
          alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dbeafe',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            fontWeight: 700, color: '#1d4ed8' }}>
            {child.first_name?.[0]}{child.last_name?.[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{child.full_name}</div>
            <div style={{ color: '#64748b', fontSize: 14 }}>{child.class_name} · {child.student_id}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard title="Davomat" value={`${stats?.attendance_rate ?? 0}%`} icon="✅" color="#10b981" />
        <StatCard title="O'rtacha baho" value={stats?.avg_grade ?? '—'} icon="🏆" color="#3b82f6" />
        <StatCard title="Qarzdorlik" value={formatMoney(stats?.debt)} icon="💳"
          color={stats?.debt > 0 ? '#ef4444' : '#10b981'} />
        <StatCard title="Xabarnomalar" value={stats?.unread_notifications ?? 0} icon="🔔" color="#8b5cf6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Davomat xulosasi</h3>
          {[
            { label: 'Keldi', key: 'present', color: '#10b981' },
            { label: 'Kelmadi', key: 'absent', color: '#ef4444' },
            { label: 'Kech keldi', key: 'late', color: '#f59e0b' },
            { label: 'Uzrli', key: 'excused', color: '#6366f1' },
          ].map(({ label, key, color }) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 14, color: '#374151' }}>{label}</span>
              <span style={{ fontWeight: 600, color }}>{stats?.attendance_detail?.[key] ?? 0} kun</span>
            </div>
          ))}
        </div>

        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>To'lovlar holati</h3>
          {(stats?.invoices || []).map((inv, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{inv.fee_type}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{inv.month}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600 }}>{formatMoney(inv.amount)}</div>
                <span style={{ background: inv.status === 'paid' ? '#dcfce7' : '#fee2e2',
                  color: inv.status === 'paid' ? '#166534' : '#991b1b', fontSize: 11,
                  padding: '2px 8px', borderRadius: 20 }}>
                  {inv.status === 'paid' ? "To'langan" : 'Kutilmoqda'}
                </span>
              </div>
            </div>
          ))}
          {!stats?.invoices?.length && (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              To'lovlar yo'q
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
