import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/shared/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import { listInventory, createInventory } from '@/api/hr'
import { rowsOf, formatMoney } from '@/utils/helpers'

const CATEGORIES = [['furniture', 'Mebel'], ['tech', 'Texnika'], ['book', 'Kitob'], ['sport', 'Sport'], ['other', 'Boshqa']]
const CONDITIONS = [['good', 'Yaxshi'], ['fair', 'Qoniqarli'], ['poor', 'Yomon']]
const COND_COLOR = { good: 'green', fair: 'yellow', poor: 'red' }
const EMPTY = { name: '', category: '', quantity: 1, condition: 'good', location: '', purchase_price: '' }

export default function HRInventory() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const { data, isLoading } = useQuery({ queryKey: ['inventory'], queryFn: () => listInventory() })
  const mutation = useMutation({
    mutationFn: (f) => createInventory({ ...f, purchase_price: f.purchase_price || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); setOpen(false); setForm(EMPTY) },
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const columns = [
    { key: 'name', label: 'Nomi' },
    { key: 'category_display', label: 'Kategoriya', render: (r) => r.category_display },
    { key: 'quantity', label: 'Soni', render: (r) => `${r.quantity} ta` },
    { key: 'condition', label: 'Holati', render: (r) => (
      <Badge color={COND_COLOR[r.condition]}>{CONDITIONS.find(([v]) => v === r.condition)?.[1]}</Badge>
    ) },
    { key: 'location', label: 'Joylashuv', render: (r) => r.location || '—' },
    { key: 'purchase_price', label: 'Narxi', render: (r) => r.purchase_price ? formatMoney(r.purchase_price) : '—' },
  ]

  return (
    <PageWrapper title="Inventar">
      <div style={{ display: 'flex', marginBottom: 16 }}>
        <div style={{ flex: 1 }} />
        <Button onClick={() => setOpen(true)}>+ Inventar qo'shish</Button>
      </div>
      <DataTable columns={columns} rows={rowsOf(data)} loading={isLoading} />

      <Modal open={open} onClose={() => setOpen(false)} title="Yangi inventar">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }}>
          <Field label="Nomi" value={form.name} onChange={set('name')} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Kategoriya" type="select" value={form.category} onChange={set('category')} required
              options={CATEGORIES.map(([v, l]) => ({ value: v, label: l }))} />
            <Field label="Soni" type="number" value={form.quantity} onChange={set('quantity')} required />
            <Field label="Holati" type="select" value={form.condition} onChange={set('condition')}
              options={CONDITIONS.map(([v, l]) => ({ value: v, label: l }))} />
            <Field label="Narxi" type="number" value={form.purchase_price} onChange={set('purchase_price')} />
          </div>
          <Field label="Joylashuv" value={form.location} onChange={set('location')} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Bekor</Button>
            <Button type="submit" disabled={mutation.isPending}>Saqlash</Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
