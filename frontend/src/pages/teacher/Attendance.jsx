import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import Button from '@/components/ui/Button'
import { listClasses, listStudents } from '@/api/students'
import { listSubjects } from '@/api/staff'
import { bulkAttendance } from '@/api/attendance'
import { rowsOf } from '@/utils/helpers'

const STATUSES = [
  ['present', 'Keldi', '#10b981'],
  ['absent', 'Kelmadi', '#ef4444'],
  ['late', 'Kech', '#f59e0b'],
  ['excused', 'Uzrli', '#6366f1'],
]
const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }

export default function TeacherAttendance() {
  const [cls, setCls] = useState('')
  const [subject, setSubject] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [marks, setMarks] = useState({})   // {studentId: status}
  const [saved, setSaved] = useState(false)

  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: listClasses })
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: listSubjects })
  const { data: students } = useQuery({
    queryKey: ['students', cls],
    queryFn: () => listStudents({ current_class: cls, status: 'active' }),
    enabled: !!cls,
  })

  // Sinf o'zgarganda barchani "keldi" qilib boshlaymiz
  useEffect(() => {
    const init = {}
    rowsOf(students).forEach((s) => { init[s.id] = 'present' })
    setMarks(init); setSaved(false)
  }, [students])

  const mutation = useMutation({
    mutationFn: bulkAttendance,
    onSuccess: () => setSaved(true),
  })

  const submit = () => {
    const records = rowsOf(students).map((s) => ({
      student: s.id, subject: Number(subject), date, status: marks[s.id] || 'present',
    }))
    mutation.mutate(records)
  }

  const rows = rowsOf(students)
  const ready = cls && subject && date

  return (
    <PageWrapper title="Davomat kiritish">
      <div style={{ ...card, marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Sel label="Sinf" value={cls} onChange={setCls}
          options={rowsOf(classes).map((c) => ({ value: c.id, label: c.name }))} />
        <Sel label="Fan" value={subject} onChange={setSubject}
          options={rowsOf(subjects).map((s) => ({ value: s.id, label: s.name }))} />
        <div>
          <div style={lbl}>Sana</div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inp} />
        </div>
      </div>

      {!ready && <p style={{ color: '#64748b' }}>Davomatni boshlash uchun sinf, fan va sanani tanlang.</p>}

      {ready && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>{rows.length} ta talaba</h3>
            <Button onClick={submit} disabled={mutation.isPending || !rows.length}>
              {mutation.isPending ? 'Saqlanmoqda...' : 'Davomatni saqlash'}
            </Button>
          </div>
          {saved && <p style={{ color: '#10b981', marginBottom: 12 }}>✓ Davomat saqlandi</p>}

          {rows.map((s) => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 14 }}>{s.full_name} <span style={{ color: '#94a3b8' }}>({s.student_id})</span></span>
              <div style={{ display: 'flex', gap: 6 }}>
                {STATUSES.map(([val, label, color]) => {
                  const active = (marks[s.id] || 'present') === val
                  return (
                    <button key={val} onClick={() => setMarks({ ...marks, [s.id]: val })}
                      style={{ padding: '5px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                        border: `1px solid ${active ? color : '#e2e8f0'}`,
                        background: active ? color : '#fff', color: active ? '#fff' : '#64748b',
                        fontWeight: active ? 600 : 400 }}>{label}</button>
                  )
                })}
              </div>
            </div>
          ))}
          {!rows.length && <p style={{ color: '#94a3b8', padding: '12px 0' }}>Bu sinfda faol talaba yo'q.</p>}
        </div>
      )}
    </PageWrapper>
  )
}

const lbl = { fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }
const inp = { padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }
function Sel({ label, value, onChange, options }) {
  return (
    <div>
      <div style={lbl}>{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inp, minWidth: 160 }}>
        <option value="">— tanlang —</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
