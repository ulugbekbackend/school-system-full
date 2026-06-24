import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import Tabs from '@/components/shared/Tabs'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/shared/Badge'
import Button from '@/components/ui/Button'
import CrudResource from '@/components/shared/CrudResource'
import { listLeaves, updateLeave, listLeaveTypes, createLeaveType } from '@/api/hr'
import { rowsOf, formatDate } from '@/utils/helpers'

const STATUS = { pending: ['yellow', 'Kutilmoqda'], approved: ['green', 'Tasdiqlandi'], rejected: ['red', 'Rad etildi'] }

function LeaveRequests() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['leaves'], queryFn: () => listLeaves() })
  const mut = useMutation({
    mutationFn: ({ id, status }) => updateLeave(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leaves'] }),
  })

  const columns = [
    { key: 'employee_name', label: 'Xodim' },
    { key: 'leave_type_name', label: 'Tur' },
    { key: 'start_date', label: 'Boshlanish', render: (r) => formatDate(r.start_date) },
    { key: 'end_date', label: 'Tugash', render: (r) => formatDate(r.end_date) },
    { key: 'days', label: 'Kun', render: (r) => `${r.days} kun` },
    { key: 'status', label: 'Holat', render: (r) => <Badge color={STATUS[r.status]?.[0]}>{STATUS[r.status]?.[1]}</Badge> },
    { key: 'act', label: '', render: (r) => r.status === 'pending' && (
      <div style={{ display: 'flex', gap: 6 }}>
        <Button size="sm" onClick={() => mut.mutate({ id: r.id, status: 'approved' })}>Tasdiq</Button>
        <Button size="sm" variant="danger" onClick={() => mut.mutate({ id: r.id, status: 'rejected' })}>Rad</Button>
      </div>
    ) },
  ]
  return <DataTable columns={columns} rows={rowsOf(data)} loading={isLoading} empty="So'rovlar yo'q" />
}

export default function HRLeaves() {
  const tabs = [
    { key: 'requests', label: "So'rovlar", render: () => <LeaveRequests /> },
    { key: 'types', label: 'Ta\'til turlari', render: () => (
      <CrudResource title="Ta'til turi" queryKey="leave-types" listFn={listLeaveTypes} createFn={createLeaveType}
        columns={[
          { key: 'name', label: 'Nomi' }, { key: 'max_days', label: 'Maks. kun' },
          { key: 'is_paid', label: "To'lanadimi", render: (r) => (r.is_paid ? 'Ha' : "Yo'q") },
        ]}
        fields={[
          { name: 'name', label: 'Nomi', required: true },
          { name: 'max_days', label: 'Maksimal kun', type: 'number', required: true },
        ]} />
    ) },
  ]
  return (
    <PageWrapper title="Ta'til boshqaruvi">
      <Tabs tabs={tabs} />
    </PageWrapper>
  )
}
