import { useState } from "react";
import React from "react";
import { authApi } from "../../services/authService";

export default function ForgotPassword() {
  const [form, setForm] = useState({
    identifier: "",
    otp: "",
    newPassword: "",
  });
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const request = async () => {
    setError("");
    try {
      await authApi.forgotRequest({ identifier: form.identifier });
      setStep(2);
    } catch (e) {
      setError(e.message);
    }
  };

  const reset = async () => {
    setError("");
    try {
      await authApi.forgotVerify(form);
      alert("Đổi mật khẩu thành công.");
      window.location.href = "/login";
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Quên mật khẩu</h2>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      {step === 1 && (
        <>
          <input
            name="identifier"
            placeholder="Email/SĐT/Tên đăng nhập"
            onChange={onChange}
          />
          <button onClick={request}>Gửi OTP</button>
        </>
      )}
      {step === 2 && (
        <>
          <input name="otp" placeholder="Nhập OTP" onChange={onChange} />
          <input
            type="password"
            name="newPassword"
            placeholder="Mật khẩu mới"
            onChange={onChange}
          />
          <button onClick={reset}>Xác nhận đổi mật khẩu</button>
        </>
      )}
    </div>
  );
}
