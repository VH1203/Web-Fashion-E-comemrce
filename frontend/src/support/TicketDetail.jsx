// TicketDetail.jsx 
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import EventTimeline from "../../components/EventTimeline.jsx";


export default function TicketDetail() {
  const { id } = useParams();
  const [t, setT] = useState(null);
  const [message, setMessage] = useState("");
  const [proposal, setProposal] = useState({ kind: "refund", amount: 0, reason: "" });
  const [approv, setApprov] = useState({ reason: "" });

  async function load() {
    const res = await api.get(`/tickets/${id}`);
    setT(res.data);
  }
  useEffect(() => { load(); }, [id]);

  if (!t) return <div>Loading...</div>;
  async function call(path, body) { await api.post(`/tickets/${id}/${path}`, body || {}); await load(); }

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-8">
        <div className="card mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <div>
                <h5 className="mb-1">{t.title}</h5>
                <div className="text-muted small">{t.code} · Order {t.orderId} · Customer {t.customerId}</div>
              </div>
              <div className="text-end">
                <StatusBadge value={t.status}/>
                <div className="small text-muted">Updated {new Date(t.updatedAt).toLocaleString()}</div>
              </div>
            </div>
            <p className="mt-3">{t.description}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Timeline</div>
          <div className="card-body">
            <EventTimeline events={t.events || []}/>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-4">
        <div className="card mb-3">
          <div className="card-header">Actions (Support)</div>
          <div className="card-body vstack gap-2">
            <button className="btn btn-sm btn-outline-primary" onClick={()=>call("claim")}>Claim</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={()=>call("process")}>Start Processing</button>

            <div className="mt-2">
              <label className="form-label">Ask more</label>
              <div className="input-group">
                <input className="form-control form-control-sm" placeholder="Message..." value={message} onChange={e=>setMessage(e.target.value)}/>
                <button className="btn btn-sm btn-outline-warning" onClick={()=>call("ask-more",{ message })}>Send</button>
              </div>
            </div>

            <div className="mt-2">
              <label className="form-label">Proposal</label>
              <select className="form-select form-select-sm" value={proposal.kind} onChange={e=>setProposal(p=>({...p, kind:e.target.value}))}>
                <option value="refund">Refund</option>
                <option value="exchange">Exchange</option>
                <option value="warranty">Warranty</option>
                <option value="reject">Reject</option>
              </select>
              {proposal.kind === "refund" && (
                <input className="form-control form-control-sm mt-1" type="number" placeholder="Amount"
                  value={proposal.amount} onChange={e=>setProposal(p=>({...p, amount:Number(e.target.value)}))}/>
              )}
              <input className="form-control form-control-sm mt-1" placeholder="Reason"
                value={proposal.reason} onChange={e=>setProposal(p=>({...p, reason:e.target.value}))}/>
              <button className="btn btn-sm btn-primary mt-2" onClick={()=>call("propose", proposal)}>Send Proposal</button>
            </div>

            <hr/>
            <div className="mt-1">
              <button className="btn btn-sm btn-success me-2" onClick={()=>call("resolve",{ note:"Done" })}>Mark Resolved</button>
              <button className="btn btn-sm btn-outline-dark" onClick={()=>call("close",{ note:"Closed" })}>Close</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Owner Decision</div>
          <div className="card-body">
            <div className="input-group input-group-sm">
              <input className="form-control" placeholder="Reason" value={approv.reason} onChange={e=>setApprov({reason:e.target.value})}/>
              <button className="btn btn-outline-success" onClick={()=>call("approve", approv)}>Approve</button>
              <button className="btn btn-outline-danger" onClick={()=>call("reject", approv)}>Reject</button>
            </div>
            {t.approval?.status && (
              <div className="mt-2 small">
                Current: <span className={`badge text-bg-${t.approval.status==="approved"?"success":t.approval.status==="rejected"?"danger":"secondary"}`}>{t.approval.status}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
