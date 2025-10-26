import React, { useState } from "react";
import { Link as RouterLink ,useNavigate} from "react-router-dom";
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
import FacebookOutlined from "@mui/icons-material/FacebookOutlined";
import GitHub from "@mui/icons-material/GitHub";
import Google from "@mui/icons-material/Google";
import Twitter from "@mui/icons-material/Twitter";
import Link from "@mui/material/Link";

import { authService } from "../../services/authService";

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
  const [severity, setSeverity] = useState("error"); // 'success' | 'error' | 'info'

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRequestOTP = async (e) => {
    e?.preventDefault?.();
    try {
      if (!form.email) return setMessage("Vui lòng nhập email!");
      if (!agree) return setMessage("Bạn cần đồng ý điều khoản để tiếp tục.");
      setLoading(true);
      await authService.requestRegisterOTP({ email: form.email });
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
              />
              <TextField
                fullWidth
                label="Tên đăng nhập"
                name="username"
                value={form.username}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Mật khẩu"
                name="password"
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
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
              <TextField
                fullWidth
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                type={showPwd2 ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
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

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
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
