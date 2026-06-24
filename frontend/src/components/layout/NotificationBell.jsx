import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listNotifications, markAllRead } from '@/api/notifications'
import { rowsOf, formatDate } from '@/utils/helpers'

const TYPE_ICON = { attendance: '✅', grade: '🏆', payment: '💳', assignment: '📋', general: '📢', alert: '⚠️' }

export default function NotificationBell() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const { data } = useQuery({ queryKey: ['notifications'], queryFn: () => listNotifications(), refetchInterval: 60000 })
  const items = rowsOf(data)
  const unread = items.filter((n) => !n.is_read).length

  const mut = useMutation({ mutationFn: markAllRead, onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) })

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 20, position: 'relative', padding: 4 }}>
        🔔
        {unread > 0 && (
          <span style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', color: '#fff',
            borderRadius: 10, fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{unread}</span>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{ position: 'absolute', right: 0, top: 36, width: 320, background: '#fff',
            borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', zIndex: 41, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
              <b style={{ fontSize: 14 }}>Xabarnomalar</b>
              {unread > 0 && (
                <button onClick={() => mut.mutate()} style={{ background: 'none', border: 'none',
                  color: '#2563eb', cursor: 'pointer', fontSize: 12 }}>Hammasini o'qildi</button>
              )}
            </div>
            <div style={{ maxHeight: 360, overflow: 'auto' }}>
              {!items.length && (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  Xabarnoma yo'q
                </div>
              )}
              {items.slice(0, 15).map((n) => (
                <div key={n.id} style={{ padding: '10px 16px', borderBottom: '1px solid #f8fafc',
                  background: n.is_read ? '#fff' : '#eff6ff' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{TYPE_ICON[n.type] || '📢'} {n.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{formatDate(n.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
