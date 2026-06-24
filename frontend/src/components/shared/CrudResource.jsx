import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DataTable from './DataTable'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import { rowsOf } from '@/utils/helpers'

/**
 * Universal "ro'yxat + qo'shish" resursi.
 * props:
 *  - title: tugma/modal sarlavhasi (masalan "Fan")
 *  - queryKey, listFn, createFn
 *  - columns: DataTable ustunlari
 *  - fields: [{ name, label, type, options, required, default }]
 */
export default function CrudResource({ title, queryKey, listFn, createFn, columns, fields }) {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const initial = Object.fromEntries(fields.map((f) => [f.name, f.default ?? '']))
  const [form, setForm] = useState(initial)

  const { data, isLoading } = useQuery({ queryKey: [queryKey], queryFn: () => listFn() })
  const mutation = useMutation({
    mutationFn: createFn,
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); setOpen(false); setForm(initial); setError('') },
    onError: (e) => setError(JSON.stringify(e.response?.data || 'Xatolik')),
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: 16 }}>
        <div style={{ flex: 1 }} />
        <Button onClick={() => setOpen(true)}>+ {title}</Button>
      </div>
      <DataTable columns={columns} rows={rowsOf(data)} loading={isLoading} />

      <Modal open={open} onClose={() => setOpen(false)} title={`Yangi ${title.toLowerCase()}`}>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }}>
          {fields.map((f) => (
            <Field key={f.name} label={f.label} type={f.type || 'text'} options={f.options}
              required={f.required} value={form[f.name]} onChange={set(f.name)} placeholder={f.placeholder} />
          ))}
          {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Bekor</Button>
            <Button type="submit" disabled={mutation.isPending}>Saqlash</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
