import React, { useState } from "react";
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBRow,
  MDBCol,
  MDBIcon,
  MDBInput,
} from "mdb-react-ui-kit";
import { authApi } from "../../services/authService";
import logo from "../../assets/icons/DFS-NonBG1.png";
import { GoogleLogin } from "@react-oauth/google";


export default function Login() {
  const [form, setForm] = useState({
    identifier: "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const roleRoutes = {
    customer: "/",
    shop_owner: "/shop/dashboard",
    system_admin: "/admin/system-config",
    sales: "/sales/orders",
    support: "/support/tickets",
  };

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
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const res = await authApi.googleLogin({ token });
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      localStorage.setItem("user", JSON.stringify(res.user));

      const redirect = roleRoutes[res.user.role.name] || "/";
      window.location.href = redirect;
    } catch (err) {
      setError("Đăng nhập Google thất bại: " + err.message);
    }
  };

  const handleGoogleError = () => {
    setError("Đăng nhập Google thất bại!");
  };
  return (
    <MDBContainer className="my-5 d-flex justify-content-center">
      <MDBCard>
        <MDBRow className="g-6">
          {/* Cột ảnh bên trái */}
          <MDBCol md="6">
            <MDBCardImage
              src="https://cdn.occtoo-media.com/995cf62a-7759-4681-a516-370aaabfd325/445f33e1-b55a-5121-9eed-e5a32a7ca2cc/239777-0014_03.jpg?format=large&outputFormat=webp"
              alt="login form"
              className="rounded-start w-100"
              // style={{ objectFit: "cover", height: "10px" }}
            />
          </MDBCol>

          {/* Form login */}
          <MDBCol md="6">
            <MDBCardBody className="d-flex flex-column">
              <div className="d-flex flex-row mt-2 align-items-center">
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "contain",
                    marginRight: "12px",
                    borderRadius: "50px",
                  }}
                />
                <span className="h1 fw-bold mb-0">Daily Fit</span>
              </div>

              <h5
                className="fw-normal my-4 pb-3"
                style={{ letterSpacing: "1px" }}
              >
                Đăng nhập
              </h5>

              {error && (
                <div style={{ color: "red", marginBottom: 12 }}>{error}</div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <MDBInput
                  wrapperClass="mb-4"
                  label="Tên đăng nhập / Email / SĐT"
                  id="identifier"
                  name="identifier"
                  type="text"
                  size="lg"
                  value={form.identifier}
                  onChange={onChange}
                />
                <div style={{ position: "relative" }} className="mb-4">
                  <MDBInput
                    label="Mật khẩu"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    size="lg"
                    value={form.password}
                    onChange={onChange}
                  />

                  <i
                    className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                    onClick={() => setShowPassword((s) => !s)}
                    style={{
                      position: "absolute",
                      right: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#555",
                      fontSize: "18px",
                    }}
                  ></i>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      id="remember"
                      name="remember"
                      style={{ width: "16px", height: "16px" }}
                      onChange={onChange}
                    />
                    <label
                      htmlFor="remember"
                      className="ms-2"
                      style={{ fontSize: "16px", marginBottom: 0 }}
                    >
                      Ghi nhớ đăng nhập
                    </label>
                  </div>

                  <a
                    href="/forgot-password"
                    className="small text-primary"
                    style={{ fontSize: "16px" }}
                  >
                    Quên mật khẩu?
                  </a>
                </div>

                <div className="d-flex justify-content-center">
                  <MDBBtn
                    className="mb-4 px-5d-flex align-items-center justify-content-center"
                    color="primary"
                    size="lg"
                    style={{ width: "60%" }}
                    onClick={submit}
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? (
                      <div
                        className="spinner-border spinner-border-sm text-light"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      "Đăng nhập"
                    )}
                  </MDBBtn>
                </div>

                 <div className="text-center mb-3">
                  <p className="mb-2">Hoặc đăng nhập bằng</p>
                  <div className="d-flex justify-content-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      shape="circle"
                      theme="outline"
                    />
                  </div>
                </div>
                <p
                  className="mb-5 pb-lg-2"
                  style={{
                    color: "#393f81",
                    textAlign: "center",
                    fontSize: "18px",
                  }}
                >
                  Chưa có tài khoản?{" "}
                  <a href="/register" style={{ color: "#393f81" }}>
                    Đăng ký tại đây
                  </a>
                </p>

                <div className="mb-5 pb-lg-2" style={{ textAlign: "center" }}>
                  <a href="#!" className="small text-muted me-1">
                    Terms of use.
                  </a>
                  <a href="#!" className="small text-muted">
                    Privacy policy
                  </a>
                </div>
              </form>
            </MDBCardBody>
          </MDBCol>
        </MDBRow>
      </MDBCard>
    </MDBContainer>
  );
}
