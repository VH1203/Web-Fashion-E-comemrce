import { useState } from 'react';
import FileUploader from './FileUploader';

export default function TicketForm({ onSubmit }) {
  const [shopId, setShopId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [files, setFiles] = useState([]);

  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('shop_id', shopId);
    if (orderId) fd.append('order_id', orderId);
    fd.append('subject', subject);
    fd.append('message', message);
    fd.append('priority', priority);
    files.forEach(f => fd.append('images', f));
    onSubmit?.(fd);
  };

  return (
    <form onSubmit={submit} className="vstack gap-2">
      <div className="row">
        <div className="col-md-6">
          <label className="form-label">Shop ID</label>
          <input className="form-control" value={shopId} onChange={e=>setShopId(e.target.value)} required/>
        </div>
        <div className="col-md-6">
          <label className="form-label">Order ID (tuỳ chọn)</label>
          <input className="form-control" value={orderId} onChange={e=>setOrderId(e.target.value)}/>
        </div>
      </div>
      <div>
        <label className="form-label">Tiêu đề</label>
        <input className="form-control" value={subject} onChange={e=>setSubject(e.target.value)} required/>
      </div>
      <div>
        <label className="form-label">Nội dung</label>
        <textarea rows="4" className="form-control" value={message} onChange={e=>setMessage(e.target.value)} required/>
      </div>
      <div>
        <label className="form-label">Ưu tiên</label>
        <select className="form-select" value={priority} onChange={e=>setPriority(e.target.value)}>
          <option value="low">Thấp</option>
          <option value="medium">Trung bình</option>
          <option value="high">Cao</option>
        </select>
      </div>
      <FileUploader onChange={setFiles}/>
      <button className="btn btn-primary">Gửi khiếu nại</button>
    </form>
  );
}
