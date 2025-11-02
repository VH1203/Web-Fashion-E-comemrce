import React, { useState, useMemo } from "react";
import { userService } from "../services/userService";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function ChangePasswordForm() {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm: "",
  });
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const onChange = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
    if (msg.text) setMsg({ type: "", text: "" });
  };

  // Tính độ mạnh của mật khẩu
  const strength = useMemo(() => {
    const pw = form.new_password || "";
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0..3
  }, [form.new_password]);

  const validate = (p) => {
    const e = {};
    if (!p.current_password?.trim()) e.current_password = "Vui lòng nhập mật khẩu hiện tại.";
    if (!p.new_password?.trim()) e.new_password = "Vui lòng nhập mật khẩu mới.";
    if (p.new_password && p.new_password.length < 8) e.new_password = "Mật khẩu mới tối thiểu 8 ký tự.";
    if (!p.confirm?.trim()) e.confirm = "Vui lòng xác nhận lại mật khẩu.";
    if (p.new_password && p.confirm && p.new_password !== p.confirm) e.confirm = "Mật khẩu xác nhận không khớp.";
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const eobj = validate(form);
    setErrors(eobj);
    if (Object.keys(eobj).length) return;

    setSaving(true);
    try {
      await userService.changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setMsg({ type: "ok", text: "Đã đổi mật khẩu thành công." });
      setForm({ current_password: "", new_password: "", confirm: "" });
    } catch (err) {
      setMsg({ type: "err", text: err?.message || "Đổi mật khẩu thất bại." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="pf-card" onSubmit={submit} noValidate>
      <div className="pf-card-title">Đổi mật khẩu</div>
      <p className="pf-desc">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.</p>

      <div className="grid-2">
        {/* Mật khẩu hiện tại */}
        <label className="pw-group">
          Mật khẩu hiện tại
          <input
            type={show.current ? "text" : "password"}
            value={form.current_password}
            onChange={(e) => onChange("current_password", e.target.value)}
            aria-invalid={!!errors.current_password}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
            aria-label={show.current ? "Ẩn mật khẩu hiện tại" : "Hiện mật khẩu hiện tại"}
          >
            {show.current ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </button>
          {errors.current_password && <span className="field-error">{errors.current_password}</span>}
        </label>

        <div />

        {/* Mật khẩu mới */}
        <label className="pw-group">
          Mật khẩu mới
          <input
            type={show.next ? "text" : "password"}
            value={form.new_password}
            onChange={(e) => onChange("new_password", e.target.value)}
            aria-invalid={!!errors.new_password}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShow((s) => ({ ...s, next: !s.next }))}
            aria-label={show.next ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
          >
            {show.next ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </button>
          {errors.new_password && <span className="field-error">{errors.new_password}</span>}

          {/* Thanh strength */}
          <div className={`pw-strength s${strength}`}>
            <span />
          </div>
          <small className="pw-hint">
            Tối thiểu 8 ký tự, nên có chữ hoa, chữ thường và số/ký tự đặc biệt.
          </small>
        </label>

        {/* Xác nhận */}
        <label className="pw-group">
          Nhập lại mật khẩu
          <input
            type={show.confirm ? "text" : "password"}
            value={form.confirm}
            onChange={(e) => onChange("confirm", e.target.value)}
            aria-invalid={!!errors.confirm}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
            aria-label={show.confirm ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
          >
            {show.confirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </button>
          {errors.confirm && <span className="field-error">{errors.confirm}</span>}
        </label>
      </div>

      <div className="pf-actions">
        <button className="btn-primary" disabled={saving}>
          {saving ? "Đang đổi…" : "Đổi mật khẩu"}
        </button>
        {msg.text && <span className={`pf-msg ${msg.type}`}>{msg.text}</span>}
      </div>
    </form>
  );
}
