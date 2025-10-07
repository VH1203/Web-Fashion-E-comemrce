import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Link } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge.jsx";

export default function OwnerDesk() {
  const [items, setItems] = useState([]);

  async function load() {
    // lọc vé escalated_to_owner/escalated của shop mình
    const res = await api.get("/tickets", { params: { status:"escalated,escalated_to_owner,approved,rejected" }});
    setItems(res.data.items || []);
  }
  useEffect(()=>{ load(); }, []);

  return (
    <div className="card">
      <div className="card-header">Owner Desk</div>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead className="table-light">
            <tr><th>Code</th><th>Title</th><th>Status</th><th>Updated</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(t=>(
              <tr key={t._id}>
                <td>{t.code}</td>
                <td className="text-truncate" style={{maxWidth:380}}>{t.title}</td>
                <td><StatusBadge value={t.status}/></td>
                <td>{new Date(t.updatedAt).toLocaleString()}</td>
                <td className="text-end"><Link to={`/support/tickets/${t._id}`} className="btn btn-sm btn-outline-primary">Open</Link></td>
              </tr>
            ))}
            {items.length===0 && <tr><td colSpan={5} className="text-center text-muted py-4">Không có ticket</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
