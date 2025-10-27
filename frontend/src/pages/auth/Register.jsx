import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import dfsLogo from "../../assets/icons/DFS-NonBG1.png";

// MUI
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";

// Icons
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Link from "@mui/material/Link";

import { authService } from "../../services/authService";
import {
  isEmail,
  isValidFullName,
  isValidPassword,
  isValidUsername,
} from "../../utils/validators";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("error");
  const [errors, setErrors] = useState({});

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  // helper validate cho Step 1
  const validateStep1 = (data) => {
    const e = {};
    const name = data.name?.trim() || "";
    const username = data.username?.trim().toLowerCase() || "";
    const email = data.email?.trim().toLowerCase() || "";
    const pw = data.password || "";
    const cpw = data.confirmPassword || "";

    if (!name) e.name = "Vui lòng nhập họ tên";
    else if (!isValidFullName(name)) e.name = "Họ tên không hợp lệ";

    if (!username) e.username = "Vui lòng nhập tên đăng nhập";
    else if (!isValidUsername(username))
      e.username = "Username 3–30 ký tự, chỉ a–z và 0–9";

    if (!email) e.email = "Vui lòng nhập email";
    else if (!isEmail(email)) e.email = "Email không hợp lệ";

    if (!pw) e.password = "Vui lòng nhập mật khẩu";
    else if (!isValidPassword(pw))
      e.password = "Tối thiểu 8 ký tự, gồm hoa, thường, số và ký tự đặc biệt";

    if (!cpw) e.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (pw !== cpw) e.confirmPassword = "Mật khẩu xác nhận không khớp";

    if (!agree) e.agree = "Bạn cần đồng ý điều khoản để tiếp tục";

    return e;
  };

  const handleRequestOTP = async (e) => {
    e?.preventDefault?.();
    setMessage("");
    const v = validateStep1(form);
    setErrors(v);
    if (Object.keys(v).length > 0) {
      setSeverity("error");
      setMessage("Vui lòng kiểm tra lại thông tin.");
      return;
    }

    try {
      setLoading(true);
      await authService.requestRegisterOTP({
        email: form.email.trim().toLowerCase(), // normalize
      });
      setSeverity("success");
      setMessage("Đã gửi OTP tới email của bạn.");
      setStep(2);
    } catch (err) {
      setSeverity("error");
      setMessage(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault?.();
    try {
      if (form.password !== form.confirmPassword)
        return setMessage("Mật khẩu xác nhận không khớp!");
      if (!form.otp) return setMessage("Vui lòng nhập OTP!");
      setLoading(true);
      await authService.verifyRegister(form);
      setSeverity("success");
      setMessage("Đăng ký thành công! Hãy đăng nhập.");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      setSeverity("error");
      setMessage(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        background:
          "radial-gradient(1000px 500px at 10% -10%, rgba(99,102,241,.08), transparent), radial-gradient(800px 400px at 100% 0, rgba(16,185,129,.08), transparent)",
      }}
    >
      <Card
        elevation={8}
        sx={{ width: "100%", maxWidth: 480, borderRadius: 3 }}
      >
        <CardContent sx={{ p: { xs: 4, sm: 6 } }}>
          {/* Header: logo + tiêu đề ngang hàng */}
          <Box
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2.5,
              flexDirection: { xs: "column", sm: "row" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            {/* Logo */}
            <Link
              component={RouterLink}
              to="/"
              underline="none"
              aria-label="Về trang chủ DFS"
              sx={{ lineHeight: 0, flexShrink: 0 }}
            >
              <Box
                sx={{
                  width: { xs: 88, sm: 100 },
                  height: { xs: 88, sm: 100 },
                  borderRadius: "50%",
                  overflow: "hidden",
                  boxShadow: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  component="img"
                  src={dfsLogo}
                  alt="Logo DFS"
                  loading="lazy"
                  decoding="async"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    transform: "scale(1.25)",
                    display: "block",
                  }}
                />
              </Box>
            </Link>

            {/* Tiêu đề + mô tả */}
            <Box>
              <Typography variant="h4" color="primary" sx={{ mb: 0.5 }}>
                Đăng ký
              </Typography>
              <Typography color="text.secondary">
                Hãy để việc mua hàng của bạn trở nên dễ dàng và thú vị!
              </Typography>
            </Box>
          </Box>

          {message ? (
            <Alert severity={severity} sx={{ mb: 2 }}>
              {message}
            </Alert>
          ) : null}

          {step === 1 ? (
            <Box
              component="form"
              noValidate
              autoComplete="off"
              onSubmit={handleRequestOTP}
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              <TextField
                autoFocus
                fullWidth
                label="Họ tên"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />

              <TextField
                fullWidth
                label="Tên đăng nhập"
                name="username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value.toLowerCase() })
                }
                error={!!errors.username}
                helperText={errors.username}
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value.trim().toLowerCase(),
                  })
                }
                error={!!errors.email}
                helperText={errors.email}
              />

              {/* Mật khẩu */}
              <TextField
                fullWidth
                label="Mật khẩu"
                name="password"
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => setShowPwd((s) => !s)}
                        onMouseDown={(e) => e.preventDefault()}
                        aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPwd ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Xác nhận mật khẩu */}
              <TextField
                fullWidth
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                type={showPwd2 ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => setShowPwd2((s) => !s)}
                        onMouseDown={(e) => e.preventDefault()}
                        aria-label={showPwd2 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPwd2 ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                }
                label={
                  <>
                    <span>Tôi đồng ý với </span>
                    <Typography
                      component={RouterLink}
                      to="/legal/privacy"
                      color="primary"
                      sx={{ textDecoration: "none" }}
                    >
                      chính sách & điều khoản
                    </Typography>
                  </>
                }
              />
              {errors.agree && (
                <Typography variant="caption" color="error" sx={{ mt: -1 }}>
                  {errors.agree}
                </Typography>
              )}

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={
                  loading ||
                  !form.name ||
                  !form.username ||
                  !form.email ||
                  !form.password ||
                  !form.confirmPassword ||
                  !agree
                }
                sx={{ py: 1.25, borderRadius: 2 }}
              >
                {loading ? "Đang gửi OTP..." : "Gửi OTP"}
              </Button>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography>Đã có tài khoản?</Typography>
                <Typography
                  component={RouterLink}
                  to="/login"
                  color="primary"
                  sx={{ textDecoration: "none" }}
                >
                  Đăng nhập
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box
              component="form"
              noValidate
              autoComplete="off"
              onSubmit={handleVerify}
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              <TextField
                fullWidth
                label="Mã OTP"
                name="otp"
                value={form.otp}
                onChange={handleChange}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{ py: 1.25, borderRadius: 2 }}
              >
                {loading ? "Đang xác thực..." : "Xác thực & Đăng ký"}
              </Button>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Button variant="text" onClick={() => setStep(1)}>
                  ← Sửa thông tin
                </Button>
                <Button variant="text" onClick={handleRequestOTP}>
                  Gửi lại OTP
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
