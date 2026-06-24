import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/shared/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import { listPayroll, createPayroll } from '@/api/hr'
import { listUsers } from '@/api/auth'
import { rowsOf, formatMoney } from '@/utils/helpers'

const EMPTY = { employee: '', month: '', base_salary: '', bonus: 0, deduction: 0 }

export default function HRPayroll() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['payroll'], queryFn: () => listPayroll() })
  const { data: users } = useQuery({ queryKey: ['users-staff'], queryFn: () => listUsers() })
  const employees = rowsOf(users).filter((u) => ['teacher', 'hr', 'accountant'].includes(u.role))

  const mutation = useMutation({
    mutationFn: createPayroll,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll'] }); setOpen(false); setForm(EMPTY); setError('') },
    onError: (e) => setError(JSON.stringify(e.response?.data || 'Xatolik')),
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const columns = [
    { key: 'employee_name', label: 'Xodim' },
    { key: 'month', label: 'Oy' },
    { key: 'base_salary', label: 'Asosiy', render: (r) => formatMoney(r.base_salary) },
    { key: 'bonus', label: 'Bonus', render: (r) => formatMoney(r.bonus) },
    { key: 'deduction', label: 'Ushlanma', render: (r) => formatMoney(r.deduction) },
    { key: 'net_salary', label: 'Sof maosh', render: (r) => <b>{formatMoney(r.net_salary)}</b> },
    { key: 'paid', label: 'Holat', render: (r) => <Badge color={r.paid ? 'green' : 'yellow'}>{r.paid ? "To'langan" : 'Kutilmoqda'}</Badge> },
  ]

  return (
    <PageWrapper title="Maosh (Payroll)">
      <div style={{ display: 'flex', marginBottom: 16 }}>
        <div style={{ flex: 1 }} />
        <Button onClick={() => setOpen(true)}>+ Maosh qo'shish</Button>
      </div>
      <DataTable columns={columns} rows={rowsOf(data)} loading={isLoading} />

      <Modal open={open} onClose={() => setOpen(false)} title="Maosh hisoblash">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }}>
          <Field label="Xodim" type="select" value={form.employee} onChange={set('employee')} required
            options={employees.map((u) => ({ value: u.id, label: `${u.full_name || u.username} (${u.role})` }))} />
          <Field label="Oy (YYYY-MM)" value={form.month} onChange={set('month')} placeholder="2026-06" required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Asosiy maosh" type="number" value={form.base_salary} onChange={set('base_salary')} required />
            <Field label="Bonus" type="number" value={form.bonus} onChange={set('bonus')} />
            <Field label="Ushlanma" type="number" value={form.deduction} onChange={set('deduction')} />
          </div>
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
