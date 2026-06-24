import { useQuery } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import StatCard from '@/components/shared/StatCard'
import { teacherSummary } from '@/api/analytics'

const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }

export default function TeacherDashboard() {
  const { data: stats } = useQuery({ queryKey: ['teacher-stats'], queryFn: teacherSummary })
  const today = new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <PageWrapper title="O'qituvchi paneli">
      <p style={{ color: '#64748b', marginBottom: 20, marginTop: -16, fontSize: 14 }}>{today}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard title="Sinflarim" value={stats?.class_count ?? '—'} icon="🏫" color="#3b82f6" />
        <StatCard title="Bugungi darslar" value={stats?.today_lessons ?? '—'} icon="📅" color="#8b5cf6" />
        <StatCard title="Tekshirilmagan" value={stats?.ungraded ?? '—'} icon="📝" color="#f59e0b" />
        <StatCard title="O'rtacha baho" value={stats?.avg_grade ?? '—'} icon="🏆" color="#10b981" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Bugungi jadval</h3>
          {(stats?.today_schedule || []).map((lesson, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: 60, fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>{lesson.start_time}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{lesson.subject}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{lesson.class_name} · {lesson.room}</div>
              </div>
            </div>
          ))}
          {!stats?.today_schedule?.length && <Empty />}
        </div>

        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Tekshirish kutayotgan topshiriqlar</h3>
          {(stats?.pending_assignments || []).map((a, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{a.class_name}</div>
              </div>
              <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 10px',
                borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{a.pending_count} ta</span>
            </div>
          ))}
          {!stats?.pending_assignments?.length && <Empty />}
        </div>
      </div>
    </PageWrapper>
  )
}

const Empty = () => (
  <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Ma'lumot yo'q</div>
)
