import React, { useState } from "react";
import { userService } from "../services/userService";

export default function PersonalInfoForm({ me, onUpdated }) {
  const [form, setForm] = useState({
    name: me?.name || "",
    email: me?.email || "",
    phone: me?.phone || "",
    gender: me?.gender || "other",
    dob: me?.dob ? me.dob.slice(0, 10) : "",
    avatar_url: me?.avatar_url || "",
    preferences: {
      height: me?.preferences?.height || "",
      weight: me?.preferences?.weight || "",
      size_top: me?.preferences?.size_top || "",
      size_bottom: me?.preferences?.size_bottom || "",
    },
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const setPref  = (k, v) => setForm(prev => ({ ...prev, preferences: { ...prev.preferences, [k]: v } }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      const payload = { ...form };
      if (!payload.dob) delete payload.dob; // không gửi dob rỗng
      const { user } = await userService.updateMe(payload);
      onUpdated && onUpdated(user);
      setMsg("Đã lưu thông tin cá nhân");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="pf-card" onSubmit={onSubmit}>
      <div className="pf-card-title">Thông tin cá nhân</div>
      <div className="grid-2">
        <label>Họ tên<input value={form.name} onChange={e=>setField("name", e.target.value)} required/></label>
        <label>Email<input type="email" value={form.email} onChange={e=>setField("email", e.target.value)} required/></label>
        <label>Số điện thoại<input value={form.phone||""} onChange={e=>setField("phone", e.target.value)} /></label>
        <label>Giới tính<select value={form.gender} onChange={e=>setField("gender", e.target.value)}>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
          <option value="other">Khác</option>
        </select></label>
        <label>Ngày sinh<input type="date" value={form.dob} onChange={e=>setField("dob", e.target.value)} /></label>
        <label>Avatar URL<input value={form.avatar_url||""} onChange={e=>setField("avatar_url", e.target.value)} /></label>
      </div>

      <div className="pf-subtitle">Số đo (gợi ý size)</div>
      <div className="grid-4">
        <label>Cao (cm)<input type="number" value={form.preferences.height} onChange={e=>setPref("height", Number(e.target.value))} /></label>
        <label>Nặng (kg)<input type="number" value={form.preferences.weight} onChange={e=>setPref("weight", Number(e.target.value))} /></label>
        <label>Size áo<input value={form.preferences.size_top} onChange={e=>setPref("size_top", e.target.value)} /></label>
        <label>Size quần<input value={form.preferences.size_bottom} onChange={e=>setPref("size_bottom", e.target.value)} /></label>
      </div>

      <div className="pf-actions">
        <button disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
        <span className="pf-msg">{msg}</span>
      </div>
      <p className="pf-note">Tên đăng nhập (username) không thể thay đổi.</p>
    </form>
  );
}
