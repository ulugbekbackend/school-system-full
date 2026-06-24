export default function StatCard({ title, value, sub, color = '#3b82f6', icon }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
      alignItems: 'center', gap: 16 }}>
      {icon && (
        <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
          {icon}
        </div>
      )}
      <div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a' }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}
