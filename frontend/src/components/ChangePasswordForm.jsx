import React, { useState } from "react";
import { userService } from "../services/userService";

export default function ChangePasswordForm() {
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault(); setMsg("");
    if (form.new_password !== form.confirm) return setMsg("Mật khẩu xác nhận không khớp");
    if (form.new_password.length < 8) return setMsg("Mật khẩu mới tối thiểu 8 ký tự");
    setSaving(true);
    try {
      await userService.changePassword({ current_password: form.current_password, new_password: form.new_password });
      setMsg("Đã đổi mật khẩu");
      setForm({ current_password: "", new_password: "", confirm: "" });
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="pf-card" onSubmit={submit}>
      <div className="pf-card-title">Đổi mật khẩu</div>
      <div className="grid-2">
        <label>Mật khẩu hiện tại<input type="password" required value={form.current_password} onChange={e=>setForm({ ...form, current_password: e.target.value })} /></label>
        <div/>
        <label>Mật khẩu mới<input type="password" required value={form.new_password} onChange={e=>setForm({ ...form, new_password: e.target.value })} /></label>
        <label>Nhập lại mật khẩu<input type="password" required value={form.confirm} onChange={e=>setForm({ ...form, confirm: e.target.value })} /></label>
      </div>
      <div className="pf-actions">
        <button disabled={saving}>{saving ? "Đang đổi…" : "Đổi mật khẩu"}</button>
        <span className="pf-msg">{msg}</span>
      </div>
    </form>
  );
}
