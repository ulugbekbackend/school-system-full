const PRESETS = {
  green:  { bg: '#dcfce7', fg: '#166534' },
  red:    { bg: '#fee2e2', fg: '#991b1b' },
  yellow: { bg: '#fef9c3', fg: '#854d0e' },
  blue:   { bg: '#dbeafe', fg: '#1d4ed8' },
  gray:   { bg: '#f1f5f9', fg: '#475569' },
  purple: { bg: '#ede9fe', fg: '#6d28d9' },
}

export default function Badge({ children, color = 'gray' }) {
  const c = PRESETS[color] || PRESETS.gray
  return (
    <span style={{ background: c.bg, color: c.fg, padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}
