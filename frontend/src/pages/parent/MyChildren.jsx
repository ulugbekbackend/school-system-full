import { useQuery } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import { parentSummary } from '@/api/analytics'

const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }

export default function ParentChildren() {
  const { data, isLoading } = useQuery({ queryKey: ['parent-base'], queryFn: () => parentSummary() })
  const children = data?.children || []

  return (
    <PageWrapper title="Farzandlarim">
      {isLoading && <p style={{ color: '#64748b' }}>Yuklanmoqda...</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {children.map((c) => (
          <div key={c.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#dbeafe',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              fontWeight: 700, color: '#1d4ed8' }}>
              {c.full_name?.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{c.full_name}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{c.class_name} · {c.student_id}</div>
            </div>
          </div>
        ))}
        {!isLoading && !children.length && <p style={{ color: '#94a3b8' }}>Farzand topilmadi.</p>}
      </div>
    </PageWrapper>
  )
}
