import { useQuery } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/shared/Badge'
import { listAssignments } from '@/api/lms'
import { rowsOf, formatDate } from '@/utils/helpers'

export default function StudentAssignments() {
  const { data, isLoading } = useQuery({ queryKey: ['assignments'], queryFn: () => listAssignments() })

  const now = new Date()
  const columns = [
    { key: 'title', label: 'Topshiriq' },
    { key: 'course_title', label: 'Kurs' },
    { key: 'max_score', label: 'Ball' },
    { key: 'due_date', label: 'Muddat', render: (r) => formatDate(r.due_date) },
    { key: 'status', label: 'Holat', render: (r) => {
      const overdue = new Date(r.due_date) < now
      return <Badge color={overdue ? 'red' : 'blue'}>{overdue ? "Muddati o'tgan" : 'Faol'}</Badge>
    } },
  ]

  return (
    <PageWrapper title="Topshiriqlar">
      <DataTable columns={columns} rows={rowsOf(data)} loading={isLoading} empty="Topshiriqlar yo'q" />
    </PageWrapper>
  )
}
