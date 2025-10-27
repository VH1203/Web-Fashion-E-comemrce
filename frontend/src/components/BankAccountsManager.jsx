import React, { useEffect, useState } from "react";
import { bankService } from "../services/bankService";

export default function BankAccountsManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ bank_name: "", account_number: "", owner_name: "", logo_url: "" });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const { items } = await bankService.list();
    setItems(items || []);
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault(); setMsg("");
    try {
      if (editing) await bankService.update(editing._id, form);
      else await bankService.create(form);
      setForm({ bank_name:"", account_number:"", owner_name:"", logo_url:"" });
      setEditing(null);
      await load();
      setMsg("Đã lưu tài khoản ngân hàng");
    } catch (e) {
      setMsg(e.message);
    }
  };

  const onEdit = (it) => { setEditing(it); setForm({ ...it }); };
  const onDelete = async (id) => { if (confirm("Xóa tài khoản này?")) { await bankService.remove(id); load(); } };

  return (
    <div className="pf-card">
      <div className="pf-card-title">Tài khoản ngân hàng</div>
      <form className="grid-3 mb16" onSubmit={onSubmit}>
        <label>Ngân hàng<input required value={form.bank_name} onChange={e=>setForm({ ...form, bank_name: e.target.value })} /></label>
        <label>Số tài khoản<input required value={form.account_number} onChange={e=>setForm({ ...form, account_number: e.target.value })} /></label>
        <label>Chủ tài khoản<input required value={form.owner_name} onChange={e=>setForm({ ...form, owner_name: e.target.value })} /></label>
        <label>Logo URL<input value={form.logo_url||""} onChange={e=>setForm({ ...form, logo_url: e.target.value })} /></label>
        <div className="pf-actions">
          <button>{editing ? "Cập nhật" : "Thêm mới"}</button>
          {editing && (
            <button
              type="button"
              className="link"
              onClick={()=>{ setEditing(null); setForm({ bank_name:"", account_number:"", owner_name:"", logo_url:"" }); }}
            >
              Hủy
            </button>
          )}
          <span className="pf-msg">{msg}</span>
        </div>
      </form>

      <ul className="pf-list">
        {items.map(it => (
          <li key={it._id}>
            <div className="bank-item">
              {it.logo_url && <img src={it.logo_url} alt={it.bank_name} />}
              <div>
                <div className="title">{it.bank_name} • {it.account_number}</div>
                <div className="sub">{it.owner_name}</div>
              </div>
            </div>
            <div className="actions">
              <button className="link" onClick={()=>onEdit(it)}>Sửa</button>
              <button className="link danger" onClick={()=>onDelete(it._id)}>Xóa</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
