const baseInput = {
  display: 'block', width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0',
  borderRadius: 8, marginTop: 6, fontSize: 14, boxSizing: 'border-box', background: '#fff',
}

// Universal forma maydoni: type='select' bo'lsa options, 'textarea' bo'lsa ko'p qatorli.
export default function Field({ label, type = 'text', options, value, onChange, required, ...rest }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </span>
      {type === 'select' ? (
        <select value={value ?? ''} onChange={onChange} required={required} style={baseInput} {...rest}>
          <option value="">— tanlang —</option>
          {(options || []).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea value={value ?? ''} onChange={onChange} required={required}
          rows={3} style={{ ...baseInput, resize: 'vertical' }} {...rest} />
      ) : (
        <input type={type} value={value ?? ''} onChange={onChange} required={required}
          style={baseInput} {...rest} />
      )}
    </label>
  )
}
