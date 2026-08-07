import { X } from 'lucide-react';

export function Logo({ compact = false }) {
  return <div className="brand"><span className="brand-mark">F</span>{!compact && <span>FFPSJ <em>Actas</em></span>}</div>;
}

export function Button({ children, variant = 'primary', className = '', type = 'button', ...props }) {
  return <button type={type} className={`button button-${variant} ${className}`} {...props}>{children}</button>;
}

export function Field({ label, error, hint, children }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}{error && <small className="field-error">{error}</small>}</label>;
}

export function EmptyState({ title, detail, action }) {
  return <div className="empty-state"><div className="empty-mark">—</div><h3>{title}</h3><p>{detail}</p>{action}</div>;
}

export function Skeleton({ className = '' }) { return <span className={`skeleton ${className}`} />; }

export function Dialog({ open, title, onClose, children }) {
  if (!open) return null;
  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="dialog" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
      <header><h2>{title}</h2><button className="icon-button" aria-label="Cerrar" onClick={onClose}><X size={18} /></button></header>
      {children}
    </section>
  </div>;
}

export function StatusBadge({ status }) { return <span className={`status status-${status}`}>{({ scheduled: 'Programado', in_progress: 'En juego', finished: 'Finalizado', cancelled: 'Cancelado', active: 'Activo', inactive: 'Inactivo' })[status] || status}</span>; }
