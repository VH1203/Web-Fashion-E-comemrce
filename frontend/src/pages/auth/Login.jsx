import { useState } from "react";
import React from "react";
import { authApi } from "../../services/authService";

export default function Login() {
  const [form, setForm] = useState({
    identifier: "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roleRoutes ={
    customer: "/",
    shop_owner: "/shop/dashboard",
    system_admin: "/admin/system-config",
    sales:"/sales/orders",
    support:"/support/tickets"
  }

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

   const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(form);
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("refresh_token", res.refresh_token);
      localStorage.setItem("remember", form.remember ? "1" : "0");

      const redirect = roleRoutes[res.user.role] || "/";
      window.location.href = redirect;
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Đăng nhập</h2>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      <input
        name="identifier"
        placeholder="Tên đăng nhập / Email / SĐT"
        onChange={onChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Mật khẩu"
        onChange={onChange}
      />
      <label>
        <input type="checkbox" name="remember" onChange={onChange} /> Ghi nhớ
        đăng nhập
      </label>
      <button onClick={submit}>Đăng nhập</button>
      <div style={{ marginTop: 12 }}>
        <a href="/forgot-password">Quên mật khẩu?</a>
      </div>
    </div>
  );
}
