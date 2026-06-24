import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import DataTable from '@/components/shared/DataTable'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import { listAssignments, createAssignment, listCourses } from '@/api/lms'
import { rowsOf, formatDate } from '@/utils/helpers'

const EMPTY = { course: '', title: '', description: '', due_date: '', max_score: 100, allow_late: false }

export default function TeacherAssignments() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const { data, isLoading } = useQuery({ queryKey: ['assignments'], queryFn: () => listAssignments() })
  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: () => listCourses() })

  const mutation = useMutation({
    mutationFn: (f) => createAssignment({ ...f, due_date: new Date(f.due_date).toISOString() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assignments'] }); setOpen(false); setForm(EMPTY) },
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const columns = [
    { key: 'title', label: 'Topshiriq' },
    { key: 'course_title', label: 'Kurs' },
    { key: 'max_score', label: 'Maksimal ball' },
    { key: 'submission_count', label: 'Topshirildi', render: (r) => `${r.submission_count} ta` },
    { key: 'due_date', label: 'Muddat', render: (r) => formatDate(r.due_date) },
  ]

  return (
    <PageWrapper title="Topshiriqlar">
      <div style={{ display: 'flex', marginBottom: 16 }}>
        <div style={{ flex: 1 }} />
        <Button onClick={() => setOpen(true)}>+ Topshiriq</Button>
      </div>
      <DataTable columns={columns} rows={rowsOf(data)} loading={isLoading} />

      <Modal open={open} onClose={() => setOpen(false)} title="Yangi topshiriq">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }}>
          <Field label="Kurs" type="select" value={form.course} onChange={set('course')} required
            options={rowsOf(courses).map((c) => ({ value: c.id, label: c.title }))} />
          <Field label="Sarlavha" value={form.title} onChange={set('title')} required />
          <Field label="Tavsif" type="textarea" value={form.description} onChange={set('description')} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Muddat" type="datetime-local" value={form.due_date} onChange={set('due_date')} required />
            <Field label="Maksimal ball" type="number" value={form.max_score} onChange={set('max_score')} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Bekor</Button>
            <Button type="submit" disabled={mutation.isPending}>Saqlash</Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
