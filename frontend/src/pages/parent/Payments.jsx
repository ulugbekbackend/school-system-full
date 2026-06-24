import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/shared/Badge'
import StatCard from '@/components/shared/StatCard'
import ChildSelector from '@/components/shared/ChildSelector'
import { parentSummary } from '@/api/analytics'
import { formatMoney } from '@/utils/helpers'

export default function ParentPayments() {
  const [childId, setChildId] = useState(null)
  const { data: base } = useQuery({ queryKey: ['parent-base'], queryFn: () => parentSummary() })
  const children = base?.children || []
  const active = childId || children[0]?.id

  const { data, isLoading } = useQuery({
    queryKey: ['child-payments', active],
    queryFn: () => parentSummary(active),
    enabled: !!active,
  })

  const columns = [
    { key: 'fee_type', label: 'To\'lov turi' },
    { key: 'month', label: 'Oy', render: (r) => r.month || '—' },
    { key: 'amount', label: 'Summa', render: (r) => formatMoney(r.amount) },
    { key: 'status', label: 'Holat', render: (r) => (
      <Badge color={r.status === 'paid' ? 'green' : 'yellow'}>
        {r.status === 'paid' ? "To'langan" : 'Kutilmoqda'}
      </Badge>
    ) },
  ]

  return (
    <PageWrapper title="To'lovlar">
      <ChildSelector children={children} value={active} onChange={setChildId} />
      <div style={{ maxWidth: 340, marginBottom: 20 }}>
        <StatCard title="Qarzdorlik" value={formatMoney(data?.debt)} icon="💳"
          color={data?.debt > 0 ? '#ef4444' : '#10b981'} />
      </div>
      <DataTable columns={columns} rows={data?.invoices || []} loading={isLoading} empty="To'lovlar yo'q" />
    </PageWrapper>
  )
}
