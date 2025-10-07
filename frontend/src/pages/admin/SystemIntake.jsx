import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import PriorityBadge from "../../components/PriorityBadge.jsx";
import { Link } from "react-router-dom";

export default function SystemIntake() {
  const [form, setForm] = useState({
    customerId:"", orderId:"", type:"refund", title:"", description:"",
    priority:"medium", severity:"medium", channel:"web"
  });
  const [tickets, setTickets] = useState([]);
  const [route, setRoute] = useState({ ownerShopId:"shop1", category:"damaged", severity:"high" });
  const canSubmit = useMemo(()=>form.title.trim() && form.type, [form]);

  async function load() {
    const res = await api.get("/tickets", { params: { status:"intake" }});
    setTickets(res.data.items || []);
  }
  useEffect(() => { load(); }, []);

  async function createIntake(e) {
    e.preventDefault();
    if (!canSubmit) return;
    await api.post("/tickets/intake", form);
    setForm(f=>({...f, title:"", description:""}));
    await load();
  }
  async function doRoute(id) {
    await api.post(`/tickets/${id}/route`, route);
    await load();
  }

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-5">
        <div className="card">
          <div className="card-header">Tạo ticket (Intake)</div>
          <div className="card-body">
            <form onSubmit={createIntake} className="vstack gap-2">
              <div className="row g-2">
                <div className="col">
                  <label className="form-label">Order ID</label>
                  <input className="form-control" value={form.orderId} onChange={e=>setForm({...form, orderId:e.target.value})}/>
                </div>
                <div className="col">
                  <label className="form-label">Customer ID</label>
                  <input className="form-control" value={form.customerId} onChange={e=>setForm({...form, customerId:e.target.value})}/>
                </div>
              </div>
              <div className="row g-2">
                <div className="col">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
                    <option value="refund">Refund</option>
                    <option value="exchange">Exchange</option>
                    <option value="warranty">Warranty</option>
                    <option value="not_received">Not received</option>
                    <option value="damaged">Damaged</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={form.priority} onChange={e=>setForm({...form, priority:e.target.value})}>
                    <option>low</option><option>medium</option><option>high</option><option>critical</option>
                  </select>
                </div>
              </div>
              <label className="form-label">Title</label>
              <input className="form-control" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="3" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
              <button className="btn btn-primary mt-2">Create Intake</button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-7">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Hàng đợi trung tâm (intake)</span>
            <div className="d-flex gap-2">
              <input className="form-control form-control-sm" style={{width:130}} placeholder="ownerShopId"
                value={route.ownerShopId} onChange={e=>setRoute({...route, ownerShopId:e.target.value})}/>
              <select className="form-select form-select-sm" style={{width:120}}
                value={route.category} onChange={e=>setRoute({...route, category:e.target.value})}>
                <option value="damaged">damaged</option>
                <option value="lost">lost</option>
                <option value="other">other</option>
              </select>
              <select className="form-select form-select-sm" style={{width:120}}
                value={route.severity} onChange={e=>setRoute({...route, severity:e.target.value})}>
                <option>low</option><option>medium</option><option>high</option><option>critical</option>
              </select>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Code</th><th>Title</th><th>Type</th><th>Priority</th><th>Created</th><th></th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t=>(
                  <tr key={t._id}>
                    <td>{t.code}</td>
                    <td className="text-truncate" style={{maxWidth:240}}>{t.title}</td>
                    <td><span className="badge bg-secondary">{t.type}</span></td>
                    <td><PriorityBadge value={t.priority}/></td>
                    <td>{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-primary" onClick={()=>doRoute(t._id)}>Route → {route.ownerShopId}</button>
                      <Link to={`/support/tickets/${t._id}`} className="btn btn-sm btn-outline-secondary ms-2">View</Link>
                    </td>
                  </tr>
                ))}
                {tickets.length===0 && <tr><td colSpan={6} className="text-center text-muted py-4">Không có ticket intake</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
