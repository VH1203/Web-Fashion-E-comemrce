import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TicketAPI } from '../../services/ticketService';
import LogList from '../../components/tickets/LogList';

export default function TicketDetail() {
  const { id } = useParams();
  const [t, setT] = useState(null);
  const [logMsg, setLogMsg] = useState('');
  const [type, setType] = useState('note');
  const [status, setStatus] = useState('');

  const load = async () => {
    const data = await TicketAPI.detail(id);
    setT(data);
    setStatus(data?.status || '');
  };

  useEffect(()=>{ load(); }, [id]);

  const addLog = async (e) => {
    e.preventDefault();
    await TicketAPI.addLog(id, { type, message: logMsg });
    setLogMsg('');
    await load();
  };

  const updateStatus = async (e) => {
    e.preventDefault();
    if (!status) return;
    await TicketAPI.setStatus(id, status);
    await load();
  };

  if (!t) return <div className="container py-3">Loading...</div>;

  return (
    <div className="container py-3">
      <h4>Phiếu #{t._id} <span className="badge text-bg-secondary">{t.status}</span></h4>

      <div className="row mt-3">
        <div className="col-lg-7">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="mb-1">{t.subject}</h5>
              <div className="small text-muted">Shop: {t.shop_id}{t.order_id?` · Order: ${t.order_id}`:''}</div>
              <p className="mt-2" style={{whiteSpace:'pre-wrap'}}>{t.message}</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Tương tác</div>
            <div className="card-body">
              <LogList logs={t.logs}/>
              <form onSubmit={addLog} className="row g-2 mt-2">
                <div className="col-md-3">
                  <select className="form-select" value={type} onChange={e=>setType(e.target.value)}>
                    <option value="note">note</option>
                    <option value="chat">chat</option>
                    <option value="call">call</option>
                    <option value="email">email</option>
                  </select>
                </div>
                <div className="col-md-7">
                  <input className="form-control" placeholder="Nội dung..." value={logMsg} onChange={e=>setLogMsg(e.target.value)}/>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-primary w-100">Thêm</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card">
            <div className="card-header">Cập nhật trạng thái</div>
            <div className="card-body">
              <form onSubmit={updateStatus} className="d-flex gap-2">
                <select className="form-select" value={status} onChange={e=>setStatus(e.target.value)}>
                  <option value="pending">pending</option>
                  <option value="in_progress">in_progress</option>
                  <option value="escalated">escalated</option>
                  <option value="resolved">resolved</option>
                  <option value="closed">closed</option>
                </select>
                <button className="btn btn-success">Lưu</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
