import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/shared/Badge'
import { listTeachers, listStaff } from '@/api/staff'
import { rowsOf, formatMoney } from '@/utils/helpers'

const TABS = [{ key: 'teachers', label: "O'qituvchilar" }, { key: 'staff', label: 'Boshqa xodimlar' }]

export default function HRStaffList() {
  const [tab, setTab] = useState('teachers')
  const { data: teachers, isLoading: tl } = useQuery({ queryKey: ['teachers'], queryFn: () => listTeachers() })
  const { data: staff, isLoading: sl } = useQuery({ queryKey: ['staff-members'], queryFn: () => listStaff() })

  const teacherCols = [
    { key: 'teacher_id', label: 'ID' },
    { key: 'full_name', label: 'F.I.O' },
    { key: 'department_name', label: "Bo'lim", render: (r) => r.department_name || '—' },
    { key: 'salary', label: 'Maosh', render: (r) => formatMoney(r.salary) },
    { key: 'is_active', label: 'Holat', render: (r) => <Badge color={r.is_active ? 'green' : 'gray'}>{r.is_active ? 'Faol' : 'Nofaol'}</Badge> },
  ]
  const staffCols = [
    { key: 'staff_id', label: 'ID' },
    { key: 'full_name', label: 'F.I.O' },
    { key: 'position', label: 'Lavozim' },
    { key: 'salary', label: 'Maosh', render: (r) => formatMoney(r.salary) },
  ]

  return (
    <PageWrapper title="Xodimlar ro'yxati">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14,
            fontWeight: 500, background: tab === t.key ? '#2563eb' : '#fff',
            color: tab === t.key ? '#fff' : '#475569' }}>{t.label}</button>
        ))}
      </div>
      {tab === 'teachers'
        ? <DataTable columns={teacherCols} rows={rowsOf(teachers)} loading={tl} />
        : <DataTable columns={staffCols} rows={rowsOf(staff)} loading={sl} />}
    </PageWrapper>
  )
}
