import { useEffect, useState } from "react";
import api from "../utils/api.js";
import { Link } from "react-router-dom";
import StatusBadge from "../components/StatusBadge.jsx";
import PriorityBadge from "../components/PriorityBadge.jsx";

export default function TicketList() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ status: "routed,assigned,processing,waiting_customer,approved,rejected" });

  async function load() {
    const res = await api.get("/tickets", { params: filters });
    setItems(res.data.items || []);
  }
  useEffect(() => { load(); }, [filters]);

  return (
    <div className="card">
      <div className="card-header d-flex align-items-center gap-2">
        <span>Tickets (Support)</span>
        <input className="form-control form-control-sm" placeholder="Keyword..." style={{maxWidth:220}}
          onChange={(e)=>setFilters(f=>({...f, keyword:e.target.value}))}/>
        <select className="form-select form-select-sm" style={{width:200}}
          value={filters.status} onChange={e=>setFilters(f=>({...f, status:e.target.value}))}>
          <option value="routed,assigned,processing,waiting_customer">Open (shop)</option>
          <option value="approved,rejected">Escalated done</option>
          <option value="resolved,closed">Closed</option>
          <option value="">All</option>
        </select>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Code</th><th>Title</th><th>Status</th><th>Priority</th><th>Updated</th><th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(t => (
              <tr key={t._id}>
                <td>{t.code}</td>
                <td className="text-truncate" style={{maxWidth:380}}>{t.title}</td>
                <td><StatusBadge value={t.status}/></td>
                <td><PriorityBadge value={t.priority}/></td>
                <td>{new Date(t.updatedAt).toLocaleString()}</td>
                <td className="text-end"><Link className="btn btn-sm btn-outline-primary" to={`/tickets/${t._id}`}>Open</Link></td>
              </tr>
            ))}
            {items.length===0 && <tr><td colSpan={6} className="text-center text-muted py-4">Không có ticket</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
