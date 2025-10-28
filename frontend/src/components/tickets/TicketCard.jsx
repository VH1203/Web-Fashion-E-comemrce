import { Link } from 'react-router-dom';

const color = (s) =>
  s==='pending'?'warning':
  s==='in_progress'?'info':
  s==='escalated'?'danger':
  s==='resolved'?'success':'secondary';

export default function TicketCard({ t }) {
  return (
    <div className="card mb-2">
      <div className="card-body">
        <div className="d-flex justify-content-between">
          <div>
            <h6 className="mb-1">{t.subject}</h6>
            <div className="small text-muted">#{t._id} · Shop: {t.shop_id}{t.order_id?` · Order: ${t.order_id}`:''}</div>
          </div>
          <span className={`badge text-bg-${color(t.status)}`}>{t.status}</span>
        </div>
        <p className="mt-2 mb-2 text-truncate">{t.message}</p>
        <Link to={`/support/tickets/${t._id}`} className="btn btn-sm btn-outline-primary">Xem chi tiết</Link>
      </div>
    </div>
  );
}
