import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/shared/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import { listStudents, createStudent, listClasses } from '@/api/students'
import { rowsOf } from '@/utils/helpers'

const STATUS_COLOR = { active: 'green', inactive: 'gray', graduated: 'blue', expelled: 'red' }
const STATUS_LABEL = { active: 'Faol', inactive: 'Nofaol', graduated: 'Bitirgan', expelled: 'Chiqarilgan' }

const EMPTY = {
  username: '', password: '', first_name: '', last_name: '', email: '', phone: '',
  student_id: '', current_class: '', date_of_birth: '', gender: '', enrollment_date: '', address: '',
}

export default function AdminStudents() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['students', status, search],
    queryFn: () => listStudents({ status: status || undefined, search: search || undefined }),
  })
  const { data: classesData } = useQuery({ queryKey: ['classes'], queryFn: listClasses })
  const classes = rowsOf(classesData)

  const mutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      setOpen(false); setForm(EMPTY); setError('')
    },
    onError: (e) => setError(JSON.stringify(e.response?.data || 'Xatolik')),
  })

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const columns = [
    { key: 'student_id', label: 'ID' },
    { key: 'full_name', label: 'F.I.O', render: (r) => r.full_name },
    { key: 'current_class_name', label: 'Sinf', render: (r) => r.current_class_name || '—' },
    { key: 'gender', label: 'Jins', render: (r) => (r.gender === 'male' ? 'Erkak' : 'Ayol') },
    { key: 'status', label: 'Holat', render: (r) => (
      <Badge color={STATUS_COLOR[r.status]}>{STATUS_LABEL[r.status]}</Badge>
    ) },
  ]

  return (
    <PageWrapper title="Talabalar">
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <input placeholder="Qidirish (ism, ID)..." value={search}
          onChange={(e) => setSearch(e.target.value)} style={filterInput} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={filterInput}>
          <option value="">Barcha holat</option>
          <option value="active">Faol</option>
          <option value="inactive">Nofaol</option>
          <option value="graduated">Bitirgan</option>
        </select>
        <div style={{ flex: 1 }} />
        <Button onClick={() => setOpen(true)}>+ Yangi talaba</Button>
      </div>

      <DataTable columns={columns} rows={rowsOf(data)} loading={isLoading} />

      <Modal open={open} onClose={() => setOpen(false)} title="Yangi talaba qo'shish" width={560}>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }}>
          <div style={grid2}>
            <Field label="Ism" value={form.first_name} onChange={set('first_name')} required />
            <Field label="Familiya" value={form.last_name} onChange={set('last_name')} required />
            <Field label="Login" value={form.username} onChange={set('username')} required />
            <Field label="Parol" type="password" value={form.password} onChange={set('password')} required />
            <Field label="Email" type="email" value={form.email} onChange={set('email')} />
            <Field label="Telefon" value={form.phone} onChange={set('phone')} />
            <Field label="Talaba ID" value={form.student_id} onChange={set('student_id')} required />
            <Field label="Sinf" type="select" value={form.current_class} onChange={set('current_class')}
              options={classes.map((c) => ({ value: c.id, label: c.name }))} />
            <Field label="Tug'ilgan sana" type="date" value={form.date_of_birth} onChange={set('date_of_birth')} required />
            <Field label="Jins" type="select" value={form.gender} onChange={set('gender')} required
              options={[{ value: 'male', label: 'Erkak' }, { value: 'female', label: 'Ayol' }]} />
            <Field label="Qabul sanasi" type="date" value={form.enrollment_date} onChange={set('enrollment_date')} required />
          </div>
          <Field label="Manzil" type="textarea" value={form.address} onChange={set('address')} />
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

const filterInput = { padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }
