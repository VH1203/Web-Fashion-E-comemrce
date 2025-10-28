import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketAPI } from '../../services/ticketService';
import TicketForm from '../../components/tickets/TicketForm';

export default function TicketCreate() {
  const navigate = useNavigate();
  const [ok, setOk] = useState(''); const [err, setErr] = useState('');

  const submit = async (fd) => {
    setOk(''); setErr('');
    try {
      const data = await TicketAPI.create(fd);
      setOk('Gửi khiếu nại thành công!');
      navigate(`/support/tickets/${data?._id}`);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    }
  };

  return (
    <div className="container py-3">
      <h4>Tạo khiếu nại</h4>
      {ok && <div className="alert alert-success">{ok}</div>}
      {err && <div className="alert alert-danger">{err}</div>}
      <TicketForm onSubmit={submit}/>
    </div>
  );
}
