import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/shared/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import { listUsers, createUser } from '@/api/auth'
import { rowsOf } from '@/utils/helpers'
import { ROLE_LABELS } from '@/utils/constants'

const ROLE_COLOR = { admin: 'purple', teacher: 'blue', student: 'green', parent: 'yellow', hr: 'gray', accountant: 'gray' }
const EMPTY = { username: '', password: '', first_name: '', last_name: '', email: '', phone: '', role: '' }

export default function AdminSettings() {
  const qc = useQueryClient()
  const [role, setRole] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['users', role],
    queryFn: () => listUsers({ role: role || undefined }),
  })
  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setOpen(false); setForm(EMPTY); setError('') },
    onError: (e) => setError(JSON.stringify(e.response?.data || 'Xatolik')),
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const columns = [
    { key: 'username', label: 'Login' },
    { key: 'full_name', label: 'F.I.O', render: (r) => r.full_name || '—' },
    { key: 'email', label: 'Email', render: (r) => r.email || '—' },
    { key: 'role', label: 'Rol', render: (r) => <Badge color={ROLE_COLOR[r.role]}>{ROLE_LABELS[r.role] || r.role}</Badge> },
    { key: 'is_active', label: 'Holat', render: (r) => <Badge color={r.is_active ? 'green' : 'gray'}>{r.is_active ? 'Faol' : 'Nofaol'}</Badge> },
  ]

  return (
    <PageWrapper title="Sozlamalar — Foydalanuvchilar">
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <select value={role} onChange={(e) => setRole(e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
          <option value="">Barcha rollar</option>
          {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <Button onClick={() => setOpen(true)}>+ Foydalanuvchi</Button>
      </div>

      <DataTable columns={columns} rows={rowsOf(data)} loading={isLoading} />

      <Modal open={open} onClose={() => setOpen(false)} title="Yangi foydalanuvchi">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }}>
          <Field label="Ism" value={form.first_name} onChange={set('first_name')} required />
          <Field label="Familiya" value={form.last_name} onChange={set('last_name')} required />
          <Field label="Login" value={form.username} onChange={set('username')} required />
          <Field label="Parol" type="password" value={form.password} onChange={set('password')} required />
          <Field label="Email" type="email" value={form.email} onChange={set('email')} />
          <Field label="Telefon" value={form.phone} onChange={set('phone')} />
          <Field label="Rol" type="select" value={form.role} onChange={set('role')} required
            options={Object.entries(ROLE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
          {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Bekor</Button>
            <Button type="submit" disabled={mutation.isPending}>Saqlash</Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
