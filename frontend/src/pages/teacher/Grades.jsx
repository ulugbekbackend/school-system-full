import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/shared/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import { listGrades, createGrade, listCategories } from '@/api/grades'
import { listStudents } from '@/api/students'
import { listSubjects } from '@/api/staff'
import { rowsOf, formatDate, gradeColor } from '@/utils/helpers'

const TERMS = [['1', '1-chorak'], ['2', '2-chorak'], ['3', '3-chorak'], ['4', '4-chorak']]
const EMPTY = { student: '', subject: '', category: '', score: '', max_score: 100, term: '1',
  academic_year: '2024-2025', date: new Date().toISOString().slice(0, 10), comment: '' }

export default function TeacherGrades() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const { data, isLoading } = useQuery({ queryKey: ['grades'], queryFn: () => listGrades() })
  const { data: students } = useQuery({ queryKey: ['students-min'], queryFn: () => listStudents() })
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: listSubjects })
  const { data: cats } = useQuery({ queryKey: ['grade-cats'], queryFn: listCategories })

  const mutation = useMutation({
    mutationFn: createGrade,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['grades'] }); setOpen(false); setForm(EMPTY) },
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const columns = [
    { key: 'student_name', label: 'Talaba' },
    { key: 'subject_name', label: 'Fan' },
    { key: 'category_name', label: 'Tur', render: (r) => r.category_name || '—' },
    { key: 'score', label: 'Baho', render: (r) => {
      const c = gradeColor(r.score)
      return <Badge color={r.score >= 80 ? 'green' : r.score >= 60 ? 'yellow' : 'red'}>{r.score}/{r.max_score}</Badge>
    } },
    { key: 'term', label: 'Chorak', render: (r) => `${r.term}-chorak` },
    { key: 'date', label: 'Sana', render: (r) => formatDate(r.date) },
  ]

  return (
    <PageWrapper title="Baholar">
      <div style={{ display: 'flex', marginBottom: 16 }}>
        <div style={{ flex: 1 }} />
        <Button onClick={() => setOpen(true)}>+ Baho qo'yish</Button>
      </div>
      <DataTable columns={columns} rows={rowsOf(data)} loading={isLoading} />

      <Modal open={open} onClose={() => setOpen(false)} title="Yangi baho">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }}>
          <Field label="Talaba" type="select" value={form.student} onChange={set('student')} required
            options={rowsOf(students).map((s) => ({ value: s.id, label: `${s.full_name} (${s.student_id})` }))} />
          <Field label="Fan" type="select" value={form.subject} onChange={set('subject')} required
            options={rowsOf(subjects).map((s) => ({ value: s.id, label: s.name }))} />
          <Field label="Tur" type="select" value={form.category} onChange={set('category')}
            options={rowsOf(cats).map((c) => ({ value: c.id, label: c.name }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Baho" type="number" value={form.score} onChange={set('score')} required />
            <Field label="Maksimal" type="number" value={form.max_score} onChange={set('max_score')} />
            <Field label="Chorak" type="select" value={form.term} onChange={set('term')} required
              options={TERMS.map(([v, l]) => ({ value: v, label: l }))} />
            <Field label="Sana" type="date" value={form.date} onChange={set('date')} required />
          </div>
          <Field label="Izoh" value={form.comment} onChange={set('comment')} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Bekor</Button>
            <Button type="submit" disabled={mutation.isPending}>Saqlash</Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
