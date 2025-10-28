import { useEffect, useState } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { TicketAPI } from '../../services/ticketService';
import TicketCard from '../../components/tickets/TicketCard';
import TicketDetail from './TicketDetail';
import CreateTicket from './TicketCreate'; // file mục 7

// Router con cho /support/tickets
export default function Tickets() {
  return (
    <Routes>
      <Route index element={<SupportQueue />} />
      <Route path="new" element={<CreateTicket />} />
      <Route path=":id" element={<TicketDetail />} />
    </Routes>
  );
}

function SupportQueue() {
  const [list, setList] = useState([]);
  const [shopId, setShopId] = useState('');
  const [status, setStatus] = useState('');

  const load = async () => {
    if (!shopId) return setList([]);
    const data = await TicketAPI.supportQueue({ shop_id: shopId, status });
    setList(data || []);
  };

  useEffect(()=>{ load(); }, [shopId, status]);

  return (
    <div className="container py-3">
      <div className="d-flex gap-2 align-items-end mb-3">
        <div>
          <label className="form-label">Shop ID</label>
          <input className="form-control" value={shopId} onChange={e=>setShopId(e.target.value)} placeholder="shop_id"/>
        </div>
        <div>
          <label className="form-label">Trạng thái</label>
          <select className="form-select" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="pending">pending</option>
            <option value="in_progress">in_progress</option>
            <option value="escalated">escalated</option>
            <option value="resolved">resolved</option>
            <option value="closed">closed</option>
          </select>
        </div>
        <button className="btn btn-outline-primary" onClick={load}>Tải</button>
        <Link to="new" className="btn btn-success ms-auto">Khách tạo khiếu nại</Link>
      </div>

      <div className="col-md-8 mx-auto">
        {list.map(t => <TicketCard key={t._id} t={t} />)}
      </div>
    </div>
  );
}
