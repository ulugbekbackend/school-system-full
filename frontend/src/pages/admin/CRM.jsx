import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/shared/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import { listLeads, createLead, updateLead } from '@/api/crm'
import { rowsOf } from '@/utils/helpers'

const STATUS = [['new', 'Yangi', 'blue'], ['contacted', "Bog'lanildi", 'purple'],
  ['trial', 'Sinov darsi', 'yellow'], ['enrolled', 'Qabul qilindi', 'green'], ['rejected', 'Rad etildi', 'red']]
const SOURCES = [['instagram', 'Instagram'], ['telegram', 'Telegram'], ['referral', 'Tavsiya'],
  ['website', 'Sayt'], ['call', "Qo'ng'iroq"], ['other', 'Boshqa']]
const EMPTY = { child_name: '', child_age: '', parent_name: '', parent_phone: '', parent_email: '',
  source: 'other', status: 'new', target_class: '', notes: '' }

export default function AdminCRM() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [filter, setFilter] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['leads', filter], queryFn: () => listLeads({ status: filter || undefined }) })
  const invalidate = () => qc.invalidateQueries({ queryKey: ['leads'] })
  const createMut = useMutation({ mutationFn: createLead, onSuccess: () => { invalidate(); setOpen(false); setForm(EMPTY) } })
  const statusMut = useMutation({ mutationFn: ({ id, status }) => updateLead(id, { status }), onSuccess: invalidate })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const columns = [
    { key: 'child_name', label: 'Bola', render: (r) => `${r.child_name} (${r.child_age})` },
    { key: 'parent_name', label: 'Ota-ona' },
    { key: 'parent_phone', label: 'Telefon' },
    { key: 'source_display', label: 'Manba' },
    { key: 'status', label: 'Holat', render: (r) => (
      <select value={r.status} onChange={(e) => statusMut.mutate({ id: r.id, status: e.target.value })}
        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13 }}>
        {STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    ) },
  ]

  const counts = STATUS.map(([key, label, color]) => ({
    label, color, count: rowsOf(data).filter((l) => l.status === key).length,
  }))

  return (
    <PageWrapper title="CRM — Qabul jarayoni">
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {counts.map((c) => (
          <div key={c.label} style={{ flex: 1, minWidth: 120, background: '#fff', borderRadius: 10,
            padding: '12px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{c.count}</div>
            <Badge color={c.color}>{c.label}</Badge>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
          <option value="">Barcha holat</option>
          {STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <Button onClick={() => setOpen(true)}>+ Yangi lead</Button>
      </div>

      <DataTable columns={columns} rows={rowsOf(data)} loading={isLoading} empty="Leadlar yo'q" />

      <Modal open={open} onClose={() => setOpen(false)} title="Yangi lead" width={520}>
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form) }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Bola ismi" value={form.child_name} onChange={set('child_name')} required />
            <Field label="Yoshi" type="number" value={form.child_age} onChange={set('child_age')} required />
            <Field label="Ota-ona ismi" value={form.parent_name} onChange={set('parent_name')} required />
            <Field label="Telefon" value={form.parent_phone} onChange={set('parent_phone')} required />
            <Field label="Email" type="email" value={form.parent_email} onChange={set('parent_email')} />
            <Field label="Maqsad sinf" value={form.target_class} onChange={set('target_class')} />
            <Field label="Manba" type="select" value={form.source} onChange={set('source')}
              options={SOURCES.map(([v, l]) => ({ value: v, label: l }))} />
            <Field label="Holat" type="select" value={form.status} onChange={set('status')}
              options={STATUS.map(([v, l]) => ({ value: v, label: l }))} />
          </div>
          <Field label="Izoh" type="textarea" value={form.notes} onChange={set('notes')} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Bekor</Button>
            <Button type="submit" disabled={createMut.isPending}>Saqlash</Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
