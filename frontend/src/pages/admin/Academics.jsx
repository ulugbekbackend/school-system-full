import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import Tabs from '@/components/shared/Tabs'
import CrudResource from '@/components/shared/CrudResource'
import DataTable from '@/components/shared/DataTable'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import { listClasses, createClass } from '@/api/students'
import { listSubjects, createSubject, listDepartments, createDepartment, listTeachers } from '@/api/staff'
import { listRooms, createRoom, listTimeSlots, createTimeSlot, listSchedule, createSchedule } from '@/api/academics'
import { listCategories, createCategory } from '@/api/grades'
import { listCourses, createCourse } from '@/api/lms'
import { rowsOf } from '@/utils/helpers'

const DAYS = [[1, 'Dushanba'], [2, 'Seshanba'], [3, 'Chorshanba'], [4, 'Payshanba'], [5, 'Juma'], [6, 'Shanba']]
const ROOM_TYPES = [['class', 'Sinf'], ['lab', 'Laboratoriya'], ['gym', 'Sport zal'], ['hall', 'Zal']]

export default function AdminAcademics() {
  const { data: teachers } = useQuery({ queryKey: ['teachers'], queryFn: () => listTeachers() })
  const { data: classesD } = useQuery({ queryKey: ['classes'], queryFn: listClasses })
  const { data: subjectsD } = useQuery({ queryKey: ['subjects'], queryFn: listSubjects })
  const teacherOpts = rowsOf(teachers).map((t) => ({ value: t.id, label: t.full_name }))
  const classOpts = rowsOf(classesD).map((c) => ({ value: c.id, label: c.name }))
  const subjectOpts = rowsOf(subjectsD).map((s) => ({ value: s.id, label: s.name }))

  const tabs = [
    { key: 'classes', label: 'Sinflar', render: () => (
      <CrudResource title="Sinf" queryKey="classes" listFn={listClasses} createFn={createClass}
        columns={[
          { key: 'name', label: 'Nomi' },
          { key: 'grade_level', label: 'Daraja' },
          { key: 'academic_year', label: "O'quv yili" },
          { key: 'homeroom_teacher_name', label: 'Sinf rahbari', render: (r) => r.homeroom_teacher_name || '—' },
          { key: 'student_count', label: 'Talabalar', render: (r) => `${r.student_count} ta` },
        ]}
        fields={[
          { name: 'name', label: 'Nomi (10-A)', required: true },
          { name: 'grade_level', label: 'Daraja (10)', type: 'number', required: true },
          { name: 'academic_year', label: "O'quv yili", placeholder: '2024-2025', required: true },
          { name: 'capacity', label: 'Sig\'imi', type: 'number', default: 30 },
          { name: 'homeroom_teacher', label: 'Sinf rahbari', type: 'select', options: teacherOpts },
        ]} />
    ) },
    { key: 'subjects', label: 'Fanlar', render: () => (
      <CrudResource title="Fan" queryKey="subjects" listFn={listSubjects} createFn={createSubject}
        columns={[
          { key: 'name', label: 'Nomi' }, { key: 'code', label: 'Kodi' }, { key: 'category', label: 'Kategoriya' },
        ]}
        fields={[
          { name: 'name', label: 'Nomi', required: true },
          { name: 'code', label: 'Kodi (MATH)', required: true },
          { name: 'category', label: 'Kategoriya' },
        ]} />
    ) },
    { key: 'departments', label: "Bo'limlar", render: () => (
      <CrudResource title="Bo'lim" queryKey="departments" listFn={listDepartments} createFn={createDepartment}
        columns={[{ key: 'name', label: 'Nomi' }, { key: 'head_name', label: 'Rahbar', render: (r) => r.head_name || '—' }]}
        fields={[{ name: 'name', label: 'Nomi', required: true }]} />
    ) },
    { key: 'rooms', label: 'Xonalar', render: () => (
      <CrudResource title="Xona" queryKey="rooms" listFn={listRooms} createFn={createRoom}
        columns={[
          { key: 'name', label: 'Nomi' }, { key: 'capacity', label: "Sig'imi" },
          { key: 'room_type', label: 'Turi', render: (r) => ROOM_TYPES.find(([v]) => v === r.room_type)?.[1] },
        ]}
        fields={[
          { name: 'name', label: 'Nomi', required: true },
          { name: 'capacity', label: "Sig'imi", type: 'number', default: 30 },
          { name: 'room_type', label: 'Turi', type: 'select', default: 'class',
            options: ROOM_TYPES.map(([v, l]) => ({ value: v, label: l })) },
        ]} />
    ) },
    { key: 'timeslots', label: 'Dars vaqtlari', render: () => (
      <CrudResource title="Dars vaqti" queryKey="timeslots" listFn={listTimeSlots} createFn={createTimeSlot}
        columns={[
          { key: 'order', label: '#' }, { key: 'name', label: 'Nomi' },
          { key: 'start_time', label: 'Boshlanish' }, { key: 'end_time', label: 'Tugash' },
        ]}
        fields={[
          { name: 'name', label: 'Nomi (1-dars)', required: true },
          { name: 'start_time', label: 'Boshlanish', type: 'time', required: true },
          { name: 'end_time', label: 'Tugash', type: 'time', required: true },
          { name: 'order', label: 'Tartib', type: 'number', required: true },
        ]} />
    ) },
    { key: 'categories', label: 'Baho turlari', render: () => (
      <CrudResource title="Baho turi" queryKey="grade-cats" listFn={listCategories} createFn={createCategory}
        columns={[{ key: 'name', label: 'Nomi' }, { key: 'weight', label: 'Vazni' }]}
        fields={[
          { name: 'name', label: 'Nomi (Nazorat ishi)', required: true },
          { name: 'weight', label: 'Vazni', type: 'number', default: 1.0 },
        ]} />
    ) },
    { key: 'courses', label: 'Kurslar', render: () => (
      <CrudResource title="Kurs" queryKey="courses" listFn={listCourses} createFn={createCourse}
        columns={[
          { key: 'title', label: 'Nomi' },
          { key: 'subject_name', label: 'Fan' },
          { key: 'teacher_name', label: "O'qituvchi" },
          { key: 'class_name', label: 'Sinf' },
          { key: 'lesson_count', label: 'Darslar', render: (r) => `${r.lesson_count} ta` },
        ]}
        fields={[
          { name: 'title', label: 'Kurs nomi', required: true },
          { name: 'subject', label: 'Fan', type: 'select', options: subjectOpts, required: true },
          { name: 'teacher', label: "O'qituvchi", type: 'select', options: teacherOpts, required: true },
          { name: 'school_class', label: 'Sinf', type: 'select', options: classOpts, required: true },
          { name: 'academic_year', label: "O'quv yili", default: '2024-2025', required: true },
          { name: 'description', label: 'Tavsif', type: 'textarea' },
        ]} />
    ) },
    { key: 'schedule', label: 'Dars jadvali', render: () => <ScheduleTab teacherOpts={teacherOpts} /> },
  ]

  return (
    <PageWrapper title="Akademik boshqaruv">
      <Tabs tabs={tabs} />
    </PageWrapper>
  )
}

