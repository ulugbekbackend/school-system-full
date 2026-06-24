import { useQuery } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import { mySchedule } from '@/api/academics'

const DAYS = { 1: 'Dushanba', 2: 'Seshanba', 3: 'Chorshanba', 4: 'Payshanba', 5: 'Juma', 6: 'Shanba' }
const card = { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }

export default function StudentSchedule() {
  const { data, isLoading } = useQuery({ queryKey: ['my-schedule'], queryFn: mySchedule })
  const items = data?.schedule || []

  const byDay = {}
  items.forEach((it) => { (byDay[it.day_of_week] ||= []).push(it) })

  return (
    <PageWrapper title="Dars jadvali">
      {isLoading && <p style={{ color: '#64748b' }}>Yuklanmoqda...</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {Object.keys(DAYS).map((d) => (
          <div key={d} style={card}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: '#0f172a' }}>{DAYS[d]}</div>
            {(byDay[d] || []).map((it) => (
              <div key={it.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{it.subject_name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{it.time} · {it.room_name || '—'}</div>
              </div>
            ))}
            {!(byDay[d] || []).length && <div style={{ fontSize: 13, color: '#cbd5e1' }}>Dars yo'q</div>}
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}
