// columns: [{ key, label, render? }]  ·  rows: massiv  ·  render(row) ixtiyoriy
export default function DataTable({ columns, rows, loading, empty = "Ma'lumot yo'q" }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      overflow: 'hidden' }}>
      <table style={{ width: '100%', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
            {columns.map((c) => (
              <th key={c.key} style={{ textAlign: 'left', padding: '12px 16px',
                fontWeight: 600, color: '#64748b', fontSize: 12, textTransform: 'uppercase',
                letterSpacing: '.02em' }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={columns.length} style={cellCenter}>Yuklanmoqda...</td></tr>
          )}
          {!loading && !rows?.length && (
            <tr><td colSpan={columns.length} style={cellCenter}>{empty}</td></tr>
          )}
          {!loading && rows?.map((row, i) => (
            <tr key={row.id ?? i} style={{ borderBottom: '1px solid #f8fafc' }}>
              {columns.map((c) => (
                <td key={c.key} style={{ padding: '12px 16px', color: '#334155' }}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const cellCenter = { padding: '28px 16px', textAlign: 'center', color: '#94a3b8' }
