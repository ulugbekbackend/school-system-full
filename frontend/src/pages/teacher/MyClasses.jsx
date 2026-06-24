import { useQuery } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/shared/Badge'
import { listCourses } from '@/api/lms'
import { rowsOf } from '@/utils/helpers'

export default function TeacherClasses() {
  const { data, isLoading } = useQuery({ queryKey: ['courses'], queryFn: () => listCourses() })

  const columns = [
    { key: 'title', label: 'Kurs' },
    { key: 'subject_name', label: 'Fan' },
    { key: 'class_name', label: 'Sinf' },
    { key: 'lesson_count', label: 'Darslar', render: (r) => `${r.lesson_count} ta` },
    { key: 'academic_year', label: "O'quv yili" },
    { key: 'is_active', label: 'Holat', render: (r) => (
      <Badge color={r.is_active ? 'green' : 'gray'}>{r.is_active ? 'Faol' : 'Nofaol'}</Badge>
    ) },
  ]

  return (
    <PageWrapper title="Sinflarim / Kurslarim">
      <DataTable columns={columns} rows={rowsOf(data)} loading={isLoading} empty="Kurslar yo'q" />
    </PageWrapper>
  )
}
