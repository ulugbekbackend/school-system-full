import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import Tabs from '@/components/shared/Tabs'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/shared/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import CrudResource from '@/components/shared/CrudResource'
import { listInvoices, createInvoice, createPayment, listFeeTypes, createFeeType } from '@/api/finance'
import { listStudents } from '@/api/students'
import { rowsOf, formatMoney, formatDate } from '@/utils/helpers'

const STATUS = { pending: ['yellow', 'Kutilmoqda'], paid: ['green', "To'langan"],
  overdue: ['red', "Muddati o'tgan"], cancelled: ['gray', 'Bekor'] }
const METHODS = [['cash', 'Naqd'], ['click', 'Click'], ['payme', 'Payme'], ['uzum', 'Uzum'], ['transfer', "O'tkazma"]]
const FREQ = [['monthly', 'Oylik'], ['yearly', 'Yillik'], ['once', 'Bir martalik']]

function InvoicesTab() {
  const qc = useQueryClient()
  const [invOpen, setInvOpen] = useState(false)
  const [payInv, setPayInv] = useState(null)
  const [inv, setInv] = useState({ student: '', fee_type: '', amount: '', due_date: '', month: '' })
  const [pay, setPay] = useState({ amount: '', method: 'cash' })

  const { data, isLoading } = useQuery({ queryKey: ['invoices'], queryFn: () => listInvoices() })
  const { data: students } = useQuery({ queryKey: ['students-min'], queryFn: () => listStudents() })
  const { data: feeTypes } = useQuery({ queryKey: ['fee-types'], queryFn: listFeeTypes })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['invoices'] })
  const invMut = useMutation({ mutationFn: createInvoice,
    onSuccess: () => { invalidate(); setInvOpen(false); setInv({ student: '', fee_type: '', amount: '', due_date: '', month: '' }) } })
  const payMut = useMutation({ mutationFn: createPayment,
    onSuccess: () => { invalidate(); setPayInv(null); setPay({ amount: '', method: 'cash' }) } })

  const columns = [
    { key: 'student_name', label: 'Talaba' },
    { key: 'fee_type_name', label: 'Tur' },
    { key: 'amount', label: 'Summa', render: (r) => formatMoney(r.amount) },
    { key: 'paid_amount', label: "To'langan", render: (r) => formatMoney(r.paid_amount) },
    { key: 'due_date', label: 'Muddat', render: (r) => formatDate(r.due_date) },
    { key: 'status', label: 'Holat', render: (r) => <Badge color={STATUS[r.status]?.[0]}>{STATUS[r.status]?.[1]}</Badge> },
    { key: 'act', label: '', render: (r) => r.status !== 'paid' && (
      <Button size="sm" onClick={() => { setPayInv(r); setPay({ amount: r.amount, method: 'cash' }) }}>To'lov</Button>
    ) },
  ]

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: 16 }}>
        <div style={{ flex: 1 }} />
        <Button onClick={() => setInvOpen(true)}>+ Hisob-faktura</Button>
      </div>
      <DataTable columns={columns} rows={rowsOf(data)} loading={isLoading} />

      <Modal open={invOpen} onClose={() => setInvOpen(false)} title="Yangi hisob-faktura">
        <form onSubmit={(e) => { e.preventDefault(); invMut.mutate(inv) }}>
          <Field label="Talaba" type="select" value={inv.student} required
            onChange={(e) => setInv({ ...inv, student: e.target.value })}
            options={rowsOf(students).map((s) => ({ value: s.id, label: `${s.full_name} (${s.student_id})` }))} />
          <Field label="To'lov turi" type="select" value={inv.fee_type} required
            onChange={(e) => { const f = rowsOf(feeTypes).find((x) => String(x.id) === e.target.value); setInv({ ...inv, fee_type: e.target.value, amount: f?.amount || inv.amount }) }}
            options={rowsOf(feeTypes).map((f) => ({ value: f.id, label: f.name }))} />
          <Field label="Summa" type="number" value={inv.amount} onChange={(e) => setInv({ ...inv, amount: e.target.value })} required />
          <Field label="Oy (YYYY-MM)" value={inv.month} onChange={(e) => setInv({ ...inv, month: e.target.value })} placeholder="2026-06" />
          <Field label="To'lov muddati" type="date" value={inv.due_date} onChange={(e) => setInv({ ...inv, due_date: e.target.value })} required />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setInvOpen(false)}>Bekor</Button>
            <Button type="submit" disabled={invMut.isPending}>Saqlash</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!payInv} onClose={() => setPayInv(null)} title="To'lov qabul qilish">
        {payInv && (
          <form onSubmit={(e) => { e.preventDefault(); payMut.mutate({ invoice: payInv.id, amount: pay.amount, method: pay.method, paid_at: new Date().toISOString() }) }}>
            <p style={{ marginBottom: 14, color: '#64748b', fontSize: 14 }}>
              {payInv.student_name} · {payInv.fee_type_name} · {formatMoney(payInv.amount)}
            </p>
            <Field label="Summa" type="number" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} required />
            <Field label="To'lov usuli" type="select" value={pay.method} required
              onChange={(e) => setPay({ ...pay, method: e.target.value })}
              options={METHODS.map(([v, l]) => ({ value: v, label: l }))} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button type="button" variant="secondary" onClick={() => setPayInv(null)}>Bekor</Button>
              <Button type="submit" disabled={payMut.isPending}>To'lovni saqlash</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default function AdminFinance() {
  const tabs = [
    { key: 'invoices', label: 'Hisob-fakturalar', render: () => <InvoicesTab /> },
    { key: 'fees', label: "To'lov turlari", render: () => (
      <CrudResource title="To'lov turi" queryKey="fee-types" listFn={listFeeTypes} createFn={createFeeType}
        columns={[
          { key: 'name', label: 'Nomi' },
          { key: 'amount', label: 'Summa', render: (r) => formatMoney(r.amount) },
          { key: 'frequency', label: 'Davriylik', render: (r) => FREQ.find(([v]) => v === r.frequency)?.[1] },
        ]}
        fields={[
          { name: 'name', label: 'Nomi', required: true },
          { name: 'amount', label: 'Summa', type: 'number', required: true },
          { name: 'frequency', label: 'Davriylik', type: 'select', default: 'monthly',
            options: FREQ.map(([v, l]) => ({ value: v, label: l })) },
        ]} />
    ) },
  ]
  return (
    <PageWrapper title="Moliya">
      <Tabs tabs={tabs} />
    </PageWrapper>
  )
}
