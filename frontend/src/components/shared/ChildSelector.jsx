// Ota-ona sahifalarida farzandni tanlash uchun. children: [{id, full_name, class_name}]
export default function ChildSelector({ children: kids, value, onChange }) {
  if (!kids?.length) return null
  if (kids.length === 1) {
    return (
      <div style={{ marginBottom: 16, fontSize: 14, color: '#475569' }}>
        Farzand: <b>{kids[0].full_name}</b> ({kids[0].class_name})
      </div>
    )
  }
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}
      style={{ marginBottom: 16, padding: '9px 12px', borderRadius: 8,
        border: '1px solid #e2e8f0', fontSize: 14 }}>
      {kids.map((c) => (
        <option key={c.id} value={c.id}>{c.full_name} — {c.class_name}</option>
      ))}
    </select>
  )
}
