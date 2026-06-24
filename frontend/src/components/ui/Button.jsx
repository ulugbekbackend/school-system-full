const VARIANTS = {
  primary:   { background: '#2563eb', color: '#fff', border: 'none' },
  secondary: { background: '#fff', color: '#334155', border: '1px solid #e2e8f0' },
  danger:    { background: '#ef4444', color: '#fff', border: 'none' },
  ghost:     { background: 'transparent', color: '#2563eb', border: 'none' },
}

export default function Button({ children, variant = 'primary', size = 'md', style, ...props }) {
  const pad = size === 'sm' ? '6px 12px' : '10px 16px'
  const font = size === 'sm' ? 13 : 14
  return (
    <button
      {...props}
      style={{
        ...VARIANTS[variant], padding: pad, fontSize: font, fontWeight: 500,
        borderRadius: 8, cursor: props.disabled ? 'default' : 'pointer',
        opacity: props.disabled ? 0.6 : 1, transition: 'opacity .15s', ...style,
      }}
    >
      {children}
    </button>
  )
}
