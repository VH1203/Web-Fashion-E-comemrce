import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

// MUI
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";

// Icons
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBack from "@mui/icons-material/ArrowBack";

import { authService } from "../../services/authService";
// import dfsLogo from "../../assets/dfs-logo.png";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập OTP + mật khẩu mới
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ email: "", otp: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("error"); // 'success' | 'error' | 'info'

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSend = async (e) => {
    e?.preventDefault?.();
    try {
      if (!form.email) return setMessage("Vui lòng nhập email!");
      setLoading(true);
      await authService.requestResetOTP({ email: form.email });
      setSeverity("success");
      setMessage("✅ Đã gửi OTP tới email!");
      setStep(2);
    } catch (err) {
      setSeverity("error");
      setMessage(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e?.preventDefault?.();
    try {
      if (!form.otp) return setMessage("Vui lòng nhập OTP!");
      if (!form.newPassword) return setMessage("Vui lòng nhập mật khẩu mới!");
      setLoading(true);
      await authService.resetPassword(form);
      setSeverity("success");
      setMessage("🎉 Mật khẩu đã được đặt lại! Đang chuyển về trang đăng nhập…");
      navigate("/login", { replace: true });
      // hoặc: setTimeout(() => navigate("/login", { replace: true }), 1200);
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
      <Card elevation={8} sx={{ width: "100%", maxWidth: 480, borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 4, sm: 6 } }}>
          {/* Header */}
          <Typography variant="h4" color="primary" sx={{ mb: 0.5 }}>
            Quên mật khẩu
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Nhập email để nhận mã OTP, sau đó đặt mật khẩu mới.
          </Typography>

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
              onSubmit={handleSend}
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              <TextField
                autoFocus
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
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

              <Divider>Hoặc</Divider>

              <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                <Link component={RouterLink} to="/login" underline="hover">
                  Quay lại đăng nhập
                </Link>
              </Box>
            </Box>
          ) : (
            <Box
              component="form"
              noValidate
              autoComplete="off"
              onSubmit={handleReset}
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              <TextField
                fullWidth
                label="Mã OTP"
                name="otp"
                value={form.otp}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Mật khẩu mới"
                name="newPassword"
                type={showPwd ? "text" : "password"}
                value={form.newPassword}
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

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{ py: 1.25, borderRadius: 2 }}
              >
                {loading ? "Đang xác nhận..." : "Xác nhận"}
              </Button>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  variant="text"
                  startIcon={<ArrowBack />}
                  onClick={() => setStep(1)}
                >
                  Nhập lại email
                </Button>
                <Button variant="text" onClick={handleSend}>
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
