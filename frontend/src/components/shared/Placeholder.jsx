import PageWrapper from '@/components/layout/PageWrapper'

// Hali to'liq qurilmagan sahifalar uchun vaqtinchalik joy egasi.
export default function Placeholder({ title }) {
  return (
    <PageWrapper title={title}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '48px 32px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#334155' }}>
          "{title}" sahifasi tayyorlanmoqda
        </div>
        <div style={{ fontSize: 14, marginTop: 8 }}>
          Backend API tayyor — bu sahifa keyingi bosqichda to'ldiriladi.
        </div>
      </div>
    </PageWrapper>
  )
}