function ScheduleTab({ teacherOpts }) {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const EMPTY = { school_class: '', subject: '', teacher: '', room: '', time_slot: '', day_of_week: '', academic_year: '2024-2025' }
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['schedule'], queryFn: () => listSchedule() })
  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: listClasses })
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: listSubjects })
  const { data: rooms } = useQuery({ queryKey: ['rooms'], queryFn: listRooms })
  const { data: slots } = useQuery({ queryKey: ['timeslots'], queryFn: listTimeSlots })

  const mutation = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['schedule'] }); setOpen(false); setForm(EMPTY); setError('') },
    onError: (e) => setError(JSON.stringify(e.response?.data || 'Xatolik')),
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const columns = [
    { key: 'day_name', label: 'Kun' },
    { key: 'time', label: 'Vaqt' },
    { key: 'class_name', label: 'Sinf' },
    { key: 'subject_name', label: 'Fan' },
    { key: 'teacher_name', label: "O'qituvchi" },
    { key: 'room_name', label: 'Xona', render: (r) => r.room_name || '—' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: 16 }}>
        <div style={{ flex: 1 }} />
        <Button onClick={() => setOpen(true)}>+ Jadvalga qo'shish</Button>
      </div>
      <DataTable columns={columns} rows={rowsOf(data)} loading={isLoading} empty="Jadval bo'sh" />

      <Modal open={open} onClose={() => setOpen(false)} title="Dars jadvaliga qo'shish">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }}>
          <Field label="Sinf" type="select" value={form.school_class} onChange={set('school_class')} required
            options={rowsOf(classes).map((c) => ({ value: c.id, label: c.name }))} />
          <Field label="Fan" type="select" value={form.subject} onChange={set('subject')} required
            options={rowsOf(subjects).map((s) => ({ value: s.id, label: s.name }))} />
          <Field label="O'qituvchi" type="select" value={form.teacher} onChange={set('teacher')} required
            options={teacherOpts} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Xona" type="select" value={form.room} onChange={set('room')}
              options={rowsOf(rooms).map((r) => ({ value: r.id, label: r.name }))} />
            <Field label="Dars vaqti" type="select" value={form.time_slot} onChange={set('time_slot')} required
              options={rowsOf(slots).map((s) => ({ value: s.id, label: s.name }))} />
            <Field label="Kun" type="select" value={form.day_of_week} onChange={set('day_of_week')} required
              options={DAYS.map(([v, l]) => ({ value: v, label: l }))} />
            <Field label="O'quv yili" value={form.academic_year} onChange={set('academic_year')} required />
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Bekor</Button>
            <Button type="submit" disabled={mutation.isPending}>Saqlash</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
