import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/shared/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import { listTeachers, createTeacher, listStaff, listDepartments } from '@/api/staff'
import { rowsOf, formatMoney } from '@/utils/helpers'

const TABS = [{ key: 'teachers', label: "O'qituvchilar" }, { key: 'staff', label: 'Xodimlar' }]
const EMPTY = {
  username: '', password: '', first_name: '', last_name: '', email: '', phone: '',
  teacher_id: '', department: '', qualification: '', hire_date: '', salary: '',
}

export default function AdminStaff() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('teachers')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  const { data: teachers, isLoading: tl } = useQuery({ queryKey: ['teachers'], queryFn: () => listTeachers() })
  const { data: staff, isLoading: sl } = useQuery({ queryKey: ['staff-members'], queryFn: () => listStaff() })
  const { data: depts } = useQuery({ queryKey: ['departments'], queryFn: listDepartments })

  const mutation = useMutation({
    mutationFn: createTeacher,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); setOpen(false); setForm(EMPTY); setError('') },
    onError: (e) => setError(JSON.stringify(e.response?.data || 'Xatolik')),
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const teacherCols = [
    { key: 'teacher_id', label: 'ID' },
    { key: 'full_name', label: 'F.I.O' },
    { key: 'department_name', label: "Bo'lim", render: (r) => r.department_name || '—' },
    { key: 'subjects', label: 'Fanlar', render: (r) => (r.subject_names || []).join(', ') || '—' },
    { key: 'salary', label: 'Maosh', render: (r) => formatMoney(r.salary) },
    { key: 'is_active', label: 'Holat', render: (r) => (
      <Badge color={r.is_active ? 'green' : 'gray'}>{r.is_active ? 'Faol' : 'Nofaol'}</Badge>
    ) },
  ]
  const staffCols = [
    { key: 'staff_id', label: 'ID' },
    { key: 'full_name', label: 'F.I.O' },
    { key: 'position', label: 'Lavozim' },
    { key: 'department_name', label: "Bo'lim", render: (r) => r.department_name || '—' },
    { key: 'salary', label: 'Maosh', render: (r) => formatMoney(r.salary) },
  ]

  return (
    <PageWrapper title="Xodimlar">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14,
            fontWeight: 500, background: tab === t.key ? '#2563eb' : '#fff',
            color: tab === t.key ? '#fff' : '#475569' }}>{t.label}</button>
        ))}
        <div style={{ flex: 1 }} />
        {tab === 'teachers' && <Button onClick={() => setOpen(true)}>+ O'qituvchi</Button>}
      </div>

      {tab === 'teachers'
        ? <DataTable columns={teacherCols} rows={rowsOf(teachers)} loading={tl} />
        : <DataTable columns={staffCols} rows={rowsOf(staff)} loading={sl} />}

      <Modal open={open} onClose={() => setOpen(false)} title="Yangi o'qituvchi" width={560}>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ ...form, salary: form.salary || 0 }) }}>
          <div style={grid2}>
            <Field label="Ism" value={form.first_name} onChange={set('first_name')} required />
            <Field label="Familiya" value={form.last_name} onChange={set('last_name')} required />
            <Field label="Login" value={form.username} onChange={set('username')} required />
            <Field label="Parol" type="password" value={form.password} onChange={set('password')} required />
            <Field label="Email" type="email" value={form.email} onChange={set('email')} />
            <Field label="Telefon" value={form.phone} onChange={set('phone')} />
            <Field label="O'qituvchi ID" value={form.teacher_id} onChange={set('teacher_id')} required />
            <Field label="Bo'lim" type="select" value={form.department} onChange={set('department')}
              options={rowsOf(depts).map((d) => ({ value: d.id, label: d.name }))} />
            <Field label="Ishga olingan sana" type="date" value={form.hire_date} onChange={set('hire_date')} required />
            <Field label="Maosh" type="number" value={form.salary} onChange={set('salary')} />
          </div>
          <Field label="Malaka" value={form.qualification} onChange={set('qualification')} />
          {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Bekor</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}

const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }
