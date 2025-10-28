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
import {
  isValidFullName,
  isValidUsername,
  isValidPassword,
  isEmail,
} from "../../utils/validators";
import "../../assets/styles/Auth.css"

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
  const [fieldErrors, setFieldErrors] = useState({}); // ✅ lỗi theo trường

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ============================================
  // 🧠 Validate từng trường khi blur
  // ============================================
  const validateField = (name, value) => {
    let message = "";

    switch (name) {
      case "name":
        if (!isValidFullName(value))
          message =
            "Họ và tên chỉ được chứa chữ cái.";
        break;

      case "username":
        if (!isValidUsername(value))
          message =
            "Tên đăng nhập chỉ gồm chữ thường và số.";
        break;

      case "email":
        if (!isEmail(value))
          message = "Địa chỉ email không hợp lệ.";
        break;

      case "password":
        if (!isValidPassword(value))
          message =
            "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt.";
        break;

      case "confirmPassword":
        if (value !== form.password)
          message = "Xác nhận mật khẩu không khớp.";
        break;

      default:
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [name]: message }));
    return message === "";
  };

  // ============================================
  // 🧩 Xử lý thay đổi
  // ============================================
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((f) => ({ ...f, [name]: val }));

    // validate realtime onChange (optional)
    if (fieldErrors[name]) validateField(name, val);
  };

  const onBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // ============================================
  // 📨 Gửi OTP
  // ============================================
  const requestOTP = async () => {
    setError("");

    // check toàn bộ trước khi gửi
    const fieldsToCheck = ["name", "username", "email", "password", "confirmPassword"];
    const valid = fieldsToCheck.every((field) => validateField(field, form[field]));
    if (!valid) {
      setError("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }

    if (!form.agreePolicy) {
      setError("Bạn cần đồng ý với chính sách trước khi tiếp tục.");
      return;
    }

    setLoading(true);
    try {
      await authApi.registerRequestOTP({ ...form });
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ✅ Xác thực OTP
  // ============================================
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

      await authApi.registerVerify(payload);
      alert("Đăng ký thành công! Hãy đăng nhập.");
      window.location.href = "/login";
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🧱 Giao diện
  // ============================================
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
                    width: "80px",
                    height: "80px",
                    objectFit: "contain",
                    marginRight: "12px",
                    borderRadius: "50px",
                  }}
                />
                <span className="h1 fw-bold mb-0">Daily Fit</span>
              </div>

              <h5 className="fw-normal my-4 pb-3">Tạo tài khoản mới</h5>

              {error && (
                <div
                  style={{
                    color: "red",
                    marginBottom: 12,
                    background: "#ffe6e6",
                    padding: 8,
                    borderRadius: 6,
                  }}
                >
                  {error}
                </div>
              )}

              {step === 1 && (
                <>{fieldErrors.name && <p className="text-danger">{fieldErrors.name}</p>}
                  {/* Họ và tên */}
                  <MDBInput
                    wrapperClass="mb-3"
                    label="Họ và tên"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                  

                  {/* Tên đăng nhập */} 
                  {fieldErrors.username && <p className="text-danger">{fieldErrors.username}</p>}
                  <MDBInput
                    wrapperClass="mb-3"
                    label="Tên đăng nhập"
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                 

                  {/* Email */}
                   {fieldErrors.email && <p className="text-danger">{fieldErrors.email}</p>}
                  <MDBInput
                    wrapperClass="mb-3"
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                 

                  {/* Số điện thoại */}
                  <MDBInput
                    wrapperClass="mb-3"
                    label="Số điện thoại"
                    name="phone"
                    type="text"
                    value={form.phone}
                    onChange={onChange}
                  />

                  {/* Mật khẩu */}
                  <div style={{ position: "relative" }} className="mb-3">
                    {fieldErrors.password && <p className="text-danger">{fieldErrors.password}</p>}
                    <MDBInput
                      label="Mật khẩu"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={onChange}
                      onBlur={onBlur}
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
                  

                  {/* Xác nhận mật khẩu */}
                  <div style={{ position: "relative" }} className="mb-3">
                    {fieldErrors.confirmPassword && (
                    <p className="text-danger">{fieldErrors.confirmPassword}</p>
                  )}
                    <MDBInput
                      label="Xác nhận mật khẩu"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={onChange}
                      onBlur={onBlur}
                    />
                    <i
                      className={`fa ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}
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
                  

                  {/* Checkbox chính sách */}
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

                  {/* Nút gửi OTP */}
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

              {/* Bước xác thực OTP */}
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

              <p className="mt-4" style={{ color: "#393f81", textAlign: "center" }}>
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
