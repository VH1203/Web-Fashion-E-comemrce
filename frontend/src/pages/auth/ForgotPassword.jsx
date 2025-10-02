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
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }
  
  const requestOTP = async () => {
    setLoading(true);
    setError("");
    try {
      await authApi.forgotRequestOTP({ identifier: form.identifier });
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    setError("");
    try {
      await authApi.forgotVerify({ identifier: form.identifier, otp: form.otp, newPassword: form.newPassword });
      alert("Đổi mật khẩu thành công.");
      window.location.href = "/login";
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
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
          <button onClick={requestOTP}>Gửi OTP</button>
        </>
      )}
      {step === 2 && (
        <div className="card">
          <input name="otp" placeholder="Nhập OTP" onChange={onChange} />
          <input
            type="password"
            name="newPassword"
            placeholder="Mật khẩu mới"
            onChange={onChange}
          />
          <button onClick={verifyOTP}>Xác nhận đổi mật khẩu</button>
          <button onClick={requestOTP}>Gửi lại OTP</button>
        </div>
      )}
    </div>
  );
}
