import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/shared/Badge'
import ChildSelector from '@/components/shared/ChildSelector'
import { parentSummary } from '@/api/analytics'
import { listAttendance } from '@/api/attendance'
import { rowsOf, formatDate } from '@/utils/helpers'

const STATUS = { present: ['green', 'Keldi'], absent: ['red', 'Kelmadi'],
  late: ['yellow', 'Kech keldi'], excused: ['purple', 'Uzrli'] }

export default function ParentAttendance() {
  const [childId, setChildId] = useState(null)
  const { data: base } = useQuery({ queryKey: ['parent-base'], queryFn: () => parentSummary() })
  const children = base?.children || []
  const active = childId || children[0]?.id

  const { data, isLoading } = useQuery({
    queryKey: ['child-attendance', active],
    queryFn: () => listAttendance({ student: active }),
    enabled: !!active,
  })

  const columns = [
    { key: 'date', label: 'Sana', render: (r) => formatDate(r.date) },
    { key: 'subject_name', label: 'Fan' },
    { key: 'status', label: 'Holat', render: (r) => <Badge color={STATUS[r.status]?.[0]}>{STATUS[r.status]?.[1]}</Badge> },
    { key: 'note', label: 'Izoh', render: (r) => r.note || '—' },
  ]

  return (
    <PageWrapper title="Farzand davomati">
      <ChildSelector children={children} value={active} onChange={setChildId} />
      <DataTable columns={columns} rows={rowsOf(data)} loading={isLoading} empty="Davomat yozuvlari yo'q" />
    </PageWrapper>
  )
}
