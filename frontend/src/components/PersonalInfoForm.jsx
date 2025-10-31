import React, { useRef, useState, useEffect } from "react";
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
  const [err, setErr] = useState("");
  const [previewUrl, setPreviewUrl] = useState(me?.avatar_url || "");

  // refs
  const fileRef = useRef(null);

  useEffect(() => { setPreviewUrl(form.avatar_url || ""); }, [form.avatar_url]);

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const setPref  = (k, v) => setForm(prev => ({ ...prev, preferences: { ...prev.preferences, [k]: v } }));

  const onPickFile = (e) => {
    setErr("");
    const f = e.target.files?.[0];
    if (!f) return;
    // validate type & size (<= 1MB)
    const okType = /image\/(jpeg|png)/i.test(f.type);
    const okSize = f.size <= 1024 * 1024;
    if (!okType) return setErr("Chỉ hỗ trợ ảnh .JPG, .PNG");
    if (!okSize) return setErr("Dung lượng tối đa 1 MB");
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setField("avatar_url", dataUrl); // gửi base64 hoặc link tuỳ backend
      setPreviewUrl(dataUrl);
    };
    reader.readAsDataURL(f);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(""); setErr("");
    try {
      const payload = { ...form };
      if (!payload.dob) delete payload.dob; // không gửi dob rỗng
      const { user } = await userService.updateMe(payload);
      onUpdated && onUpdated(user);
      setMsg("Đã lưu thông tin cá nhân");
    } catch (e) {
      setErr(e?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="pf-card" onSubmit={onSubmit}>
      <div className="pf-card-title">Hồ Sơ Của Tôi</div>
      <p className="pf-desc">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>

      {/* Hai cột: Form trái + Avatar phải */}
      <div className="pf-two-col">
        {/* LEFT: form */}
        <div className="pf-col-left">
          <div className="grid-2">
            <label>
              Tên đăng nhập
              <input value={me?.username || ""} disabled />
              <span className="pf-help">Tên Đăng nhập chỉ có thể thay đổi một lần.</span>
            </label>

            <label>
              Tên
              <input value={form.name} onChange={e=>setField("name", e.target.value)} required/>
            </label>

            <label>
              Email
              <input type="email" value={form.email} onChange={e=>setField("email", e.target.value)} required/>
            </label>

            <label>
              Số điện thoại
              <input value={form.phone||""} onChange={e=>setField("phone", e.target.value)} />
            </label>

            <label className="full">
              Giới tính
              <div className="pf-radio">
                <label><input type="radio" name="gender" value="male"   checked={form.gender==="male"}   onChange={e=>setField("gender", e.target.value)} /> Nam</label>
                <label><input type="radio" name="gender" value="female" checked={form.gender==="female"} onChange={e=>setField("gender", e.target.value)} /> Nữ</label>
                <label><input type="radio" name="gender" value="other"  checked={form.gender==="other"}  onChange={e=>setField("gender", e.target.value)} /> Khác</label>
              </div>
            </label>

            <label>
              Ngày sinh
              <input type="date" value={form.dob} onChange={e=>setField("dob", e.target.value)} />
            </label>

          </div>

          <div className="pf-subtitle">Số đo (gợi ý size)</div>
          <div className="grid-4">
            <label>Cao (cm)<input type="number" value={form.preferences.height} onChange={e=>setPref("height", Number(e.target.value))} /></label>
            <label>Nặng (kg)<input type="number" value={form.preferences.weight} onChange={e=>setPref("weight", Number(e.target.value))} /></label>
            <label>Size áo<input value={form.preferences.size_top} onChange={e=>setPref("size_top", e.target.value)} /></label>
            <label>Size quần<input value={form.preferences.size_bottom} onChange={e=>setPref("size_bottom", e.target.value)} /></label>
          </div>

          <div className="pf-actions">
            <button className="btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</button>
            <span className="pf-msg ok">{msg}</span>
            <span className="pf-msg err">{err}</span>
          </div>
        </div>

        {/* RIGHT: avatar + upload */}
        <aside className="pf-aside">
          <div className="pf-avatar">
            {previewUrl ? (
              <img src={previewUrl} alt="avatar preview" />
            ) : (
              <div className="pf-avatar-placeholder" />
            )}
          </div>

          <button
            type="button"
            className="pf-upload-btn"
            onClick={() => fileRef.current?.click()}
          >
            Chọn Ảnh
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg"
            hidden
            onChange={onPickFile}
          />
          <p className="pf-aside-note">
            Dung lượng file tối đa <strong>1 MB</strong><br/>
            Định dạng: <strong>.JPEG, .PNG</strong>
          </p>
        </aside>
      </div>
    </form>
  );
}
