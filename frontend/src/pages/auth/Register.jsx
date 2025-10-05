import React, { useState } from "react";
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBRow,
  MDBCol,
  MDBInput,
} from "mdb-react-ui-kit";
import { authApi } from "../../services/authService";
import logo from "../../assets/icons/DFS-NonBG1.png";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const requestOTP = async () => {
    if (!form.agreePolicy) {
      setError("Bạn cần đồng ý với chính sách trước khi tiếp tục.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

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
    const payload = {
      name: form.name,
      username: form.username,
      email: form.email,
      phone: form.phone,
      password: form.password, 
      otp: form.otp,
    };

    const res = await authApi.registerVerify(payload);

    alert("Đăng ký thành công! Hãy đăng nhập.");
    window.location.href = "/login";
  } catch (e) {
    setError(e.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <MDBContainer className="my-5 d-flex justify-content-center">
      <MDBCard>
        <MDBRow className="g-0">
          <MDBCol md="6" className="d-none d-md-block">
            <img
              src="https://cdn.occtoo-media.com/995cf62a-7759-4681-a516-370aaabfd325/445f33e1-b55a-5121-9eed-e5a32a7ca2cc/239777-0014_03.jpg?format=large&outputFormat=webp"
              alt="register"
              className="rounded-start w-100"
            />
          </MDBCol>

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

              <h5 className="fw-normal my-4 pb-3">Tạo tài khoản mới</h5>

              {error && (
                <div style={{ color: "red", marginBottom: 12 }}>{error}</div>
              )}

              {step === 1 && (
                <>
                  <MDBInput
                    wrapperClass="mb-3"
                    label="Họ và tên"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={onChange}
                  />

                  <MDBInput
                    wrapperClass="mb-3"
                    label="Tên đăng nhập"
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={onChange}
                  />
                  <MDBInput
                    wrapperClass="mb-3"
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                  />
                  <MDBInput
                    wrapperClass="mb-3"
                    label="Số điện thoại"
                    name="phone"
                    type="text"
                    value={form.phone}
                    onChange={onChange}
                  />
                  {/* Ô nhập mật khẩu */}
                  <div style={{ position: "relative" }} className="mb-3">
                    <MDBInput
                      label="Mật khẩu"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={onChange}
                    />
                    <i
                      className={`fa ${
                        showPassword ? "fa-eye-slash" : "fa-eye"
                      }`}
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

                  {/* Ô nhập xác nhận mật khẩu */}
                  <div style={{ position: "relative" }} className="mb-3">
                    <MDBInput
                      label="Xác nhận mật khẩu"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={onChange}
                    />
                    <i
                      className={`fa ${
                        showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                      }`}
                      onClick={() => setShowConfirmPassword((s) => !s)}
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
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="agreePolicy"
                      id="agreePolicy"
                      checked={form.agreePolicy}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="agreePolicy">
                      Tôi đồng ý với <a href="/policy">chính sách sử dụng</a>
                    </label>
                  </div>
                  <div className="d-flex justify-content-center">
                    <MDBBtn
                      className="mb-4 px-5 d-flex align-items-center justify-content-center"
                      color="primary"
                      size="lg"
                      style={{ width: "60%" }}
                      onClick={requestOTP}
                      disabled={loading}
                    >
                      {loading ? (
                        <div
                          className="spinner-border spinner-border-sm text-light"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        "Gửi OTP"
                      )}
                    </MDBBtn>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <MDBInput
                    wrapperClass="mb-4"
                    label="Nhập OTP"
                    name="otp"
                    type="text"
                    value={form.otp}
                    onChange={onChange}
                  />
                  <MDBBtn
                    className="mb-3 px-5"
                    color="dark"
                    size="lg"
                    onClick={verifyOTP}
                    disabled={loading}
                  >
                    {loading ? "Đang xác thực..." : "Xác thực & Tạo tài khoản"}
                  </MDBBtn>
                  <MDBBtn
                    outline
                    color="secondary"
                    size="lg"
                    onClick={requestOTP}
                    disabled={loading}
                  >
                    Gửi lại OTP
                  </MDBBtn>
                </>
              )}

              <p
                className="mt-4"
                style={{ color: "#393f81", textAlign: "center" }}
              >
                Đã có tài khoản?{" "}
                <a href="/login" style={{ color: "#393f81" }}>
                  Đăng nhập tại đây
                </a>
              </p>
            </MDBCardBody>
          </MDBCol>
        </MDBRow>
      </MDBCard>
    </MDBContainer>
  );
}
