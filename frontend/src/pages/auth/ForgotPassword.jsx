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

export default function ForgotPassword() {
  const [form, setForm] = useState({
    identifier: "",
    otp: "",
    newPassword: "",
  });
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // 👈 thêm state success
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const requestOTP = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await authApi.forgotRequest({ identifier: form.identifier });
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
    setSuccess("");
    try {
      await authApi.forgotVerify({
        identifier: form.identifier,
        otp: form.otp,
        newPassword: form.newPassword,
      });
      setSuccess("Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MDBContainer className="my-5">
      <MDBCard>
        <MDBRow className="g-0">
          <MDBCol md="6" className="d-none d-md-block">
            <img
              src="https://cdn.occtoo-media.com/995cf62a-7759-4681-a516-370aaabfd325/445f33e1-b55a-5121-9eed-e5a32a7ca2cc/239777-0014_03.jpg?format=large&outputFormat=webp"
              alt="forgot password"
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
                    width: "50px",
                    height: "50px",
                    objectFit: "contain",
                    marginRight: "12px",
                    borderRadius: "50px",
                  }}
                />
                <span className="h1 fw-bold mb-0">Daily Fit</span>
              </div>

              <h5 className="fw-normal my-4 pb-3">Quên mật khẩu</h5>

              {/* Hiển thị thông báo lỗi */}
              {error && (
                <div
                  className="flex w-full max-w-sm overflow-hidden bg-white rounded-lg shadow mb-3"
                  style={{ border: "1px solid #f87171" }}
                >
                  <div className="flex items-center justify-center w-12 bg-red-500">
                    <i className="fa fa-times text-white"></i>
                  </div>
                  <div className="px-4 py-2 -mx-3">
                    <div className="mx-3">
                      <span className="font-semibold text-red-500">Error</span>
                      <p className="text-sm text-gray-600">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div
                  className="flex items-center p-3 mb-4 text-green-700 bg-green-100 rounded-lg shadow"
                  role="alert"
                >
                  <i className="fa fa-check-circle mr-2 text-green-600 text-xl"></i>
                  <div>
                    <span className="font-semibold">Thành công!</span> {success}
                  </div>
                </div>
              )}

              {step === 1 && (
                <>
                  <MDBInput
                    wrapperClass="mb-4"
                    label="Email / SĐT / Tên đăng nhập"
                    name="identifier"
                    type="text"
                    value={form.identifier}
                    onChange={onChange}
                  />
                  <MDBBtn
                    className="mb-4 px-5"
                    color="dark"
                    size="lg"
                    onClick={requestOTP}
                    disabled={loading}
                  >
                    {loading ? "Đang gửi OTP..." : "Gửi OTP"}
                  </MDBBtn>
                </>
              )}

              {step === 2 && (
                <>
                  <MDBInput
                    wrapperClass="mb-4"
                    label="Mã OTP"
                    name="otp"
                    type="text"
                    value={form.otp}
                    onChange={onChange}
                  />

                  {/* Input mật khẩu có nút xem/ẩn */}
                  <div style={{ position: "relative" }} className="mb-4">
                    <MDBInput
                      label="Mật khẩu mới"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={form.newPassword}
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

                  <MDBBtn
                    className="mb-3 px-5"
                    color="dark"
                    size="lg"
                    onClick={verifyOTP}
                    disabled={loading}
                  >
                    {loading ? "Đang xác thực..." : "Xác nhận đổi mật khẩu"}
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
                <a href="/login" style={{ color: "#393f81" }}>
                  Quay lại Đăng nhập
                </a>
              </p>
            </MDBCardBody>
          </MDBCol>
        </MDBRow>
      </MDBCard>
    </MDBContainer>
  );
}
