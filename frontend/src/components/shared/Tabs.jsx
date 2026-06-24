import { useState } from 'react'

// tabs: [{ key, label, render: () => JSX }]
export default function Tabs({ tabs, initial }) {
  const [active, setActive] = useState(initial || tabs[0]?.key)
  const current = tabs.find((t) => t.key === active)
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap',
        borderBottom: '1px solid #e2e8f0', paddingBottom: 0 }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActive(t.key)} style={{
            padding: '9px 16px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
            background: 'transparent', color: active === t.key ? '#2563eb' : '#64748b',
            borderBottom: active === t.key ? '2px solid #2563eb' : '2px solid transparent',
            marginBottom: -1 }}>{t.label}</button>
        ))}
      </div>
      {current?.render()}
    </div>
  )
}
