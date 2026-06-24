import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import DataTable from '@/components/shared/DataTable'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import { listLessons, createLesson, listCourses } from '@/api/lms'
import { rowsOf } from '@/utils/helpers'

const EMPTY = { course: '', title: '', content: '', video_url: '', order: 0 }

export default function TeacherMaterials() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const { data, isLoading } = useQuery({ queryKey: ['lessons'], queryFn: () => listLessons() })
  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: () => listCourses() })

  const mutation = useMutation({
    mutationFn: createLesson,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lessons'] }); setOpen(false); setForm(EMPTY) },
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const columns = [
    { key: 'order', label: '#', render: (r) => r.order },
    { key: 'title', label: 'Dars mavzusi' },
    { key: 'video_url', label: 'Video', render: (r) => r.video_url
      ? <a href={r.video_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>havola</a> : '—' },
    { key: 'files', label: 'Fayllar', render: (r) => `${r.files?.length || 0} ta` },
  ]

  return (
    <PageWrapper title="O'quv materiallari">
      <div style={{ display: 'flex', marginBottom: 16 }}>
        <div style={{ flex: 1 }} />
        <Button onClick={() => setOpen(true)}>+ Dars qo'shish</Button>
      </div>
      <DataTable columns={columns} rows={rowsOf(data)} loading={isLoading} empty="Materiallar yo'q" />

      <Modal open={open} onClose={() => setOpen(false)} title="Yangi dars / material">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }}>
          <Field label="Kurs" type="select" value={form.course} onChange={set('course')} required
            options={rowsOf(courses).map((c) => ({ value: c.id, label: c.title }))} />
          <Field label="Mavzu" value={form.title} onChange={set('title')} required />
          <Field label="Matn (kontent)" type="textarea" value={form.content} onChange={set('content')} />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0 16px' }}>
            <Field label="Video havola" value={form.video_url} onChange={set('video_url')} placeholder="https://..." />
            <Field label="Tartib" type="number" value={form.order} onChange={set('order')} />
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
