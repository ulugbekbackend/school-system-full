import { useQuery } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import { listCourses } from '@/api/lms'
import { rowsOf } from '@/utils/helpers'

const card = { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }

export default function StudentCourses() {
  const { data, isLoading } = useQuery({ queryKey: ['courses'], queryFn: () => listCourses() })
  const courses = rowsOf(data)

  return (
    <PageWrapper title="Darslarim">
      {isLoading && <p style={{ color: '#64748b' }}>Yuklanmoqda...</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {courses.map((c) => (
          <div key={c.id} style={card}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{c.title}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
              {c.subject_name} · {c.teacher_name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8' }}>
              <span>📚 {c.lesson_count} dars</span>
              <span>{c.academic_year}</span>
            </div>
          </div>
        ))}
        {!isLoading && !courses.length && <p style={{ color: '#94a3b8' }}>Kurslar yo'q.</p>}
      </div>
    </PageWrapper>
  )
}
