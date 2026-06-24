import { useQuery } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/shared/Badge'
import { listGrades } from '@/api/grades'
import { rowsOf, formatDate } from '@/utils/helpers'

export default function StudentGrades() {
  const { data, isLoading } = useQuery({ queryKey: ['my-grades'], queryFn: () => listGrades() })

  const columns = [
    { key: 'subject_name', label: 'Fan' },
    { key: 'category_name', label: 'Tur', render: (r) => r.category_name || '—' },
    { key: 'score', label: 'Baho', render: (r) => (
      <Badge color={r.score >= 80 ? 'green' : r.score >= 60 ? 'yellow' : 'red'}>{r.score}/{r.max_score}</Badge>
    ) },
    { key: 'term', label: 'Chorak', render: (r) => `${r.term}-chorak` },
    { key: 'date', label: 'Sana', render: (r) => formatDate(r.date) },
    { key: 'comment', label: 'Izoh', render: (r) => r.comment || '—' },
  ]

  return (
    <PageWrapper title="Baholarim">
      <DataTable columns={columns} rows={rowsOf(data)} loading={isLoading} empty="Baholar yo'q" />
    </PageWrapper>
  )
}
