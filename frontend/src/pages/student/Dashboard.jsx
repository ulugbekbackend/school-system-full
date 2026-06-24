import { useQuery } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import StatCard from '@/components/shared/StatCard'
import { studentSummary } from '@/api/analytics'
import { gradeColor } from '@/utils/helpers'

const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }

export default function StudentDashboard() {
  const { data: stats } = useQuery({ queryKey: ['student-stats'], queryFn: studentSummary })

  return (
    <PageWrapper title="Mening panelim">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard title="Davomat" value={`${stats?.attendance_rate ?? 0}%`} icon="✅" color="#10b981" />
        <StatCard title="O'rtacha baho" value={stats?.avg_grade ?? '—'} icon="🏆" color="#3b82f6" />
        <StatCard title="Topshiriqlar" value={stats?.pending_assignments ?? '—'} icon="📋" color="#f59e0b" sub="kutilayotgan" />
        <StatCard title="Bugungi darslar" value={stats?.today_lessons ?? '—'} icon="📚" color="#8b5cf6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Bugungi darslar</h3>
          {(stats?.today_schedule || []).map((lesson, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: 50, fontSize: 12, color: '#94a3b8' }}>{lesson.start_time}</div>
              <div>
                <div style={{ fontWeight: 500 }}>{lesson.subject}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{lesson.teacher} · {lesson.room}</div>
              </div>
            </div>
          ))}
          {!stats?.today_schedule?.length && <Empty />}
        </div>

        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>So'nggi baholar</h3>
          {(stats?.recent_grades || []).map((g, i) => {
            const c = gradeColor(g.score)
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{g.subject}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{g.category} · {g.date}</div>
                </div>
                <span style={{ background: c.bg, color: c.fg, padding: '4px 12px', borderRadius: 20,
                  fontWeight: 700, fontSize: 14 }}>{g.score}</span>
              </div>
            )
          })}
          {!stats?.recent_grades?.length && <Empty />}
        </div>
      </div>
    </PageWrapper>
  )
}

const Empty = () => (
  <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Ma'lumot yo'q</div>
)
