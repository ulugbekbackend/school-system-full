import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/shared/Badge'
import ChildSelector from '@/components/shared/ChildSelector'
import { parentSummary } from '@/api/analytics'
import { listGrades } from '@/api/grades'
import { rowsOf, formatDate } from '@/utils/helpers'

export default function ParentGrades() {
  const [childId, setChildId] = useState(null)
  const { data: base } = useQuery({ queryKey: ['parent-base'], queryFn: () => parentSummary() })
  const children = base?.children || []
  const active = childId || children[0]?.id

  const { data, isLoading } = useQuery({
    queryKey: ['child-grades', active],
    queryFn: () => listGrades({ student: active }),
    enabled: !!active,
  })

  const columns = [
    { key: 'subject_name', label: 'Fan' },
    { key: 'category_name', label: 'Tur', render: (r) => r.category_name || '—' },
    { key: 'score', label: 'Baho', render: (r) => (
      <Badge color={r.score >= 80 ? 'green' : r.score >= 60 ? 'yellow' : 'red'}>{r.score}/{r.max_score}</Badge>
    ) },
    { key: 'term', label: 'Chorak', render: (r) => `${r.term}-chorak` },
    { key: 'date', label: 'Sana', render: (r) => formatDate(r.date) },
  ]

  return (
    <PageWrapper title="Farzand baholari">
      <ChildSelector children={children} value={active} onChange={setChildId} />
      <DataTable columns={columns} rows={rowsOf(data)} loading={isLoading} empty="Baholar yo'q" />
    </PageWrapper>
  )
}
