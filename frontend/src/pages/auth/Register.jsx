import { useState } from "react";
import { authApi } from "../../services/authService";
import React from "react";


export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreePolicy: false,
    otp: "",
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const requestOTP = async () => {
    setLoading(true);
    setError("");
    try {
      await authApi.registerRequestOTP({ ...form });
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
      await authApi.registerVerify({ ...form });
      alert("Đăng ký thành công! Hãy đăng nhập.");
      window.location.href = "/login";
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Đăng ký</h2>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}

      {step === 1 && (
        <div className="card">
          <input name="username" placeholder="Tên đăng nhập" onChange={onChange} />
          <input name="email" placeholder="Email" onChange={onChange} />
          <input name="phone" placeholder="SĐT" onChange={onChange} />
          <input type="password" name="password" placeholder="Mật khẩu" onChange={onChange} />
          <input type="password" name="confirmPassword" placeholder="Xác nhận mật khẩu" onChange={onChange} />
          <label>
            <input type="checkbox" name="agreePolicy" onChange={onChange} /> Tôi đồng ý với chính sách
          </label>
          <button onClick={requestOTP} disabled={loading}>
            {loading ? "Đang gửi OTP..." : "Gửi OTP"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <input name="otp" placeholder="Nhập OTP" onChange={onChange} />
          <button onClick={verifyOTP} disabled={loading}>
            {loading ? "Đang xác thực..." : "Xác thực & Tạo tài khoản"}
          </button>
        </div>
      )}
    </div>
  );
}

