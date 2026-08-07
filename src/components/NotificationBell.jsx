import { Bell, CheckCheck } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { notificationRepository } from '../repositories/notificationRepository';
import { formatDateTime } from '../utils/formatters';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ['notifications'], queryFn: notificationRepository.list });
  const markRead = useMutation({ mutationFn: notificationRepository.markRead, onSuccess: () => client.invalidateQueries({ queryKey: ['notifications'] }) });
  const unread = items.filter((item) => !item.read_at).length;
  return <div className="notification-wrap">
    <button className="icon-button notification-bell" onClick={() => setOpen(!open)} aria-label="Notificaciones"><Bell size={19} />{unread > 0 && <span>{unread}</span>}</button>
    {open && <section className="notification-panel"><header><strong>Notificaciones</strong><small>{unread ? `${unread} sin leer` : 'Al día'}</small></header>
      {items.length ? items.map((item) => <button key={item.id} className={`notification ${item.read_at ? '' : 'unread'}`} onClick={() => !item.read_at && markRead.mutate(item.id)}><div><strong>{item.title}</strong><p>{item.body}</p><small>{formatDateTime(item.created_at)}</small></div>{!item.read_at && <CheckCheck size={16} />}</button>) : <p className="notification-empty">No tienes notificaciones.</p>}
    </section>}
  </div>;
}
